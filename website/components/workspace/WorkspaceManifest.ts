import type { PanelId } from "./WorkspacePluginRegistry";

export type DockPosition = "left" | "main" | "secondary" | "footer" | "floating";

export interface PanelManifest {
  id: PanelId;
  title: string;
  icon?: string;
  defaultDock: DockPosition;
  defaultWidth?: number;
  minWidth?: number;
  priority: number;
  collapsible: boolean;
  supportsFloating: boolean;
  capabilities: {
    supportsMarkdown?: boolean;
    supportsPDF?: boolean;
    supportsSelection?: boolean;
    supportsVariables?: boolean;
    supportsStreaming?: boolean;
    supportsExecution?: boolean;
  };
}

export const PANEL_MANIFESTS: Record<PanelId, PanelManifest> = {
  "research-profile": {
    id: "research-profile",
    title: "Research Profile",
    icon: "user",
    defaultDock: "left",
    defaultWidth: 240,
    minWidth: 180,
    priority: 10,
    collapsible: true,
    supportsFloating: false,
    capabilities: {
      supportsVariables: true,
    },
  },
  "research-console": {
    id: "research-console",
    title: "Research Console",
    icon: "terminal",
    defaultDock: "main",
    defaultWidth: 720,
    minWidth: 400,
    priority: 100,
    collapsible: false,
    supportsFloating: false,
    capabilities: {
      supportsMarkdown: true,
      supportsExecution: true,
      supportsStreaming: true,
      supportsSelection: true,
    },
  },
  "execution-status": {
    id: "execution-status",
    title: "Execution Status",
    icon: "activity",
    defaultDock: "main",
    defaultWidth: 720,
    minWidth: 400,
    priority: 90,
    collapsible: true,
    supportsFloating: true,
    capabilities: {
      supportsExecution: true,
    },
  },
  "evidence": {
    id: "evidence",
    title: "Evidence",
    icon: "file-text",
    defaultDock: "secondary",
    defaultWidth: 600,
    minWidth: 300,
    priority: 50,
    collapsible: true,
    supportsFloating: true,
    capabilities: {
      supportsMarkdown: true,
      supportsSelection: true,
    },
  },
  "inspector": {
    id: "inspector",
    title: "Validation Inspector",
    icon: "shield-check",
    defaultDock: "secondary",
    defaultWidth: 280,
    minWidth: 220,
    priority: 60,
    collapsible: true,
    supportsFloating: false,
    capabilities: {
      supportsSelection: true,
    },
  },
  "checklist": {
    id: "checklist",
    title: "Validation Checklist",
    icon: "check-square",
    defaultDock: "secondary",
    defaultWidth: 600,
    minWidth: 300,
    priority: 40,
    collapsible: true,
    supportsFloating: false,
    capabilities: {
      supportsSelection: true,
    },
  },
  "expected-result": {
    id: "expected-result",
    title: "Expected Result",
    icon: "target",
    defaultDock: "secondary",
    defaultWidth: 600,
    minWidth: 300,
    priority: 30,
    collapsible: true,
    supportsFloating: false,
    capabilities: {
      supportsMarkdown: true,
    },
  },
  "step-advance": {
    id: "step-advance",
    title: "Step Navigation",
    icon: "arrow-right",
    defaultDock: "footer",
    defaultWidth: 0,
    minWidth: 0,
    priority: 5,
    collapsible: false,
    supportsFloating: false,
    capabilities: {},
  },
};

export function getManifest(id: PanelId): PanelManifest {
  return PANEL_MANIFESTS[id];
}

export function getManifests(ids: PanelId[]): PanelManifest[] {
  return ids.map(getManifest);
}
