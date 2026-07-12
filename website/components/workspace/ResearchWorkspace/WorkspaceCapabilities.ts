export interface WorkspaceCapabilities {
  navigator: boolean;
  leftPanel: boolean;
  plugins: boolean;
  editing: boolean;
  comments: boolean;
  aiAssistant: boolean;
  fullscreen: boolean;
}

export type WorkspaceModeType = "workspace" | "reading" | "writing" | "presentation";

export const MODE_CAPABILITIES: Record<WorkspaceModeType, WorkspaceCapabilities> = {
  workspace: {
    navigator: true,
    leftPanel: true,
    plugins: true,
    editing: true,
    comments: false,
    aiAssistant: false,
    fullscreen: false,
  },
  reading: {
    navigator: true,
    leftPanel: false,
    plugins: true,
    editing: false,
    comments: false,
    aiAssistant: false,
    fullscreen: false,
  },
  writing: {
    navigator: true,
    leftPanel: false,
    plugins: true,
    editing: true,
    comments: true,
    aiAssistant: true,
    fullscreen: false,
  },
  presentation: {
    navigator: false,
    leftPanel: false,
    plugins: false,
    editing: false,
    comments: false,
    aiAssistant: false,
    fullscreen: true,
  },
};
