"use client";

import React, { ReactNode, useEffect } from "react";
import { useWorkspace } from "../WorkspaceContext";
import { WorkspaceModeType } from "./WorkspaceCapabilities";

interface ResearchWorkspaceProps {
  children: ReactNode;
  initialMode?: WorkspaceModeType;
}

export function ResearchWorkspace({ children, initialMode = "workspace" }: ResearchWorkspaceProps) {
  const { capabilities, setMode, mode } = useWorkspace();

  // If initialMode is provided, we set it on mount
  useEffect(() => {
    if (initialMode && mode !== initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Apply global classes for layout shifts
  useEffect(() => {
    if (!capabilities.leftPanel) {
      document.body.classList.add("reading-mode");
    } else {
      document.body.classList.remove("reading-mode");
    }

    return () => {
      document.body.classList.remove("reading-mode");
    };
  }, [capabilities.leftPanel]);

  return (
    <div 
      className="research-workspace"
      data-left-panel={capabilities.leftPanel}
      data-navigator={capabilities.navigator}
      data-fullscreen={capabilities.fullscreen}
    >
      {children}
    </div>
  );
}
