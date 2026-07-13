"use client";

import { useMemo, useState } from "react";
import styles from "./qualidade.module.css";

/* ─── Types (shape written by quality/analyze.mjs) ───────────────── */

export interface QualityCriterion {
  id: string;
  label: string;
  dimension: string;
  status: "pass" | "warn" | "fail" | "manual" | "na";
  blame: string;
  evidence: string;
}
export interface ContinuityInput {
  label: string;
  type: string;
  fromStep: number;
  var: string | null;
  resolved: boolean;
  misWired: boolean;
  value: string;
  break: string;
}
export interface VarRow {
  var: string;
  origin: string;
  value: string;
  resolved: boolean;
}
export interface QualityStep {
  step: number;
  stepName: string;
  artifactType: string | null;
  score: number | null;
  passed: boolean;
  blame: { prompt: number; extractor: number; runtime: number; modelo: number } | null;
  tokens: number;
  elapsedMs: number;
  costUsd: number;
  requiredVars: string[];
  unresolved: string[];
  articleCount?: number;
  continuity?: { output: { label: string; type: string } | null; inputs: ContinuityInput[]; state: "ok" | "broken" | "mis-wired" } | null;
  variables?: VarRow[];
  derivedFrom?: { step: string; type: string; label: string }[];
  starved?: boolean;
  dominantBlame?: string;
  criteria: QualityCriterion[];
  error?: string;
}
export interface QualityRun {
  id: string;
  protocol: string;
  engine: string;
  model: string;
  theme: string;
  themeKey: string;
  timestamp: string;
  overall: {
    stepsEvaluated: number;
    passedSteps: number;
    avgScore: number;
    consistencyScore: number | null;
    circulationScore: number;
    varsRequired: number;
    varsUnresolved: number;
    totalTokens: number;
    totalElapsedMs: number;
    costUsd: number;
    costEstimated: boolean;
    references: { total: number; reused: number; hallucinated: number };
    citations?: { used: number; inRepository: number; invented: number };
    blameByCategory?: { prompt: number; extractor: number; runtime: number; modelo: number };
  };
  steps: QualityStep[];
  circulationFindings: string[];
  wiringIssues?: string[];
  blameByCategory?: { prompt: number; extractor: number; runtime: number; modelo: number };
  citations?: { used: number; inRepository: number; invented: number; items: { citation: string; present: boolean }[] };
  references: { total: number; reused: number; hallucinated: number; items: { reference: string; reused: boolean; matchedTitle?: string }[] };
}

/* ─── Helpers ────────────────────────────────────────────────────── */

const ENGINE_LABEL: Record<string, string> = { claude: "Claude", google: "Gemini", gemini: "Gemini", glm: "GLM", openrouter: "OpenRouter" };
const scoreClass = (s: number | null) => (s == null ? "" : s >= 80 ? styles.good : s >= 50 ? styles.warn : styles.bad);
const fmtTime = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(0)}s` : `${ms}ms`);
const fmtTok = (t: number) => (t >= 1000 ? `${(t / 1000).toFixed(1)}k` : `${t}`);

/* ─── Component ──────────────────────────────────────────────────── */

export function QualityDashboard({ runs }: { runs: QualityRun[] }) {
  const engines = useMemo(() => [...new Set(runs.map((r) => r.engine))], [runs]);
  const latestByEngine = useMemo(() => {
    const m: Record<string, QualityRun> = {};
    for (const r of runs) if (!m[r.engine]) m[r.engine] = r; // runs already sorted desc
    return m;
  }, [runs]);

  const [selectedId, setSelectedId] = useState<string | null>(runs[0]?.id ?? null);
  const run = runs.find((r) => r.id === selectedId) ?? runs[0];

  if (!run) {
    return (
      <main className={styles.page}>
        <header className={styles.head}>
          <h1 className={styles.title}>Qualidade Científica</h1>
          <p className={styles.subtitle}>Protocolo RL-01 — Revisão da Literatura</p>
        </header>
        <div className={styles.empty}>
          <p>Ainda não há execuções analisadas.</p>
          <p className={styles.mono}>
            node --experimental-strip-types quality/run-pipeline.mjs --engine claude --theme edu
            <br />
            node --experimental-strip-types quality/analyze.mjs --engine claude --theme edu
          </p>
        </div>
      </main>
    );
  }

  const o = run.overall;
  const cit = o.citations ?? { used: 0, inRepository: 0, invented: 0 };
  const blame = run.blameByCategory ?? o.blameByCategory ?? { prompt: 0, extractor: 0, runtime: 0, modelo: 0 };
  const varRows = (() => {
    const m = new Map<string, VarRow>();
    for (const s of run.steps) for (const v of s.variables ?? []) if (!m.has(v.var)) m.set(v.var, v);
    return [...m.values()];
  })();
  const breaks = run.steps.flatMap((s) => (s.continuity?.inputs ?? []).filter((i) => i.break).map((i) => ({ step: s.stepName, text: i.break })));
  const BLAME_LABELS: [keyof typeof blame, string, string][] = [
    ["runtime", "Runtime", "pipeline / variableResolver não entregou o contexto"],
    ["extractor", "Extractor", "conteúdo presente no texto mas não extraído"],
    ["modelo", "Modelo", "comportamento do LLM (conteúdo fraco / alucinado)"],
    ["prompt", "Prompt", "o template não pediu o conteúdo"],
  ];

  const kpis = [
    { label: "Score científico", value: `${o.avgScore}`, suffix: "/100", cls: scoreClass(o.avgScore) },
    { label: "Passos que passam", value: `${o.passedSteps}`, suffix: "/10", cls: scoreClass(o.passedSteps * 10) },
    { label: "Continuidade do contexto", value: `${o.circulationScore}`, suffix: "%", cls: scoreClass(o.circulationScore) },
    { label: "Consistência entre passos", value: o.consistencyScore == null ? "—" : `${o.consistencyScore}`, suffix: o.consistencyScore == null ? "" : "%", cls: scoreClass(o.consistencyScore) },
    { label: "Variáveis resolvidas", value: `${o.varsRequired - o.varsUnresolved}`, suffix: `/${o.varsRequired}`, cls: scoreClass(o.varsRequired ? ((o.varsRequired - o.varsUnresolved) / o.varsRequired) * 100 : 100) },
    { label: "Citações: no repo / inventadas", value: `${cit.inRepository}`, suffix: ` / ${cit.invented}`, cls: cit.invented > 0 ? styles.bad : styles.good },
    { label: "Tokens", value: fmtTok(o.totalTokens), suffix: "", cls: "" },
    { label: "Tempo total", value: fmtTime(o.totalElapsedMs), suffix: "", cls: "" },
    { label: "Custo estimado", value: o.costUsd > 0 ? `$${o.costUsd.toFixed(3)}` : "grátis", suffix: o.costEstimated ? " est." : "", cls: "" },
  ];

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Qualidade Científica</h1>
          <p className={styles.subtitle}>Protocolo RL-01 — Revisão da Literatura · evidência automatizada por passo, artefacto e motor</p>
        </div>
      </header>

      {/* Engine comparison */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Comparação entre motores</h2>
        <div className={styles.compareGrid}>
          {engines.map((e) => {
            const er = latestByEngine[e];
            const active = er.engine === run.engine;
            return (
              <button key={e} className={`${styles.compareCard} ${active ? styles.compareActive : ""}`} onClick={() => setSelectedId(er.id)}>
                <span className={styles.engName}>{ENGINE_LABEL[e] ?? e}</span>
                <span className={`${styles.engScore} ${scoreClass(er.overall.avgScore)}`}>{er.overall.avgScore}</span>
                <span className={styles.engMeta}>
                  {er.overall.passedSteps}/10 passam · circ. {er.overall.circulationScore}% · {er.overall.costUsd > 0 ? `$${er.overall.costUsd.toFixed(2)}` : "grátis"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Run header + selector */}
      <section className={styles.section}>
        <div className={styles.runHead}>
          <div>
            <span className={styles.badge}>{ENGINE_LABEL[run.engine] ?? run.engine}</span>
            <span className={styles.model}>{run.model}</span>
            <span className={styles.themeName}>· {run.theme}</span>
          </div>
          {runs.length > 1 && (
            <select className={styles.select} value={run.id} onChange={(e) => setSelectedId(e.target.value)}>
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {ENGINE_LABEL[r.engine] ?? r.engine} · {r.themeKey} · {new Date(r.timestamp).toLocaleString("pt-PT")}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* KPI tiles */}
        <div className={styles.kpiGrid}>
          {kpis.map((k) => (
            <div key={k.label} className={styles.kpi}>
              <span className={styles.kpiLabel}>{k.label}</span>
              <span className={`${styles.kpiValue} ${k.cls}`}>
                {k.value}
                <small className={styles.kpiSuffix}>{k.suffix}</small>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Per-step table */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Indicadores por passo</h2>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Passo</th>
                <th>Artefacto</th>
                <th>Score científico</th>
                <th>Vars</th>
                <th>Tokens</th>
                <th>Tempo</th>
                <th>Custo</th>
              </tr>
            </thead>
            <tbody>
              {run.steps.map((s) => {
                const resolved = s.requiredVars.length - s.unresolved.length;
                return (
                  <tr key={s.step} className={s.passed ? "" : styles.rowFail}>
                    <td className={styles.stepCell}>
                      <span className={`${styles.dot} ${s.passed ? styles.dotGood : styles.dotBad}`} />
                      {s.stepName}
                    </td>
                    <td className={styles.muted}>{s.artifactType ?? "—"}</td>
                    <td>
                      <div className={styles.barRow}>
                        <div className={styles.barTrack}>
                          <div className={`${styles.barFill} ${scoreClass(s.score)}`} style={{ width: `${s.score ?? 0}%` }} />
                        </div>
                        <span className={styles.barVal}>{s.score ?? "—"}</span>
                      </div>
                    </td>
                    <td className={s.unresolved.length ? styles.bad : ""} title={s.unresolved.length ? `Por resolver: ${s.unresolved.join(", ")}` : ""}>
                      {resolved}/{s.requiredVars.length}
                    </td>
                    <td className={styles.muted}>{s.step === 3 ? `${s.articleCount ?? 0} art.` : fmtTok(s.tokens)}</td>
                    <td className={styles.muted}>{fmtTime(s.elapsedMs)}</td>
                    <td className={styles.muted}>{s.costUsd > 0 ? `$${s.costUsd.toFixed(3)}` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* 1 — Context continuity chain (with traceability arrows) */}
      {run.steps.some((s) => s.continuity) && (
        <section className={styles.section}>
          <h2 className={styles.h2}>Continuidade do contexto — cadeia de artefactos</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Passo</th>
                  <th>Entradas consumidas (← origem)</th>
                  <th>Artefacto produzido</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {run.steps.map((s) => {
                  const c = s.continuity;
                  const icon = !c ? "–" : c.state === "ok" ? "✓" : c.state === "mis-wired" ? "⚠" : "✗";
                  const cls = !c ? "" : c.state === "ok" ? styles.good : styles.bad;
                  return (
                    <tr key={s.step} className={c && c.state !== "ok" ? styles.rowFail : ""}>
                      <td className={styles.stepCell}>{s.stepName}</td>
                      <td>
                        {(c?.inputs ?? []).length === 0 && <span className={styles.muted}>—</span>}
                        {(c?.inputs ?? []).map((inp, i) => (
                          <span key={i} className={`${styles.chip} ${inp.resolved && !inp.misWired ? styles.chipOk : styles.chipBad}`} title={inp.break || ""}>
                            {inp.type} <span className={styles.chipArrow}>← {inp.fromStep === 0 ? "Workspace" : `PR-${String(inp.fromStep).padStart(3, "0")}`}</span>
                            {inp.misWired ? " ⚠" : inp.resolved ? " ✓" : " ✗"} <em className={styles.chipVal}>{inp.value}</em>
                          </span>
                        ))}
                      </td>
                      <td className={styles.muted}>{c?.output?.type ?? "—"}</td>
                      <td className={cls}>{icon} {c?.state ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {breaks.length > 0 && (
            <ul className={styles.findings} style={{ marginTop: "var(--space-4)" }}>
              {breaks.map((b, i) => (
                <li key={i}>
                  <strong>{b.step}</strong> — {b.text}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 2 — Variables actually resolved */}
      {varRows.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.h2}>Variáveis realmente resolvidas</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Variável</th>
                  <th>Origem</th>
                  <th>Valor</th>
                  <th>Resultado</th>
                </tr>
              </thead>
              <tbody>
                {varRows.map((v) => (
                  <tr key={v.var} className={v.resolved ? "" : styles.rowFail}>
                    <td className={styles.mono}>{v.var}</td>
                    <td className={styles.muted}>{v.origin}</td>
                    <td>{v.value}</td>
                    <td className={v.resolved ? styles.good : styles.bad}>{v.resolved ? "✓" : "✗"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 4 — Hallucination (citations) */}
      {cit.used > 0 && (
        <section className={styles.section}>
          <h2 className={styles.h2}>Alucinação — citações vs repositório</h2>
          <div className={styles.hallucRow}>
            <div className={styles.hallucTile}>
              <span className={styles.hallucNum}>{cit.used}</span>
              <span className={styles.hallucLab}>citações usadas</span>
            </div>
            <div className={styles.hallucTile}>
              <span className={`${styles.hallucNum} ${styles.good}`}>{cit.inRepository}</span>
              <span className={styles.hallucLab}>presentes no repositório</span>
            </div>
            <div className={styles.hallucTile}>
              <span className={`${styles.hallucNum} ${cit.invented > 0 ? styles.bad : styles.good}`}>{cit.invented}</span>
              <span className={styles.hallucLab}>inventadas (não-rastreáveis)</span>
            </div>
          </div>
          {run.citations && run.citations.items.filter((i) => !i.present).length > 0 && (
            <ul className={styles.refs} style={{ marginTop: "var(--space-3)" }}>
              {run.citations.items.filter((i) => !i.present).slice(0, 12).map((it, i) => (
                <li key={i} className={styles.refBad}>
                  <span className={styles.refFlag}>⚠ inventada</span> {it.citation}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 5 — Engine dependency: blame by category */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Dependência do motor — onde estão os problemas</h2>
        <div className={styles.blameGrid}>
          {BLAME_LABELS.map(([k, lab, hint]) => (
            <div key={k} className={styles.blameTile} title={hint}>
              <span className={`${styles.blameNum} ${blame[k] > 0 ? (k === "modelo" || k === "runtime" ? styles.bad : styles.warn) : styles.good}`}>{blame[k]}</span>
              <span className={styles.blameLab}>{lab}</span>
              <span className={styles.blameHint}>{hint}</span>
            </div>
          ))}
        </div>
        {run.wiringIssues && run.wiringIssues.length > 0 && (
          <>
            <p className={styles.wiringNote}>Mis-wiring do resolver (análise estática, independente da execução):</p>
            <ul className={styles.findings}>
              {run.wiringIssues.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* Context circulation */}
      {run.circulationFindings.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.h2}>Quebras de circulação de contexto ({run.circulationFindings.length})</h2>
          <ul className={styles.findings}>
            {run.circulationFindings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </section>
      )}

      {/* References audit */}
      {run.references.total > 0 && (
        <section className={styles.section}>
          <h2 className={styles.h2}>
            Referências — {run.references.reused} reutilizadas / {run.references.hallucinated} não-rastreáveis
          </h2>
          <ul className={styles.refs}>
            {run.references.items.slice(0, 12).map((it, i) => (
              <li key={i} className={it.reused ? styles.refOk : styles.refBad}>
                <span className={styles.refFlag}>{it.reused ? "✓ rastreável" : "⚠ não-rastreável"}</span> {it.reference.slice(0, 160)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className={styles.foot}>
        Gerado de <span className={styles.mono}>quality/runs/{run.id}.json</span> · {new Date(run.timestamp).toLocaleString("pt-PT")} · custos são estimativas editáveis em <span className={styles.mono}>quality/analyze.mjs</span>
      </footer>
    </main>
  );
}
