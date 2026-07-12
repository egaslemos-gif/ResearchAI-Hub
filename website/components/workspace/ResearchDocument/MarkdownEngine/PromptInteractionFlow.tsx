"use client";

import React, { useEffect, useState } from "react";
import styles from "./CollapsiblePrompt.module.css";
import { useWorkspace } from "../../WorkspaceContext";
import { useResearchSession, SessionState } from "../../ResearchSessionContext";
import { EthicsNote } from "@/components/ui/EthicsNote";
import Link from "next/link";

import { resolvePromptVariables } from "@/lib/promptEngine";

interface PromptInteractionFlowProps {
  toolName?: string;
  toolUrl?: string;
  toolCategory?: string;
  toolAlternatives?: string;
  hasEthicsWarning?: boolean;
  criticalRules?: any[];
  promptContent: React.ReactNode;
  rawPromptBody?: string;
  expectedOutput?: React.ReactNode;
  checklist?: React.ReactNode;
}

/**
 * @deprecated Use PromptCard from "@/components/workspace/PromptCard" instead.
 * This monolithic component violates the single responsibility principle and
 * the PromptCard Contract defined in RFC-EX-001.
 */
export function PromptInteractionFlow({ 
  toolName,
  toolUrl,
  toolCategory,
  toolAlternatives,
  hasEthicsWarning,
  criticalRules,
  promptContent, 
  rawPromptBody,
  expectedOutput, 
  checklist 
}: PromptInteractionFlowProps) {
  const { session, updateStepProgress, advanceStepState } = useResearchSession();
  const { isPromptExpanded, setPromptExpanded, setToastMessage } = useWorkspace();
  const [localPromptText, setLocalPromptText] = useState<string>("");

  const step = session.currentStep || 1;
  const currentStatus: SessionState = session.progress?.[step]?.status || "Draft";

  // Transições da máquina de estados baseadas na UI
  const isContextConfirmed = ["ContextConfirmed", "PromptGenerated", "PromptExecuted", "EvidenceValidated", "Completed"].includes(currentStatus);
  const isGenerated = ["PromptGenerated", "PromptExecuted", "EvidenceValidated", "Completed"].includes(currentStatus);
  const isExecuted = ["PromptExecuted", "EvidenceValidated", "Completed"].includes(currentStatus);

  // Auto-transição de ContextConfirmed para PromptGenerated após render
  useEffect(() => {
    if (currentStatus === "ContextConfirmed") {
      advanceStepState(step, "PromptGenerated");
    }
  }, [currentStatus, step, advanceStepState]);

  // Função para simular o toast efémero (3 segundos)
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCopy = () => {
    let textToCopy = "";
    if (rawPromptBody) {
      // Use pure prompt engine for clipboard
      textToCopy = resolvePromptVariables(rawPromptBody, session, step, false);
    } else {
      // Fallback
      const promptElement = document.getElementById("prompt-content-container");
      textToCopy = promptElement ? promptElement.innerText : "Prompt copiado!";
    }
    navigator.clipboard.writeText(textToCopy);
    showToast("✓ Copiado!");
  };

  const handleOpenTool = () => {
    // Abrir não avança estado automaticamente, mas pode ser medido
  };

  const handleExecute = () => {
    if (!isExecuted) {
      advanceStepState(step, "PromptExecuted");
      showToast("✓ Passo marcado como executado!");
    }
  };

  return (
    <div className={styles.flowContainer}>
      <div className={styles.promptWrapper}>
        <div className={styles.promptHeader}>
          <span className={styles.promptLabel}>Prompt</span>
          {isContextConfirmed && (
            <div className={styles.promptActionsTop}>
              <button className={styles.textBtn} onClick={() => setPromptExpanded(!isPromptExpanded)}>
                {isPromptExpanded ? "▼ Colapsar" : "▼ Expandir"}
              </button>
            </div>
          )}
        </div>
        
        {!isContextConfirmed ? (
          <div className={styles.unconfirmedPlaceholder}>
            O Prompt será gerado após confirmares o contexto.
          </div>
        ) : (
          <>
            <div id="prompt-content-container" className={`${styles.content} ${isPromptExpanded ? styles.expanded : styles.collapsed}`}>
              {promptContent}
            </div>

            {/* Inserir a secção de ferramenta no fluxo linear */}
            <div className={styles.toolInlineBlock}>
               {toolName && (
                  <div className={styles.toolInlineRow}>
                    <span className={styles.toolInlineLabel}>Ferramenta:</span>
                    <span className={styles.toolInlineValue}>
                      {toolName} 
                      {toolCategory && <span className={styles.toolCatText}> ({toolCategory})</span>}
                    </span>
                  </div>
                )}
                {toolAlternatives && (
                  <div className={styles.toolInlineRow}>
                    <span className={styles.toolInlineLabel}>Alternativas:</span>
                    <span className={styles.toolInlineValue}>
                      {toolAlternatives}
                    </span>
                  </div>
                )}
            </div>
            
            {hasEthicsWarning && criticalRules && criticalRules.length > 0 && (
              <div className={styles.ethicsWrapper}>
                <EthicsNote rules={criticalRules} />
              </div>
            )}

            <div className={styles.promptActionsBottom}>
              <button className={styles.actionBtn} onClick={handleCopy}>
                📋 Copiar Prompt
              </button>
              {toolUrl && (
                <a href={toolUrl} target="_blank" rel="noreferrer" className={styles.actionBtnPrimary} onClick={handleOpenTool}>
                  ▶ Abrir {toolName || "IA"}
                </a>
              )}
              <button 
                className={`${styles.actionBtnSuccess} ${isExecuted ? styles.executed : ""}`} 
                onClick={handleExecute}
              >
                {isExecuted ? "✓ Executado" : "✓ Marcar como executado"}
              </button>
            </div>
          </>
        )}
      </div>

      <div className={`${styles.progressiveSection} ${isExecuted ? styles.revealed : ""}`}>
        {expectedOutput && (
          <div className={styles.flowSection}>
            {expectedOutput}
          </div>
        )}

        {checklist && (
          <div className={styles.flowSection}>
            {checklist}
          </div>
        )}
      </div>
    </div>
  );
}
