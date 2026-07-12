export type PluginId = string & { readonly __brand: unique symbol };
export type WorkspaceId = string & { readonly __brand: unique symbol };
export type PanelId = string & { readonly __brand: unique symbol };
export type DockId = string & { readonly __brand: unique symbol };
export type RegionId = string & { readonly __brand: unique symbol };

export type DockTarget = 'CENTER' | 'LEFT' | 'RIGHT' | 'BOTTOM' | 'FLOATING' | 'MODAL';

export type WorkspaceStatePhase = 'Preparation' | 'Executing' | 'Reviewing' | 'Completed' | 'Idle' | 'Cancelled' | 'Error';

export interface Viewport {
  device: 'desktop' | 'tablet' | 'mobile';
  width: number;
  height: number;
}
