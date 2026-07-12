import { WorkspaceCompositionEngine, CompositionContext } from './WorkspaceCompositionEngine';
import { WorkspacePluginRegistry } from '../registry/WorkspacePluginRegistry';
import { WorkspacePluginManifest } from '../registry/WorkspacePluginManifest';
import { WorkspaceStatePhase, PluginId, Viewport } from '../core/types';
import { WorkspaceState } from '../engine/WorkspaceState';

describe('WorkspaceCompositionEngine', () => {
  let registry: WorkspacePluginRegistry;
  let engine: WorkspaceCompositionEngine;

  const mockConsolePlugin: WorkspacePluginManifest = {
    id: 'research-console' as PluginId,
    version: '1.0.0',
    title: 'Research Console',
    description: 'Main AI interactions',
    priority: 10,
    defaultDock: 'CENTER',
    supportedStates: ['Preparation', 'Executing', 'Reviewing', 'Completed'],
    supportedViewports: ['desktop', 'tablet', 'mobile'],
    dependencies: [],
    capabilities: ['chat', 'history'],
    permissions: []
  };

  const mockStatusPlugin: WorkspacePluginManifest = {
    id: 'status-bar' as PluginId,
    version: '1.0.0',
    title: 'Status Bar',
    description: 'System status',
    priority: 100,
    defaultDock: 'BOTTOM',
    supportedStates: ['Preparation', 'Executing', 'Reviewing', 'Completed', 'Error', 'Cancelled', 'Idle'],
    supportedViewports: ['desktop', 'tablet', 'mobile'],
    dependencies: [],
    capabilities: [],
    permissions: []
  };

  beforeEach(() => {
    registry = new WorkspacePluginRegistry();
    engine = new WorkspaceCompositionEngine(registry);
  });

  function createMockContext(phase: WorkspaceStatePhase, device: Viewport['device']): CompositionContext {
    return {
      state: new WorkspaceState(phase),
      session: { id: 's1', protocolId: 'p1' },
      runtime: { tokensUsed: 0, isConnected: true, activeModel: 'test' },
      viewport: { device, width: 1024, height: 768 }
    };
  }

  it('fails gracefully when required plugins are missing', () => {
    // Registry is empty
    const context = createMockContext('Preparation', 'desktop');
    const result = engine.compose(context);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('missing');
    }
  });

  it('fails gracefully if plugin lacks required capabilities', () => {
    registry.register({ ...mockConsolePlugin, capabilities: [] }); // removed 'chat'
    
    const context = createMockContext('Preparation', 'desktop');
    const result = engine.compose(context);
    
    expect(result.success).toBe(false);
  });

  describe('With valid plugins', () => {
    beforeEach(() => {
      registry.register(mockConsolePlugin);
      registry.register(mockStatusPlugin);
    });

    // 1. States testing
    const states: WorkspaceStatePhase[] = ['Preparation', 'Executing', 'Reviewing', 'Completed', 'Cancelled', 'Error'];
    
    states.forEach(state => {
      it(`produces a valid topology for state: ${state} (Desktop)`, () => {
        const result = engine.compose(createMockContext(state, 'desktop'));
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.topology.root.type).toBe('split');
          // Status always present
          expect(JSON.stringify(result.topology)).toContain('status-region');
          // Main never empty
          expect(JSON.stringify(result.topology)).toContain('main-region');
        }
      });
    });

    // 2. Viewports testing
    it('composes correctly for Mobile', () => {
      const result = engine.compose(createMockContext('Executing', 'mobile'));
      expect(result.success).toBe(true);
      if (result.success) {
        // In mobile, we just have main and status vertical split
        const root = result.topology.root as any;
        expect(root.direction).toBe('vertical');
        expect(root.children[0].id).toBe('main-region');
        expect(root.children[1].id).toBe('status-region');
      }
    });

    it('composes correctly for Tablet', () => {
      const result = engine.compose(createMockContext('Preparation', 'tablet'));
      expect(result.success).toBe(true);
      if (result.success) {
        // In tablet, explorer is hidden from main flow
        const json = JSON.stringify(result.topology);
        expect(json).not.toContain('explorer-region');
        expect(json).toContain('context-region'); // Preparation has context
      }
    });

    // 3. Layout Rules
    it('Reviewing state injects secondary-region instead of context-region', () => {
      const result = engine.compose(createMockContext('Reviewing', 'desktop'));
      expect(result.success).toBe(true);
      if (result.success) {
        const json = JSON.stringify(result.topology);
        expect(json).toContain('secondary-region');
        expect(json).not.toContain('context-region');
      }
    });

    it('Error state injects utility-region (Execution Logs)', () => {
      const result = engine.compose(createMockContext('Error', 'desktop'));
      expect(result.success).toBe(true);
      if (result.success) {
        const json = JSON.stringify(result.topology);
        expect(json).toContain('utility-region');
      }
    });
  });
});
