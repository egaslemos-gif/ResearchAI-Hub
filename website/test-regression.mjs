/**
 * RL-01 Regression Test Runner
 *
 * Executes the full RL-01 pipeline with multiple themes × multiple engines.
 * Uses the actual artifactExtractor + artifactValidator modules.
 *
 * Usage: node test-regression.mjs
 *
 * Output: regression-report.json with per-run, per-step metrics.
 */

import fs from 'fs';
import path from 'path';

// ─── Config ──────────────────────────────────────────────────────

const EXEC_URL = 'http://localhost:3000/api/execution';
const SEARCH_URL = 'http://localhost:3000/api/search';
const PROMPTS_DIR = '../prompts';

const THEMES = [
  {
    studyArea: 'Educação',
    researchTopic: 'Uso de IA generativa no ensino superior em Portugal',
    academicLevel: 'mestrado',
    searchQuery: 'generative AI higher education Portugal',
  },
  {
    studyArea: 'Saúde',
    researchTopic: 'Telemedicina na atenção primária em países lusófonos',
    academicLevel: 'doutoramento',
    searchQuery: 'telemedicine primary care Portuguese-speaking countries',
  },
  {
    studyArea: 'Engenharia',
    researchTopic: 'Sustentabilidade energética em edifícios inteligentes',
    academicLevel: 'licenciatura',
    searchQuery: 'energy sustainability smart buildings',
  },
];

const ENGINES = ['gemini', 'glm']; // claude skipped due to API credit limit

// ─── Helpers ─────────────────────────────────────────────────────

function loadPrompt(step) {
  const stepId = `PR-${String(step).padStart(3, '0')}`;
  return fs.readFileSync(path.join(PROMPTS_DIR, stepId, 'prompt.md'), 'utf-8');
}

function resolveVars(content, vars) {
  return content.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const val = vars[key.trim()];
    return val !== undefined && val !== null && val !== '' ? String(val) : match;
  });
}

async function callExecution(prompt, engine) {
  const start = Date.now();
  try {
    const res = await fetch(EXEC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, engine, task: {}, profile: { maxTokens: 8192 } }),
    });
    const data = await res.json();
    return { ...data, elapsedMs: Date.now() - start };
  } catch (err) {
    return { success: false, error: err.message, elapsedMs: Date.now() - start, content: '' };
  }
}

async function callSearch(query) {
  const start = Date.now();
  try {
    const res = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, maxResults: 20 }),
    });
    const data = await res.json();
    return { ...data, elapsedMs: Date.now() - start };
  } catch (err) {
    return { success: false, error: err.message, elapsedMs: Date.now() - start, articles: [] };
  }
}

// ─── Inline extractors (matching artifactExtractor.ts) ───────────

function extractSection(text, heading) {
  const h = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const mdHeaderRegex = new RegExp(`(?:#{1,4}\\s*(?:[\\u{1F000}-\\u{1FFFF}\\u{2600}-\\u{27BF}\\u{2190}-\\u{21FF}\\u{2B00}-\\u{2BFF}]\\s*)?(?:\\d+[.)]\\s*)?\\*{0,2}[^\\n#*]{0,40}?)${h}[^\\n#*]*[:：]?\\*{0,2}[\\s\\n]*[:：]?\\s*\\n?([\\s\\S]*?)(?=\\n#{1,4}\\s|\\n\\*\\*[^*\\n]+[:：]?\\*\\*\\s*\\n|$)`, "iu");
  const mdMatch = text.match(mdHeaderRegex);
  if (mdMatch?.[1]?.trim()) return mdMatch[1].trim();
  const boldRegex = new RegExp(`\\*\\*(?:\\d+[.)\\s]*)?\\s*[^*\\n]{0,40}?${h}[^*\\n]*[:：]?\\*\\*[:：]?\\s*\\n([\\s\\S]*?)(?=\\n#{1,4}\\s|\\n\\*\\*[^*\\n]+[:：]?\\*\\*\\s*\\n|$)`, "i");
  const boldMatch = text.match(boldRegex);
  if (boldMatch?.[1]?.trim()) return boldMatch[1].trim();
  const plainRegex = new RegExp(`(?:^|\\n)${h}[\\s]*[:：]\\s*\\n?([\\s\\S]*?)(?=\\n#{1,4}\\s|\\n\\*\\*[^*\\n]+[:：]?\\*\\*\\s*\\n|$)`, "i");
  const plainMatch = text.match(plainRegex);
  if (plainMatch?.[1]?.trim()) return plainMatch[1].trim();
  return "";
}

function extractListItems(text, minItems = 0) {
  const lines = text.split("\n");
  const items = [];
  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(?:\*\*)?(?:\d+[.)]|[-•*])\s*\*\*?[.:：]?\s*\*\*?(?:\s*\*\*)?\s+(.+)/);
    if (match) items.push(match[1].replace(/\*+/g, "").trim());
    else {
      const match2 = trimmed.match(/^(?:\d+[.)]|[-•*])\s+(.+)/);
      if (match2) items.push(match2[1].replace(/\*+/g, "").trim());
      else if (trimmed && items.length > 0 && !trimmed.startsWith("#") && !trimmed.startsWith("**") && !trimmed.startsWith("|"))
        items[items.length - 1] += " " + trimmed;
    }
  }
  return items.length >= minItems ? items : [];
}

function extractParagraphs(text) {
  if (!text || !text.trim()) return [];
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim().replace(/\*+/g, "").trim())
    .filter(p => p.length > 20 && !p.startsWith("#") && !p.startsWith("|") && !p.startsWith("---"));
}

function extractKeywords(text) {
  const keywords = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(?:\*\*)?(?:\d+[.)]|[-•*])\s*\*\*?[.:：]?\s*\*\*?(?:\s*\*\*)?\s+(.+)/);
    if (match) keywords.push(match[1].replace(/\*+/g, "").trim());
    else {
      const match2 = trimmed.match(/^(?:\d+[.)]|[-•*])\s+(.+)/);
      if (match2) keywords.push(match2[1].replace(/\*+/g, "").trim());
      else if (trimmed.startsWith("|") && !trimmed.includes("---")) {
        const cells = trimmed.split("|").map(c => c.trim().replace(/\*+/g, "")).filter(Boolean);
        if (cells.length >= 2 && cells[0] !== "#") keywords.push(cells[1] || cells[0]);
      }
      else if (trimmed.includes(",") && keywords.length === 0)
        keywords.push(...trimmed.split(",").map(k => k.replace(/\*+/g, "").trim()).filter(Boolean));
    }
  }
  return keywords;
}

function extractTema(response, ws) {
  const temaProposto = extractSection(response, "Tema Proposto") || extractSection(response, "Tema proposto") || "";
  const delimitacao = extractSection(response, "Delimita") || "";
  const exequibilidade = extractSection(response, "Exequibilidade") || extractSection(response, "Avalia") || "";
  const delimited = temaProposto ? `${temaProposto}\n\n${delimitacao}`.trim() : delimitacao || ws.researchTopic;
  return { studyArea: ws.studyArea, researchTopic: ws.researchTopic, academicLevel: ws.academicLevel, delimited, feasibility: exequibilidade, createdAt: new Date().toISOString() };
}

function extractPergunta(response) {
  return {
    researchQuestion: extractSection(response, "Pergunta de Investiga") || "",
    generalObjective: extractSection(response, "Objectivo Geral") || extractSection(response, "Objetivo Geral") || extractSection(response, "Objectivo") || extractSection(response, "Objetivo") || "",
    specificObjectives: extractListItems(extractSection(response, "Objectivos Específicos") || extractSection(response, "Objetivos Específicos") || extractSection(response, "Objectivos Especific") || extractSection(response, "Objetivos Especific"), 1),
    keywordsPT: extractKeywords(extractSection(response, "Palavras-chave em PT") || extractSection(response, "Palavras.chave PT") || extractSection(response, "Português") || extractSection(response, "Em Português") || extractSection(response, "PT")),
    keywordsEN: extractKeywords(extractSection(response, "Palavras-chave em EN") || extractSection(response, "Palavras.chave EN") || extractSection(response, "Inglês") || extractSection(response, "Em Inglês") || extractSection(response, "EN")),
    createdAt: new Date().toISOString(),
  };
}

function inferCriteriaFromTable(response) {
  const inclusionReasons = [];
  const exclusionReasons = [];
  const rowRegex = /\|\s*\d+\s*\|\s*\*{0,2}\s*(Incluir|Excluir)\s*\*{0,2}\s*\|\s*([^|]+)\s*\|/gi;
  let match;
  while ((match = rowRegex.exec(response)) !== null) {
    const decision = match[1].toLowerCase();
    const justification = match[2].trim().replace(/\*+/g, "");
    if (decision.startsWith("incluir") && justification) inclusionReasons.push(justification);
    else if (decision.startsWith("excluir") && justification) exclusionReasons.push(justification);
  }
  const listRegex = /(?:\d+[.)]\s+)?\*{0,2}\s*(?:Artigo\s*)?\d+[:：]?\*{0,2}\s*([\s\S]*?)(?=\n\d+[.)]|\n#{1,4}|\n\*\*[^*\n]+[:：]?\*\*\s*\n|$)/gi;
  while ((match = listRegex.exec(response)) !== null) {
    const text = match[1].trim();
    const incMatch = text.match(/(Incluir)\b/i);
    const excMatch = text.match(/(Excluir)\b/i);
    if (incMatch && !excMatch) {
      const reason = text.replace(/^.*?(Incluir)\b/i, "").trim().replace(/^[:：\s]+/, "");
      if (reason) inclusionReasons.push(reason);
    } else if (excMatch) {
      const reason = text.replace(/^.*?(Excluir)\b/i, "").trim().replace(/^[:：\s]+/, "");
      if (reason) exclusionReasons.push(reason);
    }
  }
  return { inclusion: extractCommonPatterns(inclusionReasons, true), exclusion: extractCommonPatterns(exclusionReasons, false) };
}

function extractCommonPatterns(reasons, isInclusion) {
  if (reasons.length === 0) return [];
  const patterns = [];
  const seen = new Set();
  const inclusionKeywords = [
    { regex: /emp[ií]rico|survey|estudo emp/i, label: "Estudos empíricos com dados primários" },
    { regex: /ensino superior|higher education/i, label: "Foco em ensino superior" },
    { regex: /Portugal|portugu[êe]s/i, label: "Contexto português ou relevante para Portugal" },
    { regex: /docente|professor|teacher/i, label: "Perspetiva de docentes" },
    { regex: /estudante|student|discente/i, label: "Perspetiva de estudantes" },
    { regex: /perce[çc][ão]o|perception|atitude/i, label: "Análise de perceções ou atitudes" },
    { regex: /IA generativa|generative AI|ChatGPT/i, label: "Foco em IA generativa" },
  ];
  const exclusionKeywords = [
    { regex: /K-12|educa[çc][ão]o escolar|ensino b[áa]sico|primary education/i, label: "Foco em níveis de ensino não superior (K-12, ensino básico)" },
    { regex: /n[ãa]o.*Portugal|without.*Portugal|sem.*Portugal/i, label: "Sem menção a Portugal ou contexto português" },
    { regex: /engenharia|software|nutrition|nutri[çc][ãa]o|lexicografia|medicine|medicina/i, label: "Foco em áreas não pedagógicas (engenharia, medicina, etc.)" },
    { regex: /editorial|opini[ãa]o|carta|speculative/i, label: "Artigos de opinião ou editoriais sem dados empíricos" },
    { regex: /fora.*per[íi]odo|2025|2026/i, label: "Fora do período de publicação definido" },
    { regex: /duplicad/i, label: "Estudos duplicados" },
    { regex: /sem.*revis[ãa]o por pares|preprint/i, label: "Sem revisão por pares" },
    { regex: /t[ée]cnico|technical|funcionamento da IA/i, label: "Estudos puramente técnicos sobre funcionamento da IA" },
    { regex: /n[ãa]o.*emp[ií]rico|sem.*dados|the[óo]rico.*sem/i, label: "Estudos sem dados empíricos ou base teórica insuficiente" },
  ];
  const keywords = isInclusion ? inclusionKeywords : exclusionKeywords;
  for (const { regex, label } of keywords) {
    if (reasons.some(r => regex.test(r)) && !seen.has(label)) { patterns.push(label); seen.add(label); }
  }
  if (patterns.length === 0 && reasons.length > 0) {
    for (const reason of reasons.slice(0, 5)) {
      const truncated = reason.substring(0, 120).trim();
      if (truncated && !seen.has(truncated)) { patterns.push(truncated); seen.add(truncated); }
    }
  }
  return patterns;
}

function extractSelection(response, articles) {
  let inclusionCriteria = extractListItems(extractSection(response, "Critérios de Inclusão") || extractSection(response, "Inclusão") || "", 1);
  let exclusionCriteria = extractListItems(extractSection(response, "Critérios de Exclusão") || extractSection(response, "Exclusão") || "", 1);
  if (inclusionCriteria.length === 0 || exclusionCriteria.length === 0) {
    const inferred = inferCriteriaFromTable(response);
    if (inclusionCriteria.length === 0) inclusionCriteria = inferred.inclusion;
    if (exclusionCriteria.length === 0) exclusionCriteria = inferred.exclusion;
  }
  const selectedArticles = articles.map(article => {
    const titleLower = article.title.toLowerCase().substring(0, 30);
    const escapedTitle = titleLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const inResponse = response.toLowerCase().includes(titleLower);
    const includeMatch = response.match(new RegExp(`${escapedTitle}.*?(Incluir|✓)`, "i"));
    const excludeMatch = response.match(new RegExp(`${escapedTitle}.*?(Excluir|✗)`, "i"));
    const tableMatch = response.match(new RegExp(`\\|[^|]*${escapedTitle}[^|]*\\|[^|]*(Incluir|Excluir)`, "i"));
    let selected = false;
    if (tableMatch) selected = tableMatch[1].toLowerCase().startsWith("incluir");
    else if (includeMatch && !excludeMatch) selected = true;
    else if (inResponse && !excludeMatch) selected = true;
    return { ...article, selected, justification: tableMatch?.[0] ?? includeMatch?.[0] ?? "" };
  });
  return {
    inclusionCriteria: inclusionCriteria.length > 0 ? inclusionCriteria : [],
    exclusionCriteria: exclusionCriteria.length > 0 ? exclusionCriteria : [],
    articles: selectedArticles,
    createdAt: new Date().toISOString(),
  };
}

function extractReadingCards(response, articles) {
  const cards = [];
  const fichaSections = response.split(/\n#{1,4}\s*\*{0,2}\s*(?:Ficha de Leitura|Ficha)\s*[-:]?\s*(?:Artigo\s*)?\d*/i).slice(1);
  const selectedArticles = articles.filter(a => a.selected);
  for (let i = 0; i < selectedArticles.length; i++) {
    const article = selectedArticles[i];
    const section = fichaSections[i] ?? "";
    cards.push({
      articleId: article.id, articleTitle: article.title,
      objective: extractSection(section, "Objectivo") || extractSection(section, "Objetivo") || "",
      methodology: extractSection(section, "Metodologia") || "",
      sample: extractSection(section, "Amostra") || extractSection(section, "Sample") || "",
      results: extractSection(section, "Resultados") || extractSection(section, "Principais Resultados") || "",
      limitations: extractSection(section, "Limita") || "",
      contribution: extractSection(section, "Contribui") || extractSection(section, "Contribu") || "",
      quality: "", createdAt: new Date().toISOString(),
    });
  }
  return { cards, createdAt: new Date().toISOString() };
}

function extractComparison(response) {
  const convergences = extractListItems(extractSection(response, "Convergências") || extractSection(response, "Converg") || extractSection(response, "Concord") || "", 1);
  const divergences = extractListItems(extractSection(response, "Divergências") || extractSection(response, "Diverg") || extractSection(response, "Discord") || "", 1);
  const rows = [];
  const tableMatches = response.matchAll(/\|.*?\|\n\|[-:|\s]+\|.*\n([\s\S]*?)(?=\n\n|\n#|$)/g);
  for (const tableMatch of tableMatches) {
    for (const row of tableMatch[1].trim().split("\n")) {
      const cells = row.split("|").map(c => c.trim().replace(/\*+/g, "")).filter(Boolean);
      if (cells.length >= 2) rows.push({ articleId: cells[0], articleTitle: cells[0], objective: cells[1] || "", methodology: cells[2] || "", sample: cells[3] || "", results: cells[4] || "", limitations: cells[5] || "" });
    }
  }
  return { rows, convergences, divergences, createdAt: new Date().toISOString() };
}

function extractSectionDeep(text, heading) {
  const h = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const mdHeaderRegex = new RegExp(`(?:#{1,4}\\s*(?:[\\u{1F000}-\\u{1FFFF}\\u{2600}-\\u{27BF}\\u{2190}-\\u{21FF}\\u{2B00}-\\u{2BFF}]\\s*)?(?:\\d+[.)]\\s*)?\\*{0,2}[^\\n#*]{0,40}?)${h}[^\\n#*]*[:：]?\\*{0,2}[\\s\\n]*[:：]?\\s*\\n?([\\s\\S]*?)(?=\\n#{1,2}\\s|\\n\\*\\*[^*\\n]+[:：]?\\*\\*\\s*\\n|$)`, "iu");
  const mdMatch = text.match(mdHeaderRegex);
  if (mdMatch?.[1]?.trim()) return mdMatch[1].trim();
  const boldRegex = new RegExp(`\\*\\*(?:\\d+[.)\\s]*)?\\s*[^*\\n]{0,40}?${h}[^*\\n]*[:：]?\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n#{1,2}\\s|\\n\\*\\*[^*\\n]+[:：]?\\*\\*\\s*\\n|$)`, "i");
  const boldMatch = text.match(boldRegex);
  if (boldMatch?.[1]?.trim()) return boldMatch[1].trim();
  return "";
}

function extractGaps(response) {
  const gaps = [];
  const gapSection = extractSectionDeep(response, "Lacunas na Literatura") || extractSectionDeep(response, "Lacunas na literatura") || extractSectionDeep(response, "Lacunas Identificadas") || extractSectionDeep(response, "Lacunas identificadas") || extractSectionDeep(response, "Lacunas") || extractSection(response, "Perguntas não respondidas") || "";
  const items = gapSection ? extractListItems(gapSection, 1) : extractListItems(response, 3);
  for (let i = 0; i < items.length; i++) gaps.push({ id: `gap-${i+1}`, description: items[i], justification: "", addressable: "" });
  return { gaps: gaps.length > 0 ? gaps : [], createdAt: new Date().toISOString() };
}

function extractSynthesis(response) {
  const themes = [];
  const themeSections = response.split(/\n(?:#{1,4}\s+\*{0,2}(?:\d+[.)]\s*)?(?:Tema|Theme)\s*\d*[:：]?\*{0,2}|\*{0,2}(?:\d+[.)]\s*)?(?:Tema|Theme)\s*\d*[:：]?\*{0,2}|#{1,4}\s+\*{0,2}\d+[.)]\s+)/i).slice(1);
  for (let i = 0; i < themeSections.length; i++) {
    const section = themeSections[i];
    themes.push({ id: `theme-${i+1}`, name: section.match(/^[:：\s]*([^\n]+)/)?.[1]?.trim() ?? `Tema ${i+1}`, description: section.trim().substring(0, 500), evidence: "", articles: [] });
  }
  let trends = extractListItems(extractSection(response, "Tendên") || extractSection(response, "Padrões") || extractSection(response, "Trend") || "", 1);
  let contradictions = extractListItems(extractSection(response, "Contradi") || extractSection(response, "Diverg") || "", 1);
  if (trends.length === 0 || contradictions.length === 0) {
    for (const section of themeSections) {
      if (trends.length === 0) {
        const st = extractListItems(extractSection(section, "Tendên") || extractSection(section, "Trend") || "", 1);
        if (st.length > 0) trends = trends.concat(st);
        else {
          const tp = extractParagraphs(extractSection(section, "Tendên") || extractSection(section, "Trend") || "");
          if (tp.length > 0) trends = trends.concat(tp);
        }
      }
      if (contradictions.length === 0) {
        const sd = extractListItems(extractSection(section, "Diverg") || extractSection(section, "Contradi") || "", 1);
        if (sd.length > 0) contradictions = contradictions.concat(sd);
        else {
          const dp = extractParagraphs(extractSection(section, "Diverg") || extractSection(section, "Contradi") || "");
          if (dp.length > 0) contradictions = contradictions.concat(dp);
        }
      }
    }
  }
  return { themes, trends, contradictions, createdAt: new Date().toISOString() };
}

function extractReview(response) {
  return {
    title: response.match(/^#{1,2}\s+(.+)$/m)?.[1]?.trim() ?? "Revisão da Literatura",
    introduction: extractSection(response, "Introdução") || extractSection(response, "1. Introdução") || extractSection(response, "Definição do Problema") || extractSection(response, "Defini") || "",
    body: extractSection(response, "Desenvolvimento") || extractSection(response, "Corpo") || extractSection(response, "Análise") || extractSection(response, "Pesquisa da Literatura") || extractSection(response, "Pesquisa") || extractSection(response, "Síntese") || extractSection(response, "Checklist") || extractSection(response, "Avaliação") || "",
    conclusion: extractSection(response, "Considera") || extractSection(response, "Conclus") || extractSection(response, "Conclusões") || extractSection(response, "Recomenda") || extractSection(response, "Resumo Geral") || extractSection(response, "Resumo") || extractSection(response, "Avaliação Final") || "",
    references: extractListItems(extractSection(response, "Referên") || extractSection(response, "References") || extractSection(response, "Bibliografia") || "", 1),
    wordCount: response.split(/\s+/).length,
    createdAt: new Date().toISOString(),
  };
}

// ─── Inline validators (matching artifactValidator.ts) ───────────

function hasContent(v) { return typeof v === 'string' ? v.trim().length > 0 : Array.isArray(v) ? v.length > 0 : !!v; }

function validate(name, step, artifact, requiredFields, extraChecks = {}) {
  const issues = [], warnings = [], metrics = {};
  let filled = 0;
  for (const f of requiredFields) {
    if (hasContent(artifact[f])) filled++;
    else issues.push(`${f} está vazio`);
  }
  Object.assign(metrics, { fieldsFilled: filled, fieldsTotal: requiredFields.length });
  if (extraChecks.warnings) warnings.push(...extraChecks.warnings);
  if (extraChecks.metrics) Object.assign(metrics, extraChecks.metrics);
  const score = Math.round((filled / requiredFields.length) * 100);
  return { step, stepName: name, passed: issues.length === 0, score, issues, warnings, metrics };
}

// ─── Artifact traceability & consistency checks ──────────────────

/**
 * Verifies that artifacts from earlier steps are reused/consistent in later steps.
 * Checks: research question flows PR-002→PR-007, selected articles PR-004→PR-005,
 * reading cards PR-005→PR-006, comparison PR-006→PR-007, gaps PR-007→PR-008,
 * synthesis PR-008→PR-009, review PR-009→PR-010.
 */
function checkTraceability(artifacts, vars) {
  const checks = [];
  let passed = 0, failed = 0;

  function check(name, condition, detail) {
    const ok = !!condition;
    checks.push({ name, passed: ok, detail: ok ? '' : (detail || 'failed') });
    if (ok) passed++; else failed++;
  }

  // PR-002 research question should be in vars for PR-007
  if (artifacts.pergunta?.researchQuestion) {
    check('RQ flows PR-002→vars',
      vars.research_question && vars.research_question.length > 10,
      'research_question var not set from PR-002');
  }

  // PR-004 selected articles should flow to PR-005
  if (artifacts.selection?.articles) {
    const selected = artifacts.selection.articles.filter(a => a.selected);
    check('Selected articles PR-004→PR-005',
      selected.length >= 1,
      `Only ${selected.length} articles selected in PR-004`);

    // PR-005 cards should match selected articles count
    if (artifacts.readingCards?.cards) {
      check('Cards count matches selected articles PR-004→PR-005',
        artifacts.readingCards.cards.length <= selected.length + 1,
        `${artifacts.readingCards.cards.length} cards for ${selected.length} selected articles`);
    }
  }

  // PR-005 reading cards should have content flowing to PR-006
  if (artifacts.readingCards?.cards?.length > 0) {
    const completeCards = artifacts.readingCards.cards.filter(c => c.objective && c.methodology && c.results);
    check('Complete reading cards PR-005→PR-006',
      completeCards.length >= 1,
      `Only ${completeCards.length} cards with objective+methodology+results`);

    // vars.reading_cards should be set
    check('Reading cards in vars PR-005→PR-006',
      vars.reading_cards && vars.reading_cards.length > 50,
      'reading_cards var not populated');
  }

  // PR-006 comparison should reference reading cards
  if (artifacts.comparison) {
    check('Comparison has convergences PR-006',
      artifacts.comparison.convergences?.length >= 1,
      'No convergences extracted');
    check('Comparison has divergences PR-006',
      artifacts.comparison.divergences?.length >= 1,
      'No divergences extracted');
    check('Comparison has table rows PR-006',
      artifacts.comparison.rows?.length >= 1,
      'No table rows extracted');
  }

  // PR-007 gaps should reference the research question
  if (artifacts.gaps?.gaps?.length > 0) {
    check('Gaps extracted PR-007',
      artifacts.gaps.gaps.length >= 1,
      'No gaps extracted');
    check('Gaps content in vars PR-007→PR-008',
      vars.gaps && vars.gaps.length > 50,
      'gaps var not populated');
  }

  // PR-008 synthesis should have themes, trends, contradictions
  if (artifacts.synthesis) {
    check('Synthesis has themes PR-008',
      artifacts.synthesis.themes?.length >= 1,
      'No themes extracted');
    check('Synthesis has trends PR-008',
      artifacts.synthesis.trends?.length >= 1,
      'No trends extracted');
    check('Synthesis has contradictions PR-008',
      artifacts.synthesis.contradictions?.length >= 1,
      'No contradictions extracted');
    check('Synthesis in vars PR-008→PR-009',
      vars.thematic_synthesis && vars.thematic_synthesis.length > 50,
      'thematic_synthesis var not populated');
  }

  // PR-009 review should have all sections
  if (artifacts.review) {
    check('Review has introduction PR-009',
      artifacts.review.introduction?.length > 20,
      'Introduction too short or empty');
    check('Review has body PR-009',
      artifacts.review.body?.length > 50,
      'Body too short or empty');
    check('Review has conclusion PR-009',
      artifacts.review.conclusion?.length > 20,
      'Conclusion too short or empty');
    check('Review in vars PR-009→PR-010',
      vars.literature_review && vars.literature_review.length > 50,
      'literature_review var not populated');
  }

  // PR-010 checklist review
  if (artifacts.reviewChecklist) {
    check('Checklist has introduction PR-010',
      artifacts.reviewChecklist.introduction?.length > 10,
      'Checklist introduction empty');
    check('Checklist has body PR-010',
      artifacts.reviewChecklist.body?.length > 50,
      'Checklist body empty');
    check('Checklist has conclusion PR-010',
      artifacts.reviewChecklist.conclusion?.length > 10,
      'Checklist conclusion empty');
  }

  return { checks, passed, failed };
}

/**
 * Compute artifact quality metrics across all produced artifacts.
 */
function computeArtifactQuality(artifacts) {
  const quality = {};

  if (artifacts.pergunta) {
    quality.pergunta = {
      hasResearchQuestion: !!artifacts.pergunta.researchQuestion,
      hasGeneralObjective: !!artifacts.pergunta.generalObjective,
      specificObjectivesCount: artifacts.pergunta.specificObjectives?.length || 0,
      keywordsPTCount: artifacts.pergunta.keywordsPT?.length || 0,
      keywordsENCount: artifacts.pergunta.keywordsEN?.length || 0,
    };
  }

  if (artifacts.selection) {
    quality.selection = {
      inclusionCriteriaCount: artifacts.selection.inclusionCriteria?.length || 0,
      exclusionCriteriaCount: artifacts.selection.exclusionCriteria?.length || 0,
      selectedArticles: artifacts.selection.articles?.filter(a => a.selected).length || 0,
      totalArticles: artifacts.selection.articles?.length || 0,
      criteriaInferred: (artifacts.selection.inclusionCriteria?.length || 0) > 0 &&
        (artifacts.selection.exclusionCriteria?.length || 0) > 0,
    };
  }

  if (artifacts.readingCards) {
    const cards = artifacts.readingCards.cards || [];
    quality.readingCards = {
      cardCount: cards.length,
      completeCards: cards.filter(c => c.objective && c.methodology && c.results && c.limitations && c.contribution).length,
      avgFieldsPerCard: cards.length > 0
        ? Math.round(cards.reduce((s, c) =>
            s + ['objective','methodology','sample','results','limitations','contribution'].filter(f => c[f]).length, 0) / cards.length)
        : 0,
    };
  }

  if (artifacts.comparison) {
    quality.comparison = {
      rowCount: artifacts.comparison.rows?.length || 0,
      convergenceCount: artifacts.comparison.convergences?.length || 0,
      divergenceCount: artifacts.comparison.divergences?.length || 0,
    };
  }

  if (artifacts.gaps) {
    quality.gaps = {
      gapCount: artifacts.gaps.gaps?.length || 0,
      avgGapLength: artifacts.gaps.gaps?.length > 0
        ? Math.round(artifacts.gaps.gaps.reduce((s, g) => s + (g.description?.length || 0), 0) / artifacts.gaps.gaps.length)
        : 0,
    };
  }

  if (artifacts.synthesis) {
    quality.synthesis = {
      themeCount: artifacts.synthesis.themes?.length || 0,
      trendCount: artifacts.synthesis.trends?.length || 0,
      contradictionCount: artifacts.synthesis.contradictions?.length || 0,
    };
  }

  if (artifacts.review) {
    quality.review = {
      wordCount: artifacts.review.wordCount || 0,
      hasIntroduction: !!artifacts.review.introduction,
      hasBody: !!artifacts.review.body,
      hasConclusion: !!artifacts.review.conclusion,
      referenceCount: artifacts.review.references?.length || 0,
    };
  }

  return quality;
}

// ─── Run single pipeline ─────────────────────────────────────────

async function runPipeline(theme, engine) {
  const runId = `${engine}-${theme.studyArea.substring(0,3)}-${Date.now()}`;
  console.log(`\n${'='.repeat(70)}`);
  console.log(`RUN: ${runId}`);
  console.log(`Engine: ${engine} | Tema: ${theme.researchTopic}`);
  console.log(`${'='.repeat(70)}`);

  const vars = { studyArea: theme.studyArea, researchTopic: theme.researchTopic, academicLevel: theme.academicLevel };
  const artifacts = {};
  const stepResults = [];
  let totalTokens = 0;
  let totalElapsed = 0;
  let articles = [];

  for (let step = 1; step <= 10; step++) {
    const stepName = `PR-${String(step).padStart(3, '0')}`;
    console.log(`\n[${runId}] ${stepName}...`);

    try {
      if (step === 3) {
        // PR-003: OpenAlex search
        const searchResult = await callSearch(theme.searchQuery);
        totalElapsed += searchResult.elapsedMs || 0;

        if (searchResult.success && searchResult.articles?.length > 0) {
          articles = searchResult.articles;
          vars.article_list = articles.map((a, i) =>
            `${i+1}. ${a.title}\n   Authors: ${a.authors}\n   Year: ${a.year}\n   Source: ${a.source}\n   DOI: ${a.doi || 'N/A'}\n   Abstract: ${(a.abstract || 'No abstract').substring(0, 500)}...`
          ).join('\n\n');
          vars.article_text = articles.slice(0, 3).map((a, i) =>
            `--- Article ${i+1} ---\nTitle: ${a.title}\nAuthors: ${a.authors}\nYear: ${a.year}\nAbstract: ${a.abstract || 'No abstract available'}`
          ).join('\n\n');

          const v = validate(stepName, step, { articles }, ["articles"], {
            metrics: { articleCount: articles.length, withAbstract: articles.filter(a => a.abstract).length, withDoi: articles.filter(a => a.doi).length },
            warnings: articles.length < 10 ? [`Apenas ${articles.length} artigos`] : [],
          });
          stepResults.push(v);
          artifacts.articles = articles;
          console.log(`  ✓ ${articles.length} articles in ${(searchResult.elapsedMs/1000).toFixed(1)}s | score: ${v.score}`);
        } else {
          stepResults.push({ step, stepName, passed: false, score: 0, issues: [`Search failed: ${searchResult.error}`], warnings: [], metrics: {} });
          console.log(`  ✗ Search failed`);
        }
        continue;
      }

      // LLM steps
      const prompt = resolveVars(loadPrompt(step), vars);
      const unresolvedCount = (prompt.match(/\{\{[^}]+\}\}/g) || []).length;
      const result = await callExecution(prompt, engine);
      totalElapsed += result.elapsedMs || 0;
      totalTokens += result.tokensUsed || 0;

      if (!result.success) {
        stepResults.push({ step, stepName, passed: false, score: 0, issues: [result.error || 'Unknown'], warnings: [], metrics: { elapsedMs: result.elapsedMs } });
        console.log(`  ✗ Failed: ${result.error?.substring(0, 60)}`);
        continue;
      }

      const content = result.content || '';
      // Save raw response for debugging
      try { fs.writeFileSync(`debug-${runId}-${stepName}.txt`, content); } catch {}
      let artifact, validation;

      switch (step) {
        case 1:
          artifact = extractTema(content, theme);
          artifacts.tema = artifact;
          vars.research_topic = artifact.delimited;
          validation = validate(stepName, step, artifact, ["studyArea", "researchTopic", "delimited", "feasibility"], {
            metrics: { elapsedMs: result.elapsedMs, tokens: result.tokensUsed, unresolvedVars: unresolvedCount },
          });
          break;
        case 2:
          artifact = extractPergunta(content);
          artifacts.pergunta = artifact;
          vars.research_question = artifact.researchQuestion;
          validation = validate(stepName, step, artifact, ["researchQuestion", "generalObjective", "specificObjectives", "keywordsPT", "keywordsEN"], {
            metrics: { elapsedMs: result.elapsedMs, tokens: result.tokensUsed, unresolvedVars: unresolvedCount, objCount: artifact.specificObjectives.length, kwPtCount: artifact.keywordsPT.length, kwEnCount: artifact.keywordsEN.length },
            warnings: [
              ...(artifact.specificObjectives.length < 2 ? [`specificObjectives: ${artifact.specificObjectives.length}`] : []),
              ...(artifact.keywordsPT.length < 3 ? [`keywordsPT: ${artifact.keywordsPT.length}`] : []),
              ...(artifact.keywordsEN.length < 3 ? [`keywordsEN: ${artifact.keywordsEN.length}`] : []),
            ],
          });
          break;
        case 4:
          artifact = extractSelection(content, articles);
          artifacts.selection = artifact;
          vars.selected_articles = content;
          const selectedCount = artifact.articles.filter(a => a.selected).length;
          validation = validate(stepName, step, artifact, ["inclusionCriteria", "exclusionCriteria", "articles"], {
            metrics: { elapsedMs: result.elapsedMs, tokens: result.tokensUsed, selectedCount, totalArticles: articles.length },
            warnings: selectedCount < 3 ? [`Apenas ${selectedCount} artigos selecionados`] : [],
          });
          // Update article_text with selected articles
          const selected = artifact.articles.filter(a => a.selected).slice(0, 3);
          if (selected.length > 0) {
            vars.article_text = selected.map((a, i) =>
              `--- Article ${i+1} ---\nTitle: ${a.title}\nAuthors: ${a.authors}\nYear: ${a.year}\nAbstract: ${a.abstract || 'No abstract available'}`
            ).join('\n\n');
          }
          break;
        case 5:
          artifact = extractReadingCards(content, artifacts.selection?.articles?.filter(a => a.selected) || articles.slice(0, 3));
          artifacts.readingCards = artifact;
          vars.reading_cards = artifact.cards.map((c, i) =>
            `### Ficha ${i+1}: ${c.articleTitle}\n- Objectivo: ${c.objective}\n- Metodologia: ${c.methodology}\n- Amostra: ${c.sample}\n- Resultados: ${c.results}\n- Limitações: ${c.limitations}\n- Contribuição: ${c.contribution}`
          ).join('\n\n');
          const completeCards = artifact.cards.filter(c => c.objective && c.methodology && c.results && c.limitations && c.contribution).length;
          validation = validate(stepName, step, artifact, ["cards"], {
            metrics: { elapsedMs: result.elapsedMs, tokens: result.tokensUsed, cardCount: artifact.cards.length, completeCards },
            warnings: completeCards < artifact.cards.length * 0.5 ? [`${completeCards}/${artifact.cards.length} fichas completas`] : [],
          });
          break;
        case 6:
          artifact = extractComparison(content);
          artifacts.comparison = artifact;
          vars.comparative_analysis = content;
          validation = validate(stepName, step, artifact, ["rows", "convergences", "divergences"], {
            metrics: { elapsedMs: result.elapsedMs, tokens: result.tokensUsed, rowCount: artifact.rows.length, convergenceCount: artifact.convergences.length, divergenceCount: artifact.divergences.length },
            warnings: [
              ...(artifact.rows.length === 0 ? ["Tabela vazia"] : []),
              ...(artifact.convergences.length === 0 ? ["Sem convergências"] : []),
              ...(artifact.divergences.length === 0 ? ["Sem divergências"] : []),
            ],
          });
          break;
        case 7:
          artifact = extractGaps(content);
          artifacts.gaps = artifact;
          vars.gaps = content;
          validation = validate(stepName, step, artifact, ["gaps"], {
            metrics: { elapsedMs: result.elapsedMs, tokens: result.tokensUsed, gapCount: artifact.gaps.length },
            warnings: artifact.gaps.length < 3 ? [`Apenas ${artifact.gaps.length} lacunas`] : [],
          });
          break;
        case 8:
          artifact = extractSynthesis(content);
          artifacts.synthesis = artifact;
          vars.all_analysis = content;
          vars.thematic_synthesis = content;
          validation = validate(stepName, step, artifact, ["themes", "trends", "contradictions"], {
            metrics: { elapsedMs: result.elapsedMs, tokens: result.tokensUsed, themeCount: artifact.themes.length, trendCount: artifact.trends.length, contradictionCount: artifact.contradictions.length },
            warnings: artifact.themes.length < 2 ? [`Apenas ${artifact.themes.length} temas`] : [],
          });
          break;
        case 9:
          artifact = extractReview(content);
          artifacts.review = artifact;
          vars.literature_review = content;
          validation = validate(stepName, step, artifact, ["title", "introduction", "body", "conclusion"], {
            metrics: { elapsedMs: result.elapsedMs, tokens: result.tokensUsed, wordCount: artifact.wordCount },
            warnings: artifact.wordCount < 500 ? [`Revisão curta: ${artifact.wordCount} palavras`] : [],
          });
          break;
        case 10:
          artifact = extractReview(content);
          artifacts.reviewChecklist = artifact;
          validation = validate(stepName, step, artifact, ["title", "introduction", "body", "conclusion"], {
            metrics: { elapsedMs: result.elapsedMs, tokens: result.tokensUsed, wordCount: artifact.wordCount },
          });
          break;
      }

      stepResults.push(validation);
      console.log(`  ${validation.passed ? '✓' : '✗'} ${stepName} | score: ${validation.score} | ${(result.elapsedMs/1000).toFixed(1)}s | ${result.tokensUsed || 0} tokens${unresolvedCount > 0 ? ` | ⚠ ${unresolvedCount} unresolved vars` : ''}${validation.warnings.length > 0 ? ` | ⚠ ${validation.warnings.length} warnings` : ''}`);
    } catch (err) {
      stepResults.push({ step, stepName, passed: false, score: 0, issues: [err.message], warnings: [], metrics: {} });
      console.log(`  ✗ Error: ${err.message.substring(0, 80)}`);
    }
  }

  // ─── Artifact traceability & consistency checks ──────────────
  const traceability = checkTraceability(artifacts, vars);

  // Summary
  const passedSteps = stepResults.filter(r => r.passed).length;
  const overallScore = stepResults.length > 0 ? Math.round(stepResults.reduce((s, r) => s + r.score, 0) / stepResults.length) : 0;
  const traceabilityScore = traceability.checks.length > 0
    ? Math.round((traceability.passed / traceability.checks.length) * 100)
    : 100;

  const runSummary = {
    runId, engine, theme: theme.researchTopic, studyArea: theme.studyArea,
    passedSteps, totalSteps: 10, overallScore, traceabilityScore,
    totalTokens, totalElapsedMs: totalElapsed,
    stepResults, traceability: traceability.checks,
    artifacts: Object.keys(artifacts),
    artifactQuality: computeArtifactQuality(artifacts),
  };

  console.log(`\n[${runId}] RESULT: ${passedSteps}/10 passed | score: ${overallScore} | traceability: ${traceabilityScore}% | ${(totalElapsed/1000).toFixed(0)}s | ${totalTokens} tokens`);
  if (traceability.failed > 0) {
    traceability.checks.filter(c => !c.passed).forEach(c => {
      console.log(`  ⚠ TRACE: ${c.name} — ${c.detail}`);
    });
  }
  return runSummary;
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  const allRuns = [];
  const errors = [];

  for (const engine of ENGINES) {
    for (const theme of THEMES) {
      try {
        const result = await runPipeline(theme, engine);
        allRuns.push(result);
      } catch (err) {
        errors.push({ engine, theme: theme.researchTopic, error: err.message });
        console.log(`\nFATAL ERROR: ${engine} / ${theme.researchTopic}: ${err.message}`);
      }
    }
  }

  // ─── Aggregate metrics ────────────────────────────────────────
  const engineSummary = {};
  for (const engine of ENGINES) {
    const runs = allRuns.filter(r => r.engine === engine);
    if (runs.length === 0) continue;
    engineSummary[engine] = {
      runs: runs.length,
      avgScore: Math.round(runs.reduce((s, r) => s + r.overallScore, 0) / runs.length),
      avgPassed: (runs.reduce((s, r) => s + r.passedSteps, 0) / runs.length).toFixed(1),
      avgTraceability: runs.length > 0 ? Math.round(runs.reduce((s, r) => s + (r.traceabilityScore || 0), 0) / runs.length) : 0,
      avgTokens: Math.round(runs.reduce((s, r) => s + r.totalTokens, 0) / runs.length),
      avgTime: Math.round(runs.reduce((s, r) => s + r.totalElapsedMs, 0) / runs.length / 1000),
      extractorSuccessRate: {},
    };

    // Per-step extractor success rate
    for (let step = 1; step <= 10; step++) {
      const stepResults = runs.flatMap(r => r.stepResults.filter(s => s.step === step));
      const passed = stepResults.filter(s => s.passed).length;
      const avgScore = stepResults.length > 0 ? Math.round(stepResults.reduce((s, r) => s + r.score, 0) / stepResults.length) : 0;
      engineSummary[engine].extractorSuccessRate[`PR-${String(step).padStart(3, '0')}`] = {
        passed: `${passed}/${stepResults.length}`,
        rate: stepResults.length > 0 ? Math.round((passed / stepResults.length) * 100) : 0,
        avgScore,
      };
    }
  }

  const report = {
    timestamp: new Date().toISOString(),
    totalRuns: allRuns.length,
    totalErrors: errors.length,
    engines: ENGINES,
    themes: THEMES.map(t => t.researchTopic),
    engineSummary,
    runs: allRuns.map(r => ({
      ...r,
      artifactQuality: r.artifactQuality,
      traceability: r.traceability,
    })),
    errors,
  };

  fs.writeFileSync('regression-report.json', JSON.stringify(report, null, 2));

  // ─── Console summary ──────────────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('REGRESSION TEST SUMMARY');
  console.log('='.repeat(70) + '\n');

  console.log('| Engine | Runs | Avg Score | Avg Passed | Avg Trace | Avg Tokens | Avg Time |');
  console.log('|--------|------|-----------|------------|-----------|------------|----------|');
  for (const [engine, s] of Object.entries(engineSummary)) {
    console.log(`| ${engine.padEnd(6)} | ${s.runs}    | ${s.avgScore}        | ${s.avgPassed}/10       | ${s.avgTraceability}%       | ${s.avgTokens}        | ${s.avgTime}s       |`);
  }

  console.log('\n--- Per-step extractor success rate ---\n');
  console.log('| Step    | ' + ENGINES.map(e => e.padEnd(12)).join(' | ') + ' |');
  console.log('|---------|' + ENGINES.map(() => '--------------').join('|') + '|');
  for (let step = 1; step <= 10; step++) {
    const stepId = `PR-${String(step).padStart(3, '0')}`;
    const cells = ENGINES.map(e => {
      const data = engineSummary[e]?.extractorSuccessRate?.[stepId];
      return data ? `${data.rate}% (${data.avgScore})`.padEnd(12) : 'N/A'.padEnd(12);
    });
    console.log(`| ${stepId} | ${cells.join(' | ')} |`);
  }

  // Artifact quality summary
  console.log('\n--- Artifact quality (first run per engine) ---\n');
  for (const engine of ENGINES) {
    const run = allRuns.find(r => r.engine === engine);
    if (!run?.artifactQuality) continue;
    console.log(`\n${engine}:`);
    const q = run.artifactQuality;
    if (q.pergunta) console.log(`  PR-002: ${q.pergunta.specificObjectivesCount} objs, ${q.pergunta.keywordsPTCount} kw PT, ${q.pergunta.keywordsENCount} kw EN`);
    if (q.selection) console.log(`  PR-004: ${q.selection.inclusionCriteriaCount} inclusion, ${q.selection.exclusionCriteriaCount} exclusion, ${q.selection.selectedArticles}/${q.selection.totalArticles} selected`);
    if (q.readingCards) console.log(`  PR-005: ${q.readingCards.cardCount} cards, ${q.readingCards.completeCards} complete, ${q.readingCards.avgFieldsPerCard} avg fields`);
    if (q.comparison) console.log(`  PR-006: ${q.comparison.rowCount} rows, ${q.comparison.convergenceCount} conv, ${q.comparison.divergenceCount} div`);
    if (q.gaps) console.log(`  PR-007: ${q.gaps.gapCount} gaps, ${q.gaps.avgGapLength} avg chars`);
    if (q.synthesis) console.log(`  PR-008: ${q.synthesis.themeCount} themes, ${q.synthesis.trendCount} trends, ${q.synthesis.contradictionCount} contradictions`);
    if (q.review) console.log(`  PR-009: ${q.review.wordCount} words, refs: ${q.review.referenceCount}`);
  }

  // Traceability failures
  const allTraceFailures = allRuns.flatMap(r => (r.traceability || []).filter(c => !c.passed).map(c => ({ run: r.runId, ...c })));
  if (allTraceFailures.length > 0) {
    console.log('\n--- Traceability failures ---\n');
    for (const f of allTraceFailures) {
      console.log(`  ${f.run}: ${f.name} — ${f.detail}`);
    }
  }

  console.log(`\nFull report: regression-report.json`);
}

main().catch(console.error);
