"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface WorkspaceRuntimeState {
  selectedPanelId: string | null;
  expandedPanels: Record<string, boolean>;
  clipboard: string | null;
  selectedAI: string;
  promptDraft: string | null;
  scrollPosition: Record<string, number>;
  focusTarget: string | null;
  currentIteration: number;
  isStreaming: boolean;
  streamProgress: number;
  tokenCount: number;
  latencyMs: number;
  isConnected: boolean;
}

export interface WorkspaceRuntimeContextType {
  runtime: WorkspaceRuntimeState;
  setSelectedPanel: (id: string | null) => void;
  togglePanel: (id: string) => void;
  setClipboard: (value: string | null) => void;
  setSelectedAI: (ai: string) => void;
  setPromptDraft: (draft: string | null) => void;
  setScrollPosition: (panelId: string, position: number) => void;
  setFocusTarget: (id: string | null) => void;
  incrementIteration: () => void;
  setStreaming: (streaming: boolean) => void;
  setStreamProgress: (progress: number) => void;
  setTokenCount: (count: number) => void;
  setLatency: (ms: number) => void;
  setConnected: (connected: boolean) => void;
  resetRuntime: () => void;
}

const DEFAULT_STATE: WorkspaceRuntimeState = {
  selectedPanelId: null,
  expandedPanels: {},
  clipboard: null,
  selectedAI: "ChatGPT",
  promptDraft: null,
  scrollPosition: {},
  focusTarget: null,
  currentIteration: 0,
  isStreaming: false,
  streamProgress: 0,
  tokenCount: 0,
  latencyMs: 0,
  isConnected: false,
};

const WorkspaceRuntimeContext = createContext<WorkspaceRuntimeContextType | null>(null);

export function WorkspaceRuntimeProvider({ children }: { children: ReactNode }) {
  const [runtime, setRuntime] = useState<WorkspaceRuntimeState>(DEFAULT_STATE);

  const setSelectedPanel = useCallback((id: string | null) => {
    setRuntime((prev) => ({ ...prev, selectedPanelId: id }));
  }, []);

  const togglePanel = useCallback((id: string) => {
    setRuntime((prev) => ({
      ...prev,
      expandedPanels: { ...prev.expandedPanels, [id]: !prev.expandedPanels[id] },
    }));
  }, []);

  const setClipboard = useCallback((value: string | null) => {
    setRuntime((prev) => ({ ...prev, clipboard: value }));
  }, []);

  const setSelectedAI = useCallback((ai: string) => {
    setRuntime((prev) => ({ ...prev, selectedAI: ai }));
  }, []);

  const setPromptDraft = useCallback((draft: string | null) => {
    setRuntime((prev) => ({ ...prev, promptDraft: draft }));
  }, []);

  const setScrollPosition = useCallback((panelId: string, position: number) => {
    setRuntime((prev) => ({
      ...prev,
      scrollPosition: { ...prev.scrollPosition, [panelId]: position },
    }));
  }, []);

  const setFocusTarget = useCallback((id: string | null) => {
    setRuntime((prev) => ({ ...prev, focusTarget: id }));
  }, []);

  const incrementIteration = useCallback(() => {
    setRuntime((prev) => ({ ...prev, currentIteration: prev.currentIteration + 1 }));
  }, []);

  const setStreaming = useCallback((streaming: boolean) => {
    setRuntime((prev) => ({ ...prev, isStreaming: streaming, streamProgress: streaming ? 0 : prev.streamProgress }));
  }, []);

  const setStreamProgress = useCallback((progress: number) => {
    setRuntime((prev) => ({ ...prev, streamProgress: progress }));
  }, []);

  const setTokenCount = useCallback((count: number) => {
    setRuntime((prev) => ({ ...prev, tokenCount: count }));
  }, []);

  const setLatency = useCallback((ms: number) => {
    setRuntime((prev) => ({ ...prev, latencyMs: ms }));
  }, []);

  const setConnected = useCallback((connected: boolean) => {
    setRuntime((prev) => ({ ...prev, isConnected: connected }));
  }, []);

  const resetRuntime = useCallback(() => {
    setRuntime(DEFAULT_STATE);
  }, []);

  const value: WorkspaceRuntimeContextType = {
    runtime,
    setSelectedPanel,
    togglePanel,
    setClipboard,
    setSelectedAI,
    setPromptDraft,
    setScrollPosition,
    setFocusTarget,
    incrementIteration,
    setStreaming,
    setStreamProgress,
    setTokenCount,
    setLatency,
    setConnected,
    resetRuntime,
  };

  return (
    <WorkspaceRuntimeContext.Provider value={value}>
      {children}
    </WorkspaceRuntimeContext.Provider>
  );
}

export function useWorkspaceRuntime() {
  const ctx = useContext(WorkspaceRuntimeContext);
  if (!ctx) {
    throw new Error("useWorkspaceRuntime must be used within WorkspaceRuntimeProvider");
  }
  return ctx;
}
