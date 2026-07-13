import "server-only";
import fs from "node:fs";
import path from "node:path";
import { repoRoot, ASSET_DIRS } from "./paths";

/* ============================================================
   Camada de conteúdo (Content-First)
   ------------------------------------------------------------
   Único ponto de acesso aos activos. O frontend consome EXCLUSIVAMENTE:
     protocol.json · workflow.json · checklist.json · validation.json
     tool.json · metadata.json · prompt.md
   Nenhum conteúdo é hardcoded. Activos vazios/inválidos (roadmap) são
   ignorados em silêncio — o utilizador só vê conteúdo real e publicado.

   URLs amigáveis: cada activo expõe um `slug` derivado do nome/alias. A
   resolução aceita slug | id | alias | legacyAlias | pasta (case-insensitive).
   O id técnico (RL-01 / LIT-RL-01) nunca aparece no URL público.
   ============================================================ */

const ROOT = repoRoot();

// ---- leitura segura -------------------------------------------------
function readJson<T = Record<string, unknown>>(p: string): T | null {
  try {
    const raw = fs.readFileSync(p, "utf8");
    if (!raw.trim()) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
function readText(p: string): string | null {
  try {
    const raw = fs.readFileSync(p, "utf8");
    return raw.trim() ? raw : null;
  } catch {
    return null;
  }
}
function listDirs(p: string): string[] {
  try {
    return fs
      .readdirSync(p, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
  } catch {
    return [];
  }
}

/** slug amigável a partir de um texto ("Revisão da Literatura" → "revisao-da-literatura"). */
export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
const norm = (s: unknown) => String(s ?? "").trim().toLowerCase();

/** Converte um tempo estimado dos activos ("15-20 minutos", "4-8 horas") em minutos (média). */
export function parseMinutes(s: string | null | undefined): number {
  if (!s) return 0;
  const isHours = /hora/i.test(s);
  const nums = (s.match(/\d+/g) || []).map(Number);
  if (nums.length === 0) return 0;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return Math.round(isHours ? avg * 60 : avg);
}

/* ============================================================
   Tipos (reflectem a forma dos activos; permissivos por design)
   ============================================================ */
export interface ToolRef {
  slug: string;
  alias: string;
  name: string | null;
  role?: string;
  phase?: string;
  category?: string | null;
  toolType?: string | null;
  url?: string | null;
  available: boolean; // tem tool.json preenchido → tem página própria
}

export interface CompetencySummary {
  slug: string;
  name: string;
  icon: string;
  family: string | null;
  familyName: string | null;
  difficulty: string | null;
  estimatedTime: string | null;
  description: string;
  objective: string | null;
  stepCount: number;
  toolCount: number;
  promptCount: number;
}

export interface CompetencyStep {
  order: number;
  name: string;
  objective: string | null;
  instruction: string | null;
  estimatedTime: string | null;
  minutes: number;
  tool: ToolRef | null;
  toolAlternatives: ToolRef[];
  promptId: string | null;
  promptSlug: string | null;
  expectedOutput: string | null;
  artifactType: string | null;
  outputs: string[];
  criteria: string[];
}

export interface ChecklistSection {
  name: string;
  items: { key: string; text: string }[];
}

export interface CompetencyDetail extends CompetencySummary {
  competencies: string[];
  deliverables: string[];
  targetAudience: string[];
  tools: ToolRef[];
  steps: CompetencyStep[];
  checklist: { threshold: number | null; total: number; sections: ChecklistSection[] } | null;
  qualityRules: { name: string | null; text: string; severity?: string }[];
}

export interface ToolSummary {
  slug: string;
  name: string;
  category: string | null;
  toolType: string | null;
  provider: string | null;
  description: string;
  url: string | null;
  free: boolean | null;
}

export interface ToolDetail extends ToolSummary {
  capabilities: string[];
  bestPractices: string[];
  limitations: string[];
  useCases: { name: string; description: string; competencySlug: string | null }[];
  alternatives: ToolSummary[];
  pricing: { free?: boolean; freeLimitations?: string; paidPlans?: string } | null;
  byoa: boolean;
  byot: boolean;
}

export interface PromptVariable {
  name: string;
  type: string;
  values?: string[];
  required?: boolean;
  description?: string;
}

export interface PromptSummary {
  id: string;
  slug: string;
  name: string;
  objective: string | null;
  category: string | null;
  language: string | null;
  competencySlug: string | null;
  compatibleTools: string[];
}

export interface PromptDetail extends PromptSummary {
  variables: PromptVariable[];
  body: string;
  expectedOutput: string | null;
}

/* ============================================================
   Índices auxiliares (resolução por id / alias / slug)
   ============================================================ */
type Raw = Record<string, any>;

function toolIndex(): {
  byAlias: Map<string, Raw & { alias: string }>;
  byId: Map<string, Raw & { alias: string }>;
} {
  const byAlias = new Map<string, Raw & { alias: string }>();
  const byId = new Map<string, Raw & { alias: string }>();
  const dir = ASSET_DIRS.tools(ROOT);
  for (const slug of listDirs(dir)) {
    const data = readJson<Raw>(path.join(dir, slug, "tool.json"));
    const entry = { ...(data || {}), alias: slug };
    byAlias.set(slug, entry);
    if (data?.id) byId.set(data.id as string, entry);
  }
  return { byAlias, byId };
}

/** Mapa alias-do-protocolo (ex.: "LIT-RL-01") → slug público. */
function protocolAliasToSlug(): Map<string, string> {
  const map = new Map<string, string>();
  const dir = ASSET_DIRS.protocols(ROOT);
  for (const slug of listDirs(dir)) {
    const p = readJson<Raw>(path.join(dir, slug, "protocol.json"));
    if (!p || !p.name) continue;
    const publicSlug = slugify(p.name as string);
    if (p.alias) map.set(p.alias as string, publicSlug);
    if (p.legacyAlias) map.set(p.legacyAlias as string, publicSlug);
    map.set(slug, publicSlug);
  }
  return map;
}

function resolveToolRef(
  alias: string,
  tools: ReturnType<typeof toolIndex>,
  role?: string,
  phase?: string
): ToolRef {
  const t = tools.byAlias.get(alias);
  const available = !!(t && t.id);
  return {
    slug: alias,
    alias,
    name: (t?.name as string) || null,
    role,
    phase,
    category: (t?.category as string) || null,
    toolType: (t?.toolType as string) || null,
    url: (t?.url as string) || null,
    available,
  };
}

/* ============================================================
   COMPETÊNCIAS (protocolos publicados)
   ============================================================ */
function protocolSlug(p: Raw): string {
  return slugify(p.name as string);
}

/** Resolve slug|id|alias|legacyAlias|pasta → pasta interna do protocolo. */
function resolveCompetencyDir(input: string): string | null {
  const target = norm(input);
  const dir = ASSET_DIRS.protocols(ROOT);
  for (const s of listDirs(dir)) {
    const p = readJson<Raw>(path.join(dir, s, "protocol.json"));
    if (!p || !p.id || !p.name) continue;
    const candidates = [protocolSlug(p), s, p.id, p.alias, p.legacyAlias]
      .filter(Boolean)
      .map(norm);
    if (candidates.includes(target)) return s;
  }
  return null;
}

export function getCompetencies(): CompetencySummary[] {
  const dir = ASSET_DIRS.protocols(ROOT);
  const out: CompetencySummary[] = [];
  for (const s of listDirs(dir)) {
    const p = readJson<Raw>(path.join(dir, s, "protocol.json"));
    if (!p || !p.id || !p.name) continue; // ignora roadmap vazio
    if (p.state && p.state !== "PUBLISHED") continue; // só publicado
    const wf = readJson<Raw>(path.join(dir, s, "workflow.json"));
    const stepCount =
      (wf?.totalActivities as number) ??
      (Array.isArray(wf?.activities) ? wf!.activities.length : 0);
    out.push({
      slug: protocolSlug(p),
      name: p.name,
      icon: (p.icon as string) || "book-open",
      family: (p.family as string) || null,
      familyName: (p.familyName as string) || null,
      difficulty: (p.difficulty as string) || null,
      estimatedTime: (p.estimatedTime as string) || null,
      description: (p.description as string) || "",
      objective: (p.objective as string) || null,
      stepCount,
      toolCount: Array.isArray(p.tools) ? p.tools.length : 0,
      promptCount: Array.isArray(p.prompts) ? p.prompts.length : 0,
    });
  }
  return out;
}

export function getCompetency(slugOrId: string): CompetencyDetail | null {
  const s = resolveCompetencyDir(slugOrId);
  if (!s) return null;
  const base = ASSET_DIRS.protocols(ROOT);
  const p = readJson<Raw>(path.join(base, s, "protocol.json"));
  if (!p || !p.id || !p.name) return null;
  const wf = readJson<Raw>(path.join(base, s, "workflow.json"));
  const ck = readJson<Raw>(path.join(base, s, "checklist.json"));
  const va = readJson<Raw>(path.join(base, s, "validation.json"));
  const tools = toolIndex();
  const promptSlugs = promptIdToSlug();

  const toolRefs: ToolRef[] = Array.isArray(p.tools)
    ? p.tools.map((t: Raw) => resolveToolRef(t.alias, tools, t.role, t.phase))
    : [];

  const steps: CompetencyStep[] = Array.isArray(wf?.activities)
    ? wf!.activities
        .slice()
        .sort((a: Raw, b: Raw) => (a.order ?? 0) - (b.order ?? 0))
        .map((a: Raw, i: number) => ({
          order: a.order ?? i + 1,
          name: a.name,
          objective: a.objective || null,
          instruction: a.instruction || null,
          estimatedTime: a.estimatedTime || null,
          minutes: parseMinutes(a.estimatedTime),
          tool: a.tool ? resolveToolRef(a.tool, tools) : null,
          toolAlternatives: Array.isArray(a.toolAlternatives)
            ? a.toolAlternatives.map((al: string) => resolveToolRef(al, tools))
            : [],
          promptId: a.prompt || null,
          promptSlug: a.prompt ? promptSlugs.get(a.prompt) ?? null : null,
          expectedOutput: a.expectedOutput || null,
          artifactType: a.artifactType || null,
          outputs: Array.isArray(a.outputs) ? a.outputs : [],
          criteria: Array.isArray(a.validation?.criteria) ? a.validation.criteria : [],
        }))
    : [];

  let checklistTotal = 0;
  const checklist = ck
    ? {
        threshold: (ck.passingThreshold as number) ?? null,
        total: 0,
        sections: Array.isArray(ck.sections)
          ? ck.sections.map((sec: Raw, si: number) => ({
              name: sec.name,
              items: Array.isArray(sec.items)
                ? sec.items.map((it: Raw, ii: number) => {
                    checklistTotal++;
                    return { key: it.id || `${si}-${ii}`, text: it.text };
                  })
                : [],
            }))
          : [],
      }
    : null;
  if (checklist) checklist.total = checklistTotal;

  const qualityRules = Array.isArray(va?.globalRules)
    ? va!.globalRules.map((r: Raw) => ({
        name: r.name || null,
        text: r.description || r.name,
        severity: r.severity,
      }))
    : [];

  return {
    slug: protocolSlug(p),
    name: p.name,
    icon: (p.icon as string) || "book-open",
    family: (p.family as string) || null,
    familyName: (p.familyName as string) || null,
    difficulty: (p.difficulty as string) || null,
    estimatedTime: (p.estimatedTime as string) || null,
    description: (p.description as string) || "",
    objective: (p.objective as string) || null,
    stepCount: steps.length,
    toolCount: toolRefs.length,
    promptCount: Array.isArray(p.prompts) ? p.prompts.length : 0,
    competencies: Array.isArray(p.competencies) ? p.competencies : [],
    deliverables: Array.isArray(p.deliverables) ? p.deliverables : [],
    targetAudience: Array.isArray(p.targetAudience) ? p.targetAudience : [],
    tools: toolRefs,
    steps,
    checklist,
    qualityRules,
  };
}

/* ============================================================
   FERRAMENTAS — tool.json (slug = pasta, já amigável)
   ============================================================ */
function toolSummaryFrom(slug: string, data: Raw): ToolSummary {
  return {
    slug,
    name: data.name,
    category: (data.category as string) || null,
    toolType: (data.toolType as string) || null,
    provider: (data.provider as string) || null,
    description: (data.description as string) || "",
    url: (data.url as string) || null,
    free: data.pricing?.free ?? null,
  };
}

export function getTools(): ToolSummary[] {
  const dir = ASSET_DIRS.tools(ROOT);
  const out: ToolSummary[] = [];
  for (const slug of listDirs(dir)) {
    const data = readJson<Raw>(path.join(dir, slug, "tool.json"));
    if (!data || !data.id || !data.name) continue;
    out.push(toolSummaryFrom(slug, data));
  }
  return out;
}

function resolveToolDir(input: string): string | null {
  const target = norm(input);
  const dir = ASSET_DIRS.tools(ROOT);
  for (const s of listDirs(dir)) {
    const data = readJson<Raw>(path.join(dir, s, "tool.json"));
    if (!data || !data.id || !data.name) continue;
    const candidates = [s, data.id, slugify(data.name as string)].filter(Boolean).map(norm);
    if (candidates.includes(target)) return s;
  }
  return null;
}

export function getTool(slugOrId: string): ToolDetail | null {
  const s = resolveToolDir(slugOrId);
  if (!s) return null;
  const data = readJson<Raw>(path.join(ASSET_DIRS.tools(ROOT), s, "tool.json"));
  if (!data || !data.id || !data.name) return null;
  const tools = toolIndex();
  const aliasToSlug = protocolAliasToSlug();

  const alternatives: ToolSummary[] = Array.isArray(data.alternatives)
    ? data.alternatives
        .map((id: string) => tools.byId.get(id))
        .filter((t): t is Raw & { alias: string } => !!t && !!t.id)
        .map((t) => toolSummaryFrom(t.alias, t))
    : [];

  const useCases = Array.isArray(data.useCases)
    ? data.useCases.map((uc: Raw) => ({
        name: uc.name,
        description: uc.description,
        competencySlug: uc.protocol ? aliasToSlug.get(uc.protocol) ?? null : null,
      }))
    : [];

  return {
    ...toolSummaryFrom(s, data),
    capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
    bestPractices: Array.isArray(data.bestPractices) ? data.bestPractices : [],
    limitations: Array.isArray(data.limitations) ? data.limitations : [],
    useCases,
    alternatives,
    pricing: data.pricing || null,
    byoa: !!data.byoa,
    byot: !!data.byot,
  };
}

/* ============================================================
   PROMPTS — metadata.json + prompt.md (slug a partir do nome)
   ============================================================ */
function promptIdToSlug(): Map<string, string> {
  const map = new Map<string, string>();
  const dir = ASSET_DIRS.prompts(ROOT);
  for (const s of listDirs(dir)) {
    const m = readJson<Raw>(path.join(dir, s, "metadata.json"));
    if (m?.id && m?.name) map.set(m.id as string, slugify(m.name as string));
  }
  return map;
}

function promptSummaryFrom(m: Raw, aliasToSlug: Map<string, string>): PromptSummary {
  return {
    id: m.id,
    slug: slugify(m.name as string),
    name: m.name,
    objective: (m.objective as string) || null,
    category: (m.category as string) || null,
    language: (m.language as string) || null,
    competencySlug: m.protocol ? aliasToSlug.get(m.protocol) ?? null : null,
    compatibleTools: Array.isArray(m.compatibleTools) ? m.compatibleTools : [],
  };
}

export function getPrompts(): PromptSummary[] {
  const dir = ASSET_DIRS.prompts(ROOT);
  const aliasToSlug = protocolAliasToSlug();
  const out: PromptSummary[] = [];
  for (const s of listDirs(dir)) {
    const m = readJson<Raw>(path.join(dir, s, "metadata.json"));
    if (!m || !m.id || !m.name) continue;
    out.push(promptSummaryFrom(m, aliasToSlug));
  }
  return out;
}

export function getPrompt(slugOrId: string): PromptDetail | null {
  const dir = ASSET_DIRS.prompts(ROOT);
  const target = norm(slugOrId);
  const aliasToSlug = protocolAliasToSlug();
  for (const s of listDirs(dir)) {
    const m = readJson<Raw>(path.join(dir, s, "metadata.json"));
    if (!m || !m.id || !m.name) continue;
    const candidates = [s, m.id, slugify(m.name as string)].filter(Boolean).map(norm);
    if (!candidates.includes(target)) continue;
    const body = readText(path.join(dir, s, "prompt.md"));
    return {
      ...promptSummaryFrom(m, aliasToSlug),
      variables: Array.isArray(m.variables) ? m.variables : [],
      body: body || "",
      expectedOutput: (m.expectedOutput as string) || null,
    };
  }
  return null;
}

/** Slugs para geração estática de rotas. */
export function allCompetencySlugs(): string[] {
  return getCompetencies().map((c) => c.slug);
}
export function allToolSlugs(): string[] {
  return getTools().map((t) => t.slug);
}
export function allPromptSlugs(): string[] {
  return getPrompts().map((p) => p.slug);
}
