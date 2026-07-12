"use client";

import React, { ReactNode } from "react";

export interface WorkspacePlugin {
  id: string;
  name: string;
  slot?: "document" | "sidebar" | "footer";
  priority?: number;
  render: () => ReactNode;
}

export function WorkspacePlugins({ children }: { children: ReactNode }) {
  return (
    <div className="workspace-plugins">
      {children}
    </div>
  );
}
