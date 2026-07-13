"use client";

import React, { useState, useEffect } from "react";
import { useWorkspaceStore, type TemaArtifact } from "../workspace/WorkspaceStoreContext";
import styles from "./artifacts.module.css";

export function TemaArtifactEditor({ stepOrder }: { stepOrder: number }) {
  const { saveArtifact, getTema, session, updateSession, advanceStepState } = useWorkspaceStore();

  const existing = getTema();

  const [studyArea, setStudyArea] = useState(existing?.studyArea ?? session.studyArea ?? "");
  const [researchTopic, setResearchTopic] = useState(existing?.researchTopic ?? session.researchTopic ?? "");
  const [academicLevel, setAcademicLevel] = useState(existing?.academicLevel ?? session.academicLevel ?? "mestrado");
  const [delimited, setDelimited] = useState(existing?.delimited ?? "");
  const [feasibility, setFeasibility] = useState(existing?.feasibility ?? "");
  const [saved, setSaved] = useState(!!existing);

  useEffect(() => {
    if (existing) {
      setStudyArea(existing.studyArea);
      setResearchTopic(existing.researchTopic);
      setAcademicLevel(existing.academicLevel);
      setDelimited(existing.delimited);
      setFeasibility(existing.feasibility);
    }
  }, [existing]);

  const canSave = studyArea.trim() && researchTopic.trim() && delimited.trim();

  const handleSave = () => {
    if (!canSave) return;

    const artifact: TemaArtifact = {
      studyArea: studyArea.trim(),
      researchTopic: researchTopic.trim(),
      academicLevel,
      delimited: delimited.trim(),
      feasibility: feasibility.trim(),
      createdAt: new Date().toISOString(),
    };

    saveArtifact(1, { type: "tema", data: artifact });

    updateSession({
      studyArea: artifact.studyArea,
      researchTopic: artifact.researchTopic,
      academicLevel: artifact.academicLevel,
    });

    advanceStepState(stepOrder, "ContextConfirmed");
    setSaved(true);
  };

  return (
    <div className={styles.artifactContainer}>
      <div className={styles.artifactHeader}>
        <span className={styles.artifactTitle}>Definir Tema de Investigação</span>
        <span className={styles.artifactSubtitle}>Delimite cientificamente o tema definido no Workspace</span>
      </div>

      {/* Workspace context — read-only (REGRA 8: never show "—" for empty fields) */}
      <div className={styles.workspaceContext}>
        <div className={styles.workspaceContextHeader}>
          <span className={styles.workspaceContextTitle}>Contexto do Workspace</span>
        </div>
        <div className={styles.workspaceContextGrid}>
          <div className={styles.workspaceContextItem}>
            <span className={styles.workspaceContextLabel}>Área de estudo</span>
            <span className={styles.workspaceContextValue}>
              {studyArea || "Não definida no workspace"}
            </span>
          </div>
          <div className={styles.workspaceContextItem}>
            <span className={styles.workspaceContextLabel}>Tópico inicial</span>
            <span className={styles.workspaceContextValue}>
              {researchTopic || "Não definido no workspace"}
            </span>
          </div>
          <div className={styles.workspaceContextItem}>
            <span className={styles.workspaceContextLabel}>Nível académico</span>
            <span className={styles.workspaceContextValue}>
              {academicLevel === "licenciatura" ? "Licenciatura" : academicLevel === "mestrado" ? "Mestrado" : "Doutoramento"}
            </span>
          </div>
        </div>
      </div>

      {/* PR-001 actual work — delimitação científica */}
      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Tema delimitado (1-2 frases) *</label>
        <textarea
          className={styles.artifactTextarea}
          placeholder="Ex: O uso de ferramentas de IA generativa como suporte ao ensino-aprendizagem em cursos de licenciatura em Portugal, entre 2020 e 2024."
          value={delimited}
          onChange={(e) => { setDelimited(e.target.value); setSaved(false); }}
          rows={3}
        />
      </div>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Avaliação de exequibilidade (opcional)</label>
        <textarea
          className={styles.artifactTextarea}
          placeholder="Porque é que este tema é exequível para uma revisão da literatura?"
          value={feasibility}
          onChange={(e) => { setFeasibility(e.target.value); setSaved(false); }}
          rows={2}
        />
      </div>

      <div className={styles.artifactActions}>
        <button
          className={`${styles.artifactButton} ${styles.artifactButtonPrimary}`}
          onClick={handleSave}
          disabled={!canSave}
        >
          {saved ? "Actualizar tema" : "Guardar tema"}
        </button>
      </div>

      {saved && (
        <div className={styles.artifactSaved}>
          <span className={styles.artifactSavedDot} />
          Tema guardado. Variáveis disponíveis para o próximo passo.
        </div>
      )}
    </div>
  );
}
