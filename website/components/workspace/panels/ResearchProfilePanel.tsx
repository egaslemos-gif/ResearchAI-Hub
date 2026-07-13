"use client";

import React from "react";
import { useStepData } from "../StepDataContext";
import { useWorkspaceStore } from "../WorkspaceStoreContext";
import { DocumentProperties } from "../DocumentProperties";
import { phaseFromSessionState } from "../WorkspaceCompositionEngine";
import styles from "./panels.module.css";

export function ResearchProfilePanel() {
  const data = useStepData();
  const { session } = useWorkspaceStore();

  const step = session.currentStep || 1;
  const status = session.progress?.[step]?.status || "Draft";
  const phase = phaseFromSessionState(status);
  const stepVars = session.progress?.[step]?.variables || {};

  if (phase === "Preparation") {
    return (
      <div className={styles.contextPanel}>
        {data.promptVariables && data.promptVariables.length > 0 && (
          <DocumentProperties variables={data.promptVariables} />
        )}
        {data.stepObjective && (
          <div className={styles.contextBlock}>
            <h4 className={styles.contextLabel}>Objetivo</h4>
            <p className={styles.contextText}>{data.stepObjective}</p>
          </div>
        )}
        {data.stepInstruction && (
          <div className={styles.contextBlock}>
            <h4 className={styles.contextLabel}>Instruções</h4>
            <p className={styles.contextText}>{data.stepInstruction}</p>
          </div>
        )}
      </div>
    );
  }

  if (phase === "Executing") {
    return (
      <div className={styles.contextPanel}>
        <h3 className={styles.inspectorHeader}>Contexto</h3>
        {session.studyArea && (
          <div className={styles.inspectorRow}>
            <span className={styles.inspectorRowLabel}>Área</span>
            <span className={styles.inspectorRowValue}>{session.studyArea}</span>
          </div>
        )}
        {session.researchTopic && (
          <div className={styles.inspectorRow}>
            <span className={styles.inspectorRowLabel}>Tema</span>
            <span className={styles.inspectorRowValue}>{session.researchTopic}</span>
          </div>
        )}
        {session.academicLevel && (
          <div className={styles.inspectorRow}>
            <span className={styles.inspectorRowLabel}>Nível</span>
            <span className={styles.inspectorRowValue}>{session.academicLevel}</span>
          </div>
        )}
        {data.toolName && (
          <div className={styles.inspectorRow}>
            <span className={styles.inspectorRowLabel}>Modelo</span>
            <span className={styles.inspectorRowValue}>{data.toolName}</span>
          </div>
        )}
      </div>
    );
  }

  // Reviewing & Completed: show extracted variables and artifact info
  return (
    <div className={styles.contextPanel}>
      <h3 className={styles.inspectorHeader}>
        {phase === "Completed" ? "Artefacto" : "Variáveis"}
      </h3>

      {phase === "Completed" && (
        <>
          <div className={styles.inspectorRow}>
            <span className={styles.inspectorRowLabel}>Passo</span>
            <span className={styles.inspectorRowValue}>{data.stepOrder}/{data.totalSteps}</span>
          </div>
          <div className={styles.inspectorRow}>
            <span className={styles.inspectorRowLabel}>Estado</span>
            <span className={styles.inspectorRowValue}>Concluído</span>
          </div>
          {data.stepOutputs[0] && (
            <div className={styles.inspectorRow}>
              <span className={styles.inspectorRowLabel}>Output</span>
              <span className={styles.inspectorRowValue}>{data.stepOutputs[0]}</span>
            </div>
          )}
        </>
      )}

      {phase === "Reviewing" && Object.keys(stepVars).length > 0 && (
        Object.entries(stepVars).map(([key, value]) => (
          <div key={key} className={styles.inspectorRow}>
            <span className={styles.inspectorRowLabel}>{key}</span>
            <span className={styles.inspectorRowValue}>{value || "—"}</span>
          </div>
        ))
      )}

      {phase === "Reviewing" && Object.keys(stepVars).length === 0 && (
        <div className={styles.inspectorRow}>
          <span className={styles.inspectorRowValue} style={{ fontStyle: "italic", color: "var(--color-text-subtle)" }}>
            Sem variáveis extraídas
          </span>
        </div>
      )}
    </div>
  );
}
