/**
 * VariableResolver Tests — regression guard for context circulation.
 * ==================================================================
 * Runs the REAL buildArtifactVariables against synthetic workspaces and asserts
 * every pipeline variable resolves from the CORRECT upstream artifact.
 *
 * The two previously-broken vars are tested with their WRONG source ABSENT, so
 * the test only passes if they resolve from the right step:
 *   - article_text  must resolve from PR-004 even with NO reading cards (PR-005)
 *   - all_analysis  must resolve from PR-006 even with NO synthesis (PR-008)
 *
 * Run:  node --experimental-strip-types quality/resolver.test.mjs
 * Exit code 1 on any failure (CI-gatable).
 */
import { buildArtifactVariables } from "../lib/variableResolver.ts";

/* ─── synthetic artifacts (minimal, realistic) ───────────────────── */
const tema = { delimited: "Impacto da IA generativa no ensino superior português.", researchTopic: "IA no ensino superior", feasibility: "viável" };
const pergunta = { researchQuestion: "Como a IA generativa afecta o ensino superior?", keywordsPT: ["ia", "ensino", "docentes"], keywordsEN: ["ai", "higher education", "teachers"], generalObjective: "Analisar o impacto", specificObjectives: ["Identificar desafios", "Analisar oportunidades"] };
const articles = [
  { id: "art-1", title: "AI in Higher Ed", authors: "Smith, John", year: "2024", source: "J. Educ.", doi: "10.1/x", abstract: "Abstract sobre IA no ensino superior.", selected: true },
  { id: "art-2", title: "Teachers and GenAI", authors: "Costa, Ana", year: "2023", source: "Rev. Ped.", doi: "10.1/y", abstract: "Estudo sobre perceções docentes.", selected: true },
  { id: "art-3", title: "Irrelevant", authors: "X, Y", year: "2019", source: "Other", abstract: "Fora de âmbito.", selected: false },
];
const selection = { articles, inclusionCriteria: ["Estudos empíricos"], exclusionCriteria: ["Fora de âmbito"] };
const readingCards = { cards: [{ articleId: "art-1", articleTitle: "AI in Higher Ed", objective: "O", methodology: "M", sample: "S", results: "R", limitations: "L", contribution: "C" }] };
const comparison = { rows: [{ articleTitle: "AI in Higher Ed", objective: "O", methodology: "M", sample: "S", results: "R", limitations: "L" }], convergences: ["convergem em X"], divergences: ["divergem em Y"] };
const gaps = { gaps: [{ description: "Falta investigação em Portugal", justification: "j" }] };
const synthesis = { themes: [{ name: "Tema A", description: "desc do tema", evidence: "ev" }], trends: ["tendência 1"], contradictions: ["contradição 1"] };
const review = { body: "corpo da revisão da literatura", introduction: "intro", conclusion: "conclusão", references: ["Smith (2024)"] };

const ALL = { 1: tema, 2: pergunta, 4: selection, 5: readingCards, 6: comparison, 7: gaps, 8: synthesis, 9: review };

/** Build a workspace containing only the given artifact steps (3 = article repo). */
function ws(steps) {
  const artifacts = {};
  for (const s of steps) if (ALL[s]) artifacts[s] = { data: ALL[s] };
  return { studyArea: "Educação", researchTopic: "IA no ensino superior", academicLevel: "mestrado", artifacts, articleRepository: steps.includes(3) ? articles : [], progress: {} };
}

/* ─── checks ──────────────────────────────────────────────────────
 * `steps` deliberately EXCLUDES the step that used to (wrongly) feed the var,
 * so a regression to the old wiring makes the var resolve to undefined.
 */
const CHECKS = [
  { var: "article_list", type: "ArticleRepository (PR-003)", steps: [1, 2, 3] },
  { var: "selected_articles", type: "Selection (PR-004)", steps: [1, 2, 3, 4] },
  { var: "article_text", type: "ArticleRepository(selected) (PR-004)", steps: [1, 2, 3, 4], assert: (v) => /Resumo:/.test(v) && /Abstract sobre IA/.test(v), why: "deve conter o texto/abstract dos artigos seleccionados" },
  { var: "reading_cards", type: "ReadingCards (PR-005)", steps: [1, 2, 3, 4, 5] },
  { var: "comparative_analysis", type: "ComparativeAnalysis (PR-006)", steps: [1, 2, 3, 4, 5, 6] },
  { var: "all_analysis", type: "ComparativeAnalysis (PR-006)", steps: [1, 2, 3, 4, 5, 6], assert: (v) => /\| Artigo|Objectivo|Metodologia/.test(v), why: "deve ser a tabela comparativa do PR-006, não a síntese" },
  { var: "gaps", type: "Gaps (PR-007)", steps: [1, 2, 3, 4, 5, 6, 7] },
  { var: "thematic_synthesis", type: "Synthesis (PR-008)", steps: [1, 2, 3, 4, 5, 6, 7, 8] },
  { var: "literature_review", type: "Review (PR-009)", steps: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
];

/* ─── run ─────────────────────────────────────────────────────────── */
console.log("\nVariableResolver Tests\n" + "─".repeat(60));
let failures = 0;
for (const c of CHECKS) {
  const vars = buildArtifactVariables(ws(c.steps));
  const val = vars[c.var];
  const nonEmpty = typeof val === "string" && val.trim().length > 0;
  const assertOk = nonEmpty && (c.assert ? c.assert(val) : true);
  if (assertOk) {
    console.log(`✓ ${c.var}`);
  } else {
    failures++;
    const received = val === undefined ? "undefined" : !nonEmpty ? "‹vazio›" : `"${val.slice(0, 70).replace(/\n/g, " ")}…" (conteúdo inesperado)`;
    console.log(`✗ ${c.var}`);
    console.log(`\n    ${c.var}`);
    console.log(`    Expected:\n    ${c.type}${c.why ? ` — ${c.why}` : ""}`);
    console.log(`    Received:\n    ${received}\n`);
  }
}
console.log("─".repeat(60));
console.log(failures === 0 ? `✓ ${CHECKS.length}/${CHECKS.length} variáveis circulam correctamente.` : `✗ ${failures}/${CHECKS.length} falharam — circulação de contexto quebrada.`);
process.exit(failures === 0 ? 0 : 1);
