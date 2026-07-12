"use client";
import { RESEARCH_NEEDS } from "@/lib/researchNeeds";
import styles from "./RoadmapPanel.module.css";
import { ChevronRight } from "lucide-react";

export function RoadmapPanel() {
  const upcoming = RESEARCH_NEEDS.filter(n => n.status !== "available");

  if (upcoming.length === 0) return null;

  return (
    <details className={styles.roadmapSection}>
      <summary className={styles.roadmapTitle}>
        <ChevronRight size={16} className={styles.roadmapIcon} />
        Mostrar próximos protocolos
      </summary>
      <ul className={styles.roadmapList}>
        {upcoming.map((need) => (
          <li key={need.id} className={styles.roadmapItem}>
            <span className={styles.roadmapName}>{need.title}</span>
            <span className={styles.roadmapStatus}>
              {need.status === "development" ? "Em desenvolvimento" : "Planeado"}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
