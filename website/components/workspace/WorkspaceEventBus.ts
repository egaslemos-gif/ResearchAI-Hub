export type WorkspaceEventType =
  | "prompt:executed"
  | "prompt:copied"
  | "prompt:generated"
  | "evidence:added"
  | "evidence:validated"
  | "checklist:updated"
  | "variables:changed"
  | "session:state-changed"
  | "panel:activated"
  | "panel:expanded"
  | "panel:collapsed"
  | "iteration:created";

export interface WorkspaceEvent {
  type: WorkspaceEventType;
  payload?: unknown;
  timestamp: number;
}

type EventHandler = (event: WorkspaceEvent) => void;

class WorkspaceEventBus {
  private handlers: Map<WorkspaceEventType, Set<EventHandler>> = new Map();
  private history: WorkspaceEvent[] = [];
  private maxHistory = 100;

  on(type: WorkspaceEventType, handler: EventHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => this.off(type, handler);
  }

  off(type: WorkspaceEventType, handler: EventHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  emit(type: WorkspaceEventType, payload?: unknown): void {
    const event: WorkspaceEvent = { type, payload, timestamp: Date.now() };
    this.history.push(event);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    this.handlers.get(type)?.forEach((h) => h(event));
  }

  getHistory(): WorkspaceEvent[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}

let busInstance: WorkspaceEventBus | null = null;

export function getEventBus(): WorkspaceEventBus {
  if (!busInstance) {
    busInstance = new WorkspaceEventBus();
  }
  return busInstance;
}

export function useEventBus() {
  return getEventBus();
}
