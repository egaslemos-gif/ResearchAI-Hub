"use client";

import React, { useMemo } from "react";
import { useWorkspaceStore } from "../../WorkspaceStoreContext";
import { ResearchMarkdown } from "./ResearchMarkdown";
import { resolvePromptVariables } from "@/lib/promptEngine";

interface DynamicPromptRendererProps {
  content: string;
}

export function DynamicPromptRenderer({ content }: DynamicPromptRendererProps) {
  const { session } = useWorkspaceStore();

  const processedContent = useMemo(() => {
    const step = session.currentStep || 1;
    return resolvePromptVariables(content, session, step, true);
  }, [content, session]);

  return <ResearchMarkdown content={processedContent} />;
}
