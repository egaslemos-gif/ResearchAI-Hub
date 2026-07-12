"use client";
import { Clock } from "lucide-react";
import styles from "./RecentActivityPanel.module.css";
import Link from "next/link";

const MOCK_ACTIVITY = [
  { id: "act-01", description: "Definiu o tema de investigação", time: "Há 2 horas", protocol: "Revisão da Literatura" },
  { id: "act-02", description: "Formulou a pergunta de pesquisa", time: "Ontem", protocol: "Revisão da Literatura" },
  { id: "act-03", description: "Atualizou a matriz de extração", time: "Há 3 dias", protocol: "Revisão da Literatura" },
];

export function RecentActivityPanel() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>Atividade Recente</h2>
        </div>
      </div>

      <div className={styles.list}>
        {MOCK_ACTIVITY.map((act) => (
          <div key={act.id} className={styles.item}>
            <Clock size={14} className={styles.icon} />
            <div className={styles.content}>
              <span className={styles.desc}>{act.description}</span>
              <span className={styles.meta}>{act.protocol} &bull; {act.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
