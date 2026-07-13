/**
 * Live probe — executes ONE RL-01 step against a real engine, extracts the
 * artifact with the REAL extractor, and scores it with the protocol criteria.
 * Proves the full loop end-to-end for a given engine (esp. newly-enabled ones).
 *
 * Usage (from website/, dev server running):
 *   node --experimental-strip-types quality/live-probe.mjs --engine claude --step 1
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extractTemaArtifact, extractPerguntaArtifact } from "../lib/artifactExtractor.ts";
import { evaluateStepQuality } from "../lib/scientificCriteria.ts";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
const engine = opt("engine", "claude");
const step = Number(opt("step", "1"));

const THEME = {
  studyArea: "Educação",
  researchTopic: "Uso de IA generativa no ensino superior em Portugal",
  academicLevel: "mestrado",
};

function resolve(tpl, vars) {
  return tpl.replace(/\{\{([^}]+)\}\}/g, (m, k) => vars[k.trim()] ?? m);
}

const promptFile = path.join(ROOT, "prompts", `PR-${String(step).padStart(3, "0")}`, "prompt.md");
const prompt = resolve(fs.readFileSync(promptFile, "utf8"), THEME);

console.log(`▶ ${engine} · PR-${String(step).padStart(3, "0")} · tema="${THEME.researchTopic}"`);
const t0 = Date.now();
const res = await fetch("http://localhost:3000/api/execution", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ engine, prompt, profile: { maxTokens: 4096 } }),
});
const data = await res.json();
if (!data.success) {
  console.log(`✗ falhou: ${data.error}`);
  process.exit(1);
}
const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
console.log(`✓ resposta em ${elapsed}s · modelo=${data.model} · ${data.tokensUsed} tokens\n`);

const artifact = step === 1 ? extractTemaArtifact(data.content, THEME) : extractPerguntaArtifact(data.content);
const q = evaluateStepQuality(step, { artifact, raw: data.content });

console.log(`QUALIDADE CIENTÍFICA — score ${q.score}/100 · ${q.passed ? "PASSA" : "FALHA"}`);
console.log(`blame: prompt=${q.blame.prompt} extractor=${q.blame.extractor} content=${q.blame.content} · manual=${q.manualCount}\n`);
for (const c of q.criteria) {
  const icon = { pass: "✓", warn: "▲", fail: "✗", manual: "○", na: "–" }[c.status];
  console.log(`  ${icon} ${c.id} [${c.dimension}] ${c.label}`);
  console.log(`      → ${c.evidence}${c.blame !== "none" && c.status !== "pass" ? ` (blame: ${c.blame})` : ""}`);
}
