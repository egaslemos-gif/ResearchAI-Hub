import { PluginId, RegionId } from '../core/types';

export type LayoutDirection = 'horizontal' | 'vertical';

export interface PanelNode {
  type: 'panel';
  id: RegionId | string;
  pluginId: PluginId;
  grow?: boolean;
  width?: number | string;
  height?: number | string;
}

export interface SplitNode {
  type: 'split';
  direction: LayoutDirection;
  children: LayoutNode[];
  grow?: boolean;
}

export interface StackNode {
  type: 'stack';
  children: LayoutNode[];
  grow?: boolean;
}

export interface TabsNode {
  type: 'tabs';
  activeTabIndex: number;
  children: PanelNode[];
  grow?: boolean;
}

export interface FloatingNode {
  type: 'floating';
  child: LayoutNode;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export type LayoutNode = PanelNode | SplitNode | StackNode | TabsNode | FloatingNode;

export interface WorkspaceTopology {
  root: LayoutNode;
  floating?: FloatingNode[];
}
