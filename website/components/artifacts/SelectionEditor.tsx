"use client";

import React, { useState, useEffect } from "react";
import { useWorkspaceStore, type SelectionArtifact, type SelectedArticle } from "../workspace/WorkspaceStoreContext";
import styles from "./artifacts.module.css";

export function SelectionEditor({ stepOrder }: { stepOrder: number }) {
  const { saveArtifact, getSelection, getArticleList, advanceStepState } = useWorkspaceStore();

  const articleList = getArticleList();
  const existing = getSelection();

  const [inclusionCriteria, setInclusionCriteria] = useState<string[]>(existing?.inclusionCriteria ?? ["", ""]);
  const [exclusionCriteria, setExclusionCriteria] = useState<string[]>(existing?.exclusionCriteria ?? ["", ""]);
  const [articles, setArticles] = useState<SelectedArticle[]>(existing?.articles ?? []);
  const [saved, setSaved] = useState(!!existing);

  useEffect(() => {
    if (existing) {
      setInclusionCriteria(existing.inclusionCriteria.length >= 2 ? existing.inclusionCriteria : [...existing.inclusionCriteria, "", ""]);
      setExclusionCriteria(existing.exclusionCriteria.length >= 2 ? existing.exclusionCriteria : [...existing.exclusionCriteria, "", ""]);
      setArticles(existing.articles);
    } else if (articleList) {
      setArticles(articleList.articles.map(a => ({ ...a, selected: false, justification: "" })));
    }
  }, [existing, articleList]);

  const toggleSelected = (id: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, selected: !a.selected } : a));
    setSaved(false);
  };

  const updateJustification = (id: string, value: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, justification: value } : a));
    setSaved(false);
  };

  const updateCriterion = (type: "inclusion" | "exclusion", idx: number, value: string) => {
    if (type === "inclusion") {
      setInclusionCriteria(prev => prev.map((c, i) => i === idx ? value : c));
    } else {
      setExclusionCriteria(prev => prev.map((c, i) => i === idx ? value : c));
    }
    setSaved(false);
  };

  const selectedCount = articles.filter(a => a.selected).length;
  const canSave = inclusionCriteria.some(c => c.trim()) && selectedCount >= 1;

  const handleSave = () => {
    if (!canSave) return;
    const artifact: SelectionArtifact = {
      inclusionCriteria: inclusionCriteria.map(c => c.trim()).filter(Boolean),
      exclusionCriteria: exclusionCriteria.map(c => c.trim()).filter(Boolean),
      articles: articles.filter(a => a.selected),
      createdAt: new Date().toISOString(),
    };
    saveArtifact(4, { type: "selection", data: artifact });
    advanceStepState(stepOrder, "ContextConfirmed");
    setSaved(true);
  };

  if (!articleList || articleList.articles.length === 0) {
    return (
      <div className={styles.artifactContainer}>
        <div className={styles.artifactHeader}>
          <span className={styles.artifactTitle}>Seleccionar Artigos</span>
        </div>
        <div className={styles.artifactPrefilled}>
          Nenhum artigo encontrado no passo anterior. Complete o passo 3 primeiro.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.artifactContainer}>
      <div className={styles.artifactHeader}>
        <span className={styles.artifactTitle}>Seleccionar os Melhores Artigos</span>
        <span className={styles.artifactSubtitle}>Defina critérios e seleccione 5-8 artigos relevantes</span>
      </div>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Critérios de inclusão</label>
        {inclusionCriteria.map((c, i) => (
          <input
            key={i}
            className={styles.artifactInput}
            type="text"
            placeholder={`Critério ${i + 1}: Ex: ${i === 0 ? "Peer-reviewed" : "Últimos 5 anos"}`}
            value={c}
            onChange={(e) => updateCriterion("inclusion", i, e.target.value)}
          />
        ))}
        <button
          className={`${styles.artifactButton} ${styles.artifactButtonSecondary}`}
          onClick={() => setInclusionCriteria(prev => [...prev, ""])}
        >
          + Adicionar critério
        </button>
      </div>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Critérios de exclusão</label>
        {exclusionCriteria.map((c, i) => (
          <input
            key={i}
            className={styles.artifactInput}
            type="text"
            placeholder={`Critério ${i + 1}: Ex: ${i === 0 ? "Editoriais/opinião" : "Fora do tema"}`}
            value={c}
            onChange={(e) => updateCriterion("exclusion", i, e.target.value)}
          />
        ))}
        <button
          className={`${styles.artifactButton} ${styles.artifactButtonSecondary}`}
          onClick={() => setExclusionCriteria(prev => [...prev, ""])}
        >
          + Adicionar critério
        </button>
      </div>

      <div className={styles.articleList}>
        <label className={styles.artifactLabel}>Artigos encontrados ({articles.length}) — seleccionados: {selectedCount}</label>
        {articles.map((a) => (
          <div key={a.id} className={styles.articleItem}>
            <input
              type="checkbox"
              className={styles.articleCheckbox}
              checked={a.selected}
              onChange={() => toggleSelected(a.id)}
            />
            <div className={styles.articleInfo}>
              <span className={styles.articleTitle}>{a.title}</span>
              <span className={styles.articleMeta}>{a.authors} · {a.year} · {a.source}</span>
              {a.selected && (
                <input
                  className={styles.artifactInput}
                  type="text"
                  placeholder="Justificação da seleção..."
                  value={a.justification}
                  onChange={(e) => updateJustification(a.id, e.target.value)}
                  style={{ marginTop: 4, fontSize: "0.6875rem" }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.artifactActions}>
        <button
          className={`${styles.artifactButton} ${styles.artifactButtonPrimary}`}
          onClick={handleSave}
          disabled={!canSave}
        >
          {saved ? "Actualizar seleção" : "Guardar seleção"}
        </button>
      </div>

      {saved && (
        <div className={styles.artifactSaved}>
          <span className={styles.artifactSavedDot} />
          {selectedCount} artigos seleccionados. Disponíveis para análise no próximo passo.
        </div>
      )}
    </div>
  );
}
