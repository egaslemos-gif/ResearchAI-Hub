"use client";

import React, { useState } from "react";
import styles from "./CollapsiblePrompt.module.css";

interface CollapsiblePromptProps {
  children: React.ReactNode;
}

export function CollapsiblePrompt({ children }: CollapsiblePromptProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.content} ${expanded ? styles.expanded : styles.collapsed}`}>
        {children}
      </div>
      
      {!expanded && (
        <div className={styles.fadeOverlay}>
          <button 
            className={styles.expandButton} 
            onClick={() => setExpanded(true)}
          >
            Ver Prompt completo &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
