"use client";

import styles from "./ResearchStepHeader.module.css";

interface ResearchStepHeaderProps {
  title: string;
  expectedArtifact: string | null;
}

export function ResearchStepHeader({
  title,
  expectedArtifact,
}: ResearchStepHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div className={styles.meta}>
          <h1 className={styles.title}>{title}</h1>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.artifact}>
          <span className={styles.artifactLabel}>Artefacto deste passo:</span>
          {expectedArtifact || "Nenhum artefacto formal exigido."}
        </div>
      </div>
    </header>
  );
}
