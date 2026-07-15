"use client";

import React, { ReactNode, useState } from "react";
import styles from "./ResearchWorkspaceShell.module.css";
import { ExecutionLayout, ExecutionGrid } from "@/components/layouts/Layouts";
import { ArtifactsPanel } from "@/components/home/ArtifactsPanel";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useWorkspaceStore } from "./WorkspaceStoreContext";
import { phaseFromSessionState } from "./WorkspaceCompositionEngine";
import { resolvePanel } from "./WorkspacePluginRegistry";
import { buildLayout } from "./DockManager";
import type { LayoutNode } from "./LayoutNode";
import { getManifest } from "./WorkspaceManifest";
import { RuntimeStatusBar } from "./RuntimeStatusBar";

interface ResearchWorkspaceShellProps {
  header: ReactNode;
}

function renderPanelNode(node: LayoutNode): ReactNode {
  if (!node.panelId) return null;
  const Component = resolvePanel(node.panelId);
  if (!Component) return null;
  return <Component key={node.id} />;
}

function renderSplit(node: LayoutNode): ReactNode {
  if (!node.children || node.children.length === 0) return null;

  const isHorizontal = node.direction === "horizontal";

  return (
    <div
      key={node.id}
      className={styles.split}
      style={{
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
      }}
    >
      {node.children.map((child, i) => {
        const sizes = node.sizes || [];
        const size = sizes[i] ?? 0;
        let style: React.CSSProperties;
        if (size === 0) {
          style = { flex: 1, minWidth: 0, minHeight: 0 };
        } else if (size < 0) {
          style = {
            flex: `0 0 ${Math.abs(size)}%`,
            minWidth: 0,
            minHeight: 0,
          };
        } else {
          style = {
            [isHorizontal ? "width" : "height"]: `${size}px`,
            flexShrink: 0,
            minWidth: 0,
            minHeight: 0,
          };
        }
        return (
          <div key={child.id} className={styles.splitChild} style={style}>
            {renderNode(child)}
          </div>
        );
      })}
    </div>
  );
}

function renderTabs(node: LayoutNode): ReactNode {
  if (!node.children || node.children.length === 0) return null;

  return (
    <div key={node.id} className={styles.tabsContainer}>
      <div className={styles.tabBar}>
        {node.children.map((child) => {
          if (!child.panelId) return null;
          const manifest = getManifest(child.panelId);
          return (
            <span key={child.id} className={styles.tabLabel}>
              {manifest?.title || child.panelId}
            </span>
          );
        })}
      </div>
      <div className={styles.tabContent}>
        {node.children.map((child, i) => (
          <div
            key={child.id}
            style={{ display: i === (node.activeIndex ?? 0) ? "block" : "none" }}
          >
            {renderNode(child)}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderNode(node: LayoutNode): ReactNode {
  switch (node.type) {
    case "panel":
      return renderPanelNode(node);
    case "split":
      return renderSplit(node);
    case "tabs":
      return renderTabs(node);
    case "stack":
      return renderSplit({ ...node, direction: "vertical" });
    case "floating":
      if (!node.floating || !node.children?.[0]) return null;
      return (
        <div
          key={node.id}
          className={styles.floating}
          style={{
            position: "absolute",
            left: node.floating.x,
            top: node.floating.y,
            width: node.floating.width,
            height: node.floating.height,
          }}
        >
          {renderNode(node.children[0])}
        </div>
      );
    default:
      return null;
  }
}

export function ResearchWorkspaceShell({ header }: ResearchWorkspaceShellProps) {
  const { session } = useWorkspaceStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const step = session.currentStep || 1;
  const status = session.progress?.[step]?.status || "Draft";
  const phase = phaseFromSessionState(status);

  const layout = buildLayout(phase);

  return (
    <ExecutionLayout
      header={header}
      content={
        <ExecutionGrid
          variant="sidebar-main"
          left={
            <div className={styles.sidebarWrapper}>
              <button
                className={styles.mobileDrawerToggle}
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              >
                <span>Artefactos Gerados</span>
                {isDrawerOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <div className={`${styles.drawerContent} ${isDrawerOpen ? styles.open : ""}`}>
                <ArtifactsPanel variant="sidebar" />
              </div>
            </div>
          }
          right={
            <>
              <div className={styles.layoutRoot}>{renderNode(layout.root)}</div>
              <RuntimeStatusBar />
            </>
          }
        />
      }
    />
  );
}
