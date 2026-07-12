"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import schema from "@/lib/context-schema.json";

export type SessionState = 
  | "Draft"
  | "ContextConfirmed"
  | "PromptGenerated"
  | "PromptExecuted"
  | "EvidenceValidated"
  | "Completed";

export type StepProgress = {
  status: SessionState;
  variables: Record<string, string>;
  checklist: Record<string, boolean>;
};

export type ResearchSessionData = {
  id: string;
  currentProtocol: string;
  studyArea: string;
  researchTopic: string;
  academicLevel: string;
  language: string;
  currentStep: number;
  startedAt: string;
  updatedAt: string;
  status: "active" | "completed";
  progress: Record<number, StepProgress>;
};

interface ResearchSessionContextType {
  session: Partial<ResearchSessionData>;
  ready: boolean;
  updateSession: (updates: Partial<ResearchSessionData>) => void;
  updateStepProgress: (step: number, progressUpdate: Partial<StepProgress>) => void;
  advanceStepState: (step: number, targetState: SessionState) => void;
  schema: any;
}

const STORAGE_KEY = "raihub:v2:research_session";

const ResearchSessionContext = createContext<ResearchSessionContextType | undefined>(undefined);

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function getInitialSession(): Partial<ResearchSessionData> {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    /* ignore */
  }
  return { progress: {} };
}

export function ResearchSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Partial<ResearchSessionData>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getInitialSession());
    setReady(true);
    
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSession(getInitialSession());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const updateSession = useCallback((updates: Partial<ResearchSessionData>) => {
    setSession((prev) => {
      const now = new Date().toISOString();
      
      const next: Partial<ResearchSessionData> = {
        ...prev,
        ...updates,
        id: prev.id || generateId(),
        status: prev.status || "active",
        startedAt: prev.startedAt || now,
        updatedAt: now,
        progress: prev.progress || {}
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}

      return next;
    });
  }, []);

  const updateStepProgress = useCallback((step: number, progressUpdate: Partial<StepProgress>) => {
    setSession((prev) => {
      const prevProgress = prev.progress || {};
      const stepProg = prevProgress[step] || { status: "Draft", variables: {}, checklist: {} };
      
      const nextProgress = {
        ...prevProgress,
        [step]: {
          ...stepProg,
          ...progressUpdate,
          variables: { ...stepProg.variables, ...progressUpdate.variables },
          checklist: { ...stepProg.checklist, ...progressUpdate.checklist }
        }
      };

      const now = new Date().toISOString();
      const next: Partial<ResearchSessionData> = {
        ...prev,
        progress: nextProgress,
        updatedAt: now
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}

      return next;
    });
  }, []);

  const advanceStepState = useCallback((step: number, targetState: SessionState) => {
    updateStepProgress(step, { status: targetState });
  }, [updateStepProgress]);

  return (
    <ResearchSessionContext.Provider 
      value={{ 
        session, 
        ready, 
        updateSession, 
        updateStepProgress, 
        advanceStepState,
        schema 
      }}
    >
      {children}
    </ResearchSessionContext.Provider>
  );
}

export function useResearchSession() {
  const context = useContext(ResearchSessionContext);
  if (!context) {
    throw new Error("useResearchSession must be used within ResearchSessionProvider");
  }
  return context;
}
