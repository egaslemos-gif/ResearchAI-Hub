"use client";
import { useProgress } from "./useProgress";
import { Icon } from "@/components/ui/Icon";
import { ui } from "@/lib/labels";
import styles from "./EvidencePanel.module.css";

export type Evidence = {
  id: string;
  title: string;
  producedBy: number[]; // Passos responsáveis por esta evidência
};

/**
 * Painel que indica o progresso real da investigação.
 * Mapeia os estados (Concluída, Em curso, Por iniciar) de acordo com os passos realizados.
 */
export function EvidencePanel({
  slug,
  currentStep,
  items,
}: {
  slug: string;
  currentStep: number;
  items: Evidence[];
}) {
  const { ready, steps } = useProgress(slug);

  if (!ready || items.length === 0) return null;

  return (
    <section className={styles.panel}>
      <h2 className={styles.title}>{ui.progress.produced}</h2>
      <ul className={styles.list}>
        {items.map((it) => {
          // Uma evidência está concluída se TODOS os seus producedBy estiverem em steps
          const isDone = it.producedBy.every((stepNum) => steps.includes(stepNum));
          
          // Está em curso se não estiver concluída, E o currentStep for um dos passos produtores
          const isCurrent = !isDone && it.producedBy.includes(currentStep);

          let stateClass = styles.pending;
          let icon = "circle";

          if (isDone) {
            stateClass = styles.done;
            icon = "check-circle-2";
          } else if (isCurrent) {
            stateClass = styles.current;
            icon = "loader-2";
          }

          return (
            <li key={it.id} className={`${styles.item} ${stateClass}`}>
              <span className={styles.iconWrap}>
                <Icon name={icon} size={15} className={isCurrent ? styles.spin : ""} />
              </span>
              <span className={styles.itemTitle}>{it.title}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
