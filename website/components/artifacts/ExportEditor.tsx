"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWorkspaceStore, type ExportArtifact, type ReviewArtifact } from "../workspace/WorkspaceStoreContext";
import styles from "./artifacts.module.css";

export function ExportEditor({ stepOrder }: { stepOrder: number }) {
  const { saveArtifact, getReview, getTema, getPergunta, getSelection, getSynthesis, getGaps, getComparisonTable, getReadingCards, advanceStepState } = useWorkspaceStore();

  const review = getReview();
  const [format, setFormat] = useState<"docx" | "pdf" | "markdown">("markdown");
  const [exported, setExported] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const buildMarkdown = useCallback((): string => {
    if (!review) return "";
    const tema = getTema();
    const pergunta = getPergunta();
    const selection = getSelection();
    const cards = getReadingCards();
    const comparison = getComparisonTable();
    const gaps = getGaps();
    const synthesis = getSynthesis();

    let md = `# ${review.title}\n\n`;
    md += `## Introdução\n\n${review.introduction}\n\n`;

    if (tema) md += `> **Tema:** ${tema.delimited}\n\n`;
    if (pergunta) md += `> **Pergunta de investigação:** ${pergunta.researchQuestion}\n\n`;
    if (pergunta?.generalObjective) md += `> **Objectivo geral:** ${pergunta.generalObjective}\n\n`;

    md += `## Desenvolvimento\n\n${review.body}\n\n`;

    if (synthesis && (synthesis.themes ?? []).length > 0) {
      md += `### Síntese Temática\n\n`;
      synthesis.themes.forEach(t => {
        md += `#### ${t.name}\n\n${t.description}\n\n${t.evidence}\n\n`;
      });
    }

    if (comparison) {
      md += `### Tabela Comparativa\n\n`;
      md += `| Artigo | Objectivo | Metodologia | Amostra | Resultados | Limitações |\n`;
      md += `|--------|-----------|------------|---------|------------|-------------|\n`;
      (comparison.rows ?? []).forEach(r => {
        md += `| ${r.articleTitle} | ${r.objective} | ${r.methodology} | ${r.sample} | ${r.results} | ${r.limitations} |\n`;
      });
      md += `\n**Convergências:**\n`;
      (comparison.convergences ?? []).forEach(c => md += `- ${c}\n`);
      md += `\n**Divergências:**\n`;
      (comparison.divergences ?? []).forEach(c => md += `- ${c}\n`);
      md += `\n`;
    }

    if (gaps && (gaps.gaps ?? []).length > 0) {
      md += `### Lacunas Identificadas\n\n`;
      (gaps.gaps ?? []).forEach((g, i) => {
        md += `${i + 1}. **${g.description}**\n   - Justificação: ${g.justification}\n   - Endereçável: ${g.addressable}\n\n`;
      });
    }

    md += `## Conclusão\n\n${review.conclusion}\n\n`;

    md += `## Referências\n\n`;
    (review.references ?? []).forEach((r, i) => {
      md += `${i + 1}. ${r}\n`;
    });

    if (selection && (selection.articles ?? []).length > 0) {
      md += `\n## Artigos Analisados\n\n`;
      (selection.articles ?? []).forEach((a, i) => {
        md += `${i + 1}. ${a.title} — ${a.authors} (${a.year})${a.doi ? ` DOI: ${a.doi}` : ""}\n`;
      });
    }

    return md;
  }, [review, getTema, getPergunta, getSelection, getReadingCards, getComparisonTable, getGaps, getSynthesis]);

  const handleExport = () => {
    if (!review) return;

    const content = buildMarkdown();
    const filename = `revisao-literatura-${Date.now()}.md`;

    const artifact: ExportArtifact = {
      format,
      content,
      filename,
      exportedAt: new Date().toISOString(),
    };

    saveArtifact(10, { type: "export", data: artifact });
    advanceStepState(stepOrder, "Completed");

    // Trigger download
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    setDownloadUrl(url);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setExported(true);
  };

  if (!review) {
    return (
      <div className={styles.artifactContainer}>
        <div className={styles.artifactHeader}>
          <span className={styles.artifactTitle}>Exportação</span>
        </div>
        <div className={styles.artifactPrefilled}>
          Nenhuma revisão guardada no passo anterior. Complete o passo 9 primeiro.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.artifactContainer}>
      <div className={styles.artifactHeader}>
        <span className={styles.artifactTitle}>Exportar Revisão da Literatura</span>
        <span className={styles.artifactSubtitle}>{review.wordCount} palavras · {(review.references ?? []).length} referências</span>
      </div>

      <div className={styles.artifactResult}>
        <span className={styles.artifactResultTitle}>Pré-visualização do conteúdo exportado</span>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
          <span className={styles.artifactResultText}><strong>{review.title}</strong></span>
          <span className={styles.artifactResultText} style={{ color: "var(--color-text-muted)" }}>
            Introdução: {review.introduction.slice(0, 100)}...
          </span>
          <span className={styles.artifactResultText} style={{ color: "var(--color-text-muted)" }}>
            Desenvolvimento: {review.body.slice(0, 100)}...
          </span>
          <span className={styles.artifactResultText} style={{ color: "var(--color-text-muted)" }}>
            Conclusão: {review.conclusion.slice(0, 100)}...
          </span>
        </div>
      </div>

      <div className={styles.artifactField}>
        <label className={styles.artifactLabel}>Formato de exportação</label>
        <select className={styles.artifactSelect} value={format} onChange={(e) => setFormat(e.target.value as "docx" | "pdf" | "markdown")}>
          <option value="markdown">Markdown (.md)</option>
          <option value="docx">Word (.docx) — em breve</option>
          <option value="pdf">PDF — em breve</option>
        </select>
      </div>

      <div className={styles.artifactActions}>
        <button className={`${styles.artifactButton} ${styles.artifactButtonPrimary}`} onClick={handleExport}>
          {exported ? "Exportar novamente" : "Exportar revisão"}
        </button>
      </div>

      {exported && (
        <div className={styles.artifactSaved}>
          <span className={styles.artifactSavedDot} />
          Ficheiro exportado. O download foi iniciado.
        </div>
      )}
    </div>
  );
}
