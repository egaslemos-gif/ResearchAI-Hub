"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useWorkspaceStore, type ReviewArtifact } from "../workspace/WorkspaceStoreContext";
import styles from "./artifacts.module.css";

export function ReviewEditor({ stepOrder }: { stepOrder: number }) {
  const { saveArtifact, getReview, getTema, getPergunta, getSynthesis, getGaps, getSelection, advanceStepState } = useWorkspaceStore();

  const tema = getTema();
  const pergunta = getPergunta();
  const synthesis = getSynthesis();
  const gaps = getGaps();
  const selection = getSelection();
  const existing = getReview();

  const [title, setTitle] = useState(existing?.title ?? "");
  const [introduction, setIntroduction] = useState(existing?.introduction ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [conclusion, setConclusion] = useState(existing?.conclusion ?? "");
  const [references, setReferences] = useState<string[]>(existing?.references ?? [""]);
  const [saved, setSaved] = useState(!!existing);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setIntroduction(existing.introduction);
      setBody(existing.body);
      setConclusion(existing.conclusion);
      setReferences(existing.references.length >= 1 ? existing.references : [""]);
    }
  }, [existing]);

  const wordCount = useMemo(() => {
    const text = `${introduction} ${body} ${conclusion}`.trim();
    return text ? text.split(/\s+/).length : 0;
  }, [introduction, body, conclusion]);

  const canSave = title.trim() && introduction.trim() && body.trim() && conclusion.trim() && wordCount >= 100;

  const handleSave = () => {
    if (!canSave) return;
    const artifact: ReviewArtifact = {
      title: title.trim(),
      introduction: introduction.trim(),
      body: body.trim(),
      conclusion: conclusion.trim(),
      references: references.map(r => r.trim()).filter(Boolean),
      wordCount,
      createdAt: new Date().toISOString(),
    };
    saveArtifact(9, { type: "review", data: artifact });
    advanceStepState(stepOrder, "ContextConfirmed");
    setSaved(true);
  };

  const updateReference = (idx: number, value: string) => {
    setReferences(prev => prev.map((r, i) => i === idx ? value : r));
    setSaved(false);
  };

  return (
    <div className={styles.artifactContainer}>
      <div className={styles.artifactHeader}>
        <span className={styles.artifactTitle}>Revisão Preliminar da Literatura</span>
        <span className={styles.artifactSubtitle}>
          {wordCount} palavras · {wordCount >= 1500 ? "✓" : wordCount >= 100 ? "⚠" : "✗"} mínimo 1500 palavras
        </span>
      </div>

      {tema && <div className={styles.artifactPrefilled}>Tema: {tema.delimited}</div>}
      {pergunta && <div className={styles.artifactPrefilled}>Pergunta: {pergunta.researchQuestion}</div>}
      {synthesis && <div className={styles.artifactPrefilled}>Síntese: {synthesis.themes.length} temas identificados</div>}
      {gaps && <div className={styles.artifactPrefilled}>Lacunas: {gaps.gaps.length} identificadas</div>}

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Título da revisão</label>
        <input className={styles.artifactInput} type="text" placeholder="Ex: O uso de IA generativa no ensino superior: uma revisão da literatura" value={title} onChange={(e) => { setTitle(e.target.value); setSaved(false); }} />
      </div>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Introdução</label>
        <textarea className={styles.artifactTextarea} placeholder="Introduza o tema, a sua importância e a pergunta de investigação..." value={introduction} onChange={(e) => { setIntroduction(e.target.value); setSaved(false); }} rows={5} />
      </div>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Desenvolvimento (organizado por temas)</label>
        <textarea className={styles.artifactTextarea} placeholder="Apresente os achados organizados tematicamente. Discuta convergências e divergências..." value={body} onChange={(e) => { setBody(e.target.value); setSaved(false); }} rows={12} />
      </div>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Conclusão</label>
        <textarea className={styles.artifactTextarea} placeholder="Identifique lacunas e conclua com a relevância da investigação proposta..." value={conclusion} onChange={(e) => { setConclusion(e.target.value); setSaved(false); }} rows={4} />
      </div>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Referências</label>
        {references.map((r, i) => (
          <input key={i} className={styles.artifactInput} type="text" placeholder={`Referência ${i + 1}`} value={r} onChange={(e) => updateReference(i, e.target.value)} />
        ))}
        <button className={`${styles.artifactButton} ${styles.artifactButtonSecondary}`} onClick={() => setReferences(prev => [...prev, ""])}>+ Adicionar referência</button>
      </div>

      <div className={styles.artifactActions}>
        <button className={`${styles.artifactButton} ${styles.artifactButtonPrimary}`} onClick={handleSave} disabled={!canSave}>
          {saved ? "Actualizar revisão" : "Guardar revisão"}
        </button>
      </div>
      {saved && (
        <div className={styles.artifactSaved}>
          <span className={styles.artifactSavedDot} />
          Revisão guardada ({wordCount} palavras). Pronta para exportação.
        </div>
      )}
    </div>
  );
}
