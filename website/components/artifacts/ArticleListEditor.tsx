"use client";

import React, { useState, useEffect } from "react";
import { useWorkspaceStore, type ArticleListArtifact, type Article } from "../workspace/WorkspaceStoreContext";
import styles from "./artifacts.module.css";

export function ArticleListEditor({ stepOrder }: { stepOrder: number }) {
  const { saveArtifact, getArticleList, getPergunta, advanceStepState } = useWorkspaceStore();

  const pergunta = getPergunta();
  const existing = getArticleList();

  const [articles, setArticles] = useState<Article[]>(existing?.articles ?? []);
  const [searchQueries, setSearchQueries] = useState<string[]>(
    existing?.searchQueries && existing.searchQueries.length >= 2 
      ? existing.searchQueries 
      : [...(existing?.searchQueries ?? []), "", ""].slice(0, 2)
  );
  const [saved, setSaved] = useState(!!existing);

  const [newTitle, setNewTitle] = useState("");
  const [newAuthors, setNewAuthors] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newDoi, setNewDoi] = useState("");

  useEffect(() => {
    if (existing) {
      setArticles(existing.articles ?? []);
      const qs = existing.searchQueries ?? [];
      setSearchQueries(qs.length >= 2 ? qs : [...qs, "", ""].slice(0, 2));
    }
  }, [existing]);

  const addArticle = () => {
    if (!newTitle.trim()) return;
    const article: Article = {
      id: `art-${Date.now()}`,
      title: newTitle.trim(),
      authors: newAuthors.trim() || "—",
      year: newYear.trim() || "—",
      source: newSource.trim() || "—",
      doi: newDoi.trim() || undefined,
    };
    setArticles(prev => [...prev, article]);
    setNewTitle(""); setNewAuthors(""); setNewYear(""); setNewSource(""); setNewDoi("");
    setSaved(false);
  };

  const removeArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
    setSaved(false);
  };

  const updateQuery = (idx: number, value: string) => {
    setSearchQueries(prev => prev.map((q, i) => i === idx ? value : q));
    setSaved(false);
  };

  const canSave = articles.length >= 1;

  const handleSave = () => {
    if (!canSave) return;
    const artifact: ArticleListArtifact = {
      articles,
      searchQueries: searchQueries.map(q => q.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    saveArtifact(3, { type: "article-list", data: artifact });
    advanceStepState(stepOrder, "ContextConfirmed");
    setSaved(true);
  };

  return (
    <div className={styles.artifactContainer}>
      <div className={styles.artifactHeader}>
        <span className={styles.artifactTitle}>Pesquisar Literatura</span>
        <span className={styles.artifactSubtitle}>Registe as queries utilizadas e os artigos encontrados</span>
      </div>

      {pergunta && (
        <div className={styles.artifactPrefilled}>
          Pergunta de investigação: {pergunta.researchQuestion}
        </div>
      )}

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Queries de pesquisa utilizadas</label>
        {searchQueries.map((q, i) => (
          <input
            key={i}
            className={styles.artifactInput}
            type="text"
            placeholder={`Query ${i + 1}: Ex: "AI tools higher education Portugal"`}
            value={q}
            onChange={(e) => updateQuery(i, e.target.value)}
          />
        ))}
        <button
          className={`${styles.artifactButton} ${styles.artifactButtonSecondary}`}
          onClick={() => setSearchQueries(prev => [...prev, ""])}
        >
          + Adicionar query
        </button>
      </div>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Adicionar artigo encontrado</label>
        <input
          className={styles.artifactInput}
          type="text"
          placeholder="Título do artigo"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <input
          className={styles.artifactInput}
          type="text"
          placeholder="Autores"
          value={newAuthors}
          onChange={(e) => setNewAuthors(e.target.value)}
        />
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <input
            className={styles.artifactInput}
            type="text"
            placeholder="Ano"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            style={{ width: 80 }}
          />
          <input
            className={styles.artifactInput}
            type="text"
            placeholder="Fonte (journal)"
            value={newSource}
            onChange={(e) => setNewSource(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
        <input
          className={styles.artifactInput}
          type="text"
          placeholder="DOI (opcional)"
          value={newDoi}
          onChange={(e) => setNewDoi(e.target.value)}
        />
        <button
          className={`${styles.artifactButton} ${styles.artifactButtonSecondary}`}
          onClick={addArticle}
          disabled={!newTitle.trim()}
        >
          + Adicionar artigo
        </button>
      </div>

      {articles.length > 0 && (
        <div className={styles.articleList}>
          <label className={styles.artifactLabel}>Artigos encontrados ({articles.length})</label>
          {articles.map((a) => (
            <div key={a.id} className={styles.articleItem}>
              <div className={styles.articleInfo}>
                <span className={styles.articleTitle}>{a.title}</span>
                <span className={styles.articleMeta}>{a.authors} · {a.year} · {a.source}{a.doi ? ` · DOI: ${a.doi}` : ""}</span>
              </div>
              <button className={styles.readingCardDelete} onClick={() => removeArticle(a.id)}>✕</button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.artifactActions}>
        <button
          className={`${styles.artifactButton} ${styles.artifactButtonPrimary}`}
          onClick={handleSave}
          disabled={!canSave}
        >
          {saved ? "Actualizar lista" : "Guardar lista de artigos"}
        </button>
      </div>

      {saved && (
        <div className={styles.artifactSaved}>
          <span className={styles.artifactSavedDot} />
          {articles.length} artigos guardados. Disponíveis para seleção no próximo passo.
        </div>
      )}
    </div>
  );
}
