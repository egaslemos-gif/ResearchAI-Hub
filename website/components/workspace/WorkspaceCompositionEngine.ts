import type { WorkspaceTopology, WorkspacePhase, RegionKey } from "./WorkspaceTopology";
import type { PanelId } from "./WorkspacePluginRegistry";

export const PHASE_PANELS: Record<WorkspacePhase, Record<RegionKey, PanelId[]>> = {
  Preparation: {
    left: ["research-profile"],
    main: ["research-console"],
    secondary: [],
    footer: [],
  },
  Executing: {
    left: ["research-profile"],
    main: ["research-console"],
    secondary: [],
    footer: [],
  },
  Reviewing: {
    left: [],
    main: ["research-console"],
    secondary: ["inspector"],
    footer: [],
  },
  Completed: {
    left: [],
    main: ["research-console"],
    secondary: ["inspector"],
    footer: ["step-advance"],
  },
};

export function compose(phase: WorkspacePhase): WorkspaceTopology {
  const layout = PHASE_PANELS[phase];
  return {
    phase,
    left: layout.left,
    main: layout.main,
    secondary: layout.secondary,
    footer: layout.footer,
  };
}

export function phaseFromSessionState(
  status: string
): WorkspacePhase {
  if (status === "Completed") return "Completed";
  if (status === "EvidenceValidated") return "Completed";
  if (status === "PromptExecuted") return "Reviewing";
  if (status === "PromptGenerated") return "Executing";
  // Draft and ContextConfirmed → Preparation (form editing / ready to execute)
  return "Preparation";
}
