"use client";

import React, { useState, useEffect } from "react";
import { useWorkspaceStore, type PerguntaArtifact } from "../workspace/WorkspaceStoreContext";
import styles from "./artifacts.module.css";

export function PerguntaArtifactEditor({ stepOrder }: { stepOrder: number }) {
  const { saveArtifact, getPergunta, getTema, advanceStepState } = useWorkspaceStore();

  const tema = getTema();
  const existing = getPergunta();

  const [researchQuestion, setResearchQuestion] = useState(existing?.researchQuestion ?? "");
  const [generalObjective, setGeneralObjective] = useState(existing?.generalObjective ?? "");
  const [specificObjectives, setSpecificObjectives] = useState<string[]>(existing?.specificObjectives ?? ["", "", ""]);
  const [keywordsPT, setKeywordsPT] = useState(existing?.keywordsPT.join(", ") ?? "");
  const [keywordsEN, setKeywordsEN] = useState(existing?.keywordsEN.join(", ") ?? "");
  const [saved, setSaved] = useState(!!existing);

  useEffect(() => {
    if (existing) {
      setResearchQuestion(existing.researchQuestion);
      setGeneralObjective(existing.generalObjective);
      setSpecificObjectives(existing.specificObjectives.length >= 3 ? existing.specificObjectives : [...existing.specificObjectives, "", "", ""].slice(0, 3));
      setKeywordsPT(existing.keywordsPT.join(", "));
      setKeywordsEN(existing.keywordsEN.join(", "));
    }
  }, [existing]);

  const canSave = researchQuestion.trim() && generalObjective.trim() && keywordsPT.trim() && keywordsEN.trim();

  const handleSave = () => {
    if (!canSave) return;

    const artifact: PerguntaArtifact = {
      researchQuestion: researchQuestion.trim(),
      generalObjective: generalObjective.trim(),
      specificObjectives: specificObjectives.map(s => s.trim()).filter(Boolean),
      keywordsPT: keywordsPT.split(",").map(k => k.trim()).filter(Boolean),
      keywordsEN: keywordsEN.split(",").map(k => k.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    saveArtifact(2, { type: "pergunta", data: artifact });
    advanceStepState(stepOrder, "ContextConfirmed");
    setSaved(true);
  };

  const updateObjective = (idx: number, value: string) => {
    setSpecificObjectives(prev => prev.map((o, i) => i === idx ? value : o));
    setSaved(false);
  };

  return (
    <div className={styles.artifactContainer}>
      <div className={styles.artifactHeader}>
        <span className={styles.artifactTitle}>Refinar Pergunta Científica</span>
        <span className={styles.artifactSubtitle}>Formule a pergunta de investigação, objectivos e palavras-chave</span>
      </div>

      {tema && (
        <div className={styles.artifactPrefilled}>
          Tema do passo anterior: {tema.delimited}
        </div>
      )}

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Pergunta de investigação (máx. 2 frases)</label>
        <textarea
          className={styles.artifactTextarea}
          placeholder="Ex: Como é que as ferramentas de IA generativa influenciam o processo de ensino-aprendizagem no ensino superior português?"
          value={researchQuestion}
          onChange={(e) => { setResearchQuestion(e.target.value); setSaved(false); }}
          rows={2}
        />
      </div>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Objectivo geral</label>
        <input
          className={styles.artifactInput}
          type="text"
          placeholder="Ex: Analisar o impacto das ferramentas de IA generativa no ensino superior português"
          value={generalObjective}
          onChange={(e) => { setGeneralObjective(e.target.value); setSaved(false); }}
        />
      </div>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Objectivos específicos (3)</label>
        {specificObjectives.map((obj, i) => (
          <input
            key={i}
            className={styles.artifactInput}
            type="text"
            placeholder={`Objectivo ${i + 1}: Ex: ${i === 0 ? "Identificar..." : i === 1 ? "Comparar..." : "Avaliar..."}`}
            value={obj}
            onChange={(e) => updateObjective(i, e.target.value)}
          />
        ))}
      </div>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Palavras-chave (PT) — separadas por vírgulas</label>
        <input
          className={styles.artifactInput}
          type="text"
          placeholder="inteligência artificial, educação superior, ensino-aprendizagem"
          value={keywordsPT}
          onChange={(e) => { setKeywordsPT(e.target.value); setSaved(false); }}
        />
      </div>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Palavras-chave (EN) — separated by commas</label>
        <input
          className={styles.artifactInput}
          type="text"
          placeholder="artificial intelligence, higher education, teaching-learning"
          value={keywordsEN}
          onChange={(e) => { setKeywordsEN(e.target.value); setSaved(false); }}
        />
      </div>

      <div className={styles.artifactActions}>
        <button
          className={`${styles.artifactButton} ${styles.artifactButtonPrimary}`}
          onClick={handleSave}
          disabled={!canSave}
        >
          {saved ? "Actualizar pergunta" : "Guardar pergunta"}
        </button>
      </div>

      {saved && (
        <div className={styles.artifactSaved}>
          <span className={styles.artifactSavedDot} />
          Pergunta guardada. Variáveis disponíveis para o próximo passo.
        </div>
      )}
    </div>
  );
}
