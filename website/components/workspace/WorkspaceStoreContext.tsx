"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { validateWorkspaceInput, createWorkspaceEntity, type WorkspaceStatus as WsStatus, type WorkspaceInput } from "@/lib/WorkspaceFactory";
import { migrateExecutionMode, migrateToProfile, type ExecutionProviderConfig, type ExecutionProfile, type ProviderType } from "@/lib/ScientificExecutionEngine";

/* ============================================================
   WorkspaceRepository — localStorage CRUD for multi-workspace
   Each workspace is a root entity containing:
   - metadata (title, protocol, study area, etc.)
   - progress per step
   - artifacts per step
   ============================================================ */

export type SessionState =
  | "Draft"
  | "ContextConfirmed"
  | "PromptGenerated"
  | "PromptExecuted"
  | "EvidenceValidated"
  | "Completed";

export type WorkspaceStatus = WsStatus;

// Re-export for backward compat during migration
export type { ExecutionProviderConfig, ExecutionProfile, ProviderType } from "@/lib/ScientificExecutionEngine";

export type StepProgress = {
  status: SessionState;
  variables: Record<string, string>;
  checklist: Record<string, boolean>;
};

// ---- Artifact types (moved from ArtifactStore) ----
export interface TemaArtifact {
  studyArea: string;
  researchTopic: string;
  academicLevel: string;
  delimited: string;
  feasibility: string;
  createdAt: string;
}

export interface PerguntaArtifact {
  researchQuestion: string;
  generalObjective: string;
  specificObjectives: string[];
  keywordsPT: string[];
  keywordsEN: string[];
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  authors: string;
  year: string;
  source: string;
  doi?: string;
  abstract?: string;
  selected?: boolean;
  selectionJustification?: string;
  fullText?: string;
  pdfUrl?: string;
  searchQuery?: string;
  relevanceScore?: number;
  citedByCount?: number;
  isOpenAccess?: boolean;
}

export interface ArticleListArtifact {
  articles: Article[];
  searchQueries: string[];
  createdAt: string;
}

export interface SelectedArticle extends Article {
  selected: boolean;
  justification: string;
}

export interface SelectionArtifact {
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  articles: SelectedArticle[];
  createdAt: string;
}

export interface ReadingCard {
  articleId: string;
  articleTitle: string;
  objective: string;
  methodology: string;
  sample: string;
  results: string;
  limitations: string;
  contribution: string;
  quality: string;
  createdAt: string;
}

export interface ReadingCardsArtifact {
  cards: ReadingCard[];
  createdAt: string;
}

export interface ComparisonRow {
  articleId: string;
  articleTitle: string;
  objective: string;
  methodology: string;
  sample: string;
  results: string;
  limitations: string;
}

export interface ComparisonTableArtifact {
  rows: ComparisonRow[];
  convergences: string[];
  divergences: string[];
  createdAt: string;
}

export interface ResearchGap {
  id: string;
  description: string;
  justification: string;
  addressable: string;
}

export interface GapsArtifact {
  gaps: ResearchGap[];
  createdAt: string;
}

export interface SynthesisTheme {
  id: string;
  name: string;
  description: string;
  evidence: string;
  articles: string[];
}

export interface SynthesisArtifact {
  themes: SynthesisTheme[];
  trends: string[];
  contradictions: string[];
  createdAt: string;
}

export interface ReviewArtifact {
  title: string;
  introduction: string;
  body: string;
  conclusion: string;
  references: string[];
  wordCount: number;
  createdAt: string;
}

export interface ExportArtifact {
  format: "docx" | "pdf" | "markdown";
  content: string;
  filename: string;
  exportedAt: string;
}

export type Artifact =
  | { type: "tema"; data: TemaArtifact }
  | { type: "pergunta"; data: PerguntaArtifact }
  | { type: "article-list"; data: ArticleListArtifact }
  | { type: "selection"; data: SelectionArtifact }
  | { type: "reading-cards"; data: ReadingCardsArtifact }
  | { type: "comparison-table"; data: ComparisonTableArtifact }
  | { type: "gaps"; data: GapsArtifact }
  | { type: "synthesis"; data: SynthesisArtifact }
  | { type: "review"; data: ReviewArtifact }
  | { type: "export"; data: ExportArtifact }
  | { type: "raw"; data: { content: string; originalType: string; createdAt: string } };

export type StoredArtifact = Artifact & { researcher_id?: string; workspace_id?: string; session_id?: string };

// ---- Workspace entity ----
export interface Workspace {
  id: string;
  title: string;
  protocolSlug: string;
  studyArea: string;
  researchTopic: string;
  academicLevel: string;
  language: string;
  executionProfile?: ExecutionProfile;
  executionProvider: ExecutionProviderConfig;
  currentStep: number;
  status: WorkspaceStatus;
  createdAt: string;
  updatedAt: string;
  artifacts: Record<number, StoredArtifact>;
  progress: Record<number, StepProgress>;
  articleRepository?: Article[];
  researcher_id?: string;
  workspace_id?: string;
  session_id?: string;
}

// ---- Repository ----
const STORAGE_KEY = "raihub:v2:workspaces";
const ACTIVE_KEY = "raihub:v2:active_workspace";
const RESEARCHER_ID_KEY = "researchai.researcher_id";
const SESSION_ID_KEY = "researchai.session_id";
const SESSION_STARTED_AT_KEY = "researchai.session_started_at";

function generateId(): string {
  return `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

function genId(prefix: string): string {
  const hex = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase()
    : Math.random().toString(16).substring(2, 10).toUpperCase();
  return `${prefix}-${hex}`;
}

function getOrCreateResearcherId(): string | null {
  if (typeof window === "undefined") return null;
  let rid = localStorage.getItem(RESEARCHER_ID_KEY);
  if (!rid) {
    rid = genId("RID");
    localStorage.setItem(RESEARCHER_ID_KEY, rid);
  }
  return rid;
}

function getOrCreateSession() {
  if (typeof window === "undefined") return { sessionId: null, sessionStartedAt: null };
  let sid = sessionStorage.getItem(SESSION_ID_KEY);
  let startedAt = sessionStorage.getItem(SESSION_STARTED_AT_KEY);
  if (!sid) {
    sid = genId("SID");
    startedAt = new Date().toISOString();
    sessionStorage.setItem(SESSION_ID_KEY, sid);
    sessionStorage.setItem(SESSION_STARTED_AT_KEY, startedAt);
  }
  return { sessionId: sid, sessionStartedAt: startedAt };
}

function loadAll(): Workspace[] {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<Record<string, unknown>>;
        // Migrate old workspaces: executionMode → executionProvider → executionProfile
        return parsed.map((w) => {
          // Already has executionProfile — modern workspace
          if (w.executionProfile) return w as unknown as Workspace;

          // Has executionProvider but no profile — migrate
          if (w.executionProvider) {
            const provider = w.executionProvider as ExecutionProviderConfig;
            return {
              ...w,
              executionProfile: migrateToProfile(provider),
            } as unknown as Workspace;
          }

          // Oldest format: has executionMode — migrate to provider + profile
          const mode = w.executionMode as string | undefined;
          const { executionMode, ...rest } = w;
          const provider = migrateExecutionMode(mode);
          return {
            ...rest,
            executionProvider: provider,
            executionProfile: migrateToProfile(provider),
          } as unknown as Workspace;
        });
      }
    }
  } catch {}
  return [];
}

function saveAll(workspaces: Workspace[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspaces));
  } catch {}
}

function loadActiveId(): string | null {
  try {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ACTIVE_KEY);
    }
  } catch {}
  return null;
}

function saveActiveId(id: string | null): void {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {}
}

// ---- Context type ----
interface WorkspaceStoreContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  ready: boolean;
  researcherId: string | null;

  // Workspace lifecycle
  createWorkspace: (data: Partial<Pick<Workspace, "title" | "protocolSlug" | "studyArea" | "researchTopic" | "academicLevel" | "language" | "executionProvider">>) => string;
  setActiveWorkspace: (id: string) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  archiveWorkspace: (id: string) => void;
  duplicateWorkspace: (id: string) => string;

  // Session-like interface (operates on active workspace)
  session: Partial<Workspace>;
  updateSession: (updates: Partial<Workspace>) => void;
  updateStepProgress: (step: number, progressUpdate: Partial<StepProgress>) => void;
  advanceStepState: (step: number, targetState: SessionState) => void;

  // Artifact interface (operates on active workspace)
  saveArtifact: (step: number, artifact: Artifact) => void;
  getArtifact: (step: number) => Artifact | undefined;
  getTema: () => TemaArtifact | null;
  getPergunta: () => PerguntaArtifact | null;
  getArticleList: () => ArticleListArtifact | null;
  getSelection: () => SelectionArtifact | null;
  getReadingCards: () => ReadingCardsArtifact | null;
  getComparisonTable: () => ComparisonTableArtifact | null;
  getGaps: () => GapsArtifact | null;
  getSynthesis: () => SynthesisArtifact | null;
  getReview: () => ReviewArtifact | null;

  // Article Repository
  getArticles: () => Article[];
  updateArticles: (articles: Article[]) => void;
}

const WorkspaceStoreContext = createContext<WorkspaceStoreContextType | undefined>(undefined);

export function WorkspaceStoreProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [researcherId, setResearcherId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);

  useEffect(() => {
    const all = loadAll();
    setWorkspaces(all);
    const aid = loadActiveId();
    if (aid && all.some(w => w.id === aid)) {
      setActiveId(aid);
    } else if (all.length > 0) {
      const firstActive = all.find(w => w.status === "READY" || w.status === "COMPLETED");
      if (firstActive) {
        setActiveId(firstActive.id);
        saveActiveId(firstActive.id);
      }
    }
    setReady(true);

    const rid = getOrCreateResearcherId();
    const { sessionId: sid, sessionStartedAt: startedAt } = getOrCreateSession();
    setResearcherId(rid);
    setSessionId(sid);
    setSessionStartedAt(startedAt);
  }, []);

  // Persist to localStorage whenever workspaces change (after initial load)
  useEffect(() => {
    if (ready) saveAll(workspaces);
  }, [workspaces, ready]);

  const activeWorkspace = workspaces.find(w => w.id === activeId) ?? null;

  // ---- Workspace lifecycle (REGRA 5: transacional) ----
  const createWorkspace = useCallback((data: Partial<Pick<Workspace, "title" | "protocolSlug" | "studyArea" | "researchTopic" | "academicLevel" | "language" | "executionProvider">>) => {
    // REGRA 4: validate even if UI already validated
    const input: WorkspaceInput = {
      title: (data.researchTopic || data.title || "").trim(),
      protocolSlug: data.protocolSlug || "",
      studyArea: (data.studyArea || "").trim(),
      researchTopic: (data.researchTopic || "").trim(),
      academicLevel: data.academicLevel || "",
      language: data.language || "pt",
      executionProvider: data.executionProvider || { type: "cloud", assistantId: "researchai-cloud" },
    };

    const validation = validateWorkspaceInput(input);
    if (!validation.valid) {
      console.error("[WorkspaceFactory] Validation failed:", validation.errors);
      throw new Error(`Workspace inválido: ${validation.errors.join("; ")}`);
    }

    // REGRA 5: create validated object via factory
    const entity = createWorkspaceEntity(input, generateId);

    const ws: Workspace = {
      ...entity,
      artifacts: {},
      progress: {},
      researcher_id: researcherId ?? undefined,
      workspace_id: genId("WSP"),
      session_id: sessionId ?? undefined,
    };

    // Persist immediately (don't rely on updater side-effects)
    setWorkspaces(prev => [...prev, ws]);
    setActiveId(ws.id);
    saveActiveId(ws.id);
    return ws.id;
  }, [researcherId, sessionId]);

  const setActiveWorkspace = useCallback((id: string) => {
    setActiveId(id);
    saveActiveId(id);
  }, []);

  const updateWorkspace = useCallback((id: string, updates: Partial<Workspace>) => {
    setWorkspaces(prev =>
      prev.map(w => w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w)
    );
  }, []);

  const deleteWorkspace = useCallback((id: string) => {
    setWorkspaces(prev => prev.filter(w => w.id !== id));
    setActiveId(prev => {
      if (prev === id) {
        const remaining = workspaces.filter(w => w.id !== id);
        const newActive = remaining.length > 0 ? remaining[0].id : null;
        saveActiveId(newActive);
        return newActive;
      }
      return prev;
    });
  }, [workspaces]);

  const archiveWorkspace = useCallback((id: string) => {
    updateWorkspace(id, { status: "ARCHIVED" });
  }, [updateWorkspace]);

  const duplicateWorkspace = useCallback((id: string) => {
    const ws = workspaces.find(w => w.id === id);
    if (!ws) return "";
    const now = new Date().toISOString();
    const copy: Workspace = {
      ...ws,
      id: generateId(),
      title: `${ws.title} (cópia)`,
      status: "READY",
      createdAt: now,
      updatedAt: now,
      artifacts: { ...ws.artifacts },
      progress: { ...ws.progress },
      workspace_id: genId("WSP"),
      researcher_id: researcherId ?? undefined,
      session_id: sessionId ?? undefined,
    };
    setWorkspaces(prev => [...prev, copy]);
    return copy.id;
  }, [workspaces, researcherId, sessionId]);

  // ---- Session-like interface (operates on active workspace) ----
  const session: Partial<Workspace> = activeWorkspace ?? {};

  const updateSession = useCallback((updates: Partial<Workspace>) => {
    if (!activeId) return;
    updateWorkspace(activeId, updates);
  }, [activeId, updateWorkspace]);

  const updateStepProgress = useCallback((step: number, progressUpdate: Partial<StepProgress>) => {
    if (!activeId) return;
    setWorkspaces(prev => {
      return prev.map(w => {
        if (w.id !== activeId) return w;
        const prevProgress = w.progress || {};
        const stepProg = prevProgress[step] || { status: "Draft", variables: {}, checklist: {} };
        return {
          ...w,
          progress: {
            ...prevProgress,
            [step]: {
              ...stepProg,
              ...progressUpdate,
              variables: { ...stepProg.variables, ...progressUpdate.variables },
              checklist: { ...stepProg.checklist, ...progressUpdate.checklist },
            },
          },
          updatedAt: new Date().toISOString(),
        };
      });
    });
  }, [activeId]);

  const advanceStepState = useCallback((step: number, targetState: SessionState) => {
    updateStepProgress(step, { status: targetState });
  }, [updateStepProgress]);

  // ---- Artifact interface (operates on active workspace) ----
  const saveArtifact = useCallback((step: number, artifact: Artifact) => {
    if (!activeId) return;
    setWorkspaces(prev =>
      prev.map(w => {
        if (w.id !== activeId) return w;
        const storedArtifact: StoredArtifact = {
          ...artifact,
          researcher_id: researcherId ?? undefined,
          workspace_id: w.workspace_id ?? activeId,
          session_id: sessionId ?? undefined,
        };
        return { ...w, artifacts: { ...w.artifacts, [step]: storedArtifact }, updatedAt: new Date().toISOString() };
      })
    );
  }, [activeId, researcherId, sessionId]);

  const getArtifact = useCallback((step: number): Artifact | undefined => {
    return activeWorkspace?.artifacts?.[step];
  }, [activeWorkspace]);

  const getTyped = useCallback(<T,>(step: number, type: string): T | null => {
    const a = activeWorkspace?.artifacts?.[step];
    return a?.type === type ? (a.data as T) : null;
  }, [activeWorkspace]);

  const getTema = useCallback(() => getTyped<TemaArtifact>(1, "tema"), [getTyped]);
  const getPergunta = useCallback(() => getTyped<PerguntaArtifact>(2, "pergunta"), [getTyped]);
  const getArticleList = useCallback(() => getTyped<ArticleListArtifact>(3, "article-list"), [getTyped]);
  const getSelection = useCallback(() => getTyped<SelectionArtifact>(4, "selection"), [getTyped]);
  const getReadingCards = useCallback(() => getTyped<ReadingCardsArtifact>(5, "reading-cards"), [getTyped]);
  const getComparisonTable = useCallback(() => getTyped<ComparisonTableArtifact>(6, "comparison-table"), [getTyped]);
  const getGaps = useCallback(() => getTyped<GapsArtifact>(7, "gaps"), [getTyped]);
  const getSynthesis = useCallback(() => getTyped<SynthesisArtifact>(8, "synthesis"), [getTyped]);
  const getReview = useCallback(() => getTyped<ReviewArtifact>(9, "review"), [getTyped]);

  // ---- Article Repository ----
  const getArticles = useCallback((): Article[] => {
    return activeWorkspace?.articleRepository ?? [];
  }, [activeWorkspace]);

  const updateArticles = useCallback((articles: Article[]) => {
    if (!activeId) return;
    setWorkspaces(prev =>
      prev.map(w => w.id === activeId
        ? { ...w, articleRepository: articles, updatedAt: new Date().toISOString() }
        : w
      )
    );
  }, [activeId]);

  return (
    <WorkspaceStoreContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        ready,
        researcherId,
        createWorkspace,
        setActiveWorkspace,
        updateWorkspace,
        deleteWorkspace,
        archiveWorkspace,
        duplicateWorkspace,
        session,
        updateSession,
        updateStepProgress,
        advanceStepState,
        saveArtifact,
        getArtifact,
        getTema,
        getPergunta,
        getArticleList,
        getSelection,
        getReadingCards,
        getComparisonTable,
        getGaps,
        getSynthesis,
        getReview,
        getArticles,
        updateArticles,
      }}
    >
      {children}
    </WorkspaceStoreContext.Provider>
  );
}

export function useWorkspaceStore() {
  const ctx = useContext(WorkspaceStoreContext);
  if (!ctx) {
    throw new Error("useWorkspaceStore must be used within WorkspaceStoreProvider");
  }
  return ctx;
}
