"use client";

import React, { useState, useEffect } from "react";
import { useWorkspaceStore, type SynthesisArtifact, type SynthesisTheme } from "../workspace/WorkspaceStoreContext";
import styles from "./artifacts.module.css";

export function SynthesisEditor({ stepOrder }: { stepOrder: number }) {
  const { saveArtifact, getSynthesis, getReadingCards, getComparisonTable, advanceStepState } = useWorkspaceStore();

  const cards = getReadingCards();
  const comparison = getComparisonTable();
  const existing = getSynthesis();

  const [themes, setThemes] = useState<SynthesisTheme[]>(existing?.themes ?? [
    { id: "theme-1", name: "", description: "", evidence: "", articles: [] },
    { id: "theme-2", name: "", description: "", evidence: "", articles: [] },
  ]);
  const [trends, setTrends] = useState<string[]>(existing?.trends ?? ["", ""]);
  const [contradictions, setContradictions] = useState<string[]>(existing?.contradictions ?? [""]);
  const [saved, setSaved] = useState(!!existing);

  useEffect(() => {
    if (existing) {
      setThemes(existing.themes ?? []);
      const tr = existing.trends ?? [];
      setTrends(tr.length >= 2 ? tr : [...tr, "", ""].slice(0, 2));
      const ct = existing.contradictions ?? [];
      setContradictions(ct.length >= 1 ? ct : [""]);
    }
  }, [existing]);

  const updateTheme = (id: string, field: keyof SynthesisTheme, value: string) => {
    setThemes(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
    setSaved(false);
  };

  const addTheme = () => {
    setThemes(prev => [...prev, { id: `theme-${Date.now()}`, name: "", description: "", evidence: "", articles: [] }]);
    setSaved(false);
  };

  const removeTheme = (id: string) => {
    setThemes(prev => prev.filter(t => t.id !== id));
    setSaved(false);
  };

  const updateList = (type: "trends" | "contradictions", idx: number, value: string) => {
    if (type === "trends") setTrends(prev => prev.map((t, i) => i === idx ? value : t));
    else setContradictions(prev => prev.map((c, i) => i === idx ? value : c));
    setSaved(false);
  };

  const canSave = themes.filter(t => t.name.trim() && t.description.trim()).length >= 2;

  const handleSave = () => {
    if (!canSave) return;
    const artifact: SynthesisArtifact = {
      themes: themes.filter(t => t.name.trim()),
      trends: trends.map(t => t.trim()).filter(Boolean),
      contradictions: contradictions.map(c => c.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    saveArtifact(8, { type: "synthesis", data: artifact });
    advanceStepState(stepOrder, "ContextConfirmed");
    setSaved(true);
  };

  return (
    <div className={styles.artifactContainer}>
      <div className={styles.artifactHeader}>
        <span className={styles.artifactTitle}>Síntese Temática da Literatura</span>
        <span className={styles.artifactSubtitle}>Organize os achados por temas, não por artigo</span>
      </div>

      {cards && (
        <div className={styles.artifactPrefilled}>
          {(cards.cards ?? []).length} fichas de leitura disponíveis como fonte
        </div>
      )}
      {comparison && (
        <div className={styles.artifactPrefilled}>
          {(comparison.convergences ?? []).length} convergências · {(comparison.divergences ?? []).length} divergências identificadas
        </div>
      )}

      {themes.map((theme, i) => (
        <div key={theme.id} className={styles.readingCard}>
          <div className={styles.readingCardHeader}>
            <span className={styles.readingCardTitle}>Tema {i + 1}</span>
            <button className={styles.readingCardDelete} onClick={() => removeTheme(theme.id)}>✕</button>
          </div>
          <div className={styles.readingCardField}>
            <label className={styles.readingCardLabel}>Nome do tema</label>
            <input className={styles.artifactInput} type="text" placeholder="Ex: Impacto no desempenho académico" value={theme.name} onChange={(e) => updateTheme(theme.id, "name", e.target.value)} />
          </div>
          <div className={styles.readingCardField}>
            <label className={styles.readingCardLabel}>Descrição do tema</label>
            <textarea className={styles.readingCardTextarea} placeholder="Síntese do que a literatura diz sobre este tema" value={theme.description} onChange={(e) => updateTheme(theme.id, "description", e.target.value)} rows={3} />
          </div>
          <div className={styles.readingCardField}>
            <label className={styles.readingCardLabel}>Evidência de suporte</label>
            <textarea className={styles.readingCardTextarea} placeholder="Quais artigos suportam este tema? Que resultados?" value={theme.evidence} onChange={(e) => updateTheme(theme.id, "evidence", e.target.value)} rows={2} />
          </div>
        </div>
      ))}

      <button className={`${styles.artifactButton} ${styles.artifactButtonSecondary}`} onClick={addTheme}>+ Adicionar tema</button>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Tendências identificadas</label>
        {trends.map((t, i) => (
          <input key={i} className={styles.artifactInput} type="text" placeholder={`Tendência ${i + 1}`} value={t} onChange={(e) => updateList("trends", i, e.target.value)} />
        ))}
        <button className={`${styles.artifactButton} ${styles.artifactButtonSecondary}`} onClick={() => setTrends(prev => [...prev, ""])}>+ Adicionar</button>
      </div>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Contradições entre estudos</label>
        {contradictions.map((c, i) => (
          <input key={i} className={styles.artifactInput} type="text" placeholder={`Contradição ${i + 1}`} value={c} onChange={(e) => updateList("contradictions", i, e.target.value)} />
        ))}
        <button className={`${styles.artifactButton} ${styles.artifactButtonSecondary}`} onClick={() => setContradictions(prev => [...prev, ""])}>+ Adicionar</button>
      </div>

      <div className={styles.artifactActions}>
        <button className={`${styles.artifactButton} ${styles.artifactButtonPrimary}`} onClick={handleSave} disabled={!canSave}>
          {saved ? "Actualizar síntese" : "Guardar síntese"}
        </button>
      </div>
      {saved && (
        <div className={styles.artifactSaved}>
          <span className={styles.artifactSavedDot} />
          {themes.filter(t => t.name.trim()).length} temas guardados.
        </div>
      )}
    </div>
  );
}
