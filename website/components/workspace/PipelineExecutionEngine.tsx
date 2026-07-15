"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { useWorkspaceStore, SessionState, type Artifact } from "./WorkspaceStoreContext";
import { useWorkspaceRuntime } from "./WorkspaceRuntime";
import { useStepData } from "./StepDataContext";
import { resolveWithArtifacts } from "@/lib/variableResolver";
import {
  extractTemaArtifact,
  extractPerguntaArtifact,
  extractSelectionArtifact,
  extractReadingCardsArtifact,
  extractComparisonTableArtifact,
  extractGapsArtifact,
  extractSynthesisArtifact,
  extractReviewArtifact,
} from "@/lib/artifactExtractor";
import { getProvider, getEngineLabel, getEngineWorkflow, buildExecutionCard, createDefaultProfile, migrateToProfile, TASK_TYPE_LABELS, type ExecutionProfile, type ExecutionProviderConfig, type ProviderType, type WorkflowStep, type ExecutionCardData } from "@/lib/ScientificExecutionEngine";

function safeExtractJsonBlock<T>(text: string): T | null {
  try {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      return JSON.parse(match[1]) as T;
    }
    if (text.trim().startsWith("{") && text.trim().endsWith("}")) {
      return JSON.parse(text.trim()) as T;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/** Map workspace engineId to the /api/execution engine parameter */
const ENGINE_API_MAP: Record<string, "claude" | "gemini" | "glm" | "openrouter" | "google"> = {
  "researchai-cloud": "google",
  "chatgpt": "openrouter",
  "gemini": "google",
  "claude": "claude",
  "deepseek": "openrouter",
  "notebooklm": "google",
  "ollama": "openrouter",
  "lm-studio": "openrouter",
  "open-webui": "openrouter",
};

function resolveApiEngine(engineId: string): "claude" | "gemini" | "glm" | "openrouter" | "google" {
  return ENGINE_API_MAP[engineId] ?? "google";
}

/* ============================================================
   PipelineExecutionEngine
   Central entity managing the full execution lifecycle:
   Editing → Ready → Queued → Running → Streaming → Validating → Saving → Completed
   (or Failed at any point)

   This replaces scattered ifs across components with a single
   state machine that the UI observes.
   ============================================================ */

export type PipelineState =
  | "Editing"
  | "Ready"
  | "Queued"
  | "Running"
  | "Streaming"
  | "Validating"
  | "Saving"
  | "Completed"
  | "Failed";

export type PipelineStage =
  | "prompt"
  | "execution"
  | "output"
  | "validation"
  | "artifact";

const PIPELINE_ORDER: PipelineState[] = [
  "Editing", "Ready", "Queued", "Running", "Streaming", "Validating", "Saving", "Completed"
];

const STAGE_FROM_PIPELINE: Record<PipelineState, PipelineStage> = {
  Editing: "prompt",
  Ready: "prompt",
  Queued: "execution",
  Running: "execution",
  Streaming: "execution",
  Validating: "validation",
  Saving: "artifact",
  Completed: "artifact",
  Failed: "execution",
};

export interface PipelineCheckpoint {
  id: string;
  label: string;
  status: "pending" | "done";
}

export interface PipelineContext {
  pipelineState: PipelineState;
  pipelineStage: PipelineStage;
  isRunning: boolean;
  isCompleted: boolean;
  hasFailed: boolean;

  // Derived data
  resolvedPrompt: string;
  selectedModel: string;
  checkpoints: PipelineCheckpoint[];

  // Execution profile + provider
  isManualMode: boolean;
  executionProfile: ExecutionProfile;
  executionProvider: ExecutionProviderConfig;
  providerType: ProviderType;
  assistantLabel: string;
  workflowSteps: WorkflowStep[];
  executionCard: ExecutionCardData;

  // Progress
  streamProgress: number;
  tokenCount: number;
  latencyMs: number;
  responseContent: string;

  // User-facing validation notice (e.g. PR-003 produced no usable articles).
  // Non-technical, pedagogical message; null when there is nothing to warn about.
  validationNotice: string | null;

  // Actions
  start: () => void;
  startManual: () => void;
  reset: () => void;
  submitManualResponse: (response: string) => void;
  acceptArtifact: () => void;

  // Internal setters (for simulation hooks)
  setPipelineState: (state: PipelineState) => void;
  setStreamProgress: (n: number) => void;
  setTokenCount: (n: number) => void;
  setLatency: (n: number) => void;
}

const PipelineContext = createContext<PipelineContext | undefined>(undefined);

export function PipelineExecutionProvider({ children }: { children: ReactNode }) {
  const { session, advanceStepState, saveArtifact, updateSession, getArtifact, getArticles, updateArticles } = useWorkspaceStore();
  const runtime = useWorkspaceRuntime();
  const data = useStepData();

  const step = data.stepOrder;
  const sessionStatus: SessionState = session.progress?.[step]?.status || "Draft";

  // Sync workspace currentStep when navigating to a new step
  useEffect(() => {
    if (session.currentStep !== step) {
      updateSession({ currentStep: step });
    }
  }, [step, session.currentStep, updateSession]);

  // Derive initial pipeline state from session status
  function derivePipelineState(status: SessionState): PipelineState {
    if (status === "Completed" || status === "EvidenceValidated") return "Completed";
    if (status === "PromptExecuted") return "Validating";
    if (status === "PromptGenerated") return "Streaming";
    if (status === "ContextConfirmed") return "Ready";
    return "Editing";
  }

  const [pipelineState, setPipelineState] = useState<PipelineState>(derivePipelineState(sessionStatus));
  const [streamProgress, setStreamProgressState] = useState(0);
  const [tokenCount, setTokenCountState] = useState(0);
  const [latencyMs, setLatencyState] = useState(0);
  const [responseContent, setResponseContent] = useState("");
  const [isManualMode, setIsManualMode] = useState(false);
  const [validationNotice, setValidationNotice] = useState<string | null>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Sync pipeline state when session status changes externally
  useEffect(() => {
    setPipelineState(derivePipelineState(sessionStatus));
  }, [sessionStatus]);

  // Resolve prompt variables from workspace artifacts (structured)
  const resolvedPrompt = (() => {
    if (!data.promptBody) return "";
    return resolveWithArtifacts(data.promptBody, session, step);
  })();

  const selectedModel = runtime.runtime.selectedAI.replace("ChatGPT", "GPT-4o").replace("Claude", "Claude 3.5");

  // Execution profile from workspace (with backward compat)
  const executionProfile: ExecutionProfile = session.executionProfile
    ?? (session.executionProvider ? migrateToProfile(session.executionProvider) : createDefaultProfile("researchai-cloud"));
  const executionProvider: ExecutionProviderConfig = session.executionProvider
    ?? { type: executionProfile.engineId === "researchai-cloud" ? "cloud" : "external", assistantId: executionProfile.engineId };
  const providerType: ProviderType = executionProvider.type;
  const assistantLabel = getEngineLabel(executionProfile.engineId);
  const provider = getProvider(providerType);
  const workflowSteps = getEngineWorkflow(executionProfile.engineId);
  const executionCard = buildExecutionCard(
    executionProfile,
    resolvedPrompt.length,
    data.stepExpectedOutput || "—",
    data.stepObjective || undefined,
    data.stepExpectedOutput || undefined
  );

  // Build checkpoints — scientific task pipeline (prompt is NOT a checkpoint)
  // Pipeline: Workspace → Preparação → Execução → Revisão → Validação → Artefacto
  const checkpoints: PipelineCheckpoint[] = [
    { id: "workspace", label: "Workspace", status: "done" },
    { id: "prepare", label: "Preparação Científica", status: pipelineState === "Editing" ? "pending" : "done" },
    { id: "execute", label: "Execução", status: ["Queued", "Running", "Streaming"].includes(pipelineState) ? "done" : ["Validating", "Saving", "Completed"].includes(pipelineState) ? "done" : "pending" },
    { id: "review", label: "Revisão", status: ["Validating", "Saving", "Completed"].includes(pipelineState) ? "done" : "pending" },
    { id: "validate", label: "Validação", status: ["Validating", "Saving", "Completed"].includes(pipelineState) ? "done" : "pending" },
    { id: "artifact", label: "Artefacto", status: pipelineState === "Completed" ? "done" : "pending" },
  ];

  const startManual = useCallback(() => {
    if (pipelineState !== "Ready") return;
    setIsManualMode(true);
    setPipelineState("Queued");
    advanceStepState(step, "PromptGenerated");
    startTimeRef.current = Date.now();

    setTimeout(() => {
      setPipelineState("Running");
      runtime.setConnected(true);
    }, 300);
  }, [pipelineState, step, advanceStepState, runtime]);

  // Start execution — behavior depends on provider type and step
  const start = useCallback(() => {
    if (pipelineState !== "Ready") return;

    setPipelineState("Queued");
    advanceStepState(step, "PromptGenerated");
    startTimeRef.current = Date.now();

    // PR-003 literature search uses the platform's academic database (OpenAlex),
    // NOT the researcher's chosen AI — so it must run for every provider, including
    // external/BYIA. (Previously external returned early here and skipped the search,
    // leaving PR-003 with zero articles.) Manual paste ("Pesquisar manualmente") still
    // goes through startManual/isManualMode.
    if (providerType === "external" && step !== 3) {
      // External (ChatGPT, Gemini, Claude, etc.): skip streaming, await manual response
      setTimeout(() => {
        setPipelineState("Running");
        runtime.setConnected(true);
      }, 300);
      return;
    }

    // PR-003: Search academic database (OpenAlex) instead of LLM
    if (step === 3) {
      setTimeout(() => {
        setPipelineState("Running");
        runtime.setStreaming(true);
        runtime.setConnected(true);
      }, 300);

      let progress = 0;
      streamIntervalRef.current = setInterval(() => {
        progress = Math.min(progress + Math.random() * 8 + 2, 90);
        setStreamProgressState(progress);
        runtime.setStreamProgress(progress);
      }, 300);

      // Build search query from pergunta artifact.
      // Prefer English keywords (OpenAlex is English-centric) and strip wildcard
      // characters (? and *) — OpenAlex rejects them with HTTP 400 unless an exact
      // (no-stem) search is requested. The raw pt-PT research question ends in "?",
      // which broke PR-003 entirely (SAT-001).
      const pergunta = session.artifacts?.[2]?.data as { researchQuestion?: string; keywordsEN?: string[] } | undefined;
      const rawQuery =
        pergunta?.keywordsEN && pergunta.keywordsEN.length > 0
          ? pergunta.keywordsEN.join(" ")
          : pergunta?.researchQuestion || session.researchTopic || "";
      const searchQuery = rawQuery.replace(/[?*]/g, " ").replace(/\s+/g, " ").trim();

      fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, maxResults: 20 }),
      })
        .then((res) => res.json())
        .then((result) => {
          if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
          }

          if (!result.success) {
            setResponseContent(`[Erro] ${result.error || "Falha na pesquisa"}`);
            setPipelineState("Failed");
            runtime.setStreaming(false);
            return;
          }

          const elapsed = Date.now() - startTimeRef.current;
          const articles = result.articles || [];

          // Save articles to repository
          updateArticles(articles);

          // Also save as article-list artifact
          const articleListArtifact = {
            type: "article-list" as const,
            data: {
              articles,
              searchQueries: [searchQuery],
              createdAt: new Date().toISOString(),
            },
          };
          saveArtifact(step, articleListArtifact);

          const contentSummary = `Foram encontrados ${articles.length} artigos:\n\n` +
            articles.map((a: { title: string; authors: string; year: string; source: string; doi?: string }, i: number) =>
              `${i + 1}. ${a.title}\n   Autores: ${a.authors}\n   Ano: ${a.year}\n   Fonte: ${a.source}\n   DOI: ${a.doi || "N/A"}`
            ).join("\n\n");

          setResponseContent(contentSummary);
          setStreamProgressState(100);
          setTokenCountState(0);
          setLatencyState(elapsed);
          runtime.setStreamProgress(100);
          runtime.setTokenCount(0);
          runtime.setLatency(elapsed);
          runtime.setStreaming(false);
          setPipelineState("Validating");
          advanceStepState(step, "PromptExecuted");

          setTimeout(() => {
            setPipelineState("Saving");
            setTimeout(() => {
              setPipelineState("Completed");
              advanceStepState(step, "EvidenceValidated");
            }, 600);
          }, 800);
        })
        .catch((err) => {
          if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
            streamIntervalRef.current = null;
          }
          setResponseContent(`[Erro] ${err.message || "Falha de rede"}`);
          setPipelineState("Failed");
          runtime.setStreaming(false);
        });
      return;
    }

    // Cloud: real API call via /api/execution
    setTimeout(() => {
      setPipelineState("Running");
      runtime.setStreaming(true);
      runtime.setConnected(true);
    }, 300);

    // Simulate progress while waiting for API response
    let progress = 0;
    streamIntervalRef.current = setInterval(() => {
      progress = Math.min(progress + Math.random() * 8 + 2, 90);
      setStreamProgressState(progress);
      runtime.setStreamProgress(progress);
    }, 300);

    // Call the API — pass engine so the backend uses the correct API key + model
    const apiEngine = resolveApiEngine(executionProfile.engineId);
    fetch("/api/execution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        engine: apiEngine,
        prompt: resolvedPrompt,
        task: {
          type: data.stepObjective ?? undefined,
          objective: data.stepObjective ?? undefined,
          expectedOutput: data.stepExpectedOutput ?? undefined,
        },
        profile: {
          temperature: executionProfile.temperature,
          outputStyle: executionProfile.outputStyle,
        },
        variables: session.progress?.[step]?.variables ?? {},
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }

        if (!result.success) {
          setResponseContent(`[Erro] ${result.error || "Falha na execução"}`);
          setPipelineState("Failed");
          runtime.setStreaming(false);
          return;
        }

        const elapsed = Date.now() - startTimeRef.current;
        setResponseContent(result.content);
        setStreamProgressState(100);
        setTokenCountState(result.tokensUsed || 0);
        setLatencyState(elapsed);
        runtime.setStreamProgress(100);
        runtime.setTokenCount(result.tokensUsed || 0);
        runtime.setLatency(elapsed);
        runtime.setStreaming(false);
        setPipelineState("Validating");
        advanceStepState(step, "PromptExecuted");

        // Validating → Saving → Completed
        setTimeout(() => {
          setPipelineState("Saving");
          setTimeout(() => {
            setPipelineState("Completed");
            advanceStepState(step, "EvidenceValidated");
          }, 600);
        }, 800);
      })
      .catch((err) => {
        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }
        setResponseContent(`[Erro] ${err.message || "Falha de rede"}`);
        setPipelineState("Failed");
        runtime.setStreaming(false);
      });
  }, [pipelineState, step, advanceStepState, runtime, providerType, resolvedPrompt, session, updateArticles, saveArtifact, executionProfile.engineId]);

  // External: submit manual response (user pastes the AI output)
  const submitManualResponse = useCallback((response: string) => {
    if (!response.trim()) return;
    const tokens = Math.ceil(response.split(/\s+/).length * 1.3);
    const elapsed = Date.now() - startTimeRef.current;
    setResponseContent(response);
    setStreamProgressState(100);
    setTokenCountState(tokens);
    setLatencyState(elapsed);
    runtime.setStreamProgress(100);
    runtime.setTokenCount(tokens);
    runtime.setLatency(elapsed);
    runtime.setStreaming(false);
    setPipelineState("Validating");
    advanceStepState(step, "PromptExecuted");

    // Validating → Saving → Completed
    setTimeout(() => {
      setPipelineState("Saving");
      setTimeout(() => {
        setPipelineState("Completed");
        advanceStepState(step, "EvidenceValidated");
      }, 600);
    }, 800);
  }, [step, advanceStepState, runtime]);

  const reset = useCallback(() => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    setPipelineState("Ready");
    setIsManualMode(false);
    setValidationNotice(null);
    setStreamProgressState(0);
    setTokenCountState(0);
    setLatencyState(0);
    setResponseContent("");
    runtime.setStreaming(false);
    runtime.setStreamProgress(0);
    runtime.setTokenCount(0);
    runtime.setLatency(0);
    advanceStepState(step, "ContextConfirmed");
  }, [step, advanceStepState, runtime]);

  // Accept artifact — extract structured artifact from LLM response
  const acceptArtifact = useCallback(() => {
    if (!responseContent) return;
    setValidationNotice(null);
    const artifactType = data.expectedArtifactType || "tema";
    const existing = getArtifact(step);
    const existingData = (existing?.data ?? {}) as Record<string, unknown>;
    const articles = getArticles();

    let artifact: Artifact;

    switch (step) {
      case 1: {
        let t = safeExtractJsonBlock<any>(responseContent);
        const extracted = t || extractTemaArtifact(responseContent, {
          studyArea: session.studyArea ?? "",
          researchTopic: session.researchTopic ?? "",
          academicLevel: session.academicLevel ?? "",
        });
        // Merge with existing editor data if present
        if (existing?.type === "tema") {
          const existingTema = existing.data as unknown as Record<string, unknown>;
          artifact = {
            type: "tema",
            data: { ...existingTema, ...extracted, content: responseContent },
          } as unknown as Artifact;
        } else {
          artifact = { type: "tema", data: { ...extracted, content: responseContent } } as unknown as Artifact;
        }
        break;
      }
      case 2: {
        let t = safeExtractJsonBlock<any>(responseContent);
        const extracted = t || extractPerguntaArtifact(responseContent);
        if (existing?.type === "pergunta") {
          const existingPergunta = existing.data as unknown as Record<string, unknown>;
          artifact = {
            type: "pergunta",
            data: { ...existingPergunta, ...extracted, content: responseContent },
          } as unknown as Artifact;
        } else {
          artifact = { type: "pergunta", data: { ...extracted, content: responseContent } } as unknown as Artifact;
        }
        break;
      }
      case 3: {
        // Validation gate: PR-003 can NEVER be completed without at least one usable
        // article. Articles are populated during execution (OpenAlex search) or via the
        // manual article editor. If none exist, stay on PR-003 and show a pedagogical
        // message instead of saving an empty artifact (which would break PR-004).
        const existingArticles = Array.isArray((existingData as { articles?: unknown[] }).articles)
          ? ((existingData as { articles?: unknown[] }).articles as unknown[])
          : [];
        if (existingArticles.length === 0) {
          setValidationNotice(
            "Não foi possível identificar artigos científicos na resposta fornecida. Reveja a resposta do motor de IA ou utilize a Pesquisa Manual."
          );
          return; // do not save, do not advance — user remains on PR-003
        }
        artifact = {
          type: "article-list",
          data: { ...existingData, content: responseContent },
        } as unknown as Artifact;
        break;
      }
      case 4: {
        let t = safeExtractJsonBlock<any>(responseContent);
        const extracted = t || extractSelectionArtifact(responseContent, articles);
        artifact = { type: "selection", data: { ...extracted, content: responseContent } } as unknown as Artifact;
        // Update article repository with selection status
        updateArticles(extracted.articles.map((a: any) => ({
          id: a.id, title: a.title, authors: a.authors, year: a.year, source: a.source,
          doi: a.doi, abstract: a.abstract, selected: a.selected, selectionJustification: a.justification,
          searchQuery: a.searchQuery,
        })));
        break;
      }
      case 5: {
        let t = safeExtractJsonBlock<any>(responseContent);
        const extracted = t || extractReadingCardsArtifact(responseContent, articles);
        if (!extracted.cards || extracted.cards.length === 0) {
          artifact = { type: "raw", data: { content: responseContent, originalType: "reading-cards", createdAt: new Date().toISOString() } } as unknown as Artifact;
        } else {
          artifact = { type: "reading-cards", data: { ...extracted, content: responseContent } } as unknown as Artifact;
        }
        break;
      }
      case 6: {
        let t = safeExtractJsonBlock<any>(responseContent);
        const extracted = t || extractComparisonTableArtifact(responseContent);
        if (!extracted.rows || extracted.rows.length === 0) {
          artifact = { type: "raw", data: { content: responseContent, originalType: "comparison-table", createdAt: new Date().toISOString() } } as unknown as Artifact;
        } else {
          artifact = { type: "comparison-table", data: { ...extracted, content: responseContent } } as unknown as Artifact;
        }
        break;
      }
      case 7: {
        let t = safeExtractJsonBlock<any>(responseContent);
        const extracted = t || extractGapsArtifact(responseContent);
        if (!extracted.gaps || extracted.gaps.length === 0) {
          artifact = { type: "raw", data: { content: responseContent, originalType: "gaps", createdAt: new Date().toISOString() } } as unknown as Artifact;
        } else {
          artifact = { type: "gaps", data: { ...extracted, content: responseContent } } as unknown as Artifact;
        }
        break;
      }
      case 8: {
        let t = safeExtractJsonBlock<any>(responseContent);
        const extracted = t || extractSynthesisArtifact(responseContent);
        if (!extracted.themes || extracted.themes.length === 0) {
          artifact = { type: "raw", data: { content: responseContent, originalType: "synthesis", createdAt: new Date().toISOString() } } as unknown as Artifact;
        } else {
          artifact = { type: "synthesis", data: { ...extracted, content: responseContent } } as unknown as Artifact;
        }
        break;
      }
      case 9: {
        let t = safeExtractJsonBlock<any>(responseContent);
        const extracted = t || extractReviewArtifact(responseContent);
        if (!extracted.body || extracted.body.length < 50) {
          artifact = { type: "raw", data: { content: responseContent, originalType: "review", createdAt: new Date().toISOString() } } as unknown as Artifact;
        } else {
          artifact = { type: "review", data: { ...extracted, content: responseContent } } as unknown as Artifact;
        }
        break;
      }
      case 10: {
        const dateStr = new Date().toISOString().slice(0,10).replace(/-/g, '');
        const filename = `RL01_Revisao_Literatura_${dateStr}.md`;
        artifact = {
          type: "export",
          data: {
            format: "markdown" as const,
            content: responseContent,
            filename: filename,
            exportedAt: new Date().toISOString(),
          },
        } as unknown as Artifact;

        // Trigger download
        if (typeof window !== "undefined") {
          const blob = new Blob([responseContent], { type: "text/markdown" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        break;
      }
      default: {
        artifact = {
          type: artifactType,
          data: { ...existingData, content: responseContent, createdAt: new Date().toISOString() },
        } as unknown as Artifact;
      }
    }

    saveArtifact(step, artifact);
  }, [responseContent, step, session, saveArtifact, data.expectedArtifactType, getArtifact, getArticles, updateArticles]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);

  const pipelineStage = STAGE_FROM_PIPELINE[pipelineState];
  const isRunning = ["Queued", "Running", "Streaming"].includes(pipelineState);
  const isCompleted = pipelineState === "Completed";
  const hasFailed = pipelineState === "Failed";

  return (
    <PipelineContext.Provider
      value={{
        pipelineState,
        pipelineStage,
        isRunning,
        isCompleted,
        hasFailed,
        resolvedPrompt,
        selectedModel,
        isManualMode,
        checkpoints,
        executionProfile,
        executionProvider,
        providerType,
        assistantLabel,
        workflowSteps,
        executionCard,
        streamProgress,
        tokenCount,
        latencyMs,
        responseContent,
        validationNotice,
        start,
        startManual,
        reset,
        submitManualResponse,
        acceptArtifact,
        setPipelineState,
        setStreamProgress: setStreamProgressState,
        setTokenCount: setTokenCountState,
        setLatency: setLatencyState,
      }}
    >
      {children}
    </PipelineContext.Provider>
  );
}

export function usePipeline() {
  const ctx = useContext(PipelineContext);
  if (!ctx) {
    throw new Error("usePipeline must be used within PipelineExecutionProvider");
  }
  return ctx;
}
