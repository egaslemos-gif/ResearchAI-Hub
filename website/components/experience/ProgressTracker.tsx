"use client";
import { useProgress } from "./useProgress";
import { ui } from "@/lib/labels";
import styles from "./ProgressTracker.module.css";

function formatMinutes(m: number): string {
  if (m <= 0) return "";
  if (m < 60) return `~${m} min`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min ? `~${h}h ${min}min` : `~${h}h`;
}

/**
 * Barra de progresso persistente, sempre visível durante o Guia Prático (Ajuste 4).
 * Mostra também o tempo estimado em falta (Recomendação 1), calculado a partir dos
 * tempos de cada passo (activos) que ainda não foram concluídos.
 */
export function ProgressTracker({
  slug,
  totalSteps,
  currentStep,
  stepMinutes,
}: {
  slug: string;
  totalSteps: number;
  currentStep?: number;
  stepMinutes?: number[];
}) {
  const { ready, stepsDone, steps } = useProgress(slug);
  const pct = totalSteps ? Math.round((stepsDone / totalSteps) * 100) : 0;

  let remaining = "";
  if (stepMinutes && ready) {
    const mins = stepMinutes.reduce(
      (acc, m, i) => (steps.includes(i + 1) ? acc : acc + m),
      0
    );
    remaining = formatMinutes(mins);
  }

  return (
    <div className={styles.wrap} aria-live="polite">
      <div className={styles.labels}>
        <span className={styles.title}>
          {currentStep ? ui.step.counter(currentStep, totalSteps) : ui.progress.guideMeta(totalSteps)}
          {remaining && <span className={styles.remaining}> · {ui.progress.remaining(remaining)}</span>}
        </span>
        <span className={styles.count}>
          {ready ? ui.progress.done(stepsDone, totalSteps) : " "}
        </span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${ready ? pct : 0}%` }} />
      </div>
    </div>
  );
}
