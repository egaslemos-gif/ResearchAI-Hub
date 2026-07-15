"use client";

import React, { useState, useEffect } from "react";
import { useWorkspaceStore, type ReadingCardsArtifact, type ReadingCard } from "../workspace/WorkspaceStoreContext";
import styles from "./artifacts.module.css";

export function ReadingCardsEditor({ stepOrder }: { stepOrder: number }) {
  const { saveArtifact, getReadingCards, getSelection, getPergunta, advanceStepState } = useWorkspaceStore();

  const selection = getSelection();
  const pergunta = getPergunta();
  const existing = getReadingCards();

  const [cards, setCards] = useState<ReadingCard[]>(existing?.cards ?? []);
  const [saved, setSaved] = useState(!!existing);

  useEffect(() => {
    if (existing) {
      setCards(existing.cards ?? []);
    } else if (selection) {
      setCards((selection.articles ?? []).map(a => ({
        articleId: a.id,
        articleTitle: a.title,
        objective: "",
        methodology: "",
        sample: "",
        results: "",
        limitations: "",
        contribution: "",
        quality: "",
        createdAt: new Date().toISOString(),
      })));
    }
  }, [existing, selection]);

  const updateCard = (articleId: string, field: keyof ReadingCard, value: string) => {
    setCards(prev => prev.map(c => c.articleId === articleId ? { ...c, [field]: value } : c));
    setSaved(false);
  };

  const canSave = cards.length > 0 && cards.some(c => c.objective.trim() || c.results.trim());

  const handleSave = () => {
    if (!canSave) return;
    const artifact: ReadingCardsArtifact = {
      cards,
      createdAt: new Date().toISOString(),
    };
    saveArtifact(5, { type: "reading-cards", data: artifact });
    advanceStepState(stepOrder, "ContextConfirmed");
    setSaved(true);
  };

  if (!selection || (selection.articles ?? []).length === 0) {
    return (
      <div className={styles.artifactContainer}>
        <div className={styles.artifactHeader}>
          <span className={styles.artifactTitle}>Fichas de Leitura</span>
        </div>
        <div className={styles.artifactPrefilled}>
          Nenhum artigo seleccionado no passo anterior. Complete o passo 4 primeiro.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.artifactContainer}>
      <div className={styles.artifactHeader}>
        <span className={styles.artifactTitle}>Fichas de Leitura</span>
        <span className={styles.artifactSubtitle}>
          {pergunta ? `Pergunta: ${pergunta.researchQuestion}` : "Preencha uma ficha por artigo seleccionado"}
        </span>
      </div>

      {cards.map((card) => (
        <div key={card.articleId} className={styles.readingCard}>
          <div className={styles.readingCardHeader}>
            <span className={styles.readingCardTitle}>{card.articleTitle}</span>
          </div>
          <div className={styles.readingCardField}>
            <label className={styles.readingCardLabel}>Objectivo do estudo</label>
            <textarea
              className={styles.readingCardTextarea}
              placeholder="Qual era o objectivo do estudo?"
              value={card.objective}
              onChange={(e) => updateCard(card.articleId, "objective", e.target.value)}
              rows={2}
            />
          </div>
          <div className={styles.readingCardField}>
            <label className={styles.readingCardLabel}>Metodologia</label>
            <textarea
              className={styles.readingCardTextarea}
              placeholder="Que metodologia foi utilizada?"
              value={card.methodology}
              onChange={(e) => updateCard(card.articleId, "methodology", e.target.value)}
              rows={2}
            />
          </div>
          <div className={styles.readingCardField}>
            <label className={styles.readingCardLabel}>Amostra</label>
            <input
              className={styles.artifactInput}
              type="text"
              placeholder="Ex: 200 estudantes universitários"
              value={card.sample}
              onChange={(e) => updateCard(card.articleId, "sample", e.target.value)}
            />
          </div>
          <div className={styles.readingCardField}>
            <label className={styles.readingCardLabel}>Principais resultados</label>
            <textarea
              className={styles.readingCardTextarea}
              placeholder="Quais foram os principais achados?"
              value={card.results}
              onChange={(e) => updateCard(card.articleId, "results", e.target.value)}
              rows={3}
            />
          </div>
          <div className={styles.readingCardField}>
            <label className={styles.readingCardLabel}>Limitações</label>
            <textarea
              className={styles.readingCardTextarea}
              placeholder="Que limitações os autores identificaram?"
              value={card.limitations}
              onChange={(e) => updateCard(card.articleId, "limitations", e.target.value)}
              rows={2}
            />
          </div>
          <div className={styles.readingCardField}>
            <label className={styles.readingCardLabel}>Contribuição para o tema</label>
            <textarea
              className={styles.readingCardTextarea}
              placeholder="Como é que este estudo contribui para a sua pergunta de investigação?"
              value={card.contribution}
              onChange={(e) => updateCard(card.articleId, "contribution", e.target.value)}
              rows={2}
            />
          </div>
          <div className={styles.readingCardField}>
            <label className={styles.readingCardLabel}>Avaliação de qualidade</label>
            <input
              className={styles.artifactInput}
              type="text"
              placeholder="Ex: Alta / Média / Baixa — com justificação"
              value={card.quality}
              onChange={(e) => updateCard(card.articleId, "quality", e.target.value)}
            />
          </div>
        </div>
      ))}

      <div className={styles.artifactActions}>
        <button
          className={`${styles.artifactButton} ${styles.artifactButtonPrimary}`}
          onClick={handleSave}
          disabled={!canSave}
        >
          {saved ? "Actualizar fichas" : "Guardar fichas de leitura"}
        </button>
      </div>

      {saved && (
        <div className={styles.artifactSaved}>
          <span className={styles.artifactSavedDot} />
          {cards.length} fichas guardadas. Disponíveis para comparação no próximo passo.
        </div>
      )}
    </div>
  );
}
