import { WorkspaceState } from '../engine/WorkspaceState';
import { Viewport, PluginId } from '../core/types';
import { WorkspaceTopology, SplitNode, PanelNode, LayoutNode } from './LayoutNode';
import { WorkspacePluginRegistry } from '../registry/WorkspacePluginRegistry';
import { ResearchSession } from '../../session/ResearchSession';
import { ResearchRuntime } from '../../runtime/ResearchRuntime';

export interface CompositionContext {
  state: WorkspaceState;
  session: ResearchSession;
  runtime: ResearchRuntime;
  viewport: Viewport;
}

export type CompositionResult = 
  | { success: true; topology: WorkspaceTopology }
  | { success: false; error: string };

export class WorkspaceCompositionEngine {
  constructor(private registry: WorkspacePluginRegistry) {}

  public compose(context: CompositionContext): CompositionResult {
    const { state, viewport } = context;

    // RULE: Main is never empty. We need research-console.
    const consolePlugin = this.registry.getPlugin('research-console' as PluginId);
    if (!consolePlugin) {
      return { success: false, error: 'Critical plugin "research-console" is missing.' };
    }
    
    if (!consolePlugin.capabilities.includes('chat')) {
      return { success: false, error: 'Plugin "research-console" missing required capabilities.' };
    }

    // RULE: Status is always present
    const statusPlugin = this.registry.getPlugin('status-bar' as PluginId);
    if (!statusPlugin) {
      return { success: false, error: 'Critical plugin "status-bar" is missing.' };
    }

    // Status is always at the bottom
    const statusNode: PanelNode = {
      type: 'panel',
      id: 'status-region',
      pluginId: 'status-bar' as PluginId,
      height: 32
    };

    // Mobile layout
    if (viewport.device === 'mobile') {
      return {
        success: true,
        topology: {
          root: {
            type: 'split',
            direction: 'vertical',
            children: [
              {
                type: 'panel',
                id: 'main-region',
                pluginId: 'research-console' as PluginId,
                grow: true
              },
              statusNode
            ]
          }
        }
      };
    }

    // Desktop/Tablet layout
    const mainChildren: LayoutNode[] = [
      { type: 'panel', id: 'main-region', pluginId: 'research-console' as PluginId, grow: true }
    ];

    if (state.phase === 'Preparation' || state.phase === 'Executing') {
      mainChildren.push({ type: 'panel', id: 'context-region', pluginId: 'research-profile' as PluginId, width: 320 });
    } else if (state.phase === 'Reviewing') {
      mainChildren.push({ type: 'panel', id: 'secondary-region', pluginId: 'evidence-panel' as PluginId, width: 420 });
    } else if (state.phase === 'Error') {
      mainChildren.push({ type: 'panel', id: 'utility-region', pluginId: 'execution-logs' as PluginId, height: 250 });
    }

    const appArea: SplitNode = {
      type: 'split',
      direction: 'horizontal',
      grow: true,
      children: []
    };

    if (viewport.device === 'desktop') {
      appArea.children.push({ type: 'panel', id: 'explorer-region', pluginId: 'protocol-navigator' as PluginId, width: 260 });
    }

    appArea.children.push({
      type: 'split',
      direction: 'horizontal',
      grow: true,
      children: mainChildren
    });

    const rootSplit: SplitNode = {
      type: 'split',
      direction: 'vertical',
      children: [
        appArea,
        statusNode
      ]
    };

    return { success: true, topology: { root: rootSplit } };
  }
}
