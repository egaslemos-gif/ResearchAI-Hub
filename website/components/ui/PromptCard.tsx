import Link from "next/link";
import { Icon } from "./Icon";
import { Badge } from "./Badge";
import type { PromptSummary } from "@/lib/content";
import styles from "./PromptCard.module.css";

export function PromptCard({ p }: { p: PromptSummary }) {
  return (
    <Link href={`/prompts/${p.slug}`} className={styles.card}>
      <div className={styles.top}>
        <span className={styles.icon} aria-hidden>
          <Icon name="file-text" size={18} />
        </span>
        {p.language && <Badge tone="outline">{p.language.toUpperCase()}</Badge>}
      </div>

      <h3 className={styles.title}>{p.name}</h3>
      {p.objective && <p className={styles.desc}>{p.objective}</p>}

      {p.compatibleTools.length > 0 && (
        <div className={styles.tools}>
          {p.compatibleTools.map((t) => (
            <span key={t} className={styles.tool}>
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
