export type WorkspaceEventType = 
  | "SECTION_COLLAPSED" 
  | "NAVIGATOR_UPDATED" 
  | "MODE_CHANGED" 
  | "PLUGIN_UPDATED"
  | "ANCHOR_ACTIVATED";

export interface WorkspaceEvent {
  type: WorkspaceEventType;
  payload?: any;
}

type EventListener = (event: WorkspaceEvent) => void;

export class WorkspaceEventBus {
  private listeners: Set<EventListener> = new Set();

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  publish(event: WorkspaceEvent) {
    this.listeners.forEach((listener) => listener(event));
  }
}

// Global instance for simple inter-component communication inside the workspace
export const workspaceEvents = new WorkspaceEventBus();
