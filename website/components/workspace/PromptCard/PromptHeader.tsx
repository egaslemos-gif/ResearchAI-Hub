"use client";

import React, { useState, useCallback } from "react";
import styles from "./PromptCard.module.css";
import { Icon } from "@/components/ui/Icon";

interface PromptHeaderProps {
  onCopy?: () => void;
}

export function PromptHeader({ onCopy }: PromptHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [onCopy]);

  return (
    <div className={styles.header}>
      <span className={styles.title}>Research Console</span>
      {onCopy && (
        <div className={styles.headerAction}>
          <button
            className={`${styles.btn} ${copied ? styles.btnSuccess : styles.btnSecondary}`}
            onClick={handleCopy}
            disabled={copied}
          >
            <Icon name={copied ? "check" : "copy"} size={14} />
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>
      )}
    </div>
  );
}
