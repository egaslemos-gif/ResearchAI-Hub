import type { PanelId } from "./WorkspacePluginRegistry";
import type { WorkspacePhase } from "./WorkspaceTopology";

export type LayoutNodeType = "split" | "stack" | "tabs" | "floating" | "panel";

export type SplitDirection = "horizontal" | "vertical";

export interface LayoutNode {
  type: LayoutNodeType;
  id: string;
  direction?: SplitDirection;
  sizes?: number[];
  activeIndex?: number;
  children?: LayoutNode[];
  panelId?: PanelId;
  floating?: { x: number; y: number; width: number; height: number };
}

export interface WorkspaceLayout {
  phase: WorkspacePhase;
  root: LayoutNode;
}
