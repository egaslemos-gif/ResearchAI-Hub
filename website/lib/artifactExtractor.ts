/**
 * Artifact Extractor — parses raw LLM text responses into structured artifacts.
 * Each extractor function takes the raw response and returns a structured artifact.
 */

import type {
  TemaArtifact,
  PerguntaArtifact,
  ArticleListArtifact,
  Article,
  SelectionArtifact,
  ReadingCardsArtifact,
  ReadingCard,
  ComparisonTableArtifact,
  ComparisonRow,
  GapsArtifact,
  ResearchGap,
  SynthesisArtifact,
  SynthesisTheme,
  ReviewArtifact,
} from "@/components/workspace/WorkspaceStoreContext";

export function extractJsonBlock<T>(text: string): T | null {
  try {
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      return JSON.parse(match[1]) as T;
    }
    if (text.trim().startsWith("{") && text.trim().endsWith("}")) {
      return JSON.parse(text.trim()) as T;
    }
    return null;
  } catch (e) {
    return null;
  }
}

/* ---- Helpers ---- */

/**
 * Extract a section from text by heading.
 * Handles three Claude response formats:
 *   1. ## Heading\ncontent  (markdown header)
 *   2. **Heading**\ncontent  (bold markdown — most common)
 *   3. Heading:\ncontent  (plain text with colon)
 * Also handles **N. Heading** numbered bold headings.
 */
/**
 * Section-boundary lookahead: a section ends at the next markdown heading,
 * the next **Bold Label:** line, OR the next numbered bold *field label* with a
 * colon (e.g. `\n3. **Metodologia:**`). The colon requirement distinguishes
 * field labels (which end a section) from numbered list items like
 * `1. **Identificar** ...` (which are section content and must NOT end it).
 */
const SECTION_STOP = `\\n\\*\\*[^*\\n]+[:：]?\\*\\*\\s*\\n|\\n\\s*\\d+[.)]\\s+\\*\\*[^*\\n]+[:：]\\*\\*`;

function extractSection(text: string, heading: string): string {
  // Escape regex special chars in heading
  const h = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Pattern 1: ## Heading or ### Heading (content on same or next line)
  // Require #{1,4} prefix to avoid matching heading text in body content
  // Allow optional emoji after # markers: ## 🔬 Heading
  // Allow optional number prefix: ### 1. Convergências
  // Allow optional prefix text: ## Identificação de Lacunas na Literatura
  // Allow optional ** around heading: ### **Lacunas na Literatura**
  // Lookahead stops at next ## heading, **Bold Heading:**\n, or end of text
  const mdHeaderRegex = new RegExp(`(?:#{1,4}\\s*(?:[\\u{1F000}-\\u{1FFFF}\\u{2600}-\\u{27BF}\\u{2190}-\\u{21FF}\\u{2B00}-\\u{2BFF}]\\s*)?(?:\\d+[.)]\\s*)?\\*{0,2}[^\\n#*]{0,40}?)${h}[^\\n#*]*[:：]?\\*{0,2}[\\s\\n]*[:：]?\\s*\\n?([\\s\\S]*?)(?=\\n#{1,4}\\s|${SECTION_STOP}|$)`, "iu");
  const mdMatch = text.match(mdHeaderRegex);
  if (mdMatch?.[1]?.trim()) return mdMatch[1].trim();

  // Pattern 2: **Heading** or **N. Heading** or **Heading:** or **Prefix Heading:**
  // [^*\n]* allows trailing chars (e.g. "Investiga" matching "Investigação")
  // Also allow optional prefix text before the heading: **Divergências ou Contradições:**
  // Lookahead stops at next ## heading, **Bold Heading:**\n, or end of text
  const boldRegex = new RegExp(`\\*\\*(?:\\d+[.)\\s]*)?\\s*[^*\\n]{0,40}?${h}[^*\\n]*[:：]?\\*\\*[:：]?\\s*\\n([\\s\\S]*?)(?=\\n#{1,4}\\s|${SECTION_STOP}|$)`, "i");
  const boldMatch = text.match(boldRegex);
  if (boldMatch?.[1]?.trim()) return boldMatch[1].trim();

  // Pattern 3: Plain heading with colon (content on same or next line)
  // Lookahead stops at next ## heading, **Bold Heading:**\n, or end of text
  const plainRegex = new RegExp(`(?:^|\\n)${h}[\\s]*[:：]\\s*\\n?([\\s\\S]*?)(?=\\n#{1,4}\\s|${SECTION_STOP}|$)`, "i");
  const plainMatch = text.match(plainRegex);
  if (plainMatch?.[1]?.trim()) return plainMatch[1].trim();

  return "";
}

function extractBetween(text: string, start: string, end: string): string {
  const regex = new RegExp(`${start}[\\s\\n]*([\\s\\S]*?)${end}`, "i");
  const match = text.match(regex);
  return match?.[1]?.trim() ?? "";
}

function extractListItems(text: string, minItems: number = 0): string[] {
  const lines = text.split("\n");
  const items: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    // Match: 1. item, 1) item, - item, • item, * item
    // Also match: **1.** item, **1)** item (bold number)
    // Also match: 1. **item**, 1. **Verb** rest (bold content after number)
    // Also match: **1.** **Verb** rest (bold number + bold verb)
    const match = trimmed.match(/^(?:\*\*)?(?:\d+[.)]|[-•*])\s*\*\*?[.:：]?\s*\*\*?(?:\s*\*\*)?\s+(.+)/);
    if (match) {
      items.push(match[1].replace(/\*+/g, "").trim());
    } else {
      // Fallback: number/bullet followed by content (with optional bold prefix word)
      const match2 = trimmed.match(/^(?:\d+[.)]|[-•*])\s+(.+)/);
      if (match2) {
        items.push(match2[1].replace(/\*+/g, "").trim());
      } else if (trimmed && items.length > 0 && !trimmed.startsWith("#") && !trimmed.startsWith("**") && !trimmed.startsWith("|")) {
        items[items.length - 1] += " " + trimmed;
      }
    }
  }
  return items.length >= minItems ? items : [];
}

function extractParagraphs(text: string): string[] {
  if (!text || !text.trim()) return [];
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim().replace(/\*+/g, "").trim())
    .filter(p => p.length > 20 && !p.startsWith("#") && !p.startsWith("|") && !p.startsWith("---"));
  return paragraphs;
}

function extractKeywords(text: string): string[] {
  const keywords: string[] = [];
  const lines = text.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Pattern 1: Numbered list item (1. keyword, **1.** keyword, 1. **keyword**)
    const match = trimmed.match(/^(?:\*\*)?(?:\d+[.)]|[-•*])\s*\*\*?[.:：]?\s*\*\*?(?:\s*\*\*)?\s+(.+)/);
    if (match) {
      keywords.push(match[1].replace(/\*+/g, "").trim());
    }
    // Pattern 1b: Fallback — simple numbered/bulleted list
    else {
      const match2 = trimmed.match(/^(?:\d+[.)]|[-•*])\s+(.+)/);
      if (match2) {
        keywords.push(match2[1].replace(/\*+/g, "").trim());
      }
      // Pattern 2: Markdown table row — extract 2nd column (Termo Principal)
      else if (trimmed.startsWith("|") && !trimmed.includes("---")) {
        const cells = trimmed.split("|").map((c) => c.trim().replace(/\*+/g, "")).filter(Boolean);
        if (cells.length >= 2 && cells[0] !== "#") {
          keywords.push(cells[1] || cells[0]);
        }
      }
      // Pattern 3: Comma-separated on a single line
      else if (trimmed.includes(",") && keywords.length === 0) {
        keywords.push(...trimmed.split(",").map((k) => k.replace(/\*+/g, "").trim()).filter(Boolean));
      }
    }
  }
  return keywords;
}

/* ---- Extractors ---- */

export function extractTemaArtifact(response: string, workspace: { studyArea: string; researchTopic: string; academicLevel: string }): TemaArtifact {
  const temaProposto = extractSection(response, "Tema Proposto") || extractSection(response, "Tema proposto") || "";
  const delimitacao = extractSection(response, "Delimita") || "";
  const exequibilidade = extractSection(response, "Exequibilidade") || extractSection(response, "Avaliação de Exequibilidade") || extractSection(response, "Avalia") || "";

  // delimited = tema + delimitação combined
  const delimited = temaProposto
    ? `${temaProposto}\n\n${delimitacao}`.trim()
    : delimitacao || workspace.researchTopic;

  return {
    studyArea: workspace.studyArea,
    researchTopic: workspace.researchTopic,
    academicLevel: workspace.academicLevel,
    delimited,
    feasibility: exequibilidade,
    createdAt: new Date().toISOString(),
  };
}

export function extractPerguntaArtifact(response: string): PerguntaArtifact {
  const question = extractSection(response, "Pergunta de Investiga") || "";
  const generalObj = extractSection(response, "Objectivo Geral") || extractSection(response, "Objetivo Geral") || extractSection(response, "Objectivo") || extractSection(response, "Objetivo") || "";
  const specificObjs = extractListItems(
    extractSection(response, "Objectivos Específicos") || extractSection(response, "Objetivos Específicos") || extractSection(response, "Objectivos Especific") || extractSection(response, "Objetivos Especific"),
    1
  );
  const keywordsPT = extractKeywords(
    extractSection(response, "Palavras-chave em PT") ||
    extractSection(response, "Palavras.chave PT") ||
    extractSection(response, "Português") ||
    extractSection(response, "Em Português") ||
    extractSection(response, "PT")
  );
  const keywordsEN = extractKeywords(
    extractSection(response, "Palavras-chave em EN") ||
    extractSection(response, "Palavras.chave EN") ||
    extractSection(response, "Inglês") ||
    extractSection(response, "Em Inglês") ||
    extractSection(response, "EN")
  );

  return {
    researchQuestion: question,
    generalObjective: generalObj,
    specificObjectives: specificObjs.length >= 1 ? specificObjs : ["", "", ""],
    keywordsPT: keywordsPT.length > 0 ? keywordsPT : [],
    keywordsEN: keywordsEN.length > 0 ? keywordsEN : [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Infer inclusion/exclusion criteria from a decision table when the model
 * doesn't provide explicit criteria sections. Parses table rows with
 * Incluir/Excluir decisions and extracts common justification patterns.
 */
function inferCriteriaFromTable(response: string): { inclusion: string[]; exclusion: string[] } {
  const inclusionReasons: string[] = [];
  const exclusionReasons: string[] = [];

  // Match table rows: | N | Incluir/Excluir | Justification |
  const rowRegex = /\|\s*\d+\s*\|\s*\*{0,2}\s*(Incluir|Excluir)\s*\*{0,2}\s*\|\s*([^|]+)\s*\|/gi;
  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(response)) !== null) {
    const decision = match[1].toLowerCase();
    const justification = match[2].trim().replace(/\*+/g, "");
    if (decision.startsWith("incluir") && justification) {
      inclusionReasons.push(justification);
    } else if (decision.startsWith("excluir") && justification) {
      exclusionReasons.push(justification);
    }
  }

  // Also check for numbered list format: 1. **Artigo N:** ... Incluir/Excluir ... justification
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

  // Extract common patterns from justifications
  const inclusion = extractCommonPatterns(inclusionReasons, true);
  const exclusion = extractCommonPatterns(exclusionReasons, false);

  return { inclusion, exclusion };
}

/**
 * Extract common patterns from a list of justification strings.
 * Groups similar reasons into concise criteria statements.
 */
function extractCommonPatterns(reasons: string[], isInclusion: boolean): string[] {
  if (reasons.length === 0) return [];

  const patterns: string[] = [];
  const seen = new Set<string>();

  // Common keywords to look for in justifications
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
    const hasMatch = reasons.some((r) => regex.test(r));
    if (hasMatch && !seen.has(label)) {
      patterns.push(label);
      seen.add(label);
    }
  }

  // If no common patterns matched, use the justifications directly (truncated)
  if (patterns.length === 0 && reasons.length > 0) {
    for (const reason of reasons.slice(0, 5)) {
      const truncated = reason.substring(0, 120).trim();
      if (truncated && !seen.has(truncated)) {
        patterns.push(truncated);
        seen.add(truncated);
      }
    }
  }

  return patterns;
}

export function extractSelectionArtifact(response: string, articles: Article[]): SelectionArtifact {
  let inclusionCriteria = extractListItems(
    extractSection(response, "Critérios de Inclusão") ||
    extractSection(response, "Inclusão") ||
    "", 1);
  let exclusionCriteria = extractListItems(
    extractSection(response, "Critérios de Exclusão") ||
    extractSection(response, "Exclusão") ||
    "", 1);

  // If no explicit criteria sections found, infer from decision table justifications
  if (inclusionCriteria.length === 0 || exclusionCriteria.length === 0) {
    const inferred = inferCriteriaFromTable(response);
    if (inclusionCriteria.length === 0) inclusionCriteria = inferred.inclusion;
    if (exclusionCriteria.length === 0) exclusionCriteria = inferred.exclusion;
  }

  const selectedArticles = articles.map((article) => {
    const titleLower = article.title.toLowerCase();
    const titleSnippet = titleLower.substring(0, 30);
    const inResponse = response.toLowerCase().includes(titleSnippet);

    // Escape regex special chars from title
    const escapedTitle = titleSnippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Check for Incluir/Excluir decision near the article title
    const includeMatch = response.match(new RegExp(`${escapedTitle}.*?(Incluir|✓|Incluir)`, "i"));
    const excludeMatch = response.match(new RegExp(`${escapedTitle}.*?(Excluir|✗|Excluir)`, "i"));

    // Also check table format: | Title | Incluir | ... |
    const tableMatch = response.match(new RegExp(`\\|[^|]*${escapedTitle}[^|]*\\|[^|]*(Incluir|Excluir)`, "i"));

    let selected = false;
    if (tableMatch) {
      selected = tableMatch[1].toLowerCase().startsWith("incluir");
    } else if (includeMatch && !excludeMatch) {
      selected = true;
    } else if (inResponse && !excludeMatch) {
      // If mentioned but no explicit exclude, assume included
      selected = true;
    }

    return {
      ...article,
      selected,
      justification: tableMatch?.[0] ?? includeMatch?.[0] ?? "",
    };
  });

  return {
    inclusionCriteria: inclusionCriteria.length > 0 ? inclusionCriteria : [],
    exclusionCriteria: exclusionCriteria.length > 0 ? exclusionCriteria : [],
    articles: selectedArticles,
    createdAt: new Date().toISOString(),
  };
}

export function extractReadingCardsArtifact(response: string, articles: Article[]): ReadingCardsArtifact {
  const cards: ReadingCard[] = [];

  // Split response by per-card headings. Accept both "Ficha de Leitura N"/"Ficha - Artigo N"
  // AND "Artigo N"/"ARTIGO N" (some engines, e.g. Claude, title each card "## ARTIGO 1").
  const fichaSections = response.split(/\n#{1,4}\s*\*{0,2}\s*(?:(?:Ficha de Leitura|Ficha)\s*[-:]?\s*(?:Artigo\s*)?\d*|Artigo\s+\d+)/i).slice(1);

  const selectedArticles = articles.filter((a) => a.selected);

  for (let i = 0; i < selectedArticles.length; i++) {
    const article = selectedArticles[i];
    const section = fichaSections[i] ?? "";

    cards.push({
      articleId: article.id,
      articleTitle: article.title,
      objective: extractSection(section, "Objectivo") || extractSection(section, "Objetivo") || "",
      methodology: extractSection(section, "Metodologia") || "",
      sample: extractSection(section, "Amostra") || extractSection(section, "Sample") || "",
      results: extractSection(section, "Resultados") || extractSection(section, "Principais Resultados") || "",
      limitations: extractSection(section, "Limita") || "",
      contribution: extractSection(section, "Contribuição") || extractSection(section, "Contribu") || "",
      quality: extractSection(section, "Qualidade") || "",
      createdAt: new Date().toISOString(),
    });
  }

  return {
    cards,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Capture a section body until the next markdown heading, WITHOUT the bold-line
 * SECTION_STOP boundary — so "**N.N Título**" sub-labels are kept as content
 * (extractSection would truncate at the first one).
 */
function extractRawSection(text: string, heading: string): string {
  const h = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`#{1,4}\\s*(?:[^\\n#]*?\\s)?${h}[^\\n]*\\n([\\s\\S]*?)(?=\\n#{1,4}\\s|$)`, "i");
  return text.match(re)?.[1]?.trim() ?? "";
}

/**
 * Pull sub-points from a convergences/divergences block: line-start bold
 * sub-headings ("**1.1 Título**") > list items > paragraphs.
 */
function extractComparisonPoints(response: string, headings: string[]): string[] {
  let block = "";
  for (const h of headings) { block = extractRawSection(response, h); if (block) break; }
  if (!block) return [];
  const bold = [...block.matchAll(/^\s*\*\*\s*([^\n*]{6,})\*\*\s*$/gm)].map((m) => m[1].replace(/[:：]\s*$/, "").trim());
  if (bold.length > 0) return bold;
  const items = extractListItems(block, 1);
  if (items.length > 0) return items;
  return extractParagraphs(block);
}

export function extractComparisonTableArtifact(response: string): ComparisonTableArtifact {
  // Primary: numbered/bulleted list under the heading (SECTION_STOP-bounded).
  // Fallback: Claude writes "### N. Convergências" with "**N.N Título**" sub-headings
  // and narrative paragraphs, which the primary path can't see — recover via raw block.
  const convSection =
    extractSection(response, "Convergências") ||
    extractSection(response, "Converg") ||
    extractSection(response, "Concord") || "";
  let convergences = extractListItems(convSection, 1);
  if (convergences.length === 0) convergences = extractComparisonPoints(response, ["Convergências", "Converg", "Concord"]);
  const divSection =
    extractSection(response, "Divergências") ||
    extractSection(response, "Diverg") ||
    extractSection(response, "Discord") || "";
  let divergences = extractListItems(divSection, 1);
  if (divergences.length === 0) divergences = extractComparisonPoints(response, ["Divergências", "Diverg", "Discord"]);

  const rows: ComparisonRow[] = [];
  // Match all markdown tables in the response
  const tableMatches = response.matchAll(/\|.*?\|\n\|[-:|\s]+\|.*\n([\s\S]*?)(?=\n\n|\n#|$)/g);
  for (const tableMatch of tableMatches) {
    const tableRows = tableMatch[1].trim().split("\n");
    for (const row of tableRows) {
      const cells = row.split("|").map((c) => c.trim().replace(/\*+/g, "")).filter(Boolean);
      if (cells.length >= 2) {
        rows.push({
          articleId: cells[0],
          articleTitle: cells[0],
          objective: cells[1] || "",
          methodology: cells[2] || "",
          sample: cells[3] || "",
          results: cells[4] || "",
          limitations: cells[5] || "",
        });
      }
    }
  }

  return {
    rows,
    convergences: convergences.length > 0 ? convergences : [],
    divergences: divergences.length > 0 ? divergences : [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Like extractSection, but captures content until the next heading of the same
 * or higher level (e.g. ## stops at next ##, but not at ###).
 * Used for sections with subheadings like PR-007 gaps.
 */
function extractSectionDeep(text: string, heading: string): string {
  const h = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Pattern 1: ## Heading — capture until next ## (not ###)
  const mdHeaderRegex = new RegExp(`(?:#{1,4}\\s*(?:[\\u{1F000}-\\u{1FFFF}\\u{2600}-\\u{27BF}\\u{2190}-\\u{21FF}\\u{2B00}-\\u{2BFF}]\\s*)?(?:\\d+[.)]\\s*)?\\*{0,2}[^\\n#*]{0,40}?)${h}[^\\n#*]*[:：]?\\*{0,2}[\\s\\n]*[:：]?\\s*\\n?([\\s\\S]*?)(?=\\n#{1,2}\\s|${SECTION_STOP}|$)`, "iu");
  const mdMatch = text.match(mdHeaderRegex);
  if (mdMatch?.[1]?.trim()) return mdMatch[1].trim();

  // Pattern 2: **Heading:** — capture until next ## or **Bold:**
  const boldRegex = new RegExp(`\\*\\*(?:\\d+[.)\\s]*)?\\s*[^*\\n]{0,40}?${h}[^*\\n]*[:：]?\\*\\*\\s*\\n([\\s\\S]*?)(?=\\n#{1,2}\\s|${SECTION_STOP}|$)`, "i");
  const boldMatch = text.match(boldRegex);
  if (boldMatch?.[1]?.trim()) return boldMatch[1].trim();

  return "";
}

export function extractGapsArtifact(response: string): GapsArtifact {
  const gaps: ResearchGap[] = [];

  // Try multiple heading variants for the gaps section
  // Use extractSectionDeep to capture subheadings (### 1. Perguntas...) within ## Lacunas
  const gapSection =
    extractSectionDeep(response, "Lacunas na Literatura") ||
    extractSectionDeep(response, "Lacunas na literatura") ||
    extractSectionDeep(response, "Lacunas Identificadas") ||
    extractSectionDeep(response, "Lacunas identificadas") ||
    extractSectionDeep(response, "Lacunas") ||
    extractSection(response, "Perguntas não respondidas") ||
    "";

  // If we found a gaps section, extract list items from it
  // Otherwise, scan the full response for numbered lists after any gap-related heading
  let items = gapSection
    ? extractListItems(gapSection, 1)
    : extractListItems(response, 3); // fallback: need at least 3 items from full response

  // Some engines (Claude) render each gap as a subheading instead of a list item, in
  // varied forms: "### Lacuna N — título", "### 🔴 LACUNA 1 — …" (emoji prefix),
  // "### Lacuna 1.1 — …" (decimal numbering). gapSection also gets truncated by
  // SECTION_STOP at the first "**Descrição:**", so split the FULL response by the
  // gap headings (emoji-tolerant, integer or decimal index).
  if (items.length === 0) {
    const gapHead = /\n#{1,4}\s*(?:[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]\s*)?\*{0,2}\s*(?:Lacuna|Gap)\s*[\d.]*\s*[—:–\-]\s*/iu;
    const blocks = response.split(gapHead);
    for (let k = 1; k < blocks.length; k++) {
      const title = (blocks[k].match(/^([^\n*]+)/)?.[1] || "").replace(/\*+/g, "").trim();
      if (title.length > 5) items.push(title);
    }
  }

  for (let i = 0; i < items.length; i++) {
    gaps.push({
      id: `gap-${i + 1}`,
      description: items[i],
      justification: "",
      addressable: "",
    });
  }

  return {
    gaps: gaps.length > 0 ? gaps : [],
    createdAt: new Date().toISOString(),
  };
}

export function extractSynthesisArtifact(response: string): SynthesisArtifact {
  const themes: SynthesisTheme[] = [];

  // Split by ## Tema N, **Tema N**, #### Tema N, #### **N. Tema:**, #### **N. Title**, or ### N. Title (numbered headings)
  const themeSections = response.split(/\n(?:#{1,4}\s+\*{0,2}(?:\d+[.)]\s*)?(?:Tema|Theme)\s*\d*[:：]?\*{0,2}|\*{0,2}(?:\d+[.)]\s*)?(?:Tema|Theme)\s*\d*[:：]?\*{0,2}|#{1,4}\s+\*{0,2}\d+[.)]\s+)/i).slice(1);

  for (let i = 0; i < themeSections.length; i++) {
    const section = themeSections[i];
    const nameMatch = section.match(/^[:：\s]*([^\n]+)/);
    themes.push({
      id: `theme-${i + 1}`,
      name: nameMatch?.[1]?.trim() ?? `Tema ${i + 1}`,
      description: section.trim().substring(0, 500),
      evidence: extractSection(section, "Evid") || extractSection(section, "Estudos") || "",
      articles: [],
    });
  }

  // Try single-section extraction first, then fall back to collecting from theme sections
  let trends = extractListItems(
    extractSection(response, "Tendên") ||
    extractSection(response, "Padrões") ||
    extractSection(response, "Trend") ||
    "", 1);
  let contradictions = extractListItems(
    extractSection(response, "Contradi") ||
    extractSection(response, "Diverg") ||
    "", 1);

  // If trends/contradictions are empty, collect from per-theme sections
  if (trends.length === 0 || contradictions.length === 0) {
    for (const section of themeSections) {
      if (trends.length === 0) {
        const sectionTrends = extractListItems(
          extractSection(section, "Tendên") || extractSection(section, "Trend") || "", 1);
        if (sectionTrends.length > 0) {
          trends = trends.concat(sectionTrends);
        } else {
          const trendPara = extractParagraphs(extractSection(section, "Tendên") || extractSection(section, "Trend") || "");
          if (trendPara.length > 0) trends = trends.concat(trendPara);
        }
      }
      if (contradictions.length === 0) {
        const sectionDiv = extractListItems(
          extractSection(section, "Diverg") || extractSection(section, "Contradi") || "", 1);
        if (sectionDiv.length > 0) {
          contradictions = contradictions.concat(sectionDiv);
        } else {
          const divPara = extractParagraphs(extractSection(section, "Diverg") || extractSection(section, "Contradi") || "");
          if (divPara.length > 0) contradictions = contradictions.concat(divPara);
        }
      }
    }
  }

  return {
    themes: themes.length > 0 ? themes : [],
    trends: trends.length > 0 ? trends : [],
    contradictions: contradictions.length > 0 ? contradictions : [],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Parse a bibliography/references section. Academic references are typically plain
 * paragraphs (APA style), not bullet/number lists — so extractListItems misses them.
 * Split by blank-line paragraphs (falling back to per-line when several refs share a
 * block), drop separators/headings/italic notes, and keep entries carrying a year.
 */
function extractReferenceList(section: string): string[] {
  if (!section || !section.trim()) return [];
  const chunks = section.split(/\n\s*\n/).flatMap((p) => {
    const t = p.trim();
    // Several single-line refs with no blank line between → split per line
    return t.includes("\n") && /\((?:19|20)\d{2}\)/.test(t) && !/^[-•*]/.test(t)
      ? t.split(/\n/)
      : [t];
  });
  const refs: string[] = [];
  for (const raw of chunks) {
    const line = raw.replace(/^(?:\d+[.)]|[-•*])\s*/, "").replace(/\*+/g, "").trim();
    if (line.length < 15) continue;
    if (/^[-–—_=]{2,}$/.test(line) || line.startsWith("#")) continue; // separators/headings
    if (/^nota\b/i.test(line)) continue; // methodological notes
    if (!/\b(?:19|20)\d{2}\b/.test(line)) continue; // a reference carries a year
    refs.push(line);
  }
  return refs;
}

export function extractReviewArtifact(response: string): ReviewArtifact {
  const introduction =
    extractSection(response, "Introdução") ||
    extractSection(response, "1. Introdução") ||
    extractSection(response, "1\\.") ||
    extractSection(response, "Definição do Problema") ||
    extractSection(response, "Defini") || "";
  const bodyRaw =
    // Deep: the thematic development has ### 2.1..2.5 subheadings; a shallow
    // extractSection would stop at the first ### and drop themes 2.2..2.5.
    extractSectionDeep(response, "Desenvolvimento") ||
    extractSection(response, "Corpo") ||
    extractSection(response, "Análise") ||
    extractSection(response, "2\\.") ||
    extractSection(response, "Pesquisa da Literatura") ||
    extractSection(response, "Pesquisa") ||
    extractSection(response, "Síntese") ||
    extractSection(response, "Checklist") ||
    extractSection(response, "Avaliação") || "";
  // Safety net: when the conclusion/references aren't separated from the development
  // by a ## heading, the deep capture can swallow them. Cut at that boundary heading.
  const bodyCut = bodyRaw.search(/\n#{1,4}\s*(?:\d+[.)]\s*)?\*{0,2}\s*(?:Refer[êe]ncias|Bibliografia|Considera[çc][õo]es|Conclus)/i);
  const body = bodyCut > 0 ? bodyRaw.slice(0, bodyCut).trim() : bodyRaw;
  const conclusion =
    extractSection(response, "Considera") ||
    extractSection(response, "Conclus") ||
    extractSection(response, "4\\.") ||
    extractSection(response, "Conclusões") ||
    extractSection(response, "Recomenda") ||
    extractSection(response, "Resumo Geral") ||
    extractSection(response, "Resumo") ||
    extractSection(response, "Avaliação Final") || "";
  const refsSection =
    extractSection(response, "Referên") ||
    extractSection(response, "References") ||
    extractSection(response, "Bibliografia") ||
    "";
  // Prefer bullet/numbered lists (some engines); fall back to plain-paragraph
  // (APA-style) references, which extractListItems cannot see.
  let references = extractListItems(refsSection, 1);
  if (references.length === 0) references = extractReferenceList(refsSection);

  const wordCount = response.split(/\s+/).length;

  return {
    title: response.match(/^#{1,2}\s+(.+)$/m)?.[1]?.trim() ?? "Revisão da Literatura",
    introduction,
    body,
    conclusion,
    references: references.length > 0 ? references : [],
    wordCount,
    createdAt: new Date().toISOString(),
  };
}
