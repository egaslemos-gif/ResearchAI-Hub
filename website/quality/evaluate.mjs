/**
 * Scientific Quality Evaluator — runner
 * =====================================
 * Reuses the REAL extractors (lib/artifactExtractor.ts) + the protocol-grounded
 * evaluator (lib/scientificCriteria.ts). No test framework, no duplicated logic.
 *
 * Run (from website/):
 *   node --experimental-strip-types quality/evaluate.mjs --fixtures
 *   node --experimental-strip-types quality/evaluate.mjs --fixtures --engine glm --step 6
 *
 * Output: quality/quality-baseline.json + a console summary that separates
 * prompt-failures from extractor-failures per step and engine.
 *
 * NOTE ON FIXTURE MODE: steps that need the live article chain (PR-004/005) are
 * evaluated with synthetic article stubs so the EXTRACTOR can be exercised; their
 * cross-step consistency (X) criteria are only meaningful in --live mode.
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
import { evaluateStepQuality } from "../lib/scientificCriteria.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEBSITE = path.resolve(HERE, "..");

// ─── args ────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const onlyEngine = opt("engine");
const onlyStep = opt("step") ? Number(opt("step")) : undefined;

// ─── fixture discovery ───────────────────────────────────────────
// filename: debug-{engine}-{theme}-{timestamp}-PR-0NN.txt
function parseFixtureName(f) {
  const m = f.match(/^debug-([a-z]+)-([^-]+)-(\d+)-PR-(\d{3})\.txt$/);
  if (!m) return null;
  return { file: f, engine: m[1], theme: m[2], runId: `${m[1]}-${m[2]}-${m[3]}`, step: Number(m[4]) };
}

function discoverFixtures() {
  const files = fs.readdirSync(WEBSITE).filter((f) => /^debug-.*\.txt$/.test(f));
  const runs = new Map(); // runId -> { engine, theme, steps: {n: file} }
  for (const f of files) {
    const p = parseFixtureName(f);
    if (!p) continue;
    if (onlyEngine && p.engine !== onlyEngine) continue;
    if (!runs.has(p.runId)) runs.set(p.runId, { engine: p.engine, theme: p.theme, steps: {} });
    runs.get(p.runId).steps[p.step] = f;
  }
  return runs;
}

// ─── extraction (real modules) ───────────────────────────────────
function syntheticArticlesFromCards(raw) {
  const n = (raw.match(/#{1,4}\s*\*{0,2}\s*(?:Ficha de Leitura|Ficha)\b/gi) || []).length || 3;
  return Array.from({ length: n }, (_, i) => ({
    id: `art-${i + 1}`,
    title: `Artigo ${i + 1}`,
    authors: "",
    year: "",
    source: "",
    selected: true,
  }));
}

function extractForStep(step, raw, theme) {
  switch (step) {
    case 1:
      return extractTemaArtifact(raw, {
        studyArea: theme,
        researchTopic: "tópico de investigação",
        academicLevel: "mestrado",
      });
    case 2:
      return extractPerguntaArtifact(raw);
    case 4:
      return extractSelectionArtifact(raw, []); // criteria still extractable
    case 5:
      return extractReadingCardsArtifact(raw, syntheticArticlesFromCards(raw));
    case 6:
      return extractComparisonTableArtifact(raw);
    case 7:
      return extractGapsArtifact(raw);
    case 8:
      return extractSynthesisArtifact(raw);
    case 9:
    case 10:
      return extractReviewArtifact(raw);
    default:
      return {};
  }
}

// ─── evaluate ────────────────────────────────────────────────────
const runs = discoverFixtures();
const perStepEngine = {}; // `${engine}|${step}` -> { scores:[], passed:0, total:0, blame, worst:[] }

function bucket(engine, step) {
  const k = `${engine}|${step}`;
  if (!perStepEngine[k])
    perStepEngine[k] = { engine, step, scores: [], passed: 0, total: 0, blame: { prompt: 0, extractor: 0, runtime: 0, modelo: 0 }, failingCriteria: {} };
  return perStepEngine[k];
}

const detailed = [];

for (const [runId, run] of runs) {
  const prevByType = {}; // rough prev threading within a run
  for (let step = 1; step <= 10; step++) {
    if (onlyStep && step !== onlyStep) continue;
    if (step === 3) continue; // search step — no LLM fixture
    const file = run.steps[step];
    if (!file) continue;
    const raw = fs.readFileSync(path.join(WEBSITE, file), "utf8");
    let artifact;
    try {
      artifact = extractForStep(step, raw, run.theme);
    } catch (err) {
      artifact = { __error: String(err) };
    }

    const ctx = {
      artifact,
      raw,
      prev: step === 2 ? prevByType.tema : step === 5 ? prevByType.selection : step === 6 ? prevByType.readingCards : step === 9 ? prevByType.synthesis : undefined,
    };
    const q = evaluateStepQuality(step, ctx);

    // thread prev
    if (step === 1) prevByType.tema = artifact;
    if (step === 4) prevByType.selection = artifact;
    if (step === 5) prevByType.readingCards = artifact;
    if (step === 8) prevByType.synthesis = artifact;

    const b = bucket(run.engine, step);
    b.total++;
    b.scores.push(q.score);
    if (q.passed) b.passed++;
    b.blame.prompt += q.blame.prompt;
    b.blame.extractor += q.blame.extractor;
    b.blame.runtime += q.blame.runtime;
    b.blame.modelo += q.blame.modelo;
    for (const cr of q.criteria) {
      if (cr.status === "fail") {
        b.failingCriteria[cr.id] = b.failingCriteria[cr.id] || { label: cr.label, blame: cr.blame, count: 0 };
        b.failingCriteria[cr.id].count++;
      }
    }
    detailed.push({ runId, engine: run.engine, theme: run.theme, step, score: q.score, passed: q.passed, blame: q.blame, criteria: q.criteria });
  }
}

// ─── aggregate ───────────────────────────────────────────────────
const avg = (a) => (a.length ? Math.round(a.reduce((s, x) => s + x, 0) / a.length) : 0);
const engines = [...new Set([...runs.values()].map((r) => r.engine))].sort();
const summary = {};
for (const eng of engines) {
  summary[eng] = {};
  for (let step = 1; step <= 10; step++) {
    if (step === 3) continue;
    const b = perStepEngine[`${eng}|${step}`];
    if (!b) continue;
    summary[eng][`PR-${String(step).padStart(3, "0")}`] = {
      runs: b.total,
      passRate: b.total ? Math.round((b.passed / b.total) * 100) : 0,
      avgScore: avg(b.scores),
      blame: b.blame,
      topFailures: Object.entries(b.failingCriteria)
        .sort((a, c) => c[1].count - a[1].count)
        .slice(0, 3)
        .map(([id, v]) => ({ id, label: v.label, blame: v.blame, count: v.count })),
    };
  }
}

const report = {
  generatedFrom: "fixtures",
  totalRuns: runs.size,
  engines,
  summary,
  detailed,
};
fs.writeFileSync(path.join(HERE, "quality-baseline.json"), JSON.stringify(report, null, 2));

// ─── console ─────────────────────────────────────────────────────
console.log(`\n${"═".repeat(78)}`);
console.log(`QUALIDADE CIENTÍFICA DOS ARTEFACTOS — baseline sobre fixtures`);
console.log(`Runs: ${runs.size} | Motores: ${engines.join(", ")}`);
console.log(`${"═".repeat(78)}\n`);

for (const eng of engines) {
  console.log(`\n### Motor: ${eng.toUpperCase()}`);
  console.log(`| Passo   | runs | pass% | score | prompt | extractor | runtime | modelo |`);
  console.log(`|---------|------|-------|-------|--------|-----------|---------|`);
  for (let step = 1; step <= 10; step++) {
    if (step === 3) continue;
    const s = summary[eng]?.[`PR-${String(step).padStart(3, "0")}`];
    if (!s) continue;
    console.log(
      `| PR-${String(step).padStart(3, "0")} | ${String(s.runs).padStart(4)} | ${String(s.passRate).padStart(4)}% | ${String(s.avgScore).padStart(5)} | ${String(s.blame.prompt).padStart(6)} | ${String(s.blame.extractor).padStart(9)} | ${String(s.blame.runtime).padStart(7)} | ${String(s.blame.modelo).padStart(6)} |`
    );
  }
  // Top failing criteria with blame
  console.log(`\n  Falhas principais (${eng}):`);
  for (let step = 1; step <= 10; step++) {
    if (step === 3) continue;
    const s = summary[eng]?.[`PR-${String(step).padStart(3, "0")}`];
    if (!s?.topFailures?.length) continue;
    for (const f of s.topFailures) {
      console.log(`    PR-${String(step).padStart(3, "0")} ▸ [${f.blame}] ${f.id} "${f.label}" — falha em ${f.count} run(s)`);
    }
  }
}

console.log(`\nRelatório completo: quality/quality-baseline.json\n`);
