"use client";

import React, { ReactNode } from "react";
import { useResearchSession, SessionState } from "./ResearchSessionContext";

export function RequireContextConfirmed({ children }: { children: ReactNode }) {
  const { session } = useResearchSession();
  const step = session.currentStep || 1;
  const currentStatus: SessionState = session.progress?.[step]?.status || "Draft";
  const isContextConfirmed = ["ContextConfirmed", "PromptGenerated", "PromptExecuted", "EvidenceValidated", "Completed"].includes(currentStatus);

  return (
    <div
      style={{
        opacity: isContextConfirmed ? 1 : 0,
        pointerEvents: isContextConfirmed ? "auto" : "none",
        transition: "all 0.4s ease",
        maxHeight: isContextConfirmed ? "2000px" : "0px",
        overflow: "hidden"
      }}
    >
      {children}
    </div>
  );
}
