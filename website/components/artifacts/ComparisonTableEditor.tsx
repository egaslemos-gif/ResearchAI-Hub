"use client";

import React, { useState, useEffect } from "react";
import { useWorkspaceStore, type ComparisonTableArtifact, type ComparisonRow } from "../workspace/WorkspaceStoreContext";
import styles from "./artifacts.module.css";

export function ComparisonTableEditor({ stepOrder }: { stepOrder: number }) {
  const { saveArtifact, getComparisonTable, getReadingCards, advanceStepState } = useWorkspaceStore();

  const cards = getReadingCards();
  const existing = getComparisonTable();

  const [rows, setRows] = useState<ComparisonRow[]>(existing?.rows ?? []);
  const [convergences, setConvergences] = useState<string[]>(existing?.convergences ?? ["", ""]);
  const [divergences, setDivergences] = useState<string[]>(existing?.divergences ?? ["", ""]);
  const [saved, setSaved] = useState(!!existing);

  useEffect(() => {
    if (existing) {
      setRows(existing.rows);
      setConvergences(existing.convergences.length >= 2 ? existing.convergences : [...existing.convergences, "", ""]);
      setDivergences(existing.divergences.length >= 2 ? existing.divergences : [...existing.divergences, "", ""]);
    } else if (cards) {
      setRows(cards.cards.map(c => ({
        articleId: c.articleId,
        articleTitle: c.articleTitle,
        objective: c.objective,
        methodology: c.methodology,
        sample: c.sample,
        results: c.results,
        limitations: c.limitations,
      })));
    }
  }, [existing, cards]);

  const updateRow = (articleId: string, field: keyof ComparisonRow, value: string) => {
    setRows(prev => prev.map(r => r.articleId === articleId ? { ...r, [field]: value } : r));
    setSaved(false);
  };

  const updateList = (type: "convergences" | "divergences", idx: number, value: string) => {
    if (type === "convergences") {
      setConvergences(prev => prev.map((c, i) => i === idx ? value : c));
    } else {
      setDivergences(prev => prev.map((c, i) => i === idx ? value : c));
    }
    setSaved(false);
  };

  const canSave = rows.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const artifact: ComparisonTableArtifact = {
      rows,
      convergences: convergences.map(c => c.trim()).filter(Boolean),
      divergences: divergences.map(c => c.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    saveArtifact(6, { type: "comparison-table", data: artifact });
    advanceStepState(stepOrder, "ContextConfirmed");
    setSaved(true);
  };

  if (!cards || cards.cards.length === 0) {
    return (
      <div className={styles.artifactContainer}>
        <div className={styles.artifactHeader}>
          <span className={styles.artifactTitle}>Tabela Comparativa</span>
        </div>
        <div className={styles.artifactPrefilled}>
          Nenhuma ficha de leitura encontrada no passo anterior. Complete o passo 5 primeiro.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.artifactContainer}>
      <div className={styles.artifactHeader}>
        <span className={styles.artifactTitle}>Tabela Comparativa de Estudos</span>
        <span className={styles.artifactSubtitle}>Compare os artigos nas dimensões-chave e identifique convergências/divergências</span>
      </div>

      {rows.map((row) => (
        <div key={row.articleId} className={styles.readingCard}>
          <div className={styles.readingCardHeader}>
            <span className={styles.readingCardTitle}>{row.articleTitle}</span>
          </div>
          {(["objective", "methodology", "sample", "results", "limitations"] as const).map((field) => (
            <div key={field} className={styles.readingCardField}>
              <label className={styles.readingCardLabel}>
                {field === "objective" ? "Objectivo" : field === "methodology" ? "Metodologia" : field === "sample" ? "Amostra" : field === "results" ? "Resultados" : "Limitações"}
              </label>
              <textarea
                className={styles.readingCardTextarea}
                value={row[field]}
                onChange={(e) => updateRow(row.articleId, field, e.target.value)}
                rows={2}
              />
            </div>
          ))}
        </div>
      ))}

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Convergências entre estudos</label>
        {convergences.map((c, i) => (
          <input key={i} className={styles.artifactInput} type="text" placeholder={`Convergência ${i + 1}`} value={c} onChange={(e) => updateList("convergences", i, e.target.value)} />
        ))}
        <button className={`${styles.artifactButton} ${styles.artifactButtonSecondary}`} onClick={() => setConvergences(prev => [...prev, ""])}>+ Adicionar</button>
      </div>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Divergências entre estudos</label>
        {divergences.map((c, i) => (
          <input key={i} className={styles.artifactInput} type="text" placeholder={`Divergência ${i + 1}`} value={c} onChange={(e) => updateList("divergences", i, e.target.value)} />
        ))}
        <button className={`${styles.artifactButton} ${styles.artifactButtonSecondary}`} onClick={() => setDivergences(prev => [...prev, ""])}>+ Adicionar</button>
      </div>

      <div className={styles.artifactActions}>
        <button className={`${styles.artifactButton} ${styles.artifactButtonPrimary}`} onClick={handleSave} disabled={!canSave}>
          {saved ? "Actualizar tabela" : "Guardar tabela comparativa"}
        </button>
      </div>
      {saved && (
        <div className={styles.artifactSaved}>
          <span className={styles.artifactSavedDot} />
          Tabela guardada. Disponível para identificação de lacunas.
        </div>
      )}
    </div>
  );
}
