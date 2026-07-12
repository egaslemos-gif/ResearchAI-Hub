"use client";

import React, { ReactNode } from "react";
import { ResearchNavigator } from "../Navigator/ResearchNavigator";
import styles from "./ResearchDocument.module.css";

interface ResearchDocumentProps {
  children: ReactNode;
  navigatorEnabled?: boolean;
}

export function ResearchDocument({ children, navigatorEnabled = true }: ResearchDocumentProps) {
  return (
    <div className={styles.layout}>
      {navigatorEnabled && <ResearchNavigator />}
      <article className={styles.document}>
        {children}
      </article>
    </div>
  );
}
