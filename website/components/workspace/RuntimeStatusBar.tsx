"use client";

import React from "react";
import { useWorkspaceStore } from "./WorkspaceStoreContext";
import { useStepData } from "./StepDataContext";
import { usePipeline, type PipelineState } from "./PipelineExecutionEngine";
import styles from "./RuntimeStatusBar.module.css";

const PIPELINE_VISUAL: Record<PipelineState, { emoji: string; label: string; color: string }> = {
  Editing: { emoji: "🟡", label: "Editing", color: styles.dotPending },
  Ready: { emoji: "🟢", label: "Ready", color: styles.dotReview },
  Queued: { emoji: "⚪", label: "Queued", color: styles.dotPending },
  Running: { emoji: "🔵", label: "Running", color: styles.dotActive },
  Streaming: { emoji: "🔵", label: "Streaming", color: styles.dotActive },
  Validating: { emoji: "🔍", label: "Validating", color: styles.dotReview },
  Saving: { emoji: "💾", label: "Saving", color: styles.dotReview },
  Completed: { emoji: "✅", label: "Completed", color: styles.dotDone },
  Failed: { emoji: "❌", label: "Failed", color: styles.dotPending },
};

export function RuntimeStatusBar() {
  const { session } = useWorkspaceStore();
  const data = useStepData();
  const pipeline = usePipeline();

  const step = session.currentStep || 1;
  const status = session.progress?.[step]?.status || "Draft";
  const vi = PIPELINE_VISUAL[pipeline.pipelineState] ?? PIPELINE_VISUAL.Editing;

  const protocolId = data.slug.slice(0, 8).toUpperCase();
  const stepId = `PR-${String(data.stepOrder).padStart(3, "0")}`;

  // Scientific pipeline state labels
  const stateLabel = pipeline.isCompleted ? "Concluído" : pipeline.hasFailed ? "Falhou" : pipeline.isRunning ? "Executando…" : vi.label;

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <span className={`${styles.dot} ${vi.color}`} />
        <span className={styles.phase}>{stepId}</span>
        <span className={styles.separator}>·</span>
        <span className={styles.model}>{pipeline.assistantLabel}</span>
        <span className={styles.separator}>·</span>
        <span className={styles.metric}>{pipeline.selectedModel}</span>
        <span className={styles.separator}>·</span>
        <span className={styles.metric}>Estado: {stateLabel}</span>
        {pipeline.isRunning && (
          <>
            <span className={styles.separator}>·</span>
            <span className={styles.metric}>{Math.round(pipeline.streamProgress)}%</span>
          </>
        )}
        <span className={styles.separator}>·</span>
        <span className={styles.metric}>{protocolId}</span>
        <span className={styles.separator}>·</span>
        <span className={styles.metric}>{stepId}</span>
      </div>
      <div className={styles.right}>
        {pipeline.tokenCount > 0 && (
          <>
            <span className={styles.metric}>{pipeline.tokenCount} tokens</span>
            <span className={styles.separator}>·</span>
          </>
        )}
        {pipeline.latencyMs > 0 && (
          <>
            <span className={styles.metric}>{Math.round(pipeline.latencyMs / 1000)}s</span>
            <span className={styles.separator}>·</span>
          </>
        )}
        <span className={styles.metric}>Passo {data.stepOrder}/{data.totalSteps}</span>
        <span className={styles.separator}>·</span>
        <span className={styles.saved}>
          {status === "Draft" ? "Não guardado" : "Guardado"}
        </span>
      </div>
    </div>
  );
}
