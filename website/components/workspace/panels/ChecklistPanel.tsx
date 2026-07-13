"use client";

import React from "react";
import { useStepData } from "../StepDataContext";
import { useWorkspaceStore } from "../WorkspaceStoreContext";
import { phaseFromSessionState } from "../WorkspaceCompositionEngine";
import styles from "./panels.module.css";

export function ChecklistPanel() {
  const data = useStepData();
  const { session } = useWorkspaceStore();

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

  return (
    <div className={styles.checklistPanel}>
      <div className={styles.checklistHeader}>
        <span className={styles.checklistTitle}>Checklist</span>
        <span className={styles.checklistProgress}>
          {completedCount}/{totalCount}
        </span>
      </div>
      <div className={styles.checklistProgressBar}>
        <div
          className={styles.checklistProgressFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <ul className={styles.checklistSteps}>
        {phaseSteps.map((s) => (
          <li
            key={s.id}
            className={`${styles.checklistStep} ${
              s.done ? styles.checklistStepDone :
              (s as any).active ? styles.checklistStepActive :
              styles.checklistStepWaiting
            }`}
          >
            <span className={styles.checklistStepIcon}>
              {s.done ? "✓" : (s as any).active ? "●" : "○"}
            </span>
            <span className={styles.checklistStepLabel}>{s.label}</span>
          </li>
        ))}
      </ul>
      {data.evidenceItems.length > 0 && (
        <div className={styles.checklistEvidence}>
          <span className={styles.checklistEvidenceLabel}>Evidências</span>
          <ul className={styles.checklistEvidenceList}>
            {data.evidenceItems.map((item) => (
              <li
                key={item.id}
                className={`${styles.checklistEvidenceItem} ${
                  item.completed ? styles.checklistEvidenceDone : styles.checklistEvidencePending
                }`}
              >
                <span className={styles.checklistEvidenceIcon}>
                  {item.completed ? "✓" : "○"}
                </span>
                <span className={styles.checklistEvidenceText}>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
