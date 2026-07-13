import type { LayoutNode, WorkspaceLayout, SplitDirection } from "./LayoutNode";
import type { WorkspacePhase, RegionKey } from "./WorkspaceTopology";
import type { PanelId } from "./WorkspacePluginRegistry";
import { PHASE_PANELS } from "./WorkspaceCompositionEngine";
import { getManifest } from "./WorkspaceManifest";

let nodeCounter = 0;
function nodeId(prefix: string): string {
  return `${prefix}-${++nodeCounter}`;
}

function buildPanelNode(panelId: PanelId): LayoutNode {
  return {
    type: "panel",
    id: nodeId("p"),
    panelId,
  };
}

function buildStack(panelIds: PanelId[], direction: SplitDirection = "vertical"): LayoutNode | null {
  if (panelIds.length === 0) return null;
  if (panelIds.length === 1) return buildPanelNode(panelIds[0]);

  const children = panelIds.map(buildPanelNode);
  const sizes = distributeSizes(children.length);

  return {
    type: "split",
    id: nodeId("s"),
    direction,
    sizes,
    children,
  };
}

function buildTabs(panelIds: PanelId[]): LayoutNode | null {
  if (panelIds.length === 0) return null;
  if (panelIds.length === 1) return buildPanelNode(panelIds[0]);

  return {
    type: "tabs",
    id: nodeId("t"),
    activeIndex: 0,
    children: panelIds.map(buildPanelNode),
  };
}

function distributeSizes(count: number): number[] {
  return Array.from({ length: count }, () => 100 / count);
}

function getPhasePanels(phase: WorkspacePhase): Record<RegionKey, PanelId[]> {
  return PHASE_PANELS[phase];
}

export function buildLayout(phase: WorkspacePhase): WorkspaceLayout {
  const panels = getPhasePanels(phase);

  const leftStack = buildStack(panels.left, "vertical");
  const mainStack = buildStack(panels.main, "vertical");
  // Secondary: vertical stack in Reviewing/Completed, tabs otherwise
  const secondaryNode = phase === "Reviewing" || phase === "Completed"
    ? buildStack(panels.secondary, "vertical")
    : buildTabs(panels.secondary);
  const footerStack = buildStack(panels.footer, "horizontal");

  // Build the tree: horizontal split [left | main | secondary]
  const horizontalChildren: LayoutNode[] = [];
  const horizontalSizes: number[] = [];

  if (leftStack) {
    const manifest = getManifest(panels.left[0]);
    const width = manifest?.defaultWidth ?? 240;
    horizontalChildren.push(leftStack);
    horizontalSizes.push(width);
  }

  if (mainStack) {
    horizontalChildren.push(mainStack);
    horizontalSizes.push(0); // 0 = flex-grow
  }

  if (secondaryNode) {
    horizontalChildren.push(secondaryNode);
    // Single inspector panel: fixed width. Multiple panels: percentage.
    if (panels.secondary.length === 1) {
      const manifest = getManifest(panels.secondary[0]);
      const width = manifest?.defaultWidth ?? 280;
      horizontalSizes.push(width);
    } else {
      horizontalSizes.push(leftStack ? -25 : -30);
    }
  }

  let root: LayoutNode;

  if (horizontalChildren.length === 1) {
    root = horizontalChildren[0];
  } else {
    root = {
      type: "split",
      id: nodeId("root"),
      direction: "horizontal",
      sizes: horizontalSizes.length > 0 ? horizontalSizes : undefined,
      children: horizontalChildren,
    };
  }

  // If footer exists, wrap root in a vertical split [root, footer]
  if (footerStack) {
    root = {
      type: "split",
      id: nodeId("vroot"),
      direction: "vertical",
      sizes: [0, 44],
      children: [root, footerStack],
    };
  }

  return { phase, root };
}
