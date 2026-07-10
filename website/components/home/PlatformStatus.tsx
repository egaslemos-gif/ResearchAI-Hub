import styles from "./PlatformStatus.module.css";
import { getPrompts, getTools } from "@/lib/content";
import { RESEARCH_NEEDS } from "@/lib/researchNeeds";

export function PlatformStatus() {
  const tools = getTools();
  const prompts = getPrompts();
  const availableNeeds = RESEARCH_NEEDS.filter((n) => n.status === "available").length;

  return (
    <div className={styles.statusWrap}>
      <h3 className={styles.title}>Estado da Plataforma</h3>
      
      <div className={styles.grid}>
        <div className={styles.metric}>
          <span className={styles.label}>Versão</span>
          <span className={styles.value}>v1.0-beta</span>
        </div>
        
        <div className={styles.metric}>
          <span className={styles.label}>Protocolos</span>
          <span className={styles.value}>{availableNeeds} de {RESEARCH_NEEDS.length} disponíveis</span>
        </div>
        
        <div className={styles.metric}>
          <span className={styles.label}>Ferramentas</span>
          <span className={styles.value}>{tools.length} ativas</span>
        </div>
        
        <div className={styles.metric}>
          <span className={styles.label}>Prompts</span>
          <span className={styles.value}>{prompts.length} aprovados</span>
        </div>
        
        <div className={styles.metric}>
          <span className={styles.label}>Training Kit</span>
          <span className={styles.value}>Concluído</span>
        </div>
      </div>
    </div>
  );
}
