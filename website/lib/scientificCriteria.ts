/**
 * Scientific Quality Criteria — RL-01
 * ===================================
 * Evaluates each produced artifact against the *protocol's own* validation
 * criteria (protocols/RL-01/workflow.json), producing per-criterion evidence.
 *
 * Purpose (Sprint "Qualidade Científica dos Artefactos"):
 *   For each of the 10 steps, after the real extractor produces a structured
 *   artifact, we automatically evaluate its scientific quality and — crucially —
 *   classify each failure as:
 *     - "prompt"    → the model did not produce the required content
 *     - "extractor" → the content IS present in the raw text but the extractor
 *                     failed to parse it into the artifact
 *     - "content"   → present but scientifically weak (too short / too few)
 *
 * This module is framework-free (no React, only `import type`) so it can be
 * run from a node script (via --experimental-strip-types) reusing the REAL
 * extractors, and later imported by the runtime to power the "Validação" stage.
 */

/* ─── Types ──────────────────────────────────────────────────────── */

export type CriterionStatus = "pass" | "warn" | "fail" | "manual" | "na";
/**
 * Where the responsibility for a failure lies — so a fix targets the right layer
 * instead of blindly editing prompts:
 *   - prompt    → the prompt template didn't ask for the content
 *   - extractor → content IS in the raw text but the parser missed it
 *   - runtime   → the pipeline/variableResolver didn't feed the step its inputs
 *   - modelo    → the LLM produced wrong/weak/hallucinated content despite good inputs
 */
export type Blame = "prompt" | "extractor" | "runtime" | "modelo" | "none";
export type Dimension =
  | "completeness"
  | "delimitation"
  | "scientific-rigor"
  | "consistency"
  | "reuse";

export interface CriterionResult {
  id: string; // e.g. "PR-001.C2"
  label: string; // protocol criterion text
  dimension: Dimension;
  status: CriterionStatus;
  blame: Blame;
  evidence: string;
  automatable: boolean;
}

export interface StepQuality {
  step: number;
  stepName: string;
  artifactType: string;
  criteria: CriterionResult[];
  /** 0-100 over automatable criteria (pass=1, warn=0.5, fail=0). */
  score: number;
  /** true when no automatable criterion FAILS. */
  passed: boolean;
  blame: { prompt: number; extractor: number; runtime: number; modelo: number };
  manualCount: number;
}

export interface EvalContext {
  /** structured artifact produced by the real extractor */
  artifact: Record<string, unknown>;
  /** raw LLM response text */
  raw: string;
  /** artifact from the previous relevant step (for consistency checks) */
  prev?: Record<string, unknown>;
  /** full article repository (for cross-step article checks) */
  articles?: Record<string, unknown>[];
  /**
   * Result of resolving THIS step's prompt with the real variableResolver from
   * the artifacts accumulated in previous steps.
   * `requiredVars` = {{vars}} the prompt references; `unresolved` = those the
   * prior artifacts could NOT fill. Drives the "context circulation" dimension:
   * an unresolved var means an earlier step failed to feed this one.
   */
  reuse?: { stepName: string; unresolved: string[]; requiredVars: string[] };
}

/* ─── Small helpers ──────────────────────────────────────────────── */

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}
function has(v: unknown): boolean {
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  return !!v;
}
function words(s: string): number {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}
function rawHas(raw: string, re: RegExp): boolean {
  return re.test(raw);
}
/** classify a missing/weak field: present? → none; else raw has signal? → extractor; else prompt */
function blameMissing(present: boolean, rawSignal: boolean): Blame {
  if (present) return "none";
  return rawSignal ? "extractor" : "prompt";
}
/** heuristic: does the string start with a Portuguese action verb (infinitive)? */
function startsWithInfinitive(s: string): boolean {
  const first = s.trim().replace(/^[\d.)\-•*\s]+/, "").split(/\s+/)[0]?.toLowerCase() ?? "";
  return /(?:ar|er|ir)$/.test(first) && first.length > 3;
}

function mk(
  id: string,
  label: string,
  dimension: Dimension,
  status: CriterionStatus,
  blame: Blame,
  evidence: string,
  automatable = true
): CriterionResult {
  return { id, label, dimension, status, blame, evidence, automatable };
}

/* ─── Per-step evaluators ────────────────────────────────────────── */

function evalPR001(ctx: EvalContext): CriterionResult[] {
  const a = ctx.artifact;
  const delimited = str(a.delimited);
  const feasibility = str(a.feasibility);
  const c: CriterionResult[] = [];

  // C1 — tema claro e conciso (1-2 frases para a parte "Tema Proposto")
  const temaProposto = delimited.split(/\n\s*\n/)[0] ?? "";
  const sentences = temaProposto.split(/[.!?](?:\s|$)/).filter((s) => s.trim().length > 5).length;
  c.push(
    mk(
      "PR-001.C1",
      "O tema está formulado de forma clara e concisa",
      "delimitation",
      has(delimited) ? (sentences <= 3 ? "pass" : "warn") : "fail",
      blameMissing(has(delimited), rawHas(ctx.raw, /tema\s+proposto|##?\s*tema/i)),
      has(delimited) ? `tema em ~${sentences} frase(s)` : "delimited vazio"
    )
  );

  // C2 — delimitação (temporal / geográfica / temática)
  const hasDelim =
    /\b(temporal|geogr[áa]fic|tem[áa]tic|per[íi]odo|contexto|entre \d{4}|\d{4}-\d{4})\b/i.test(delimited);
  c.push(
    mk(
      "PR-001.C2",
      "O tema possui delimitação (temporal, geográfica ou temática)",
      "delimitation",
      hasDelim ? "pass" : "fail",
      blameMissing(hasDelim, rawHas(ctx.raw, /delimita[çc]/i)),
      hasDelim ? "delimitação detectada no texto" : "sem marcadores de delimitação"
    )
  );

  // C3 — relevante para a área de estudo
  const area = str(a.studyArea).toLowerCase();
  const relevant =
    has(area) && (delimited.toLowerCase().includes(area.split(/\s+/)[0] ?? "###") || words(delimited) > 15);
  c.push(
    mk(
      "PR-001.C3",
      "O tema é relevante para a área de estudo",
      "scientific-rigor",
      relevant ? "pass" : "warn",
      "none",
      `área="${area}"`
    )
  );

  // C4 — exequibilidade avaliada
  const verdict = /vi[áa]vel|demasiado amplo|demasiado restrito|exequ[íi]vel/i.test(feasibility);
  c.push(
    mk(
      "PR-001.C4",
      "O tema é exequível para uma revisão da literatura",
      "scientific-rigor",
      has(feasibility) ? (verdict ? "pass" : "warn") : "fail",
      blameMissing(has(feasibility), rawHas(ctx.raw, /exequibilidade|vi[áa]vel/i)),
      has(feasibility) ? (verdict ? "veredicto explícito" : "presente sem veredicto claro") : "feasibility vazio"
    )
  );
  return c;
}

function evalPR002(ctx: EvalContext): CriterionResult[] {
  const a = ctx.artifact;
  const q = str(a.researchQuestion);
  const objs = arr(a.specificObjectives).map(str).filter(has);
  const kwPt = arr(a.keywordsPT).map(str).filter(has);
  const kwEn = arr(a.keywordsEN).map(str).filter(has);
  const c: CriterionResult[] = [];

  // C1 — específica e não genérica (interrogativa + comprimento razoável)
  const interrogative = /\?/.test(q) || /^(como|qual|quais|de que forma|em que medida|porquê|por que)/i.test(q.trim());
  c.push(
    mk(
      "PR-002.C1",
      "A pergunta é específica e não genérica",
      "scientific-rigor",
      has(q) ? (interrogative && words(q) >= 6 ? "pass" : "warn") : "fail",
      blameMissing(has(q), rawHas(ctx.raw, /pergunta de investiga/i)),
      has(q) ? `interrogativa=${interrogative}, ${words(q)} palavras` : "researchQuestion vazio"
    )
  );

  // C2 — respondível com base na literatura (heurística fraca → manual)
  c.push(
    mk(
      "PR-002.C2",
      "A pergunta é respondível com base na literatura",
      "scientific-rigor",
      "manual",
      "none",
      "requer julgamento (heurística insuficiente)",
      false
    )
  );

  // C3 — objectivos mensuráveis e alinhados (≥2, começam por verbo de acção)
  const withVerb = objs.filter(startsWithInfinitive).length;
  c.push(
    mk(
      "PR-002.C3",
      "Os objectivos são mensuráveis e alinhados com a pergunta",
      "scientific-rigor",
      objs.length >= 2 ? (withVerb >= Math.ceil(objs.length / 2) ? "pass" : "warn") : "fail",
      blameMissing(objs.length >= 2, rawHas(ctx.raw, /objectivos?\s+espec[íi]ficos/i)),
      `${objs.length} objectivos, ${withVerb} começam por verbo de acção`
    )
  );

  // C4 — palavras-chave em PT e EN
  c.push(
    mk(
      "PR-002.C4",
      "As palavras-chave estão definidas em PT e EN",
      "completeness",
      kwPt.length > 0 && kwEn.length > 0 ? "pass" : "fail",
      blameMissing(kwPt.length > 0 && kwEn.length > 0, rawHas(ctx.raw, /palavras?.chave|ingl[êe]s|portugu[êe]s/i)),
      `PT=${kwPt.length}, EN=${kwEn.length}`
    )
  );

  // C5 — pelo menos 5 palavras-chave
  const totalKw = kwPt.length + kwEn.length;
  c.push(
    mk(
      "PR-002.C5",
      "Existem pelo menos 5 palavras-chave",
      "completeness",
      totalKw >= 5 ? (kwPt.length >= 3 && kwEn.length >= 3 ? "pass" : "warn") : "fail",
      "modelo",
      `${totalKw} palavras-chave no total`
    )
  );

  // Consistency — a pergunta partilha termos com o tema (PR-001)
  if (ctx.prev) {
    const temaWords = new Set(
      str(ctx.prev.delimited).toLowerCase().split(/\s+/).filter((w) => w.length > 4)
    );
    const overlap = q.toLowerCase().split(/\s+/).filter((w) => temaWords.has(w)).length;
    c.push(
      mk(
        "PR-002.X1",
        "[consistência] A pergunta deriva do tema delimitado (PR-001)",
        "consistency",
        overlap >= 2 ? "pass" : "warn",
        "none",
        `${overlap} termos partilhados com o tema`
      )
    );
  }
  return c;
}

function evalPR003(ctx: EvalContext): CriterionResult[] {
  const articles = ctx.articles ?? arr(ctx.artifact.articles) as Record<string, unknown>[];
  const withAbstract = articles.filter((x) => has(x.abstract)).length;
  const withSource = articles.filter((x) => has(x.source)).length;
  const c: CriterionResult[] = [];

  c.push(
    mk(
      "PR-003.C1",
      "Foram encontrados pelo menos 10 artigos relevantes",
      "completeness",
      articles.length >= 10 ? "pass" : articles.length >= 5 ? "warn" : "fail",
      "none",
      `${articles.length} artigos`
    )
  );
  c.push(
    mk(
      "PR-003.C2",
      "Os artigos são de fontes científicas",
      "scientific-rigor",
      articles.length > 0 && withSource >= articles.length * 0.8 ? "pass" : "warn",
      "none",
      `${withSource}/${articles.length} com fonte`
    )
  );
  c.push(
    mk(
      "PR-003.C3",
      "Os artigos possuem abstract (analisáveis)",
      "completeness",
      articles.length > 0 && withAbstract >= articles.length * 0.5 ? "pass" : "warn",
      "none",
      `${withAbstract}/${articles.length} com abstract`
    )
  );
  return c;
}

function evalPR004(ctx: EvalContext): CriterionResult[] {
  const a = ctx.artifact;
  const inc = arr(a.inclusionCriteria).map(str).filter(has);
  const exc = arr(a.exclusionCriteria).map(str).filter(has);
  const articles = arr(a.articles) as Record<string, unknown>[];
  const selected = articles.filter((x) => x.selected === true);
  const c: CriterionResult[] = [];

  c.push(
    mk(
      "PR-004.C1",
      "Foram definidos critérios de inclusão e exclusão",
      "completeness",
      inc.length > 0 && exc.length > 0 ? "pass" : "fail",
      blameMissing(inc.length > 0 && exc.length > 0, rawHas(ctx.raw, /inclus[ãa]o|exclus[ãa]o/i)),
      `inclusão=${inc.length}, exclusão=${exc.length}`
    )
  );
  c.push(
    mk(
      "PR-004.C2",
      "Foram seleccionados entre 5 e 8 artigos",
      "scientific-rigor",
      selected.length >= 5 && selected.length <= 8 ? "pass" : selected.length >= 3 ? "warn" : "fail",
      "modelo",
      `${selected.length} seleccionados de ${articles.length}`
    )
  );
  const withJust = selected.filter((x) => has(x.justification)).length;
  c.push(
    mk(
      "PR-004.C3",
      "Cada selecção possui justificação",
      "scientific-rigor",
      selected.length > 0 && withJust >= selected.length * 0.8 ? "pass" : "warn",
      blameMissing(withJust > 0, rawHas(ctx.raw, /justifica|incluir|excluir/i)),
      `${withJust}/${selected.length} com justificação`
    )
  );

  // Consistency — seleccionados existem na lista anterior (PR-003)
  if (ctx.articles && ctx.articles.length > 0) {
    const ids = new Set(ctx.articles.map((x) => String(x.id)));
    const orphans = selected.filter((x) => !ids.has(String(x.id))).length;
    c.push(
      mk(
        "PR-004.X1",
        "[consistência] Artigos seleccionados vêm da lista de PR-003",
        "consistency",
        orphans === 0 ? "pass" : "warn",
        "none",
        orphans === 0 ? "todos rastreáveis à busca" : `${orphans} artigos órfãos`
      )
    );
  }
  return c;
}

function evalPR005(ctx: EvalContext): CriterionResult[] {
  const cards = arr(ctx.artifact.cards) as Record<string, unknown>[];
  const c: CriterionResult[] = [];
  const fields = ["objective", "methodology", "results", "limitations", "contribution"];

  c.push(
    mk(
      "PR-005.C1",
      "Cada artigo possui uma ficha de leitura",
      "completeness",
      cards.length > 0 ? "pass" : "fail",
      blameMissing(cards.length > 0, rawHas(ctx.raw, /ficha de leitura/i)),
      `${cards.length} fichas`
    )
  );

  const complete = cards.filter((card) => fields.every((f) => has(card[f]))).length;
  c.push(
    mk(
      "PR-005.C2",
      "As fichas contêm objectivo, metodologia, resultados, limitações",
      "completeness",
      cards.length > 0 && complete >= cards.length * 0.6 ? "pass" : cards.length > 0 ? "warn" : "fail",
      blameMissing(complete > 0, rawHas(ctx.raw, /metodologia|objectivo do estudo|principais resultados/i)),
      `${complete}/${cards.length} fichas completas`
    )
  );

  // Extractor field-bleed heuristic: objective absorbs other section labels
  const bleed = cards.filter((card) =>
    /\b(metodologia|principais resultados|limita[çc][õo]es|conclus[õo]es)\b/i.test(str(card.objective))
  ).length;
  c.push(
    mk(
      "PR-005.C3",
      "Os campos das fichas estão bem segmentados (sem field-bleed)",
      "completeness",
      bleed === 0 ? "pass" : "fail",
      cards.length > 0 && bleed > 0 ? "extractor" : "none",
      bleed === 0 ? "campos limpos" : `${bleed} fichas com objectivo a absorver outros campos`
    )
  );

  // Consistency — fichas correspondem a artigos seleccionados (PR-004)
  if (ctx.prev && Array.isArray(ctx.prev.articles)) {
    const selIds = new Set(
      (ctx.prev.articles as Record<string, unknown>[]).filter((x) => x.selected === true).map((x) => String(x.id))
    );
    const match = cards.filter((card) => selIds.has(String(card.articleId))).length;
    c.push(
      mk(
        "PR-005.X1",
        "[consistência] Fichas correspondem aos artigos seleccionados (PR-004)",
        "consistency",
        cards.length > 0 && match >= cards.length * 0.6 ? "pass" : "warn",
        "none",
        `${match}/${cards.length} fichas rastreáveis à selecção`
      )
    );
  }
  return c;
}

function evalPR006(ctx: EvalContext): CriterionResult[] {
  const a = ctx.artifact;
  const rows = arr(a.rows) as Record<string, unknown>[];
  const conv = arr(a.convergences).map(str).filter(has);
  const div = arr(a.divergences).map(str).filter(has);
  const c: CriterionResult[] = [];

  c.push(
    mk(
      "PR-006.C1",
      "A tabela comparativa inclui os artigos seleccionados",
      "completeness",
      rows.length > 0 ? "pass" : "fail",
      blameMissing(rows.length > 0, rawHas(ctx.raw, /\|.*\|.*\|/)),
      `${rows.length} linhas na tabela`
    )
  );
  c.push(
    mk(
      "PR-006.C2",
      "Convergências entre estudos estão identificadas",
      "scientific-rigor",
      conv.length > 0 ? "pass" : "fail",
      blameMissing(conv.length > 0, rawHas(ctx.raw, /converg[êe]ncia|concord/i)),
      `${conv.length} convergências`
    )
  );
  c.push(
    mk(
      "PR-006.C3",
      "Divergências entre estudos estão identificadas",
      "scientific-rigor",
      div.length > 0 ? "pass" : "fail",
      blameMissing(div.length > 0, rawHas(ctx.raw, /diverg[êe]ncia|contradi[çc]/i)),
      `${div.length} divergências`
    )
  );

  // Consistency — nº de linhas ≈ nº de fichas (PR-005)
  if (ctx.prev && Array.isArray(ctx.prev.cards)) {
    const cardCount = (ctx.prev.cards as unknown[]).length;
    c.push(
      mk(
        "PR-006.X1",
        "[consistência] Linhas da tabela cobrem as fichas (PR-005)",
        "consistency",
        cardCount === 0 || rows.length >= cardCount * 0.6 ? "pass" : "warn",
        "none",
        `${rows.length} linhas para ${cardCount} fichas`
      )
    );
  }
  return c;
}

function evalPR007(ctx: EvalContext): CriterionResult[] {
  const gaps = arr(ctx.artifact.gaps) as Record<string, unknown>[];
  const withDesc = gaps.filter((g) => has(g.description)).length;
  const c: CriterionResult[] = [];

  c.push(
    mk(
      "PR-007.C1",
      "Foram identificadas pelo menos 3 lacunas",
      "scientific-rigor",
      gaps.length >= 3 ? "pass" : gaps.length >= 1 ? "warn" : "fail",
      blameMissing(gaps.length >= 1, rawHas(ctx.raw, /lacuna|gap|n[ãa]o.*respond/i)),
      `${gaps.length} lacunas`
    )
  );
  c.push(
    mk(
      "PR-007.C2",
      "As lacunas estão descritas/fundamentadas",
      "scientific-rigor",
      gaps.length > 0 && withDesc >= gaps.length * 0.8 ? "pass" : gaps.length > 0 ? "warn" : "fail",
      "modelo",
      `${withDesc}/${gaps.length} com descrição`
    )
  );
  c.push(
    mk(
      "PR-007.C3",
      "Pelo menos uma lacuna é relevante para a pergunta",
      "consistency",
      "manual",
      "none",
      "requer julgamento",
      false
    )
  );
  return c;
}

function evalPR008(ctx: EvalContext): CriterionResult[] {
  const a = ctx.artifact;
  const themes = arr(a.themes) as Record<string, unknown>[];
  const trends = arr(a.trends).map(str).filter(has);
  const contra = arr(a.contradictions).map(str).filter(has);
  const c: CriterionResult[] = [];

  c.push(
    mk(
      "PR-008.C1",
      "A síntese está organizada por temas (≥2) e não por artigos",
      "scientific-rigor",
      themes.length >= 2 ? "pass" : themes.length === 1 ? "warn" : "fail",
      blameMissing(themes.length >= 1, rawHas(ctx.raw, /tema\s*\d|theme|categoria/i)),
      `${themes.length} temas`
    )
  );
  const named = themes.filter((t) => has(t.name) && !/^tema \d+$/i.test(str(t.name))).length;
  c.push(
    mk(
      "PR-008.C2",
      "Os principais temas estão claramente identificados",
      "completeness",
      themes.length > 0 && named >= themes.length * 0.6 ? "pass" : themes.length > 0 ? "warn" : "fail",
      themes.length > 0 && named < themes.length * 0.6 ? "extractor" : "none",
      `${named}/${themes.length} temas com nome próprio`
    )
  );
  c.push(
    mk(
      "PR-008.C3",
      "Tendências e padrões estão explicitados",
      "scientific-rigor",
      trends.length > 0 ? "pass" : "warn",
      blameMissing(trends.length > 0, rawHas(ctx.raw, /tend[êe]nc|padr[õo]|trend/i)),
      `${trends.length} tendências`
    )
  );
  c.push(
    mk(
      "PR-008.C4",
      "Contradições entre estudos estão identificadas",
      "scientific-rigor",
      contra.length > 0 ? "pass" : "warn",
      blameMissing(contra.length > 0, rawHas(ctx.raw, /contradi|diverg/i)),
      `${contra.length} contradições`
    )
  );
  return c;
}

function evalPR009(ctx: EvalContext): CriterionResult[] {
  const a = ctx.artifact;
  const intro = str(a.introduction);
  const body = str(a.body);
  const concl = str(a.conclusion);
  const refs = arr(a.references).map(str).filter(has);
  const wc = typeof a.wordCount === "number" ? (a.wordCount as number) : 0;
  const c: CriterionResult[] = [];

  c.push(
    mk(
      "PR-009.C1",
      "O texto possui introdução, desenvolvimento e conclusão",
      "completeness",
      has(intro) && has(body) && has(concl) ? "pass" : "fail",
      blameMissing(has(intro) && has(body) && has(concl), rawHas(ctx.raw, /introdu[çc]|conclus|considera/i)),
      `intro=${has(intro)}, corpo=${has(body)}, conclusão=${has(concl)}`
    )
  );
  c.push(
    mk(
      "PR-009.C2",
      "As afirmações são suportadas por referências",
      "scientific-rigor",
      refs.length >= 3 ? "pass" : refs.length >= 1 ? "warn" : "fail",
      blameMissing(refs.length >= 1, rawHas(ctx.raw, /refer[êe]nc|\(\d{4}\)|bibliografia/i)),
      `${refs.length} referências`
    )
  );
  c.push(
    mk(
      "PR-009.C3",
      "Extensão adequada (1500-3000 palavras)",
      "completeness",
      wc >= 1500 && wc <= 3500 ? "pass" : wc >= 700 ? "warn" : "fail",
      "modelo",
      `${wc} palavras`
    )
  );

  // Consistency — a revisão menciona os temas da síntese (PR-008)
  if (ctx.prev && Array.isArray(ctx.prev.themes)) {
    const names = (ctx.prev.themes as Record<string, unknown>[])
      .map((t) => str(t.name))
      .filter((n) => n && !/^tema \d+$/i.test(n));
    const full = `${intro}\n${body}\n${concl}`.toLowerCase();
    const mentioned = names.filter((n) => full.includes(n.toLowerCase().split(/\s+/)[0] ?? "###")).length;
    c.push(
      mk(
        "PR-009.X1",
        "[consistência] A revisão integra os temas da síntese (PR-008)",
        "consistency",
        names.length === 0 || mentioned >= Math.ceil(names.length / 2) ? "pass" : "warn",
        "none",
        `${mentioned}/${names.length} temas referidos`
      )
    );
  }
  return c;
}

function evalPR010(ctx: EvalContext): CriterionResult[] {
  const a = ctx.artifact;
  const body = str(a.body) || str(a.content);
  const c: CriterionResult[] = [];
  c.push(
    mk(
      "PR-010.C1",
      "O checklist final foi produzido e avaliado",
      "completeness",
      has(body) ? "pass" : "fail",
      blameMissing(has(body), rawHas(ctx.raw, /checklist|✓|✗|cumprid/i)),
      has(body) ? `${words(body)} palavras` : "vazio"
    )
  );
  c.push(
    mk(
      "PR-010.C2",
      "Confirmação pessoal de cada item pelo investigador",
      "scientific-rigor",
      "manual",
      "none",
      "acção humana obrigatória",
      false
    )
  );
  return c;
}

/* ─── Reuse dimension (shared) ───────────────────────────────────── */

function evalReuse(step: number, ctx: EvalContext): CriterionResult[] {
  if (!ctx.reuse) return [];
  const { unresolved, requiredVars } = ctx.reuse;
  const ok = unresolved.length === 0;
  return [
    mk(
      `PR-${String(step).padStart(3, "0")}.R1`,
      "[circulação] O passo recebeu todo o contexto dos passos anteriores",
      "reuse",
      requiredVars.length === 0 ? "na" : ok ? "pass" : "fail",
      ok ? "none" : "runtime",
      requiredVars.length === 0
        ? "não depende de artefactos anteriores"
        : ok
        ? `todas as ${requiredVars.length} variáveis resolvidas`
        : `por resolver: ${unresolved.join(", ")}`
    ),
  ];
}

/* ─── Public API ─────────────────────────────────────────────────── */

const STEP_META: Record<number, { name: string; artifact: string }> = {
  1: { name: "PR-001 — Tema", artifact: "tema" },
  2: { name: "PR-002 — Pergunta", artifact: "pergunta" },
  3: { name: "PR-003 — Busca", artifact: "article-list" },
  4: { name: "PR-004 — Selecção", artifact: "selection" },
  5: { name: "PR-005 — Fichas de Leitura", artifact: "reading-cards" },
  6: { name: "PR-006 — Comparação", artifact: "comparison-table" },
  7: { name: "PR-007 — Lacunas", artifact: "gaps" },
  8: { name: "PR-008 — Síntese", artifact: "synthesis" },
  9: { name: "PR-009 — Revisão", artifact: "review" },
  10: { name: "PR-010 — Validação", artifact: "export" },
};

const EVALUATORS: Record<number, (ctx: EvalContext) => CriterionResult[]> = {
  1: evalPR001,
  2: evalPR002,
  3: evalPR003,
  4: evalPR004,
  5: evalPR005,
  6: evalPR006,
  7: evalPR007,
  8: evalPR008,
  9: evalPR009,
  10: evalPR010,
};

export function evaluateStepQuality(step: number, ctx: EvalContext): StepQuality {
  const meta = STEP_META[step] ?? { name: `PR-${String(step).padStart(3, "0")}`, artifact: "unknown" };
  const criteria = [...(EVALUATORS[step]?.(ctx) ?? []), ...evalReuse(step, ctx)];

  const automatable = criteria.filter((r) => r.automatable && r.status !== "na");
  const scoreUnit = automatable.reduce(
    (s, r) => s + (r.status === "pass" ? 1 : r.status === "warn" ? 0.5 : 0),
    0
  );
  const score = automatable.length > 0 ? Math.round((scoreUnit / automatable.length) * 100) : 100;
  const passed = automatable.every((r) => r.status !== "fail");

  const blame = { prompt: 0, extractor: 0, runtime: 0, modelo: 0 };
  for (const r of criteria) {
    if (r.status === "fail" || r.status === "warn") {
      if (r.blame === "prompt") blame.prompt++;
      else if (r.blame === "extractor") blame.extractor++;
      else if (r.blame === "runtime") blame.runtime++;
      else if (r.blame === "modelo") blame.modelo++;
    }
  }
  const manualCount = criteria.filter((r) => r.status === "manual").length;

  return {
    step,
    stepName: meta.name,
    artifactType: meta.artifact,
    criteria,
    score,
    passed,
    blame,
    manualCount,
  };
}

/* ─── References: reused vs hallucinated ─────────────────────────── */

export interface ReferenceAudit {
  total: number;
  reused: number; // traceable to an article retrieved in PR-003/PR-004
  hallucinated: number; // cited but NOT traceable to any retrieved article
  items: { reference: string; reused: boolean; matchedTitle?: string }[];
}

function surname(authors: string): string {
  const first = (authors || "").split(/[,;]/)[0]?.trim() ?? "";
  const tokens = first.split(/\s+/);
  return (tokens[tokens.length - 1] || "").toLowerCase();
}
const STOP = new Set(["the", "and", "for", "with", "from", "generative", "artificial", "intelligence", "study", "análise", "using", "based", "review"]);
function titleWords(t: string): Set<string> {
  return new Set(
    (t || "")
      .toLowerCase()
      .replace(/[^\p{L}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 4 && !STOP.has(w))
  );
}

/**
 * Audit the references produced in PR-009 against the articles actually
 * retrieved (PR-003/PR-004). A reference is "reused" when it is traceable to a
 * retrieved article (author surname + year, or ≥2 significant title words);
 * otherwise it is flagged as a potential hallucination (a citation the pipeline
 * cannot ground in any source it actually saw).
 */
export function auditReferences(
  references: string[],
  articles: { title?: string; authors?: string; year?: string | number }[]
): ReferenceAudit {
  const items = references.map((ref) => {
    const refLower = ref.toLowerCase();
    let matchedTitle: string | undefined;
    for (const art of articles) {
      const sn = surname(String(art.authors ?? ""));
      const yr = String(art.year ?? "");
      const bySurnameYear = sn.length > 2 && refLower.includes(sn) && (!yr || refLower.includes(yr));
      let byTitle = false;
      if (!bySurnameYear && art.title) {
        const tw = titleWords(String(art.title));
        const rw = titleWords(ref);
        let overlap = 0;
        for (const w of tw) if (rw.has(w)) overlap++;
        byTitle = overlap >= 2;
      }
      if (bySurnameYear || byTitle) {
        matchedTitle = art.title;
        break;
      }
    }
    return { reference: ref, reused: !!matchedTitle, matchedTitle };
  });
  const reused = items.filter((i) => i.reused).length;
  return { total: items.length, reused, hallucinated: items.length - reused, items };
}

/* ─── Typed step I/O (context continuity chain) ──────────────────── */

export interface StepInput {
  label: string;
  type: string; // e.g. "ArticleRepository", "ReadingCards", "ComparativeAnalysis"
  fromStep: number; // scientifically-correct producing step (0 = workspace)
  var?: string; // the prompt variable that should carry this input
}
export interface StepIODef {
  inputs: StepInput[];
  output: { label: string; type: string };
}

/** The intended scientific data-flow of RL-01 (what each step SHOULD consume/produce). */
export const STEP_IO: Record<number, StepIODef> = {
  1: { inputs: [{ label: "Área + Tópico", type: "Workspace", fromStep: 0 }], output: { label: "Tema", type: "TemaArtifact" } },
  2: { inputs: [{ label: "Tema", type: "TemaArtifact", fromStep: 1, var: "research_topic" }], output: { label: "Pergunta + Objectivos + Keywords", type: "PerguntaArtifact" } },
  3: { inputs: [{ label: "Keywords (EN)", type: "PerguntaArtifact", fromStep: 2, var: "research_question_en" }], output: { label: "Lista de artigos", type: "ArticleRepository" } },
  4: { inputs: [{ label: "Lista de artigos", type: "ArticleRepository", fromStep: 3, var: "article_list" }], output: { label: "Seleção + Critérios", type: "SelectionArtifact" } },
  5: { inputs: [{ label: "Artigos seleccionados", type: "ArticleRepository(selected)", fromStep: 4, var: "article_text" }], output: { label: "Fichas de leitura", type: "ReadingCards" } },
  6: { inputs: [{ label: "Fichas de leitura", type: "ReadingCards", fromStep: 5, var: "reading_cards" }], output: { label: "Tabela comparativa", type: "ComparativeAnalysis" } },
  7: { inputs: [{ label: "Análise comparativa", type: "ComparativeAnalysis", fromStep: 6, var: "comparative_analysis" }], output: { label: "Lacunas", type: "Gaps" } },
  8: { inputs: [{ label: "Análise comparativa", type: "ComparativeAnalysis", fromStep: 6, var: "all_analysis" }], output: { label: "Síntese temática", type: "Synthesis" } },
  9: {
    inputs: [
      { label: "Síntese", type: "Synthesis", fromStep: 8, var: "thematic_synthesis" },
      { label: "Lacunas", type: "Gaps", fromStep: 7, var: "gaps" },
    ],
    output: { label: "Revisão da Literatura", type: "Review" },
  },
  10: { inputs: [{ label: "Revisão", type: "Review", fromStep: 9, var: "literature_review" }], output: { label: "Checklist / Export", type: "Export" } },
};

/**
 * Which step the CURRENT variableResolver actually sources each var from (reflects
 * the code, including known chicken-and-egg bugs). Compare against STEP_IO's
 * expected `fromStep` to detect mis-wiring statically (a RUNTIME defect).
 */
export const VAR_RESOLVER_SOURCE: Record<string, number> = {
  studyArea: 0, researchTopic: 0, academicLevel: 0,
  research_topic: 1, tema_delimited: 1, tema_feasibility: 1,
  research_question: 2, research_question_pt: 2, research_question_en: 2, general_objective: 2, specific_objectives: 2, keywords_pt: 2, keywords_en: 2,
  article_list: 3,
  selected_articles: 4, inclusion_criteria: 4, exclusion_criteria: 4,
  reading_cards: 5, article_text: 4, // fixed R1: article_text now fed from PR-004 selection
  comparative_analysis: 6,
  gaps: 7,
  all_analysis: 6, thematic_synthesis: 8, // fixed R1: all_analysis now fed from PR-006 comparison
  literature_review: 9,
};

/* ─── Hallucination: citations used vs present in repository ──────── */

export interface CitationAudit {
  used: number; // distinct citations in the review (body + reference list)
  inRepository: number; // traceable to a retrieved article
  invented: number; // cited but absent from the repository
  items: { citation: string; present: boolean }[];
}

/**
 * Extract in-text citations (Autor, Ano) + the reference list from a review and
 * check each against the articles actually retrieved (PR-003). Answers the key
 * scientific question: "did the model cite things it never actually saw?"
 */
export function auditReviewCitations(
  reviewRaw: string,
  referenceList: string[],
  articles: { title?: string; authors?: string; year?: string | number }[]
): CitationAudit {
  const cites = new Map<string, string>(); // key surname|year → display
  // In-text: "Smith (2024)", "Smith et al. (2024)", "Smith e Jones (2024)"
  const re = /([A-ZÀ-Ý][A-Za-zÀ-ÿ'’.-]+(?:\s+(?:et al\.?|e\s+[A-ZÀ-Ý][A-Za-zÀ-ÿ'’.-]+|&\s+[A-ZÀ-Ý][A-Za-zÀ-ÿ'’.-]+))?)\s*[,(]\s*(\d{4})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(reviewRaw)) !== null) {
    const surname = m[1].split(/\s+/)[0].toLowerCase().replace(/[^a-zà-ÿ]/g, "");
    if (surname.length > 2) cites.set(`${surname}|${m[2]}`, `${m[1]} (${m[2]})`);
  }
  // Reference-list entries also count as "used"
  for (const ref of referenceList) {
    const ym = ref.match(/\b(19|20)\d{2}\b/);
    const sm = ref.match(/[A-ZÀ-Ý][A-Za-zÀ-ÿ'’.-]{2,}/);
    if (ym && sm) cites.set(`${sm[0].toLowerCase()}|${ym[0]}`, ref.slice(0, 90));
  }

  const items = [...cites.entries()].map(([key, display]) => {
    const [sn, yr] = key.split("|");
    const present = articles.some((a) => {
      const asn = String(a.authors ?? "").split(/[,;]/)[0]?.trim().split(/\s+/).pop()?.toLowerCase() ?? "";
      const ay = String(a.year ?? "");
      if (asn.length > 2 && asn === sn && (!ay || ay === yr)) return true;
      // title fallback: surname appears in title words is unreliable; skip
      return false;
    });
    return { citation: display, present };
  });
  const inRepository = items.filter((i) => i.present).length;
  return { used: items.length, inRepository, invented: items.length - inRepository, items };
}

/** Which prompt variables each step's prompt requires (for the reuse dimension). */
export const STEP_REQUIRED_VARS: Record<number, string[]> = {
  1: ["studyArea", "researchTopic", "academicLevel"],
  2: ["researchTopic", "studyArea", "academicLevel"],
  3: [],
  4: ["article_list"],
  5: ["article_text", "reading_cards"],
  6: ["reading_cards"],
  7: ["comparative_analysis", "gaps"],
  8: ["all_analysis", "thematic_synthesis"],
  9: ["thematic_synthesis", "literature_review"],
  10: ["literature_review"],
};
