"use client";

import React, { useEffect, useState } from "react";
import { navigationEngine, DocumentSection } from "./NavigationEngine";
import styles from "./Navigator.module.css";
import { useWorkspace } from "../WorkspaceContext";

export function ResearchNavigator() {
  const [sections, setSections] = useState<DocumentSection[]>([]);
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  const { capabilities } = useWorkspace();

  useEffect(() => {
    const unsubSections = navigationEngine.subscribeSections(setSections);
    const unsubAnchor = navigationEngine.subscribeAnchor(setActiveAnchor);

    setSections(navigationEngine.getSections());
    setActiveAnchor(navigationEngine.getActiveAnchor());

    return () => {
      unsubSections();
      unsubAnchor();
    };
  }, []);

  if (!capabilities.navigator) {
    return null;
  }

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const { mode, setMode } = useWorkspace();
  const isReading = mode === "reading";
  const toggleReadingMode = () => setMode(isReading ? "workspace" : "reading");

  return (
    <nav className={styles.navigator}>
      <div className={styles.header}>
        <h4 className={styles.title}>Navigator</h4>
        <button className={styles.zenBtn} onClick={toggleReadingMode} title="Modo Leitura">
          {isReading ? "⛶" : "🕮"}
        </button>
      </div>
      <ul className={styles.sectionList}>
        {sections.map((section) => (
          <li 
            key={section.id} 
            className={`${styles.sectionItem} ${activeAnchor === section.id ? styles.active : ""}`}
            onClick={() => handleScrollTo(section.id)}
          >
            <span className={styles.indicator}>
              {activeAnchor === section.id ? "●" : "○"}
            </span>
            <span className={styles.label}>{section.title}</span>
            {section.completed && <span className={styles.check}>✓</span>}
          </li>
        ))}
      </ul>
    </nav>
  );
}
