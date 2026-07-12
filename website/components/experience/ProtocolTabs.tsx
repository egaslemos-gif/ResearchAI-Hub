"use client";
import { useState, type ReactNode } from "react";
import styles from "./ProtocolTabs.module.css";

type TabId = "guia" | "passos" | "evidencias" | "checklist";

interface ProtocolTabsProps {
  guiaContent: ReactNode;
  passosContent: ReactNode;
  evidenciasContent: ReactNode;
  checklistContent: ReactNode;
}

export function ProtocolTabs({
  guiaContent,
  passosContent,
  evidenciasContent,
  checklistContent,
}: ProtocolTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("guia");

  return (
    <div className={styles.container}>
      <div className={styles.tabList} role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "guia"}
          className={`${styles.tab} ${activeTab === "guia" ? styles.active : ""}`}
          onClick={() => setActiveTab("guia")}
        >
          Guia
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "passos"}
          className={`${styles.tab} ${activeTab === "passos" ? styles.active : ""}`}
          onClick={() => setActiveTab("passos")}
        >
          Passos
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "evidencias"}
          className={`${styles.tab} ${activeTab === "evidencias" ? styles.active : ""}`}
          onClick={() => setActiveTab("evidencias")}
        >
          Evidências
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "checklist"}
          className={`${styles.tab} ${activeTab === "checklist" ? styles.active : ""}`}
          onClick={() => setActiveTab("checklist")}
        >
          Checklist
        </button>
      </div>

      <div className={styles.tabPanels}>
        <div role="tabpanel" hidden={activeTab !== "guia"}>
          {guiaContent}
        </div>
        <div role="tabpanel" hidden={activeTab !== "passos"}>
          {passosContent}
        </div>
        <div role="tabpanel" hidden={activeTab !== "evidencias"}>
          {evidenciasContent}
        </div>
        <div role="tabpanel" hidden={activeTab !== "checklist"}>
          {checklistContent}
        </div>
      </div>
    </div>
  );
}
