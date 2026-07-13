"use client";

import styles from "./ResearchStepHeader.module.css";

interface ResearchStepHeaderProps {
  title: string;
  expectedArtifact: string | null;
  stepNumber?: number;
  protocolId?: string;
  estimatedTime?: number;
  artifactStatus?: string;
}

export function ResearchStepHeader({
  title,
  expectedArtifact,
  stepNumber,
  protocolId,
  estimatedTime,
  artifactStatus,
}: ResearchStepHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div className={styles.meta}>
          {protocolId && (
            <span className={styles.stepNumber}>{protocolId}</span>
          )}
          {stepNumber && <span className={styles.metaItem}>Passo {stepNumber}</span>}
          {estimatedTime && <span className={styles.metaItem}>{estimatedTime} min</span>}
          <h1 className={styles.title}>{title}</h1>
        </div>
        <div className={styles.metaRight}>
          {expectedArtifact && (
            <span className={styles.metaItem}>
              <span className={styles.artifactLabel}>Artefacto: </span>
              <span className={styles.artifact}>{expectedArtifact}</span>
            </span>
          )}
          {artifactStatus && (
            <span className={`${styles.status} ${artifactStatus === "completed" ? styles.statusCompleted : styles.statusPending}`}>
              {artifactStatus === "completed" ? "✓ Concluído" : "Em execução"}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
