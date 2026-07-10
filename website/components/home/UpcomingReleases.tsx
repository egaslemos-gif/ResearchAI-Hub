import styles from "./UpcomingReleases.module.css";
import { Check } from "lucide-react";

export function UpcomingReleases() {
  const releases = [
    "Escrita Científica",
    "Projeto de Investigação",
    "Análise de Dados",
    "Gestão Bibliográfica",
    "Prompt Engineering",
  ];

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Próximos Lançamentos</h3>
      <div className={styles.badge}>Em desenvolvimento</div>
      
      <ul className={styles.list}>
        {releases.map((r, i) => (
          <li key={i} className={styles.item}>
            <Check size={16} className={styles.icon} />
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}
