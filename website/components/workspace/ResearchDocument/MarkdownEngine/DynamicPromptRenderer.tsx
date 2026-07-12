"use client";

import React, { useMemo } from "react";
import { useResearchSession } from "../../ResearchSessionContext";
import { ResearchMarkdown } from "./ResearchMarkdown";
import { resolvePromptVariables } from "@/lib/promptEngine";

interface DynamicPromptRendererProps {
  content: string;
}

export function DynamicPromptRenderer({ content }: DynamicPromptRendererProps) {
  const { session } = useResearchSession();

  const processedContent = useMemo(() => {
    const step = session.currentStep || 1;
    return resolvePromptVariables(content, session, step, true);
  }, [content, session]);

  return <ResearchMarkdown content={processedContent} />;
}
