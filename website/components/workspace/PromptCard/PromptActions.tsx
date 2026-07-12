"use client";

import React from "react";
import styles from "./PromptCard.module.css";
import { Icon } from "@/components/ui/Icon";

interface PromptActionsProps {
  toolUrl?: string;
  toolName?: string;
  onExecute: () => void;
  onCopy: () => void;
  status: string;
}

export function PromptActions({ toolUrl, toolName, onExecute, onCopy, status }: PromptActionsProps) {
  const isExecuted = ["PromptExecuted", "EvidenceValidated", "Completed"].includes(status);

  return (
    <div className={styles.actions}>
      <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onCopy}>
        <Icon name="copy" size={16} /> Copiar Prompt
      </button>
      
      {toolUrl && (
        <a href={toolUrl} target="_blank" rel="noreferrer" className={`${styles.btn} ${styles.btnPrimary}`}>
          <Icon name="external-link" size={16} /> Abrir {toolName || "IA"}
        </a>
      )}
      
      <button 
        className={`${styles.btn} ${styles.btnSuccess} ${isExecuted ? styles.active : ""}`} 
        onClick={onExecute}
      >
        <Icon name="check" size={16} /> {isExecuted ? "Executado" : "Marcar como executado"}
      </button>
    </div>
  );
}
