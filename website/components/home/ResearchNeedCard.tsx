import Link from "next/link";
import { ResearchNeed } from "@/lib/researchNeeds";
import { Icon } from "@/components/ui/Icon";
import { ui } from "@/lib/labels";
import styles from "./EcosystemGrid.module.css";

export function ResearchNeedCard({ need }: { need: ResearchNeed }) {
  const isAvailable = need.status === "available";
  const href = isAvailable && need.competencyId ? `/competencias/${need.competencyId}` : undefined;

  let badgeText = "";
  let badgeClass = "";
  let iconClass = "";

  switch (need.status) {
    case "available":
      badgeText = "Disponível agora";
      badgeClass = styles.badgeAvailable;
      iconClass = styles.iconAvailable;
      break;
    case "development":
      badgeText = "Em desenvolvimento";
      badgeClass = styles.badgeDevelopment;
      iconClass = styles.iconDevelopment;
      break;
    case "planned":
      badgeText = "Brevemente";
      badgeClass = styles.badgePlanned;
      iconClass = styles.iconPlanned;
      break;
  }

  const CardContent = () => (
    <>
      <div className={styles.header}>
        <div className={`${styles.iconWrap} ${iconClass}`}>
          <Icon name={need.iconName as any} size={20} />
        </div>
        <span className={`${styles.badge} ${badgeClass}`}>{badgeText}</span>
      </div>
      
      <h3 className={styles.title}>{need.title}</h3>
      <p className={styles.description}>{need.description}</p>
      
      {isAvailable ? (
        <div className={`${styles.action} ${styles.actionAvailable}`}>
          {ui.actions.start} <Icon name="arrow-right" size={16} />
        </div>
      ) : (
        <div className={`${styles.action} ${styles.actionNotAvailable}`} title="Estará disponível numa futura versão.">
          Indisponível <Icon name="lock" size={14} />
        </div>
      )}
    </>
  );

  const cardClassName = `${styles.card} ${isAvailable ? styles.cardAvailable : styles.cardNotAvailable}`;

  if (href) {
    return (
      <Link href={href} className={cardClassName}>
        <CardContent />
      </Link>
    );
  }

  return (
    <div className={cardClassName}>
      <CardContent />
    </div>
  );
}
