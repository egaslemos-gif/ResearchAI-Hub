import { RESEARCH_NEEDS } from "@/lib/researchNeeds";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import styles from "./EcosystemGrid.module.css";

export function EcosystemGrid() {
  const available = RESEARCH_NEEDS.filter(n => n.status === "available");
  const upcoming = RESEARCH_NEEDS.filter(n => n.status !== "available");

  return (
    <div className={styles.container}>
      <div className={styles.activeProtocols}>
        {available.map((need) => (
          <Link key={need.id} href={`/competencias/${need.competencyId}`} className={styles.activeCard}>
            <div className={styles.cardHeader}>
              <Icon name={need.iconName as any} size={20} className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>{need.title}</h3>
            </div>
            <p className={styles.cardDescription}>{need.description}</p>
            
            <div className={styles.cardFooter}>
              <div className={styles.cardMeta}>
                <span className={styles.metaBadge}>DISPONÍVEL</span>
              </div>
              <span className={styles.cardAction}>
                Iniciar <Icon name="arrow-right" size={15} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.upcomingGrid}>
        {upcoming.map((need) => (
          <div key={need.id} className={styles.upcomingCard}>
            <div className={styles.cardHeader}>
              <Icon name={need.iconName as any} size={20} className={styles.cardIconMuted} />
              <h3 className={styles.cardTitle}>{need.title}</h3>
            </div>
            <p className={styles.cardDescriptionMuted}>{need.description}</p>
            
            <div className={styles.cardFooter}>
              <div className={styles.cardMeta}>
                <span className={styles.metaBadgePlanned}>PLANEADO</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
