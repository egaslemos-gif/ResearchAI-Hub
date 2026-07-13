/**
 * Semantic Validators — validate each artifact for completeness,
 * consistency with previous step, and correct reuse by next step.
 *
 * Each validator returns a ValidationResult with:
 *   - passed: boolean
 *   - score: 0-100
 *   - issues: list of specific problems
 *   - warnings: non-blocking concerns
 */

export interface ValidationResult {
  step: number;
  stepName: string;
  passed: boolean;
  score: number;
  issues: string[];
  warnings: string[];
  metrics: Record<string, number>;
}

interface ArtifactLike {
  [key: string]: unknown;
}

/* ─── Helpers ─────────────────────────────────────────────────── */

function hasContent(value: unknown): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return false;
}

function minLength(value: unknown, min: number): boolean {
  return typeof value === "string" && value.trim().length >= min;
}

function minItems(value: unknown, min: number): boolean {
  return Array.isArray(value) && value.length >= min;
}

function nonEmptyFields(obj: ArtifactLike, fields: string[]): { filled: string[]; empty: string[] } {
  const filled: string[] = [];
  const empty: string[] = [];
  for (const f of fields) {
    if (hasContent(obj[f])) filled.push(f);
    else empty.push(f);
  }
  return { filled, empty };
}

/* ─── Per-step validators ─────────────────────────────────────── */

export function validateTema(artifact: ArtifactLike): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  const { filled, empty } = nonEmptyFields(artifact, ["studyArea", "researchTopic", "academicLevel", "delimited", "feasibility"]);

  if (empty.includes("delimited")) issues.push("delimited está vazio — tema não foi delimitado");
  if (empty.includes("feasibility")) issues.push("feasibility está vazio — exequibilidade não avaliada");
  if (empty.includes("studyArea")) issues.push("studyArea está vazio");
  if (empty.includes("researchTopic")) issues.push("researchTopic está vazio");

  if (!issues.length && minLength(artifact["delimited"], 50) === false)
    warnings.push("delimited < 50 chars — delimitação pode ser insuficiente");

  const score = Math.round((filled.length / 5) * 100);
  return {
    step: 1, stepName: "PR-001 — Tema",
    passed: issues.length === 0,
    score,
    issues, warnings,
    metrics: { fieldsFilled: filled.length, fieldsTotal: 5 },
  };
}

export function validatePergunta(artifact: ArtifactLike, prev?: ArtifactLike): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  const { filled, empty } = nonEmptyFields(artifact, ["researchQuestion", "generalObjective", "specificObjectives", "keywordsPT", "keywordsEN"]);

  if (empty.includes("researchQuestion")) issues.push("researchQuestion está vazio — pergunta não extraída");
  if (empty.includes("generalObjective")) issues.push("generalObjective está vazio");
  if (empty.includes("specificObjectives")) issues.push("specificObjectives está vazio");
  if (empty.includes("keywordsPT")) warnings.push("keywordsPT está vazio");
  if (empty.includes("keywordsEN")) warnings.push("keywordsEN está vazio");

  // Consistency: research question should relate to tema
  if (prev && hasContent(prev["delimited"]) && hasContent(artifact["researchQuestion"])) {
    const temaWords = String(prev["delimited"]).toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    const question = String(artifact["researchQuestion"]).toLowerCase();
    const overlap = temaWords.filter((w) => question.includes(w));
    if (overlap.length < 2) {
      warnings.push(`Pergunta partilha < 2 palavras com tema delimitado (overlap: ${overlap.length})`);
    }
  }

  // Specific objectives should be >= 2
  const objCount = Array.isArray(artifact["specificObjectives"]) ? artifact["specificObjectives"].length : 0;
  if (objCount < 2) warnings.push(`specificObjectives tem apenas ${objCount} itens (esperado >= 2)`);

  // Keywords should be >= 3
  const kwPtCount = Array.isArray(artifact["keywordsPT"]) ? artifact["keywordsPT"].length : 0;
  const kwEnCount = Array.isArray(artifact["keywordsEN"]) ? artifact["keywordsEN"].length : 0;
  if (kwPtCount < 3) warnings.push(`keywordsPT tem apenas ${kwPtCount} itens (esperado >= 3)`);
  if (kwEnCount < 3) warnings.push(`keywordsEN tem apenas ${kwEnCount} itens (esperado >= 3)`);

  const score = Math.round((filled.length / 5) * 100);
  return {
    step: 2, stepName: "PR-002 — Pergunta",
    passed: issues.length === 0,
    score,
    issues, warnings,
    metrics: { fieldsFilled: filled.length, fieldsTotal: 5, objectivesCount: objCount, kwPtCount, kwEnCount },
  };
}

export function validateArticleList(articles: ArtifactLike[]): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (articles.length === 0) {
    issues.push("Nenhum artigo encontrado");
  } else if (articles.length < 5) {
    warnings.push(`Apenas ${articles.length} artigos (recomendado >= 10)`);
  }

  let withAbstract = 0;
  let withDoi = 0;
  let withRelevanceScore = 0;
  for (const a of articles) {
    if (hasContent(a["abstract"])) withAbstract++;
    if (hasContent(a["doi"])) withDoi++;
    if (typeof a["relevanceScore"] === "number") withRelevanceScore++;
  }

  if (articles.length > 0 && withAbstract < articles.length * 0.5)
    warnings.push(`${withAbstract}/${articles.length} artigos com abstract (< 50%)`);
  if (articles.length > 0 && withDoi < articles.length * 0.5)
    warnings.push(`${withDoi}/${articles.length} artigos com DOI (< 50%)`);

  const score = articles.length === 0 ? 0 : Math.round((withAbstract / articles.length) * 100);
  return {
    step: 3, stepName: "PR-003 — Busca Artigos",
    passed: issues.length === 0,
    score,
    issues, warnings,
    metrics: { articleCount: articles.length, withAbstract, withDoi, withRelevanceScore },
  };
}

export function validateSelection(artifact: ArtifactLike, prev?: ArtifactLike): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  const { filled, empty } = nonEmptyFields(artifact, ["inclusionCriteria", "exclusionCriteria", "articles"]);

  if (empty.includes("inclusionCriteria")) issues.push("inclusionCriteria está vazio");
  if (empty.includes("exclusionCriteria")) issues.push("exclusionCriteria está vazio");

  const articles = Array.isArray(artifact["articles"]) ? artifact["articles"] as ArtifactLike[] : [];
  const selected = articles.filter((a) => a["selected"] === true);

  if (selected.length === 0) {
    issues.push("Nenhum artigo selecionado");
  } else if (selected.length < 3) {
    warnings.push(`Apenas ${selected.length} artigos selecionados (recomendado 3-5)`);
  } else if (selected.length > 8) {
    warnings.push(`${selected.length} artigos selecionados (pode ser excessivo)`);
  }

  // Consistency: selected articles should exist in previous article list
  if (prev && Array.isArray(prev["articles"])) {
    const prevIds = new Set((prev["articles"] as ArtifactLike[]).map((a) => String(a["id"])));
    const orphanCount = selected.filter((a) => !prevIds.has(String(a["id"]))).length;
    if (orphanCount > 0) warnings.push(`${orphanCount} artigos selecionados não estão na lista anterior`);
  }

  const score = Math.round((filled.length / 3) * 100);
  return {
    step: 4, stepName: "PR-004 — Seleção",
    passed: issues.length === 0,
    score,
    issues, warnings,
    metrics: { fieldsFilled: filled.length, fieldsTotal: 3, selectedCount: selected.length, totalArticles: articles.length },
  };
}

export function validateReadingCards(artifact: ArtifactLike, prev?: ArtifactLike): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  const cards = Array.isArray(artifact["cards"]) ? artifact["cards"] as ArtifactLike[] : [];
  if (cards.length === 0) {
    issues.push("Nenhuma ficha de leitura extraída");
    return {
      step: 5, stepName: "PR-005 — Fichas de Leitura",
      passed: false, score: 0, issues, warnings,
      metrics: { cardCount: 0 },
    };
  }

  let completeCards = 0;
  const requiredFields = ["objective", "methodology", "results", "limitations", "contribution"];
  let emptyFieldCount = 0;

  for (const card of cards) {
    const { filled, empty } = nonEmptyFields(card, requiredFields);
    if (empty.length === 0) completeCards++;
    emptyFieldCount += empty.length;
  }

  if (completeCards < cards.length * 0.5)
    warnings.push(`${completeCards}/${cards.length} fichas têm todos os campos preenchidos (< 50%)`);
  if (emptyFieldCount > cards.length * 2)
    warnings.push(`${emptyFieldCount} campos vazios em ${cards.length} fichas (média ${Math.round(emptyFieldCount / cards.length)} por ficha)`);

  // Consistency: cards should match selected articles from PR-004
  if (prev && Array.isArray(prev["articles"])) {
    const selectedIds = new Set(
      (prev["articles"] as ArtifactLike[]).filter((a) => a["selected"] === true).map((a) => String(a["id"]))
    );
    const cardIds = cards.map((c) => String(c["articleId"]));
    const matching = cardIds.filter((id) => selectedIds.has(id)).length;
    if (matching < cardIds.length * 0.5)
      warnings.push(`${matching}/${cardIds.length} fichas correspondem a artigos selecionados em PR-004`);
  }

  const score = Math.round((completeCards / cards.length) * 100);
  return {
    step: 5, stepName: "PR-005 — Fichas de Leitura",
    passed: issues.length === 0,
    score,
    issues, warnings,
    metrics: { cardCount: cards.length, completeCards, emptyFieldCount },
  };
}

export function validateComparison(artifact: ArtifactLike, prev?: ArtifactLike): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  const rows = Array.isArray(artifact["rows"]) ? artifact["rows"] as ArtifactLike[] : [];
  const convergences = Array.isArray(artifact["convergences"]) ? artifact["convergences"] as string[] : [];
  const divergences = Array.isArray(artifact["divergences"]) ? artifact["divergences"] as string[] : [];

  if (rows.length === 0) issues.push("Tabela comparativa vazia — nenhuma linha extraída");
  if (convergences.length === 0) warnings.push("Sem convergências identificadas");
  if (divergences.length === 0) warnings.push("Sem divergências identificadas");

  // Consistency: comparison should reference same articles as reading cards
  if (prev && Array.isArray(prev["cards"])) {
    const cardCount = (prev["cards"] as ArtifactLike[]).length;
    if (rows.length < cardCount * 0.5)
      warnings.push(`Tabela tem ${rows.length} linhas mas PR-005 produziu ${cardCount} fichas`);
  }

  const score = Math.round(((rows.length > 0 ? 1 : 0) + (convergences.length > 0 ? 1 : 0) + (divergences.length > 0 ? 1 : 0)) / 3 * 100);
  return {
    step: 6, stepName: "PR-006 — Comparação",
    passed: issues.length === 0,
    score,
    issues, warnings,
    metrics: { rowCount: rows.length, convergenceCount: convergences.length, divergenceCount: divergences.length },
  };
}

export function validateGaps(artifact: ArtifactLike, prev?: ArtifactLike): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  const gaps = Array.isArray(artifact["gaps"]) ? artifact["gaps"] as ArtifactLike[] : [];
  if (gaps.length === 0) {
    issues.push("Nenhuma lacuna identificada");
  } else if (gaps.length < 2) {
    warnings.push(`Apenas ${gaps.length} lacuna(s) identificada(s) (recomendado >= 3)`);
  }

  let gapsWithJustification = 0;
  for (const gap of gaps) {
    if (hasContent(gap["description"])) gapsWithJustification++;
  }

  if (gaps.length > 0 && gapsWithJustification < gaps.length * 0.5)
    warnings.push(`${gapsWithJustification}/${gaps.length} lacunas têm descrição preenchida`);

  // Consistency: gaps should relate to comparison
  if (prev && Array.isArray(prev["rows"])) {
    if (gaps.length === 0 && (prev["rows"] as ArtifactLike[]).length > 0)
      issues.push("PR-007 não produziu lacunas apesar de PR-006 ter dados comparativos");
  }

  const score = gaps.length === 0 ? 0 : Math.round((gapsWithJustification / gaps.length) * 100);
  return {
    step: 7, stepName: "PR-007 — Lacunas",
    passed: issues.length === 0,
    score,
    issues, warnings,
    metrics: { gapCount: gaps.length, gapsWithJustification },
  };
}

export function validateSynthesis(artifact: ArtifactLike, prev?: ArtifactLike): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  const themes = Array.isArray(artifact["themes"]) ? artifact["themes"] as ArtifactLike[] : [];
  const trends = Array.isArray(artifact["trends"]) ? artifact["trends"] as string[] : [];
  const contradictions = Array.isArray(artifact["contradictions"]) ? artifact["contradictions"] as string[] : [];

  if (themes.length === 0) issues.push("Nenhum tema síntese identificado");
  if (themes.length < 2) warnings.push(`Apenas ${themes.length} tema(s) na síntese (recomendado >= 2)`);

  // Consistency: synthesis should build on gaps
  if (prev && Array.isArray(prev["gaps"])) {
    const gapCount = (prev["gaps"] as ArtifactLike[]).length;
    if (gapCount > 0 && themes.length === 0)
      issues.push("Síntese vazia apesar de PR-007 ter identificado lacunas");
  }

  const score = Math.round(((themes.length > 0 ? 1 : 0) + (trends.length > 0 ? 1 : 0) + (contradictions.length > 0 ? 1 : 0)) / 3 * 100);
  return {
    step: 8, stepName: "PR-008 — Síntese",
    passed: issues.length === 0,
    score,
    issues, warnings,
    metrics: { themeCount: themes.length, trendCount: trends.length, contradictionCount: contradictions.length },
  };
}

export function validateReview(artifact: ArtifactLike, prev?: ArtifactLike): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  const { filled, empty } = nonEmptyFields(artifact, ["title", "introduction", "body", "conclusion"]);

  if (empty.includes("introduction")) issues.push("Introdução vazia");
  if (empty.includes("body")) issues.push("Desenvolvimento vazio");
  if (empty.includes("conclusion")) issues.push("Conclusão vazia");

  const wordCount = typeof artifact["wordCount"] === "number" ? artifact["wordCount"] : 0;
  if (wordCount < 500) warnings.push(`Revisão tem apenas ${wordCount} palavras (recomendado >= 1000)`);
  if (wordCount < 200) issues.push(`Revisão insuficiente: ${wordCount} palavras`);

  // Consistency: review should reference themes from synthesis
  if (prev && Array.isArray(prev["themes"])) {
    const themeCount = (prev["themes"] as ArtifactLike[]).length;
    if (themeCount > 0 && wordCount < 500)
      warnings.push(`Revisão curta (${wordCount} palavras) apesar de ${themeCount} temas na síntese`);
  }

  const score = Math.round((filled.length / 4) * 100);
  return {
    step: 9, stepName: "PR-009 — Revisão da Literatura",
    passed: issues.length === 0,
    score,
    issues, warnings,
    metrics: { fieldsFilled: filled.length, fieldsTotal: 4, wordCount },
  };
}

export function validateReviewChecklist(artifact: ArtifactLike, prev?: ArtifactLike): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  const { filled, empty } = nonEmptyFields(artifact, ["title", "introduction", "body", "conclusion"]);
  if (empty.includes("body")) warnings.push("body da revisão validada está vazio");

  // This step reviews the previous review — check it references it
  if (prev && typeof prev["wordCount"] === "number" && prev["wordCount"] < 200)
    warnings.push("PR-010 parece validar uma revisão muito curta (PR-009 < 200 palavras)");

  const score = Math.round((filled.length / 4) * 100);
  return {
    step: 10, stepName: "PR-010 — Validação",
    passed: issues.length === 0,
    score,
    issues, warnings,
    metrics: { fieldsFilled: filled.length, fieldsTotal: 4 },
  };
}

/* ─── Pipeline-level validation ────────────────────────────────── */

export interface PipelineValidationSummary {
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  overallScore: number;
  results: ValidationResult[];
  crossStepIssues: string[];
}

export function validatePipeline(results: ValidationResult[]): PipelineValidationSummary {
  const passedSteps = results.filter((r) => r.passed).length;
  const failedSteps = results.filter((r) => !r.passed).length;
  const overallScore = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0;

  const crossStepIssues: string[] = [];

  // Check for score degradation — each step should not drop more than 30 points
  for (let i = 1; i < results.length; i++) {
    const drop = results[i - 1].score - results[i].score;
    if (drop > 30) {
      crossStepIssues.push(
        `Queda de qualidade: ${results[i - 1].stepName} (${results[i - 1].score}) → ${results[i].stepName} (${results[i].score}), -${drop} pontos`
      );
    }
  }

  // Check for cascading failures
  for (let i = 0; i < results.length; i++) {
    if (!results[i].passed && i < results.length - 1) {
      crossStepIssues.push(
        `Falha em ${results[i].stepName} pode comprometer passos seguintes`
      );
    }
  }

  return {
    totalSteps: results.length,
    passedSteps,
    failedSteps,
    overallScore,
    results,
    crossStepIssues,
  };
}
