import React from "react";
import styles from "./PromptCard.module.css";
import { Icon } from "@/components/ui/Icon";

interface PromptTimelineProps {
  status: "Draft" | "ContextConfirmed" | "PromptGenerated" | "PromptExecuted" | "EvidenceValidated" | "Completed";
}

export function PromptTimeline({ status }: PromptTimelineProps) {
  const isGenerated = ["PromptGenerated", "PromptExecuted", "EvidenceValidated", "Completed"].includes(status);
  const isExecuted = ["PromptExecuted", "EvidenceValidated", "Completed"].includes(status);

  return (
    <div className={styles.timeline}>
      <span className={`${styles.timelineStep} ${styles.completed}`}>
        <Icon name="check-circle" size={14} /> Contexto
      </span>
      <Icon name="chevron-right" size={14} />
      <span className={`${styles.timelineStep} ${isGenerated ? styles.completed : styles.active}`}>
        {isGenerated ? <Icon name="check-circle" size={14} /> : <Icon name="circle" size={14} />} Gerado
      </span>
      <Icon name="chevron-right" size={14} />
      <span className={`${styles.timelineStep} ${isExecuted ? styles.completed : ""}`}>
        {isExecuted ? <Icon name="check-circle" size={14} /> : <Icon name="circle" size={14} />} Executado
      </span>
    </div>
  );
}
