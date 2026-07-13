"use client";

import React, { createContext, useContext, ReactNode } from "react";
import type { PromptVariable } from "@/lib/content";

export interface StepData {
  slug: string;
  stepOrder: number;
  totalSteps: number;
  competencyName: string;
  stepObjective: string | null;
  stepInstruction: string | null;
  stepExpectedOutput: string | null;
  expectedArtifactType: string;
  stepOutputs: string[];
  stepMinutes: number;
  promptBody: string | null;
  promptVariables: PromptVariable[] | null;
  toolName: string | null;
  toolUrl: string | null;
  isAiStep: boolean;
  criticalRules: { severity?: string; text: string }[];
  evidenceItems: { id: string; label: string; completed: boolean }[];
  prevHref: string;
  nextHref: string;
  isLast: boolean;
}

const StepDataContext = createContext<StepData | null>(null);

export function StepDataProvider({
  data,
  children,
}: {
  data: StepData;
  children: ReactNode;
}) {
  return (
    <StepDataContext.Provider value={data}>
      {children}
    </StepDataContext.Provider>
  );
}

export function useStepData(): StepData {
  const ctx = useContext(StepDataContext);
  if (!ctx) {
    throw new Error("useStepData must be used within StepDataProvider");
  }
  return ctx;
}
