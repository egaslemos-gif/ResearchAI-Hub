import { PluginId } from '../core/types';
import { WorkspacePluginManifest } from './WorkspacePluginManifest';

export class WorkspacePluginRegistry {
  private plugins: Map<PluginId, WorkspacePluginManifest> = new Map();

  public register(plugin: WorkspacePluginManifest): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with id ${plugin.id} is already registered.`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  public getPlugin(id: PluginId): WorkspacePluginManifest | undefined {
    return this.plugins.get(id);
  }

  public getAllPlugins(): WorkspacePluginManifest[] {
    return Array.from(this.plugins.values());
  }

  public getPluginsByState(state: WorkspacePluginManifest['supportedStates'][0]): WorkspacePluginManifest[] {
    return this.getAllPlugins().filter(p => p.supportedStates.includes(state));
  }
}
