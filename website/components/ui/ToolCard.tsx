import Link from "next/link";
import { Icon } from "./Icon";
import { Badge } from "./Badge";
import { ui, categoryLabel } from "@/lib/labels";
import type { ToolSummary } from "@/lib/content";
import styles from "./ToolCard.module.css";

/** Mapeia categoria de ferramenta para ícone Lucide — identidade visual consistente. */
const CATEGORY_ICONS: Record<string, string> = {
  discovery: "search",
  production: "pen-tool",
  organization: "folder-open",
  reading: "book-open",
  review: "check-circle",
  analysis: "bar-chart-3",
  writing: "file-text",
};

function toolIcon(category: string | null): string {
  if (!category) return "box";
  return CATEGORY_ICONS[category.toLowerCase()] ?? "box";
}

export function ToolCard({ t }: { t: ToolSummary }) {
  return (
    <Link href={`/ferramentas/${t.slug}`} className={styles.card}>
      <div className={styles.head}>
        <span className={styles.logo} aria-hidden>
          <Icon name={toolIcon(t.category)} size={20} />
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
