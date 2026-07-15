/**
 * Normalizer — turns a raw consistency-<engine>-<theme>.json (produced by
 * run-pipeline.mjs) into a dashboard-ready record in quality/runs/, WITHOUT
 * re-calling any LLM. Adds cost estimation and reference reuse/hallucination
 * audit. The permanent dashboard (/qualidade) reads quality/runs/*.json.
 *
 * Usage (from website/):
 *   node --experimental-strip-types quality/analyze.mjs --engine claude --theme edu
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractReviewArtifact } from "../lib/artifactExtractor.ts";
import { auditReferences, auditReviewCitations } from "../lib/scientificCriteria.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUNS = path.join(HERE, "runs");
fs.mkdirSync(RUNS, { recursive: true });

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const engine = opt("engine", "claude");
const themeKey = opt("theme", "edu");

// Blended price per 1M tokens (input+output combined). ESTIMATES — edit freely.
const PRICING = {
  claude: 6.6, // ~Sonnet blended
  google: 0, // Gemini free tier
  gemini: 0,
  glm: 0.6, // via OpenRouter (est.)
  openrouter: 3,
};

const srcPath = path.join(HERE, `consistency-${engine}-${themeKey}.json`);
if (!fs.existsSync(srcPath)) {
  console.error(`✗ não encontrado: ${srcPath}`);
  process.exit(1);
}
const src = JSON.parse(fs.readFileSync(srcPath, "utf8"));
const rate = PRICING[engine] ?? 0;

// references + in-text citations audit (re-derived from the saved PR-009 raw +
// retrieved articles, using the CURRENT audit code — no LLM re-call). This keeps
// the dashboard's hallucination metric in sync with audit fixes.
let references = { total: 0, reused: 0, hallucinated: 0, items: [] };
let citations = src.citations ?? { used: 0, inRepository: 0, invented: 0, items: [] };
const reviewRawPath = path.join(HERE, `live-${engine}-${themeKey}-PR-009.txt`);
if (fs.existsSync(reviewRawPath)) {
  const raw = fs.readFileSync(reviewRawPath, "utf8");
  const refs = extractReviewArtifact(raw).references ?? [];
  references = auditReferences(refs, src.articles ?? []);
  citations = auditReviewCitations(raw, refs, src.articles ?? []);
} else if (Array.isArray(src.reviewReferences)) {
  references = auditReferences(src.reviewReferences, src.articles ?? []);
}

const steps = src.steps.map((s) => {
  const tokens = s.meta?.tokens ?? 0;
  return {
    step: s.step,
    stepName: s.stepName,
    artifactType: s.artifactType ?? null,
    score: s.quality?.score ?? null,
    passed: s.quality?.passed ?? false,
    blame: s.quality?.blame ?? null,
    tokens,
    elapsedMs: s.meta?.elapsedMs ?? 0,
    costUsd: +(tokens / 1e6 * rate).toFixed(4),
    requiredVars: s.circulation?.requiredVars ?? [],
    unresolved: (s.circulation?.unresolved ?? []).map((u) => u.var),
    articleCount: s.meta?.articleCount,
    continuity: s.continuity ?? null,
    variables: s.variables ?? [],
    derivedFrom: s.derivedFrom ?? [],
    starved: s.starved ?? false,
    dominantBlame: s.dominantBlame ?? "none",
    criteria: (s.criteria ?? []).map((c) => ({ id: c.id, label: c.label, dimension: c.dimension, status: c.status, blame: c.blame, evidence: c.evidence })),
    error: s.error,
  };
});

const totalTokens = steps.reduce((n, s) => n + s.tokens, 0);
const totalElapsedMs = steps.reduce((n, s) => n + s.elapsedMs, 0);

const ts = new Date().toISOString();
const record = {
  id: `${engine}-${themeKey}-${Date.parse(ts)}`,
  protocol: "RL-01",
  engine,
  model: src.model ?? engine,
  theme: src.theme,
  themeKey,
  timestamp: ts,
  overall: {
    ...src.overall,
    totalTokens,
    totalElapsedMs,
    costUsd: +(totalTokens / 1e6 * rate).toFixed(4),
    costEstimated: rate > 0,
    citations: { used: citations.used, inRepository: citations.inRepository, invented: citations.invented },
    references: { total: references.total, reused: references.reused, hallucinated: references.hallucinated },
  },
  steps,
  circulationFindings: src.circulationFindings ?? [],
  wiringIssues: src.wiringIssues ?? [],
  blameByCategory: src.blameByCategory ?? { prompt: 0, extractor: 0, runtime: 0, modelo: 0 },
  citations,
  references,
};

const outPath = path.join(RUNS, `${record.id}.json`);
fs.writeFileSync(outPath, JSON.stringify(record, null, 2));
console.log(`✓ ${path.relative(HERE, outPath)}`);
console.log(`  score médio ${record.overall.avgScore} · passos ${record.overall.passedSteps}/10 · circulação ${record.overall.circulationScore}% · consistência ${record.overall.consistencyScore}%`);
console.log(`  tokens ${totalTokens} · ${(totalElapsedMs / 1000).toFixed(0)}s · custo ~$${record.overall.costUsd}${record.overall.costEstimated ? " (est.)" : ""}`);
console.log(`  citações: ${record.citations.used} usadas · ${record.citations.inRepository} no repositório · ${record.citations.invented} inventadas`);
console.log(`  culpa: runtime=${record.blameByCategory.runtime} extractor=${record.blameByCategory.extractor} prompt=${record.blameByCategory.prompt} modelo=${record.blameByCategory.modelo}`);
