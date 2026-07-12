"use client";
import { useRouter } from "next/navigation";
import { useResearchSession } from "@/components/workspace/ResearchSessionContext";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MoreHorizontal } from "lucide-react";
import styles from "./ResearchSessionHeader.module.css";
import { useState } from "react";

export function ResearchSessionHeader() {
  const { session, ready, updateSession } = useResearchSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!ready || session.status !== "active" || !session.researchTopic) {
    return null;
  }

  const handleContinue = () => {
    const url = session.currentProtocol ? `/competencias/${session.currentProtocol}` : "/competencias";
    router.push(url);
  };

  const handleNew = () => {
    if (confirm("Ao iniciar uma nova investigação, o contexto actual será substituído. Pretende continuar?")) {
      updateSession({ status: "completed" });
      router.push("/competencias");
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.top}>
        <span className={styles.overline}>Investigação Atual</span>
      </div>
      <div className={styles.main}>
        <h1 className={styles.topic}>{session.researchTopic}</h1>
        
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Protocolo</span>
            <span className={styles.metaValue}>Revisão da Literatura</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Passo</span>
            <span className={styles.metaValue}>{session.currentStep || 1} de 10</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Progresso</span>
            <span className={styles.metaValue}>10%</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Tempo investido</span>
            <span className={styles.metaValue}>2h</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Tempo estimado restante</span>
            <span className={styles.metaValue}>18h</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Última evidência</span>
            <span className={styles.metaValue}>Tema definido</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Próxima ação</span>
            <span className={styles.metaValue}>Formular pergunta</span>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={handleContinue}>
          <Icon name="play" size={16} /> Continuar
        </Button>
        
        <div className={styles.menuWrapper}>
          <button 
            className={styles.contextMenuBtn} 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Mais opções"
          >
            <MoreHorizontal size={20} />
          </button>
          
          {menuOpen && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} onClick={handleNew}>
                Nova investigação
              </button>
              <button className={styles.dropdownItem} disabled>
                Duplicar investigação
              </button>
              <button className={styles.dropdownItem} disabled>
                Arquivar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
