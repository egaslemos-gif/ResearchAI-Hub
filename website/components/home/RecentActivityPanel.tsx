"use client";
import { Clock } from "lucide-react";
import styles from "./RecentActivityPanel.module.css";
import { useWorkspaceStore } from "@/components/workspace/WorkspaceStoreContext";

const STEP_LABELS: Record<number, string> = {
  1: "Definiu o tema de investigação",
  2: "Formulou a pergunta de pesquisa",
  3: "Pesquisou artigos científicos",
  4: "Selecionou estudos para análise",
  5: "Criou fichas de leitura",
  6: "Construiu tabela comparativa",
  7: "Identificou lacunas na literatura",
  8: "Sintetizou achados por temas",
  9: "Escreveu a revisão preliminar",
  10: "Exportou o documento final",
};

export function RecentActivityPanel() {
  const { activeWorkspace } = useWorkspaceStore();

  const progress = activeWorkspace?.progress ?? {};
  const activities = Object.entries(progress)
    .filter(([_, p]) => p.status === "Completed" || p.status === "ContextConfirmed")
    .sort(([a], [b]) => Number(b) - Number(a))
    .slice(0, 5)
    .map(([step]) => ({
      step: Number(step),
      description: STEP_LABELS[Number(step)] || `Completou o passo ${step}`,
    }));

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>Atividade Recente</h2>
        </div>
      </div>

      <div className={styles.list}>
        {activities.length === 0 ? (
          <div style={{ padding: "var(--space-3)", color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
            Nenhuma atividade registada. Inicie um protocolo para começar.
          </div>
        ) : (
          activities.map((act) => (
            <div key={act.step} className={styles.item}>
              <Clock size={14} className={styles.icon} />
              <div className={styles.content}>
                <span className={styles.desc}>{act.description}</span>
                <span className={styles.meta}>Passo {act.step}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
