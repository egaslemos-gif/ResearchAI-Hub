"use client";

import React, { useState } from "react";
import { Section } from "../ResearchDocument/Sections/Section";
import styles from "./EvidencePlugin.module.css";

interface EvidenceItem {
  id: string;
  label: string;
  completed: boolean;
}

interface EvidencePluginProps {
  items: EvidenceItem[];
}

export function EvidencePlugin({ items }: EvidencePluginProps) {
  const [showAll, setShowAll] = useState(false);
  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const displayItems = showAll ? items : items.slice(0, 5);
  const hasMore = items.length > 5;

  return (
    <Section id="evidence-plugin" title="Checklist" defaultOpen={false}>
      <div className={styles.progressContainer}>
        <span className={styles.progressText}>
          {completedCount}/{totalCount} concluído
        </span>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>

      <ul className={styles.checklist}>
        {displayItems.map((item) => (
          <li key={item.id} className={styles.checklistItem}>
            <span className={item.completed ? styles.checkIcon : styles.uncheckIcon}>
              {item.completed ? "✓" : "○"}
            </span>
            <span className={item.completed ? styles.checkedLabel : styles.label}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>

      {hasMore && !showAll && (
        <button 
          className={styles.showMoreBtn} 
          onClick={() => setShowAll(true)}
        >
          Mostrar restantes (+{totalCount - 5})
        </button>
      )}
    </Section>
  );
}
