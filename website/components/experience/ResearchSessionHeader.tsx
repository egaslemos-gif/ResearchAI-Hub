"use client";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/components/workspace/WorkspaceStoreContext";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MoreHorizontal } from "lucide-react";
import styles from "./ResearchSessionHeader.module.css";
import { useState, useEffect } from "react";

export function ResearchSessionHeader() {
  const { session, ready, updateSession, archiveWorkspace, duplicateWorkspace, workspaces } = useWorkspaceStore();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = () => setMenuOpen(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  if (!ready || (session.status !== "READY" && session.status !== "COMPLETED") || !session.researchTopic) {
    return null;
  }

  const stepCount = Object.keys(session.progress || {}).length;
  const completedSteps = Object.values(session.progress || {}).filter(p => p.status === "Completed").length;
  const progress = Math.round((completedSteps / 10) * 100);

  const handleContinue = () => {
    const url = session.protocolSlug ? `/competencias/${session.protocolSlug}/passo/${session.currentStep || 1}` : "/competencias";
    router.push(url);
  };

  const handleNew = () => {
    router.push("/");
  };

  const handleDuplicate = () => {
    if (session.id) duplicateWorkspace(session.id);
    setMenuOpen(false);
  };

  const handleArchive = () => {
    if (session.id) archiveWorkspace(session.id);
    setMenuOpen(false);
    router.push("/");
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
            <span className={styles.metaValue}>{progress}%</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Passos concluídos</span>
            <span className={styles.metaValue}>{completedSteps}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Área</span>
            <span className={styles.metaValue}>{session.studyArea || "—"}</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Nível</span>
            <span className={styles.metaValue}>{session.academicLevel || "—"}</span>
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
            onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
            aria-label="Mais opções"
          >
            <MoreHorizontal size={20} />
          </button>
          
          {menuOpen && (
            <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
              <button className={styles.dropdownItem} onClick={handleNew}>
                Nova investigação
              </button>
              <button className={styles.dropdownItem} onClick={handleDuplicate}>
                Duplicar investigação
              </button>
              <button className={styles.dropdownItem} onClick={handleArchive}>
                Arquivar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
