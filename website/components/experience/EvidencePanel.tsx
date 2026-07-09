"use client";
import { useProgress } from "./useProgress";
import { Icon } from "@/components/ui/Icon";
import { ui } from "@/lib/labels";
import styles from "./EvidencePanel.module.css";

/**
 * "O que já produziste" (Recomendação 3): lista os resultados concretos dos passos
 * já concluídos, reforçando a sensação de progresso. Os rótulos vêm dos activos
 * (workflow.json → outputs / expectedOutput).
 */
export function EvidencePanel({
  slug,
  items,
}: {
  slug: string;
  items: { order: number; label: string }[];
}) {
  const { ready, steps } = useProgress(slug);
  const done = items.filter((it) => steps.includes(it.order));

  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>{ui.progress.produced}</h2>
      {ready && done.length > 0 ? (
        <ul className={styles.list}>
          {done.map((it) => (
            <li key={it.order} className={styles.item}>
              <span className={styles.check}>
                <Icon name="check" size={13} />
              </span>
              <span>{it.label}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{ui.progress.willProduce}</p>
      )}
    </section>
  );
}
