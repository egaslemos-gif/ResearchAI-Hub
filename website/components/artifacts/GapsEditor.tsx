"use client";

import React, { useState, useEffect } from "react";
import { useWorkspaceStore, type GapsArtifact, type ResearchGap } from "../workspace/WorkspaceStoreContext";
import styles from "./artifacts.module.css";

export function GapsEditor({ stepOrder }: { stepOrder: number }) {
  const { saveArtifact, getGaps, getComparisonTable, getPergunta, advanceStepState } = useWorkspaceStore();

  const comparison = getComparisonTable();
  const pergunta = getPergunta();
  const existing = getGaps();

  const [gaps, setGaps] = useState<ResearchGap[]>(existing?.gaps ?? [
    { id: "gap-1", description: "", justification: "", addressable: "" },
    { id: "gap-2", description: "", justification: "", addressable: "" },
    { id: "gap-3", description: "", justification: "", addressable: "" },
  ]);
  const [saved, setSaved] = useState(!!existing);

  useEffect(() => {
    if (existing) setGaps(existing.gaps);
  }, [existing]);

  const updateGap = (id: string, field: keyof ResearchGap, value: string) => {
    setGaps(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
    setSaved(false);
  };

  const addGap = () => {
    setGaps(prev => [...prev, { id: `gap-${Date.now()}`, description: "", justification: "", addressable: "" }]);
    setSaved(false);
  };

  const removeGap = (id: string) => {
    setGaps(prev => prev.filter(g => g.id !== id));
    setSaved(false);
  };

  const canSave = gaps.filter(g => g.description.trim()).length >= 3;

  const handleSave = () => {
    if (!canSave) return;
    const artifact: GapsArtifact = {
      gaps: gaps.filter(g => g.description.trim()),
      createdAt: new Date().toISOString(),
    };
    saveArtifact(7, { type: "gaps", data: artifact });
    advanceStepState(stepOrder, "ContextConfirmed");
    setSaved(true);
  };

  return (
    <div className={styles.artifactContainer}>
      <div className={styles.artifactHeader}>
        <span className={styles.artifactTitle}>Identificar Lacunas na Literatura</span>
        <span className={styles.artifactSubtitle}>Mínimo 3 lacunas fundamentadas nos artigos analisados</span>
      </div>

      {pergunta && (
        <div className={styles.artifactPrefilled}>
          Pergunta de investigação: {pergunta.researchQuestion}
        </div>
      )}

      {comparison && (
        <div className={styles.artifactPrefilled}>
          Convergências: {comparison.convergences.length} · Divergências: {comparison.divergences.length}
        </div>
      )}

      {gaps.map((gap, i) => (
        <div key={gap.id} className={styles.readingCard}>
          <div className={styles.readingCardHeader}>
            <span className={styles.readingCardTitle}>Lacuna {i + 1}</span>
            <button className={styles.readingCardDelete} onClick={() => removeGap(gap.id)}>✕</button>
          </div>
          <div className={styles.readingCardField}>
            <label className={styles.readingCardLabel}>Descrição da lacuna</label>
            <textarea className={styles.readingCardTextarea} placeholder="O que a literatura ainda não responde?" value={gap.description} onChange={(e) => updateGap(gap.id, "description", e.target.value)} rows={2} />
          </div>
          <div className={styles.readingCardField}>
            <label className={styles.readingCardLabel}>Justificação (baseada nos artigos)</label>
            <textarea className={styles.readingCardTextarea} placeholder="Como é que os artigos analisados suportam esta lacuna?" value={gap.justification} onChange={(e) => updateGap(gap.id, "justification", e.target.value)} rows={2} />
          </div>
          <div className={styles.readingCardField}>
            <label className={styles.readingCardLabel}>Endereçável pelo investigador?</label>
            <input className={styles.artifactInput} type="text" placeholder="Ex: Sim, através de um estudo com..." value={gap.addressable} onChange={(e) => updateGap(gap.id, "addressable", e.target.value)} />
          </div>
        </div>
      ))}

      <button className={`${styles.artifactButton} ${styles.artifactButtonSecondary}`} onClick={addGap}>+ Adicionar lacuna</button>

      <div className={styles.artifactActions}>
        <button className={`${styles.artifactButton} ${styles.artifactButtonPrimary}`} onClick={handleSave} disabled={!canSave}>
          {saved ? "Actualizar lacunas" : "Guardar lacunas"}
        </button>
      </div>
      {saved && (
        <div className={styles.artifactSaved}>
          <span className={styles.artifactSavedDot} />
          {gaps.filter(g => g.description.trim()).length} lacunas guardadas.
        </div>
      )}
    </div>
  );
}
