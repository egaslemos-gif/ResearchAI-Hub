import Link from "next/link";
import { Icon } from "./Icon";
import { Badge } from "./Badge";
import { ui, difficultyLabel, familyLabel } from "@/lib/labels";
import type { CompetencySummary } from "@/lib/content";
import styles from "./CompetencyCard.module.css";

export function CompetencyCard({
  c,
  featured = false,
}: {
  c: CompetencySummary;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/competencias/${c.slug}`}
      className={`${styles.card} ${featured ? styles.featured : ""}`}
    >
      <div className={styles.top}>
        <span className={styles.icon}>
          <Icon name={c.icon} size={featured ? 26 : 22} />
        </span>
        <div className={styles.tags}>
          {familyLabel(c.family, c.familyName) && (
            <span className="overline">{familyLabel(c.family, c.familyName)}</span>
          )}
          {c.difficulty && <Badge tone="neutral">{difficultyLabel(c.difficulty)}</Badge>}
        </div>
      </div>

      <h3 className={styles.title}>{c.name}</h3>
      <p className={styles.desc}>{c.description}</p>

      <div className={styles.meta}>
        {c.estimatedTime && (
          <span className={styles.metaItem}>
            <Icon name="clock" size={14} /> {c.estimatedTime}
          </span>
        )}
        <span className={styles.metaItem}>
          <Icon name="list-checks" size={14} /> {c.stepCount} {ui.meta.stepsSuffix}
        </span>
        <span className={styles.metaItem}>
          <Icon name="wrench" size={14} /> {c.toolCount} {ui.meta.toolsSuffix}
        </span>
      </div>

      {featured && (
        <span className={styles.cta}>
          {ui.actions.start}
          <Icon name="arrow-right" size={16} />
        </span>
      )}
    </Link>
  );
}
