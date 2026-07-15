"use client";

import React, { useState } from "react";
import { useStepData } from "../StepDataContext";
import { useWorkspaceStore } from "../WorkspaceStoreContext";
import { useWorkspace } from "../WorkspaceContext";
import { usePipeline, type PipelineStage } from "../PipelineExecutionEngine";
import { getEngineUrl, getEngine, ENGINE_CATEGORY_LABELS, EXECUTION_CATALOG, getEngineActionLabel, type ProviderType } from "@/lib/ScientificExecutionEngine";
import { ArtifactEditorDispatcher } from "../../artifacts/ArtifactEditorDispatcher";
import { phaseFromSessionState } from "../WorkspaceCompositionEngine";
import styles from "./panels.module.css";

/* ============================================================
   ResearchConsolePanel — single panel that changes state
   based on PipelineState.

   Editing  → ArtifactEditorDispatcher
   Ready    → Pipeline checklist + Executar IA
   Running  → Streaming progress
   Completed→ Resultado (Resposta, Raciocínio, Fontes, Validação, Artefacto)
   ============================================================ */

const STAGE_ORDER: PipelineStage[] = ["prompt", "execution", "output", "validation", "artifact"];

const STAGE_LABELS: Record<PipelineStage, string> = {
  prompt: "Prompt",
  execution: "Execução",
  output: "Resultado",
  validation: "Validação",
  artifact: "Artefacto",
};

function compactChars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k chars` : `${n} chars`;
}

export function ResearchConsolePanel() {
  const data = useStepData();
  const { session } = useWorkspaceStore();
  const pipeline = usePipeline();

  const step = session.currentStep || 1;
  const status = session.progress?.[step]?.status || "Draft";
  const phase = phaseFromSessionState(status);

  if (pipeline.pipelineState === "Editing") {
    return <ArtifactEditorDispatcher />;
  }

  if (pipeline.pipelineState === "Ready") {
    return <PipelineReady />;
  }

  if (pipeline.hasFailed) {
    return <PipelineFailed />;
  }

  if (pipeline.isRunning) {
    return <PipelineRunning />;
  }

  return <PipelineResults />;
}

/* ============================================================
   PipelineReady — Scientific task pipeline with Execution Card
   Prompt is an advanced/optional panel, not a main checkpoint.
   ============================================================ */
function PipelineReady() {
  const pipeline = usePipeline();
  const data = useStepData();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState<"prompt" | "payload" | "variables" | "logs" | "debug">("prompt");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pipeline.resolvedPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCopyAndOpen = () => {
    navigator.clipboard.writeText(pipeline.resolvedPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      const url = getEngineUrl(pipeline.executionProvider.assistantId);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => pipeline.start(), 500);
    });
  };

  const card = pipeline.executionCard;
  const engine = getEngine(pipeline.executionProvider.assistantId);

  let primaryAction: React.ReactNode;
  
  if (data.stepOrder === 3) {
    primaryAction = (
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
        <button className={styles.pipelineExecuteBtn} onClick={pipeline.start}>
          ▶ Pesquisar automaticamente
        </button>
        <button className={styles.pipelineExecuteBtnSecondary} onClick={() => {
          handleCopy();
          pipeline.startManual();
        }}>
          Pesquisar manualmente
        </button>
        <button className={styles.pipelineExecuteBtnSecondary} onClick={pipeline.startManual}>
          Importar lista existente
        </button>
      </div>
    );
  } else {
    primaryAction = pipeline.providerType === "cloud" ? (
      <button className={styles.pipelineExecuteBtn} onClick={pipeline.start}>
        ▶ Executar
      </button>
    ) : pipeline.providerType === "external" ? (
      <button className={styles.pipelineExecuteBtn} onClick={handleCopyAndOpen}>
        📋 Copiar e Abrir {pipeline.assistantLabel}
      </button>
    ) : (
      <button className={styles.pipelineExecuteBtn} onClick={pipeline.start}>
        ▶ Executar no {pipeline.assistantLabel}
      </button>
    );
  }

  return (
    <div className={styles.pipelineReady}>
      <div className={styles.pipelineReadyHeader}>
        <span className={styles.pipelineReadyTitle}>Pipeline Científico</span>
        <span className={styles.pipelineReadyState}>🟢 Pronto</span>
      </div>

      {data.stepOrder > 1 && (
        <div style={{ marginBottom: "16px" }}>
          <a href={`./${data.stepOrder - 1}`} className={styles.pipelineResetBtn} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Consultar Passo {data.stepOrder - 1}
          </a>
        </div>
      )}

      {/* Scientific checkpoints */}
      <div className={styles.pipelineChecklist}>
        {pipeline.checkpoints.map((cp) => (
          <div key={cp.id} className={styles.pipelineChecklistRow}>
            <span className={styles.pipelineChecklistIcon}>
              {cp.status === "done" ? "✓" : "○"}
            </span>
            <span className={styles.pipelineChecklistLabel}>{cp.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.pipelineDivider} />

      {/* Narrative flow: Objetivo → Instruções → Execução → Workflow → Artefacto */}

      {/* Objetivo */}
      {data.stepObjective && (
        <div className={styles.narrativeBlock}>
          <span className={styles.narrativeBlockTitle}>Objetivo</span>
          <p className={styles.narrativeBlockText}>{data.stepObjective}</p>
        </div>
      )}

      {/* Instruções */}
      {data.stepInstruction && (
        <div className={styles.narrativeBlock}>
          <span className={styles.narrativeBlockTitle}>Instruções</span>
          <p className={styles.narrativeBlockText}>{data.stepInstruction}</p>
        </div>
      )}

      {/* Execution Card — grouped by domain */}
      <div className={styles.executionCard}>
        <div className={styles.executionCardHeader}>
          <span className={styles.executionCardIcon}>{engine?.icon ?? "🤖"}</span>
          <span className={styles.executionCardTitle}>Execução</span>
        </div>

        {/* Identidade */}
        <div className={styles.executionCardGroup}>
          <span className={styles.executionCardGroupTitle}>Identidade</span>
          <div className={styles.executionCardGrid}>
            <div className={styles.executionCardItem}>
              <span className={styles.executionCardLabel}>Executor</span>
              <span className={styles.executionCardValue}>{card.engine}</span>
            </div>
            <div className={styles.executionCardItem}>
              <span className={styles.executionCardLabel}>Modelo</span>
              <span className={styles.executionCardValue}>{card.model}</span>
            </div>
          </div>
        </div>

        {/* Missão */}
        <div className={styles.executionCardGroup}>
          <span className={styles.executionCardGroupTitle}>Missão</span>
          <div className={styles.executionCardGrid}>
            <div className={styles.executionCardItem}>
              <span className={styles.executionCardLabel}>Tipo</span>
              <span className={styles.executionCardValue}>{card.taskTypeLabel}</span>
            </div>
            <div className={styles.executionCardItem}>
              <span className={styles.executionCardLabel}>Descrição</span>
              <span className={styles.executionCardValue}>{card.taskTypeDescription}</span>
            </div>
            <div className={styles.executionCardItem}>
              <span className={styles.executionCardLabel}>Resultado esperado</span>
              <span className={styles.executionCardValue}>{card.expectedOutput}</span>
            </div>
          </div>
        </div>

        {/* Entrega */}
        <div className={styles.executionCardGroup}>
          <span className={styles.executionCardGroupTitle}>Entrega</span>
          <div className={styles.executionCardGrid}>
            <div className={styles.executionCardItem}>
              <span className={styles.executionCardLabel}>Artefacto</span>
              <span className={styles.executionCardValue}>{card.artifactType}</span>
            </div>
            <div className={styles.executionCardItem}>
              <span className={styles.executionCardLabel}>Tempo previsto</span>
              <span className={styles.executionCardValue}>{card.estimatedTime}</span>
            </div>
          </div>
        </div>

        {/* Advanced config (collapsible, organized by domain) */}
        <div className={styles.executionCardAdvancedBar} onClick={() => setShowAdvanced(!showAdvanced)}>
          <span className={styles.executionCardAdvancedIcon}>⚙</span>
          <span className={styles.executionCardAdvancedLabel}>Configuração avançada</span>
          <span className={styles.executionCardAdvancedToggle}>
            {showAdvanced ? "▲" : "▼"}
          </span>
        </div>
        {showAdvanced && (
          <div className={styles.executionCardAdvancedGrid}>
            {/* Executor */}
            <div className={styles.executionCardSection}>
              <span className={styles.executionCardSectionTitle}>Executor</span>
              <div className={styles.executionCardItem}>
                <span className={styles.executionCardLabel}>Modo</span>
                <span className={styles.executionCardValue}>
                  {card.providerType === "cloud" ? "Plataforma" : card.providerType === "external" ? "Prompt externo" : "Agente local"}
                </span>
              </div>
              <div className={styles.executionCardItem}>
                <span className={styles.executionCardLabel}>Provider</span>
                <span className={styles.executionCardValue}>{card.providerType}</span>
              </div>
              <div className={styles.executionCardItem}>
                <span className={styles.executionCardLabel}>Streaming</span>
                <span className={styles.executionCardValue}>{card.providerType === "cloud" ? "Sim" : "Não"}</span>
              </div>
            </div>
            {/* Inferência */}
            <div className={styles.executionCardSection}>
              <span className={styles.executionCardSectionTitle}>Inferência</span>
              <div className={styles.executionCardItem}>
                <span className={styles.executionCardLabel}>Temperatura</span>
                <span className={styles.executionCardValue}>{card.temperature}</span>
              </div>
              <div className={styles.executionCardItem}>
                <span className={styles.executionCardLabel}>Context Window</span>
                <span className={styles.executionCardValue}>{card.contextWindow}</span>
              </div>
            </div>
            {/* Saída */}
            <div className={styles.executionCardSection}>
              <span className={styles.executionCardSectionTitle}>Saída</span>
              <div className={styles.executionCardItem}>
                <span className={styles.executionCardLabel}>Output style</span>
                <span className={styles.executionCardValue}>{card.outputStyle}</span>
              </div>
              <div className={styles.executionCardItem}>
                <span className={styles.executionCardLabel}>Validation</span>
                <span className={styles.executionCardValue}>{card.validationMode}</span>
              </div>
            </div>
            {/* Recursos */}
            <div className={styles.executionCardSection}>
              <span className={styles.executionCardSectionTitle}>Recursos</span>
              <div className={styles.executionCardItem}>
                <span className={styles.executionCardLabel}>Prompt tokens</span>
                <span className={styles.executionCardValue}>{card.promptTokens}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary action — visual center of the page */}
      <div className={styles.pipelineExecuteCenter}>
        {primaryAction}
      </div>

      {/* Per-engine workflow steps with subtitles */}
      <div className={styles.workflowSteps}>
        {pipeline.workflowSteps.map((ws, i) => (
          <div key={ws.id} className={styles.workflowStep}>
            <span className={styles.workflowStepNum}>{i + 1}</span>
            <div className={styles.workflowStepContent}>
              <span className={styles.workflowStepLabel}>{ws.label}</span>
              {ws.hint && <span className={styles.workflowStepHint}>{ws.hint}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.pipelineDivider} />

      {/* Ferramentas do Executor (optional, opens side drawer) */}
      <div className={styles.advancedPromptBar} onClick={() => setShowTools(!showTools)}>
        <span className={styles.advancedPromptIcon}>🔧</span>
        <span className={styles.advancedPromptLabel}>Ferramentas do Executor</span>
        <span className={styles.advancedPromptMeta}>{compactChars(pipeline.resolvedPrompt.length)}</span>
        <span className={styles.advancedPromptToggle}>
          {showTools ? "Ocultar" : "Mostrar"}
        </span>
      </div>

      {/* Side drawer for tools */}
      {showTools && (
        <div className={styles.toolsDrawer}>
          <div className={styles.toolsDrawerHeader}>
            <span className={styles.toolsDrawerTitle}>Ferramentas do Executor</span>
            <button className={styles.toolsDrawerClose} onClick={() => setShowTools(false)}>✕</button>
          </div>
          <div className={styles.toolsTabs}>
            <button
              className={`${styles.toolTab} ${activeToolTab === "prompt" ? styles.toolTabActive : ""}`}
              onClick={() => setActiveToolTab("prompt")}
            >Prompt</button>
            <button
              className={`${styles.toolTab} ${activeToolTab === "payload" ? styles.toolTabActive : ""}`}
              onClick={() => setActiveToolTab("payload")}
            >Payload</button>
            <button
              className={`${styles.toolTab} ${activeToolTab === "variables" ? styles.toolTabActive : ""}`}
              onClick={() => setActiveToolTab("variables")}
            >Variáveis</button>
            <button
              className={`${styles.toolTab} ${activeToolTab === "logs" ? styles.toolTabActive : ""}`}
              onClick={() => setActiveToolTab("logs")}
            >Logs</button>
            <button
              className={`${styles.toolTab} ${activeToolTab === "debug" ? styles.toolTabActive : ""}`}
              onClick={() => setActiveToolTab("debug")}
            >Debug</button>
          </div>
          <div className={styles.toolsDrawerBody}>
            {activeToolTab === "prompt" && (
              <>
                <pre className={styles.pipelinePromptPre}>{pipeline.resolvedPrompt}</pre>
                <div className={styles.advancedPromptActions}>
                  <button
                    className={`${styles.pipelinePromptCopy} ${copied ? styles.pipelinePromptCopyDone : ""}`}
                    onClick={handleCopy}
                  >
                    {copied ? "✓ Copiado!" : "📋 Copiar"}
                  </button>
                  {getEngineUrl(pipeline.executionProvider.assistantId) && (
                    <a
                      href={getEngineUrl(pipeline.executionProvider.assistantId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.advancedPromptLink}
                    >
                      Abrir {pipeline.assistantLabel} ↗
                    </a>
                  )}
                </div>
              </>
            )}
            {activeToolTab === "payload" && (
              <pre className={styles.pipelinePromptPre}>{JSON.stringify({ model: card.model, temperature: card.temperature, outputStyle: card.outputStyle, validationMode: card.validationMode, promptTokens: card.promptTokens }, null, 2)}</pre>
            )}
            {activeToolTab === "variables" && (
              <div className={styles.variablesList}>
                {(data.promptVariables ?? []).map((v) => (
                  <div key={v.name} className={styles.variableItem}>
                    <span className={styles.variableName}>{`{{${v.name}}}`}</span>
                    <span className={styles.variableValue}>{v.values?.[0] ?? "—"}</span>
                  </div>
                ))}
                {(data.promptVariables ?? []).length === 0 && (
                  <p className={styles.evidenceDocSectionPlaceholder}>Sem variáveis definidas.</p>
                )}
              </div>
            )}
            {activeToolTab === "logs" && (
              <p className={styles.evidenceDocSectionPlaceholder}>Sem logs registados.</p>
            )}
            {activeToolTab === "debug" && (
              <pre className={styles.pipelinePromptPre}>{JSON.stringify({ pipelineState: pipeline.pipelineState, providerType: pipeline.providerType, engineId: card.engineId, resolvedPromptLength: pipeline.resolvedPrompt.length }, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PipelineRunning — streaming progress
   ============================================================ */
function PipelineRunning() {
  const pipeline = usePipeline();
  const data = useStepData();
  const [manualResponse, setManualResponse] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pipeline.resolvedPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const protocolId = data.slug.slice(0, 8).toUpperCase();
  const stepId = `PR-${String(data.stepOrder).padStart(3, "0")}`;

  // Paste-response UI: for manual mode (any step) and for external LLM steps.
  // PR-003 auto-search (external, not manual) runs the platform's OpenAlex search
  // instead, so it must NOT show the paste UI — it shows the streaming/progress view.
  if ((pipeline.isManualMode || (pipeline.providerType === "external" && data.stepOrder !== 3)) && pipeline.pipelineState === "Running") {
    return (
      <div className={styles.pipelineRunning}>
        <div className={styles.pipelineRunningHeader}>
          <span className={styles.pipelineRunningTitle}>{pipeline.assistantLabel} — Aguardar Resposta</span>
          <span className={styles.pipelineRunningSep}>·</span>
          <span className={styles.pipelineRunningMeta}>{protocolId}</span>
          <span className={styles.pipelineRunningSep}>·</span>
          <span className={styles.pipelineRunningMeta}>{stepId}</span>
          <span className={styles.pipelineRunningState}>
            <span className={styles.streamingDot} />
            Aguardar resposta
          </span>
        </div>

        {/* Workflow steps for this assistant */}
        <div className={styles.workflowSteps}>
          {pipeline.workflowSteps.map((ws, i) => (
            <div
              key={ws.id}
              className={`${styles.workflowStep} ${ws.id === "paste" ? styles.workflowStepActive : ""}`}
            >
              <span className={styles.workflowStepNum}>{i + 1}</span>
              <span className={styles.workflowStepLabel}>{ws.label}</span>
              {ws.hint && <span className={styles.workflowStepHint}>{ws.hint}</span>}
            </div>
          ))}
        </div>

        <div className={styles.byomPasteArea}>
          <div className={styles.byomInstructions}>
            <span className={styles.byomStep}>✓ Prompt copiado para a área de transferência.</span>
            <span className={styles.byomStep}>✓ {pipeline.assistantLabel} aberto numa nova janela.</span>
            {getEngineUrl(pipeline.executionProvider.assistantId) && (
              <a
                href={getEngineUrl(pipeline.executionProvider.assistantId)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.byomHintLink}
              >
                → Reabrir {pipeline.assistantLabel} ↗
              </a>
            )}
            <span className={styles.byomStep}>3. Copie a resposta gerada no {pipeline.assistantLabel}.</span>
            <span className={styles.byomStep}>4. Cole a resposta abaixo e clique em "Validar".</span>
          </div>

          <div className={styles.byomPromptPreview}>
            <div className={styles.byomPromptHeader}>
              <span className={styles.byomPromptLabel}>Prompt (avançado)</span>
              <button
                className={`${styles.pipelinePromptCopy} ${copied ? styles.pipelinePromptCopyDone : ""}`}
                onClick={handleCopy}
              >
                {copied ? "✓ Copiado!" : "📋 Copiar novamente"}
              </button>
            </div>
            <pre className={styles.pipelinePromptPre}>{pipeline.resolvedPrompt}</pre>
          </div>

          <textarea
            className={styles.byomTextarea}
            placeholder={`Cole aqui a resposta do ${pipeline.assistantLabel}…`}
            value={manualResponse}
            onChange={(e) => setManualResponse(e.target.value)}
            rows={12}
            autoFocus
          />

          <div className={styles.pipelineReadyActions}>
            <button
              className={styles.pipelineExecuteBtn}
              onClick={() => pipeline.submitManualResponse(manualResponse)}
              disabled={!manualResponse.trim()}
            >
              ✓ Validar Resposta
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subSteps = [
    { label: "A pensar…", active: pipeline.pipelineState === "Running" },
    { label: "A pesquisar…", active: pipeline.pipelineState === "Streaming" && pipeline.streamProgress < 50 },
    { label: "A gerar…", active: pipeline.pipelineState === "Streaming" && pipeline.streamProgress >= 50 },
    { label: "A validar…", active: pipeline.pipelineState === "Validating" },
  ];

  return (
    <div className={styles.pipelineRunning}>
      <div className={styles.pipelineRunningHeader}>
        <span className={styles.pipelineRunningTitle}>Consola de Investigação</span>
        <span className={styles.pipelineRunningSep}>·</span>
        <span className={styles.pipelineRunningMeta}>{protocolId}</span>
        <span className={styles.pipelineRunningSep}>·</span>
        <span className={styles.pipelineRunningMeta}>{stepId}</span>
        <span className={styles.pipelineRunningSep}>·</span>
        <span className={styles.pipelineRunningMeta}>{pipeline.selectedModel}</span>
        <span className={styles.pipelineRunningState}>
          <span className={styles.streamingDot} />
          {pipeline.pipelineState}
        </span>
      </div>

      <div className={styles.streamingProgress}>
        <div
          className={styles.streamingProgressBar}
          style={{ width: `${pipeline.streamProgress}%` }}
        />
      </div>

      <div className={styles.streamingMetrics}>
        <span className={styles.streamingMetric}>{pipeline.tokenCount} tokens</span>
        <span className={styles.streamingMetric}>{Math.round(pipeline.streamProgress)}%</span>
        {pipeline.latencyMs > 0 && (
          <span className={styles.streamingMetric}>{(pipeline.latencyMs / 1000).toFixed(1)}s</span>
        )}
      </div>

      <div className={styles.pipelineSubSteps}>
        {subSteps.map((ss, i) => (
          <div
            key={i}
            className={`${styles.pipelineSubStep} ${ss.active ? styles.pipelineSubStepActive : ""}`}
          >
            <span className={styles.pipelineSubStepIcon}>
              {ss.active ? "●" : "○"}
            </span>
            <span className={styles.pipelineSubStepLabel}>{ss.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.streamingBody}>
        <span className={styles.streamingCursor}>▋</span>
      </div>
    </div>
  );
}

/* ============================================================
   PipelineFailed — error display with retry
   ============================================================ */
function PipelineFailed() {
  const pipeline = usePipeline();

  return (
    <div className={styles.pipelineReady}>
      <div className={styles.pipelineReadyHeader}>
        <span className={styles.pipelineReadyTitle}>Erro na Execução</span>
        <span className={styles.pipelineReadyState}>✗ Falhou</span>
      </div>

      <div className={styles.narrativeBlock}>
        <span className={styles.narrativeBlockTitle}>Resposta</span>
        <pre className={styles.artifactContent}>{pipeline.responseContent}</pre>
      </div>

      <div className={styles.pipelineReadyActions}>
        <button className={styles.pipelineResetBtn} onClick={pipeline.reset}>
          ↺ Nova execução
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   PipelineResults — Sessão → Resposta → Ações → Artefacto
   ============================================================ */
function PipelineResults() {
  const pipeline = usePipeline();
  const data = useStepData();
  const { getArtifact } = useWorkspaceStore();
  const { setToastMessage } = useWorkspace();

  const protocolId = data.slug.slice(0, 8).toUpperCase();
  const stepId = `PR-${String(data.stepOrder).padStart(3, "0")}`;
  const step = data.stepOrder;
  const savedArtifact = getArtifact(step);
  const hasArtifact = !!savedArtifact;

  const handleAccept = () => {
    pipeline.acceptArtifact();
    setToastMessage(`✓ Artefacto guardado com sucesso`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className={styles.pipelineReady}>
      <div className={styles.pipelineReadyHeader}>
        <span className={styles.pipelineReadyTitle}>Sessão de Execução</span>
        <span className={styles.pipelineReadyState}>✓ Concluída</span>
      </div>

      {/* 1. Execution Session card */}
      <div className={styles.executionSessionCard}>
        <div className={styles.executionSessionHeader}>
          <span className={styles.executionSessionId}>Sessão #{step}</span>
          <span className={styles.executionSessionProtocol}>{protocolId} · {stepId}</span>
        </div>
        <div className={styles.executionSessionGrid}>
          <div className={styles.executionSessionItem}>
            <span className={styles.executionSessionLabel}>Executor</span>
            <span className={styles.executionSessionValue}>{pipeline.assistantLabel}</span>
          </div>
          <div className={styles.executionSessionItem}>
            <span className={styles.executionSessionLabel}>Modelo</span>
            <span className={styles.executionSessionValue}>{pipeline.selectedModel}</span>
          </div>
          <div className={styles.executionSessionItem}>
            <span className={styles.executionSessionLabel}>Estado</span>
            <span className={styles.executionSessionValue}>
              {hasArtifact ? "✓ Guardado" : "Aguarda aceitação"}
            </span>
          </div>
          <div className={styles.executionSessionItem}>
            <span className={styles.executionSessionLabel}>Tempo</span>
            <span className={styles.executionSessionValue}>
              {(pipeline.latencyMs / 1000).toFixed(1)}s
            </span>
          </div>
          <div className={styles.executionSessionItem}>
            <span className={styles.executionSessionLabel}>Tokens</span>
            <span className={styles.executionSessionValue}>{pipeline.tokenCount}</span>
          </div>
        </div>
      </div>

      <div className={styles.pipelineDivider} />

      {/* 2. Response content */}
      {pipeline.responseContent && (
        <div className={styles.narrativeBlock}>
          <span className={styles.narrativeBlockTitle}>Resposta</span>
          <pre className={styles.artifactContent}>{pipeline.responseContent}</pre>
        </div>
      )}

      <div className={styles.pipelineDivider} />

      {/* 3. Actions — investigator decides first */}
      {!hasArtifact && (
        <div className={styles.narrativeBlock}>
          <span className={styles.narrativeBlockTitle}>Ações</span>
          {pipeline.validationNotice && (
            <div
              role="alert"
              style={{
                display: "flex", gap: "10px", alignItems: "flex-start",
                padding: "12px 16px", marginBottom: "12px", borderRadius: "8px",
                background: "var(--color-warning-bg, #fff7e6)",
                border: "1px solid var(--color-warning, #e0a800)",
                color: "var(--color-text, #333)", fontSize: "0.9rem", lineHeight: 1.5,
              }}
            >
              <span aria-hidden>⚠️</span>
              <span>{pipeline.validationNotice}</span>
            </div>
          )}
          <div className={styles.pipelineExecuteCenter}>
            <button
              className={styles.pipelineExecuteBtn}
              onClick={handleAccept}
            >
              ✓ Aceitar e Guardar
            </button>
          </div>
          <div className={styles.pipelineReadyActions}>
            <button className={styles.pipelineResetBtn} onClick={pipeline.reset}>
              ↺ Nova execução
            </button>
          </div>
        </div>
      )}

      <div className={styles.pipelineDivider} />

      {/* 4. Artifact — born after acceptance */}
      <div className={styles.narrativeBlock}>
        <span className={styles.narrativeBlockTitle}>Artefacto</span>
        {hasArtifact ? (
          <div className={styles.artifactCard}>
            <div className={styles.artifactCardHeader}>
              <span className={styles.artifactCardIcon}>✓</span>
              <span className={styles.artifactCardType}>{savedArtifact?.type}</span>
            </div>
            <pre className={styles.artifactContent}>
              {JSON.stringify(savedArtifact?.data, null, 2)}
            </pre>
            
            <div className={styles.pipelineExecuteCenter} style={{ marginTop: "16px" }}>
              <button
                className={styles.pipelineExecuteBtn}
                onClick={() => pipeline.setPipelineState("Editing")}
                style={{ backgroundColor: "var(--color-bg-elevated)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
              >
                ✏️ Editar Artefacto
              </button>
            </div>

            {data.nextHref && (
              <a href={data.nextHref} className={styles.artifactNextLink}>
                Avançar para o próximo passo →
              </a>
            )}
          </div>
        ) : (
          <p className={styles.evidenceDocSectionPlaceholder}>
            O artefacto nasce após a aceitação da resposta.
          </p>
        )}
      </div>
    </div>
  );
}
