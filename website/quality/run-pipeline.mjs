/**
 * RL-01 Live Pipeline Runner + Consistency Report
 * ================================================
 * Runs the FULL 10-step RL-01 protocol live against one engine, using the REAL
 * extractors (lib/artifactExtractor.ts) AND the REAL variable resolver
 * (lib/variableResolver.ts) — so it tests the platform's *context circulation*,
 * not just isolated prompts/extractors.
 *
 * For every step it records: what the resolver injected, which {{vars}} stayed
 * unresolved (⇒ an earlier step failed to feed this one), the produced artifact,
 * and its scientific-quality score against the protocol criteria.
 *
 * Usage (from website/, dev server running):
 *   node --experimental-strip-types quality/run-pipeline.mjs --engine google --theme edu
 *
 * Output: quality/consistency-<engine>-<theme>.json + console consistency report.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractTemaArtifact,
  extractPerguntaArtifact,
  extractSelectionArtifact,
  extractReadingCardsArtifact,
  extractComparisonTableArtifact,
  extractGapsArtifact,
  extractSynthesisArtifact,
  extractReviewArtifact,
} from "../lib/artifactExtractor.ts";
import { resolveWithArtifacts, buildArtifactVariables } from "../lib/variableResolver.ts";
import { evaluateStepQuality, STEP_IO, VAR_RESOLVER_SOURCE, auditReviewCitations } from "../lib/scientificCriteria.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEBSITE = path.resolve(HERE, "..");
const ROOT = path.resolve(WEBSITE, "..");

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const engine = opt("engine", "google");
const themeKey = opt("theme", "edu");

const THEMES = {
  edu: { studyArea: "Educação", researchTopic: "Uso de IA generativa no ensino superior em Portugal", academicLevel: "mestrado" },
  eng: { studyArea: "Engenharia", researchTopic: "Sustentabilidade energética em edifícios inteligentes", academicLevel: "licenciatura" },
  sau: { studyArea: "Saúde", researchTopic: "Telemedicina na atenção primária em países lusófonos", academicLevel: "doutoramento" },
};
const theme = THEMES[themeKey] ?? THEMES.edu;

/** Which step is expected to PRODUCE each variable (for circulation attribution). */
const VAR_PRODUCER = {
  studyArea: 0, researchTopic: 0, academicLevel: 0,
  research_topic: 1, tema_delimited: 1, tema_feasibility: 1,
  research_question: 2, research_question_pt: 2, research_question_en: 2,
  general_objective: 2, specific_objectives: 2, keywords_pt: 2, keywords_en: 2,
  article_list: 3,
  selected_articles: 4, inclusion_criteria: 4, exclusion_criteria: 4,
  reading_cards: 5, article_text: 5,
  comparative_analysis: 6,
  gaps: 7,
  all_analysis: 8, thematic_synthesis: 8,
  literature_review: 9,
};

const findVars = (txt) => [...new Set([...txt.matchAll(/\{\{([^}]+)\}\}/g)].map((m) => m[1].trim()))];
const loadPrompt = (step) => fs.readFileSync(path.join(ROOT, "prompts", `PR-${String(step).padStart(3, "0")}`, "prompt.md"), "utf8");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callExec(prompt) {
  for (let attempt = 1; attempt <= 5; attempt++) {
    const t0 = Date.now();
    const res = await fetch("http://localhost:3000/api/execution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ engine, prompt, profile: { maxTokens: 8192 } }),
    });
    const j = await res.json();
    if (j.success) return { ...j, elapsedMs: Date.now() - t0 };
    // Retry on rate limit (429) respecting the API's retryDelay hint.
    if (/\b429\b/.test(j.error || "") && attempt < 5) {
      const hint = (j.error.match(/retryDelay["']?:\s*["']?(\d+)s/) || [])[1];
      const waitMs = (hint ? Number(hint) : 20) * 1000 + 4000;
      console.log(`   ⏳ 429 (tokens/min) — aguardar ${Math.round(waitMs / 1000)}s e repetir (tentativa ${attempt}/5)`);
      await sleep(waitMs);
      continue;
    }
    return { ...j, elapsedMs: Date.now() - t0 };
  }
}
async function callSearch(query) {
  const t0 = Date.now();
  const res = await fetch("http://localhost:3000/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, maxResults: 20 }),
  });
  const j = await res.json();
  return { ...j, elapsedMs: Date.now() - t0 };
}

// ─── workspace (what the real resolver consumes) ──────────────────
const workspace = {
  studyArea: theme.studyArea,
  researchTopic: theme.researchTopic,
  academicLevel: theme.academicLevel,
  artifacts: {},
  articleRepository: [],
  progress: {},
};

const prevForStep = { 2: 1, 5: 4, 6: 5, 9: 8 }; // consistency previous-artifact wiring
const stepReport = [];
let reviewRaw = ""; // captured at PR-009 for citation/hallucination audit
const pad = (n) => `PR-${String(n).padStart(3, "0")}`;

/** Human-readable summary of a resolved variable's value (for the variables table). */
function valueSummary(name, value) {
  const arts = workspace.articleRepository ?? [];
  const rc = workspace.artifacts?.[5]?.data;
  const cmp = workspace.artifacts?.[6]?.data;
  const gp = workspace.artifacts?.[7]?.data;
  const syn = workspace.artifacts?.[8]?.data;
  switch (name) {
    case "article_list": return `${arts.length} artigos`;
    case "article_text": return value ? `texto (${value.length} car.)` : "vazio";
    case "selected_articles": return `${arts.filter((a) => a.selected).length} seleccionados`;
    case "reading_cards": return rc ? `${rc.cards?.length ?? 0} fichas` : "vazio";
    case "comparative_analysis": return cmp ? `tabela ${cmp.rows?.length ?? 0} linhas` : (value ? `${value.length} car.` : "vazio");
    case "gaps": return gp ? `${gp.gaps?.length ?? 0} lacunas` : (value ? `${value.length} car.` : "vazio");
    case "thematic_synthesis": case "all_analysis": return syn ? `${syn.themes?.length ?? 0} temas` : (value ? `${value.length} car.` : "vazio");
    case "research_question": case "research_question_pt": return value ? `"${value.slice(0, 60)}…"` : "vazio";
    case "research_question_en": case "keywords_en": return value ? value.slice(0, 60) : "vazio";
    case "research_topic": return value ? `"${value.slice(0, 50)}…"` : "vazio";
    default: return value ? `${value.length} car.` : "vazio";
  }
}

/** Build the typed continuity entry + variable table + traceability for a step. */
function buildContinuity(step, vars, requiredVars) {
  const io = STEP_IO[step];
  const inputs = (io?.inputs ?? []).map((inp) => {
    const val = inp.var ? vars[inp.var] : "workspace";
    const resolved = inp.var ? !!(typeof val === "string" && val.trim()) : true;
    const actualSource = inp.var != null ? VAR_RESOLVER_SOURCE[inp.var] : 0;
    const misWired = inp.var != null && actualSource != null && actualSource !== inp.fromStep;
    let brk = "";
    if (!resolved) brk = `não recebeu ${inp.type} — variável {{${inp.var}}} vazia (esperado do ${pad(inp.fromStep)})`;
    else if (misWired) brk = `{{${inp.var}}} é alimentada pelo ${pad(actualSource)} e não pelo ${pad(inp.fromStep)} — mis-wiring do resolver`;
    return { label: inp.label, type: inp.type, fromStep: inp.fromStep, var: inp.var ?? null, resolved, misWired, value: inp.var ? valueSummary(inp.var, typeof val === "string" ? val : "") : "—", break: brk };
  });
  const state = inputs.every((i) => i.resolved && !i.misWired) ? "ok" : inputs.some((i) => !i.resolved) ? "broken" : "mis-wired";

  // variable-resolution table (per required var)
  const variables = requiredVars.map((v) => {
    const val = vars[v];
    const ok = !!(typeof val === "string" && val.trim());
    return { var: v, origin: VAR_RESOLVER_SOURCE[v] != null ? pad(VAR_RESOLVER_SOURCE[v]) : "?", value: valueSummary(v, typeof val === "string" ? val : ""), resolved: ok };
  });

  // traceability — which upstream artifacts fed this step
  const derivedFrom = inputs
    .filter((i) => i.resolved)
    .map((i) => ({ step: pad(i.misWired ? VAR_RESOLVER_SOURCE[i.var] : i.fromStep), type: i.type, label: i.label }));

  return { io: io?.output ?? null, inputs, state, variables, derivedFrom };
}

const pickMaxBlame = (b) => {
  const order = ["runtime", "extractor", "modelo", "prompt"];
  let best = "modelo", n = -1;
  for (const k of order) if ((b?.[k] ?? 0) > n) { n = b[k]; best = k; }
  return n > 0 ? best : "modelo";
};

console.log(`\n${"═".repeat(80)}`);
console.log(`RL-01 PIPELINE LIVE · engine=${engine} · tema="${theme.researchTopic}"`);
console.log(`${"═".repeat(80)}`);

for (let step = 1; step <= 10; step++) {
  const stepName = `PR-${String(step).padStart(3, "0")}`;
  const template = loadPrompt(step);
  const requiredVars = findVars(template);
  const vars = buildArtifactVariables(workspace); // what THIS step can consume from prior artifacts
  let raw = "";
  let artifact = {};
  let unresolved = [];
  let meta = {};

  try {
    if (step === 3) {
      // Search step. The APP currently sends researchQuestion || researchTopic
      // (often markdown-polluted / pt) → poor OpenAlex results. The runner uses a
      // CLEAN English-keywords query so the downstream chain gets real articles,
      // and records the divergence as a finding.
      const pergunta = workspace.artifacts?.[2]?.data ?? {};
      const appQuery = pergunta.researchQuestion || theme.researchTopic;
      const kwEn = (pergunta.keywordsEN ?? []).filter(Boolean);
      const cleanQuery = kwEn.length ? kwEn.join(" ") : appQuery.replace(/[>*#`_]/g, " ").replace(/\s+/g, " ").trim();
      const r = await callSearch(cleanQuery);
      const articles = r.success ? r.articles ?? [] : [];
      workspace.articleRepository = articles;
      artifact = { articles, searchQueries: [cleanQuery] };
      workspace.artifacts[3] = { data: artifact };
      meta = { query: cleanQuery, appQuery, appQueryPolluted: appQuery !== cleanQuery && /[>*#`]/.test(appQuery), articleCount: articles.length, withAbstract: articles.filter((a) => a.abstract).length, elapsedMs: r.elapsedMs };
      console.log(`\n[${stepName}] busca "${cleanQuery.slice(0, 60)}" → ${articles.length} artigos (${(r.elapsedMs / 1000).toFixed(1)}s)`);
    } else {
      if (step > 1) await sleep(6000); // gentle spacing to respect per-minute free-tier limits
      const resolved = resolveWithArtifacts(template, workspace, step);
      unresolved = findVars(resolved);
      const r = await callExec(resolved);
      if (!r.success) throw new Error(r.error || "exec failed");
      raw = r.content || "";
      if (step === 9) reviewRaw = raw;
      meta = { model: r.model, tokens: r.tokensUsed, elapsedMs: r.elapsedMs };
      fs.writeFileSync(path.join(HERE, `live-${engine}-${themeKey}-${stepName}.txt`), raw);

      switch (step) {
        case 1: artifact = extractTemaArtifact(raw, theme); break;
        case 2: artifact = extractPerguntaArtifact(raw); break;
        case 4:
          artifact = extractSelectionArtifact(raw, workspace.articleRepository);
          // propagate selection flags back to the repository (as the app does)
          workspace.articleRepository = artifact.articles.map((a) => ({ ...a }));
          break;
        case 5: artifact = extractReadingCardsArtifact(raw, workspace.articleRepository); break;
        case 6: artifact = extractComparisonTableArtifact(raw); break;
        case 7: artifact = extractGapsArtifact(raw); break;
        case 8: artifact = extractSynthesisArtifact(raw); break;
        case 9: artifact = extractReviewArtifact(raw); break;
        case 10: artifact = { format: "markdown", content: raw }; break;
      }
      workspace.artifacts[step] = { data: artifact };
      console.log(`\n[${stepName}] resolvido (${requiredVars.length - unresolved.length}/${requiredVars.length} vars) · ${r.tokensUsed} tokens · ${(r.elapsedMs / 1000).toFixed(1)}s`);
      if (unresolved.length) console.log(`   ⚠ por resolver: ${unresolved.join(", ")}`);
    }
  } catch (err) {
    console.log(`\n[${stepName}] ✗ ${String(err.message).slice(0, 100)}`);
    stepReport.push({ step, stepName, error: String(err.message), requiredVars, unresolved });
    continue;
  }

  // evaluate
  const ctx = {
    artifact,
    raw,
    prev: workspace.artifacts?.[prevForStep[step]]?.data,
    articles: workspace.articleRepository,
    reuse: step === 3 ? undefined : { stepName, unresolved, requiredVars },
  };
  const q = evaluateStepQuality(step, ctx);

  const consumed = requiredVars
    .filter((v) => !unresolved.includes(v))
    .map((v) => ({ var: v, fromStep: VAR_PRODUCER[v] ?? "?" }));
  const brokenCirculation = unresolved.map((v) => ({ var: v, expectedFromStep: VAR_PRODUCER[v] ?? "?" }));

  // Rich instrumentation: typed continuity, variable table, traceability, blame root-cause
  const cont = buildContinuity(step, vars, requiredVars);
  const starved = cont.inputs.some((i) => !i.resolved);
  const dominantBlame = q.passed ? "none" : starved ? "runtime" : pickMaxBlame(q.blame);

  stepReport.push({
    step, stepName, artifactType: q.artifactType,
    quality: { score: q.score, passed: q.passed, blame: q.blame },
    circulation: { requiredVars, consumed, unresolved: brokenCirculation },
    continuity: { output: cont.io, inputs: cont.inputs, state: cont.state },
    variables: cont.variables,
    derivedFrom: cont.derivedFrom,
    starved,
    dominantBlame,
    criteria: q.criteria,
    meta,
  });
  console.log(`   qualidade ${q.score}/100 ${q.passed ? "✓" : "✗"} | consistência: ${q.criteria.filter((c) => c.dimension === "consistency").map((c) => `${c.id.split(".").pop()}=${c.status}`).join(" ") || "—"}`);
}

// ─── aggregate consistency report ────────────────────────────────
const evaluated = stepReport.filter((s) => s.quality);
const consistencyCriteria = evaluated.flatMap((s) => s.criteria.filter((c) => c.dimension === "consistency"));
const reuseCriteria = evaluated.flatMap((s) => s.criteria.filter((c) => c.dimension === "reuse"));
const totalRequired = evaluated.reduce((n, s) => n + s.circulation.requiredVars.length, 0);
const totalUnresolved = evaluated.reduce((n, s) => n + s.circulation.unresolved.length, 0);

const findings = [];
for (const s of evaluated) {
  for (const u of s.circulation.unresolved) {
    findings.push(`${s.stepName}: variável {{${u.var}}} por resolver (devia vir do PR-${String(u.expectedFromStep).padStart(3, "0")})`);
  }
}
const search3 = stepReport.find((s) => s.step === 3)?.meta;
if (search3?.appQueryPolluted) {
  findings.push(`PR-003: a query que a APP envia está poluída com markdown/pt ("${String(search3.appQuery).slice(0, 40)}…"); o runner usou keywords EN limpas.`);
}

// hallucination — citations used vs present in the retrieved repository
const citations = reviewRaw
  ? auditReviewCitations(reviewRaw, workspace.artifacts?.[9]?.data?.references ?? [], workspace.articleRepository ?? [])
  : { used: 0, inRepository: 0, invented: 0, items: [] };

// engine-dependency: root-cause blame per failing step, aggregated
const blameByCategory = { prompt: 0, extractor: 0, runtime: 0, modelo: 0 };
for (const s of stepReport) {
  if (s.dominantBlame && s.dominantBlame !== "none") blameByCategory[s.dominantBlame]++;
}

// static resolver mis-wiring (independent of this run's data)
const wiringIssues = [];
for (const [stepStr, io] of Object.entries(STEP_IO)) {
  for (const inp of io.inputs) {
    if (inp.var != null && VAR_RESOLVER_SOURCE[inp.var] != null && VAR_RESOLVER_SOURCE[inp.var] !== inp.fromStep) {
      wiringIssues.push(`${pad(Number(stepStr))}: {{${inp.var}}} devia vir do ${pad(inp.fromStep)} mas o resolver busca-a do ${pad(VAR_RESOLVER_SOURCE[inp.var])}`);
    }
  }
}

const report = {
  engine, theme: theme.researchTopic, themeKey,
  model: stepReport.find((s) => s.meta?.model)?.meta?.model ?? engine,
  articles: (workspace.articleRepository ?? []).map((a) => ({ id: a.id, title: a.title, authors: a.authors, year: a.year })),
  reviewReferences: workspace.artifacts?.[9]?.data?.references ?? [],
  overall: {
    stepsEvaluated: evaluated.length,
    avgScore: evaluated.length ? Math.round(evaluated.reduce((n, s) => n + s.quality.score, 0) / evaluated.length) : 0,
    passedSteps: evaluated.filter((s) => s.quality.passed).length,
    consistencyScore: consistencyCriteria.length ? Math.round((consistencyCriteria.filter((c) => c.status === "pass").length / consistencyCriteria.length) * 100) : null,
    circulationScore: totalRequired ? Math.round(((totalRequired - totalUnresolved) / totalRequired) * 100) : 100,
    varsRequired: totalRequired, varsUnresolved: totalUnresolved,
    citations: { used: citations.used, inRepository: citations.inRepository, invented: citations.invented },
    blameByCategory,
  },
  circulationFindings: findings,
  wiringIssues,
  citations,
  blameByCategory,
  steps: stepReport,
};
fs.writeFileSync(path.join(HERE, `consistency-${engine}-${themeKey}.json`), JSON.stringify(report, null, 2));

console.log(`\n${"═".repeat(80)}`);
console.log(`RELATÓRIO DE CONSISTÊNCIA — RL-01 (${engine}/${themeKey})`);
console.log(`${"═".repeat(80)}`);
console.log(`Passos avaliados : ${report.overall.stepsEvaluated} | Passam: ${report.overall.passedSteps}`);
console.log(`Score qualidade  : ${report.overall.avgScore}/100 (média)`);
console.log(`Consistência     : ${report.overall.consistencyScore ?? "—"}% (critérios cruzados entre passos)`);
console.log(`Circulação       : ${report.overall.circulationScore}% (${totalRequired - totalUnresolved}/${totalRequired} variáveis resolvidas via artefactos)`);
if (findings.length) {
  console.log(`\n⚠ Falhas de circulação de contexto (${findings.length}):`);
  findings.forEach((f) => console.log(`   • ${f}`));
} else {
  console.log(`\n✓ Nenhuma falha de circulação — o contexto flui entre os 10 passos.`);
}
console.log(`\nRelatório completo: quality/consistency-${engine}-${themeKey}.json\n`);
