"use client";

import React, { useState } from "react";
import { useStepData } from "../StepDataContext";
import { useWorkspaceStore } from "../WorkspaceStoreContext";
import { phaseFromSessionState } from "../WorkspaceCompositionEngine";
import styles from "./panels.module.css";

export function ValidationInspectorPanel() {
  const data = useStepData();
  const { session } = useWorkspaceStore();
  const [expectedOpen, setExpectedOpen] = useState(false);

  const step = session.currentStep || 1;
  const status = session.progress?.[step]?.status || "Draft";
  const phase = phaseFromSessionState(status);

  const completedCount = data.evidenceItems.filter((i) => i.completed).length;
  const totalCount = data.evidenceItems.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const phaseSteps = [
    { id: "context", label: "Contexto", done: status !== "Draft" },
    { id: "prompt", label: "Prompt", done: ["PromptGenerated", "PromptExecuted", "EvidenceValidated", "Completed"].includes(status) },
    { id: "evidence", label: "Evidence", done: ["EvidenceValidated", "Completed"].includes(status), active: phase === "Reviewing" },
    { id: "checklist", label: "Checklist", done: status === "Completed" },
    { id: "artifact", label: "Artefacto", done: status === "Completed" },
  ];

  const warnings = data.criticalRules.filter(
    (r) => (r.severity || "").toLowerCase() === "critical"
  );

  return (
    <div className={styles.inspectorPanel}>
      {/* Progress section */}
      <div className={styles.inspectorSection}>
        <div className={styles.inspectorSectionHeader}>
          <span className={styles.inspectorSectionTitle}>Validation</span>
          <span className={styles.inspectorSectionMeta}>
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className={styles.inspectorProgressBar}>
          <div
            className={styles.inspectorProgressFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Phase steps */}
      <div className={styles.inspectorSection}>
        <ul className={styles.inspectorSteps}>
          {phaseSteps.map((s) => {
            const isActive = (s as any).active;
            return (
              <li
                key={s.id}
                className={`${styles.inspectorStep} ${
                  s.done ? styles.inspectorStepDone :
                  isActive ? styles.inspectorStepActive :
                  styles.inspectorStepWaiting
                }`}
              >
                <span className={styles.inspectorStepIcon}>
                  {s.done ? "✓" : isActive ? "●" : "○"}
                </span>
                <span className={styles.inspectorStepLabel}>{s.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Expected result — collapsible, default collapsed */}
      {data.stepExpectedOutput && (
        <div className={styles.inspectorSection}>
          <div
            className={styles.inspectorCollapsibleHeader}
            onClick={() => setExpectedOpen(!expectedOpen)}
          >
            <span className={styles.inspectorCollapseToggle}>
              {expectedOpen ? "▼" : "▶"}
            </span>
            <span className={styles.inspectorSectionTitle}>Resultado esperado</span>
          </div>
          {expectedOpen && (
            <p className={styles.inspectorExpectedText}>{data.stepExpectedOutput}</p>
          )}
        </div>
      )}

      {/* Outputs */}
      {data.stepOutputs.length > 0 && (
        <div className={styles.inspectorSection}>
          <span className={styles.inspectorSectionTitle}>Outputs</span>
          <div className={styles.inspectorOutputs}>
            {data.stepOutputs.map((out, i) => (
              <span key={i} className={styles.inspectorOutputTag}>{out}</span>
            ))}
          </div>
        </div>
      )}

      {/* Evidence items */}
      {data.evidenceItems.length > 0 && (
        <div className={styles.inspectorSection}>
          <span className={styles.inspectorSectionTitle}>Evidências</span>
          <ul className={styles.inspectorEvidenceList}>
            {data.evidenceItems.map((item) => (
              <li
                key={item.id}
                className={`${styles.inspectorEvidenceItem} ${
                  item.completed ? styles.inspectorEvidenceDone : styles.inspectorEvidencePending
                }`}
              >
                <span className={styles.inspectorEvidenceIcon}>
                  {item.completed ? "✓" : "○"}
                </span>
                <span className={styles.inspectorEvidenceText}>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className={styles.inspectorSection}>
          <span className={styles.inspectorSectionTitle}>Warnings</span>
          <ul className={styles.inspectorWarnings}>
            {warnings.map((w, i) => (
              <li key={i} className={styles.inspectorWarning}>
                <span className={styles.inspectorWarningIcon}>⚠</span>
                <span className={styles.inspectorWarningText}>{w.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
