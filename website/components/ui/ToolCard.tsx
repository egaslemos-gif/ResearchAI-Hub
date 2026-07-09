import Link from "next/link";
import { Badge } from "./Badge";
import { ui, categoryLabel } from "@/lib/labels";
import type { ToolSummary } from "@/lib/content";
import styles from "./ToolCard.module.css";

export function ToolCard({ t }: { t: ToolSummary }) {
  return (
    <Link href={`/ferramentas/${t.slug}`} className={styles.card}>
      <div className={styles.head}>
        <span className={styles.logo} aria-hidden>
          {t.name.charAt(0)}
        </span>
        <div className={styles.headText}>
          <h3 className={styles.name}>{t.name}</h3>
          {categoryLabel(t.category) && (
            <span className="overline">{categoryLabel(t.category)}</span>
          )}
        </div>
      </div>

      <p className={styles.desc}>{t.description}</p>

      <div className={styles.foot}>
        {t.free && <Badge tone="success">{ui.meta.free}</Badge>}
        {t.provider && <span className={styles.provider}>{t.provider}</span>}
      </div>
    </Link>
  );
}
