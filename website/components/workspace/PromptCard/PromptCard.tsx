"use client";

import React from "react";
import styles from "./PromptCard.module.css";
import { PromptHeader } from "./PromptHeader";
import { PromptTimeline } from "./PromptTimeline";
import { PromptViewer } from "./PromptViewer";
import { PromptActions } from "./PromptActions";
import { EthicsNote } from "@/components/ui/EthicsNote";

interface PromptCardProps {
  content: string; // Raw prompt content
  resolvedContent: string; // Final prompt content with variables injected
  status: "Draft" | "ContextConfirmed" | "PromptGenerated" | "PromptExecuted" | "EvidenceValidated" | "Completed"; 
  toolUrl?: string;
  toolName?: string;
  hasEthicsWarning?: boolean;
  criticalRules?: any[];
  onExecute: () => void;
  onCopy: () => void;
}

export function PromptCard({ 
  content, 
  resolvedContent,
  status,
  toolUrl, 
  toolName, 
  hasEthicsWarning, 
  criticalRules,
  onExecute,
  onCopy
}: PromptCardProps) {
  const isContextConfirmed = ["ContextConfirmed", "PromptGenerated", "PromptExecuted", "EvidenceValidated", "Completed"].includes(status);

  return (
    <div className={styles.card}>
      <PromptHeader onCopy={onCopy} />
      
      {!isContextConfirmed ? (
        <div className={styles.unconfirmedPlaceholder}>
          A aguardar dados do Workspace…
        </div>
      ) : (
        <>
          <PromptTimeline status={status} />
          
          <PromptViewer content={resolvedContent} />

          {hasEthicsWarning && criticalRules && criticalRules.length > 0 && (
             <div style={{ padding: "0 var(--space-4) var(--space-2) var(--space-4)" }}>
               <EthicsNote rules={criticalRules} />
             </div>
          )}

          <PromptActions 
            toolUrl={toolUrl} 
            toolName={toolName} 
            onExecute={onExecute} 
            status={status} 
          />
        </>
      )}
    </div>
  );
}
