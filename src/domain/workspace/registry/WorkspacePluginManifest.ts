import { DockTarget, PluginId, WorkspaceStatePhase, Viewport } from '../core/types';

export interface WorkspacePluginManifest {
  id: PluginId;
  version: string;
  title: string;
  description: string;
  icon?: string;
  priority: number;
  defaultDock: DockTarget;
  supportedStates: WorkspaceStatePhase[];
  supportedViewports: Viewport['device'][];
  dependencies: PluginId[];
  capabilities: string[];
  permissions: string[];
}
