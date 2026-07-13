import type { PanelId } from "./WorkspacePluginRegistry";

export type WorkspacePhase =
  | "Preparation"
  | "Executing"
  | "Reviewing"
  | "Completed";

export type RegionKey = "left" | "main" | "secondary" | "footer";

export interface WorkspaceTopology {
  phase: WorkspacePhase;
  left: PanelId[];
  main: PanelId[];
  secondary: PanelId[];
  footer: PanelId[];
}
