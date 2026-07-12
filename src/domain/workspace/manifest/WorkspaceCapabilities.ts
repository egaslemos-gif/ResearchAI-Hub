export interface WorkspaceCapabilities {
  supports: {
    pdf: boolean;
    markdown: boolean;
    mermaid: boolean;
    chat: boolean;
    terminal: boolean;
    checklists: boolean;
    history: boolean;
    annotations: boolean;
  };
}
