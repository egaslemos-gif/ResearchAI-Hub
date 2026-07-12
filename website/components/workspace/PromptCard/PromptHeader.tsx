import React from "react";
import styles from "./PromptCard.module.css";

export function PromptHeader() {
  return (
    <div className={styles.header}>
      <span className={styles.title}>Prompt de Engenharia</span>
    </div>
  );
}
