"use client";
import { useProgress } from "./useProgress";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ui } from "@/lib/labels";
import type { ChecklistSection } from "@/lib/content";
import styles from "./ChecklistTracker.module.css";

export function ChecklistTracker({
  slug,
  sections,
  total,
  threshold,
  concludeHref,
}: {
  slug: string;
  sections: ChecklistSection[];
  total: number;
  threshold: number | null;
  concludeHref: string;
}) {
  const { ready, checklist, toggleChecklist } = useProgress(slug);
  const done = checklist.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const thresholdPct = threshold ? Math.round(threshold * 100) : null;
  const meets = thresholdPct === null || pct >= thresholdPct;

  return (
    <div className={styles.wrap}>
      <div className={styles.summary}>
        <div className={styles.summaryText}>
          <strong className={styles.count}>{ready ? ui.checklist.progress(done, total) : " "}</strong>
          {thresholdPct !== null && (
            <span className={styles.note}>{ui.checklist.thresholdNote(thresholdPct)}</span>
          )}
        </div>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${ready ? pct : 0}%` }} />
        </div>
      </div>

      {sections.map((sec) => (
        <section key={sec.name} className={styles.section}>
          <h3 className={styles.sectionTitle}>{sec.name}</h3>
          <ul className={styles.items}>
            {sec.items.map((it) => {
              const checked = checklist.includes(it.key);
              return (
                <li key={it.key}>
                  <button
                    type="button"
                    className={`${styles.item} ${checked ? styles.checked : ""}`}
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggleChecklist(it.key)}
                  >
                    <span className={styles.box}>{checked && <Icon name="check" size={13} />}</span>
                    <span className={styles.text}>{it.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className={styles.footer}>
        {meets && ready && (
          <span className={styles.ready}>
            <Icon name="circle-check" size={16} /> {ui.checklist.ready}
          </span>
        )}
        <Button href={concludeHref} size="lg">
          {ui.actions.finish}
          <Icon name="arrow-right" size={18} />
        </Button>
      </div>
    </div>
  );
}
