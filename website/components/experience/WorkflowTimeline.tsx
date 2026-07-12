"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./WorkflowTimeline.module.css";
import { Check } from "lucide-react";

export interface TimelineStep {
  order: number;
  name: string;
  minutes: number;
}

interface WorkflowTimelineProps {
  steps: TimelineStep[];
  currentStepIndex: number; // 0-indexed (0 is step 1)
}

function formatMinutes(m: number): string {
  if (m <= 0) return "";
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min ? `${h}h ${min}min` : `${h}h`;
}

export function WorkflowTimeline({ steps, currentStepIndex }: WorkflowTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll current step into view on mount or step change
  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector(`.${styles.stepActive}`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [currentStepIndex]);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.scrollArea}>
        <div className={styles.track}>
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = idx === currentStepIndex;
            // O próximo passo seria 'Available' se pudéssemos aferir o unlocked,
            // mas por predefinição, qualquer índice > currentStepIndex é 'Locked'.
            const isLocked = idx > currentStepIndex;

            let statusClass = "";
            if (isActive) statusClass = styles.stepActive;
            else if (isCompleted) statusClass = styles.stepCompleted;
            else if (isLocked) statusClass = styles.stepLocked;

            const content = (
                <>
                  <div className={styles.indicator}>
                    <div className={styles.circle}>
                      {isCompleted ? <Check size={16} /> : step.order}
                    </div>
                    <div className={styles.content}>
                      <span className={styles.name}>{step.name}</span>
                      {step.minutes > 0 && (
                        <span className={styles.time}>{formatMinutes(step.minutes)}</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.line} />
                </>
            );

            // RFC-NAV-001:
            // Completed -> Clicável
            // Current -> Não clicável
            // Locked -> Não clicável (not-allowed)
            return (
              <div key={step.order} className={`${styles.step} ${statusClass}`}>
                 {isCompleted ? (
                    <Link href={`./${step.order}`} className={styles.stepLink}>
                      {content}
                    </Link>
                 ) : (
                    <div 
                      className={styles.stepLink} 
                      title={isLocked ? `Disponível após concluir passo atual` : undefined}
                      aria-current={isActive ? "step" : undefined}
                      aria-disabled={isLocked ? true : undefined}
                    >
                      {content}
                    </div>
                 )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
