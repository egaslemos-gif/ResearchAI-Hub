/**
 * Variable Resolver — resolves {{variables}} in prompts using structured artifacts
 * from the workspace, not just flat session properties.
 */

import type {
  Workspace,
  TemaArtifact,
  PerguntaArtifact,
  Article,
  SelectionArtifact,
  ReadingCardsArtifact,
  ComparisonTableArtifact,
  GapsArtifact,
  SynthesisArtifact,
  ReviewArtifact,
} from "@/components/workspace/WorkspaceStoreContext";

/**
 * Build a variables map from all artifacts in the workspace.
 * This is the single source of truth for prompt variable resolution.
 */
export function buildArtifactVariables(workspace: Partial<Workspace>): Record<string, string> {
  const vars: Record<string, string> = {};

  // Workspace-level vars
  if (workspace.studyArea) vars.studyArea = workspace.studyArea;
  if (workspace.researchTopic) vars.researchTopic = workspace.researchTopic;
  if (workspace.academicLevel) vars.academicLevel = workspace.academicLevel;

  // PR-001: Tema
  const tema = workspace.artifacts?.[1]?.data as TemaArtifact | undefined;
  if (tema) {
    vars.research_topic = tema.delimited || tema.researchTopic;
    vars.tema_delimited = tema.delimited || "";
    vars.tema_feasibility = tema.feasibility || "";
  }

  // PR-002: Pergunta
  const pergunta = workspace.artifacts?.[2]?.data as PerguntaArtifact | undefined;
  if (pergunta) {
    vars.research_question = pergunta.researchQuestion;
    vars.research_question_pt = pergunta.researchQuestion;
    vars.research_question_en = pergunta.keywordsEN.join(", ");
    vars.general_objective = pergunta.generalObjective;
    vars.specific_objectives = pergunta.specificObjectives.map((o, i) => `${i + 1}. ${o}`).join("\n");
    vars.keywords_pt = pergunta.keywordsPT.join(", ");
    vars.keywords_en = pergunta.keywordsEN.join(", ");
  }

  // PR-003: Article Repository (from workspace.articleRepository)
  const articles = workspace.articleRepository ?? [];
  if (articles.length > 0) {
    vars.article_list = articles.map((a, i) =>
      `${i + 1}. ${a.title}\n   Authors: ${a.authors}\n   Year: ${a.year}\n   Source: ${a.source}\n   DOI: ${a.doi || "N/A"}\n   Abstract: ${(a.abstract || "No abstract available").substring(0, 300)}...`
    ).join("\n\n");
  }

  // PR-004: Selection
  const selection = workspace.artifacts?.[4]?.data as SelectionArtifact | undefined;
  if (selection) {
    const selectedArticles = selection.articles.filter((a) => a.selected);
    vars.selected_articles = selectedArticles.map((a, i) =>
      `${i + 1}. ${a.title} (${a.authors}, ${a.year})`
    ).join("\n");
    vars.inclusion_criteria = selection.inclusionCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n");
    vars.exclusion_criteria = selection.exclusionCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n");
    // article_text for PR-005: the text of the SELECTED articles to analyse.
    // Source = PR-004 selection (NOT PR-005 reading cards — that was a chicken-and-egg bug).
    vars.article_text = selectedArticles.map((a, i) =>
      `--- Artigo ${i + 1} ---\nTítulo: ${a.title}\nAutores: ${a.authors}\nAno: ${a.year}\nResumo: ${a.abstract || "(sem resumo disponível)"}`
    ).join("\n\n");
  }

  // PR-005: Reading Cards
  const readingCards = workspace.artifacts?.[5]?.data as ReadingCardsArtifact | undefined;
  if (readingCards) {
    vars.reading_cards = readingCards.cards.map((c, i) =>
      `### Ficha ${i + 1}: ${c.articleTitle}\n- Objectivo: ${c.objective}\n- Metodologia: ${c.methodology}\n- Amostra: ${c.sample}\n- Resultados: ${c.results}\n- Limitações: ${c.limitations}\n- Contribuição: ${c.contribution}`
    ).join("\n\n");
    // NOTE: article_text is intentionally NOT set here — it is fed from PR-004
    // (selected articles) above, so PR-005 receives real article text to analyse.
  }

  // PR-006: Comparison Table
  const comparison = workspace.artifacts?.[6]?.data as ComparisonTableArtifact | undefined;
  if (comparison) {
    vars.comparative_analysis = formatComparisonTable(comparison);
    // all_analysis for PR-008: the comparative analysis produced in PR-006.
    // Source = PR-006 (NOT PR-008 synthesis — that was a chicken-and-egg bug).
    vars.all_analysis = formatComparisonTable(comparison);
  }

  // PR-007: Gaps
  const gaps = workspace.artifacts?.[7]?.data as GapsArtifact | undefined;
  if (gaps) {
    vars.gaps = gaps.gaps.map((g, i) => `${i + 1}. ${g.description}\n   Justificação: ${g.justification}`).join("\n\n");
  }

  // PR-008: Synthesis
  const synthesis = workspace.artifacts?.[8]?.data as SynthesisArtifact | undefined;
  if (synthesis) {
    // thematic_synthesis feeds PR-009. all_analysis is NO LONGER sourced here
    // (it comes from PR-006 comparison above), fixing the chicken-and-egg bug.
    vars.thematic_synthesis = synthesis.themes.map((t, i) => `Tema ${i + 1}: ${t.name} — ${t.description}`).join("\n");
  }

  // PR-009: Review
  const review = workspace.artifacts?.[9]?.data as ReviewArtifact | undefined;
  if (review) {
    vars.literature_review = review.body || "";
  }

  return vars;
}

function formatComparisonTable(comparison: ComparisonTableArtifact): string {
  if (comparison.rows.length === 0) return "";

  let table = "| Artigo | Objectivo | Metodologia | Amostra | Resultados | Limitações |\n";
  table += "|--------|-----------|-------------|---------|------------|------------|\n";
  for (const row of comparison.rows) {
    table += `| ${row.articleTitle} | ${row.objective} | ${row.methodology} | ${row.sample} | ${row.results} | ${row.limitations} |\n`;
  }

  if (comparison.convergences.length > 0) {
    table += "\n**Convergências:**\n";
    comparison.convergences.forEach((c, i) => { table += `${i + 1}. ${c}\n`; });
  }
  if (comparison.divergences.length > 0) {
    table += "\n**Divergências:**\n";
    comparison.divergences.forEach((d, i) => { table += `${i + 1}. ${d}\n`; });
  }

  return table;
}

/**
 * Resolve prompt variables using artifact-based variables first,
 * falling back to session progress variables.
 */
export function resolveWithArtifacts(
  content: string,
  workspace: Partial<Workspace>,
  step: number
): string {
  if (!content) return "";

  const artifactVars = buildArtifactVariables(workspace);
  const progressVars = workspace.progress?.[step]?.variables ?? {};

  return content.replace(/\{\{([^}]+)\}\}/g, (match, key: string) => {
    const trimmedKey = key.trim();

    // 1. Check artifact variables
    const artifactValue = artifactVars[trimmedKey];
    if (artifactValue !== undefined && artifactValue !== null && artifactValue !== "") {
      return String(artifactValue);
    }

    // 2. Check workspace-level properties
    const wsValue = (workspace as Record<string, unknown>)[trimmedKey];
    if (wsValue !== undefined && wsValue !== null && wsValue !== "") {
      return String(wsValue);
    }

    // 3. Check step progress variables
    const progressValue = progressVars[trimmedKey];
    if (progressValue !== undefined && progressValue !== null && progressValue !== "") {
      return String(progressValue);
    }

    return match;
  });
}
