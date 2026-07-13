"use client";

import React, { ReactNode } from "react";
import { WorkspaceProvider } from "./WorkspaceContext";
import { ResearchWorkspace } from "./ResearchWorkspace/ResearchWorkspace";
import { ResearchWorkspaceShell } from "./ResearchWorkspaceShell";
import { StepDataProvider, type StepData } from "./StepDataContext";
import { WorkspaceRuntimeProvider } from "./WorkspaceRuntime";
import { PipelineExecutionProvider } from "./PipelineExecutionEngine";
import { WorkspaceGuard } from "./WorkspaceGuard";

interface WorkspaceBootstrapProps {
  header: ReactNode;
  stepData: StepData;
}

export function WorkspaceBootstrap({ header, stepData }: WorkspaceBootstrapProps) {
  return (
    <StepDataProvider data={stepData}>
      <WorkspaceRuntimeProvider>
        <PipelineExecutionProvider>
          <WorkspaceProvider>
            <ResearchWorkspace initialMode="workspace">
              <WorkspaceGuard>
                <ResearchWorkspaceShell header={header} />
              </WorkspaceGuard>
            </ResearchWorkspace>
          </WorkspaceProvider>
        </PipelineExecutionProvider>
      </WorkspaceRuntimeProvider>
    </StepDataProvider>
  );
}
