"use client";
import { useState, useEffect } from "react";
import { useProgress } from "./useProgress";
import { ui } from "@/lib/labels";
import styles from "./ProgressTracker.module.css";
import { WorkflowTimeline, TimelineStep } from "./WorkflowTimeline";

function formatMinutes(m: number): string {
  if (m <= 0) return "";
  if (m < 60) return `~${m} min`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min ? `~${h}h ${min}min` : `~${h}h`;
}

/**
 * Barra de progresso persistente.
 * Funciona como Wrapper: Renderiza a WorkflowTimeline em Desktop 
 * e a barra de progresso simples em Mobile.
 */
export function ProgressTracker({
  slug,
  totalSteps,
  currentStep,
  stepMinutes,
  timelineSteps,
}: {
  slug: string;
  totalSteps: number;
  currentStep?: number;
  stepMinutes?: number[];
  timelineSteps?: TimelineStep[];
}) {
  const { ready, stepsDone, steps } = useProgress(slug);
  const pct = totalSteps ? Math.round((stepsDone / totalSteps) * 100) : 0;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  let remaining = "";
  if (stepMinutes && ready) {
    const mins = stepMinutes.reduce(
      (acc, m, i) => (steps.includes(i + 1) ? acc : acc + m),
      0
    );
    remaining = formatMinutes(mins);
  }

  return (
    <>
      {timelineSteps && timelineSteps.length > 0 && currentStep && (
        <div className={styles.desktopTimeline}>
          <WorkflowTimeline steps={timelineSteps} currentStepIndex={currentStep - 1} />
        </div>
      )}
      <div className={`${styles.wrap} ${isScrolled ? styles.scrolled : ""} ${timelineSteps?.length ? styles.mobileOnly : ""}`} aria-live="polite">
        <div className={styles.labels}>
          <span className={styles.title}>
            {currentStep ? `Passo ${currentStep}/${totalSteps}` : `0/${totalSteps}`}
          </span>
          {!isScrolled && remaining && <span className={styles.remaining}>{remaining}</span>}
        </div>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${ready ? pct : 0}%` }} />
        </div>
      </div>
    </>
  );
}
