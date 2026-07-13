"use client";

import React, { useMemo, useEffect } from "react";
import { PromptCard } from "./PromptCard";
import { useWorkspaceStore } from "../WorkspaceStoreContext";
import { useWorkspace } from "../WorkspaceContext";
import { resolvePromptVariables } from "@/lib/promptEngine";

interface PromptCardContainerProps {
  content: string;
  toolUrl?: string;
  toolName?: string;
  hasEthicsWarning?: boolean;
  criticalRules?: any[];
}

export function PromptCardContainer({ 
  content, 
  toolUrl, 
  toolName, 
  hasEthicsWarning, 
  criticalRules 
}: PromptCardContainerProps) {
  const { session, advanceStepState } = useWorkspaceStore();
  const { setToastMessage } = useWorkspace();
  
  const step = session.currentStep || 1;
  const status = session.progress?.[step]?.status || "Draft";

  useEffect(() => {
    if (status === "ContextConfirmed") {
      advanceStepState(step, "PromptGenerated");
    }
  }, [status, step, advanceStepState]);

  const handleExecute = () => {
    const isExecuted = ["PromptExecuted", "EvidenceValidated", "Completed"].includes(status);
    if (!isExecuted) {
      advanceStepState(step, "PromptExecuted");
    }
  };

  const handleCopy = () => {
    const textToCopy = resolvePromptVariables(content, session, step, false);
    navigator.clipboard.writeText(textToCopy);
    setToastMessage("✓ Copiado!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const resolvedContent = useMemo(() => {
    return resolvePromptVariables(content, session, step, true);
  }, [content, session, step]);

  return (
    <PromptCard 
      content={content}
      resolvedContent={resolvedContent}
      status={status}
      toolUrl={toolUrl}
      toolName={toolName}
      hasEthicsWarning={hasEthicsWarning}
      criticalRules={criticalRules}
      onExecute={handleExecute}
      onCopy={handleCopy}
    />
  );
}
