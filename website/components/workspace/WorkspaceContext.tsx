"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { WorkspaceModeType, WorkspaceCapabilities, MODE_CAPABILITIES } from "./ResearchWorkspace/WorkspaceCapabilities";
import { workspaceEvents } from "./ResearchWorkspace/WorkspaceEvents";

interface WorkspaceState {
  // Modos e Capacidades (UI / Ambiente)
  mode: WorkspaceModeType;
  setMode: (mode: WorkspaceModeType) => void;
  capabilities: WorkspaceCapabilities;

  // Estado visual temporário
  expandedAccordionId: string | null;
  setExpandedAccordionId: (id: string | null) => void;
  
  isPromptExpanded: boolean;
  setPromptExpanded: (expanded: boolean) => void;

  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceState | null>(null);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [mode, setModeState] = useState<WorkspaceModeType>("workspace");
  const [expandedAccordionId, setExpandedAccordionId] = useState<string | null>(null);
  const [isPromptExpanded, setPromptExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const setMode = (newMode: WorkspaceModeType) => {
    setModeState(newMode);
    workspaceEvents.publish({ type: "MODE_CHANGED", payload: newMode });
  };

  const state: WorkspaceState = {
    mode,
    setMode,
    capabilities: MODE_CAPABILITIES[mode],
    expandedAccordionId,
    setExpandedAccordionId,
    isPromptExpanded,
    setPromptExpanded,
    toastMessage,
    setToastMessage
  };

  return (
    <WorkspaceContext.Provider value={state}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
