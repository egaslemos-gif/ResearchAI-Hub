import { RESEARCH_NEEDS } from "@/lib/researchNeeds";
import { ResearchNeedCard } from "./ResearchNeedCard";
import styles from "./EcosystemGrid.module.css";

export function EcosystemGrid() {
  return (
    <div className={styles.grid}>
      {RESEARCH_NEEDS.map((need) => (
        <ResearchNeedCard key={need.id} need={need} />
      ))}
    </div>
  );
}
