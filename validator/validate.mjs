#!/usr/bin/env node
/**
 * Content Runtime Validator — ResearchAI Hub (orientado por Targets)
 * ------------------------------------------------------------------
 * Valida se a arquitectura Content-First é interpretável automaticamente,
 * MAS apenas para os activos pertencentes a um Validation Target seleccionado
 * (ex: MVP). Activos fora do target NUNCA são classificados como erro — aparecem
 * em Roadmap (referenciados pelo target) ou Ignored (fora do âmbito actual).
 *
 * Objectivo: permitir que o MVP seja considerado válido mesmo existindo activos
 * futuros ainda vazios.
 *
 * NÃO possui interface gráfica. NÃO usa React. NÃO cria componentes.
 * Zero dependências (só Node builtins). Não altera a arquitectura nem os protocolos.
 *
 * Uso:
 *   node validator/validate.mjs --target=mvp
 *   node validator/validate.mjs --target mvp [--root <dir>] [--out <ficheiro>] [--quiet]
 *   node validator/validate.mjs                # sem target => valida o repositório completo
 *
 * Código de saída: 0 = target válido (frontend pode arrancar); 1 = existem erros.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ------------------------------------------------------------------
// CLI args (suporta --flag=valor e --flag valor)
// ------------------------------------------------------------------
function parseArgs(argv) {
  const args = { root: null, out: null, target: null, quiet: false };
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i];
    let inlineVal = null;
    const eq = a.indexOf('=');
    if (a.startsWith('--') && eq !== -1) {
      inlineVal = a.slice(eq + 1);
      a = a.slice(0, eq);
    }
    const next = () => (inlineVal != null ? inlineVal : argv[++i]);
    if (a === '--root') args.root = next();
    else if (a === '--out') args.out = next();
    else if (a === '--target') args.target = next();
    else if (a === '--quiet') args.quiet = true;
  }
  return args;
}

const cli = parseArgs(process.argv.slice(2));
const ROOT = path.resolve(cli.root || path.join(__dirname, '..'));
const OUT = path.resolve(cli.out || path.join(ROOT, 'validation-report.json'));

// ------------------------------------------------------------------
// Diagnóstico central
// ------------------------------------------------------------------
const report = { errors: [], warnings: [], dependencies: [] };

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const relOrU = (p) => (p ? rel(p) : undefined);

function addError(code, message, extra = {}) {
  report.errors.push({ code, severity: 'error', message, ...extra });
}
function addWarning(code, message, extra = {}) {
  report.warnings.push({ code, severity: 'warning', message, ...extra });
}
function addDependency(edge) {
  report.dependencies.push(edge);
}

// ------------------------------------------------------------------
// Leitura segura de JSON
// ------------------------------------------------------------------
function loadJson(filePath) {
  const result = { path: filePath, exists: false, empty: false, ok: false, data: null, error: null };
  if (!fs.existsSync(filePath)) return result;
  result.exists = true;
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    result.error = `não foi possível ler: ${e.message}`;
    return result;
  }
  if (raw.trim().length === 0) {
    result.empty = true;
    return result;
  }
  try {
    result.data = JSON.parse(raw);
    result.ok = true;
  } catch (e) {
    result.error = `JSON inválido: ${e.message}`;
  }
  return result;
}

function fileStatus(load) {
  if (!load || !load.exists) return 'missing';
  if (load.empty) return 'empty';
  if (!load.ok) return 'invalid';
  return 'ok';
}

/** Valida existência/parse de um ficheiro de um activo IN-TARGET e emite diagnóstico. */
function checkFile(load, { scope, id, requiredCode = 'E_FILE_MISSING' }) {
  if (!load.exists) {
    addError(requiredCode, `${scope} (${id}): ficheiro inexistente`, { scope, id, file: rel(load.path) });
    return false;
  }
  if (load.empty) {
    addError('E_FILE_EMPTY', `${scope} (${id}): ficheiro vazio`, { scope, id, file: rel(load.path) });
    return false;
  }
  if (!load.ok) {
    addError('E_JSON_INVALID', `${scope} (${id}): ${load.error}`, { scope, id, file: rel(load.path) });
    return false;
  }
  return true;
}

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
}

function shortActivityCode(compositeId) {
  const m = String(compositeId || '').match(/ACT-\d+/);
  return m ? m[0] : null;
}

// ==================================================================
// FASE 1 — Descoberta
// ==================================================================
const PROTOCOLS_DIR = path.join(ROOT, 'protocols');
const TOOLS_DIR = path.join(ROOT, 'tools');
const PROMPTS_DIR = path.join(ROOT, 'prompts');

function discoverTools() {
  const tools = [];
  for (const name of listDirs(TOOLS_DIR)) {
    const toolPath = path.join(TOOLS_DIR, name, 'tool.json');
    if (!fs.existsSync(toolPath)) continue;
    const load = loadJson(toolPath);
    const data = load.data || {};
    tools.push({
      kind: 'tool', dirName: name, alias: name, path: toolPath, load,
      populated: load.ok && !!data.id, id: data.id || null,
      name: data.name || null, category: data.category || null,
      data: load.ok ? data : null,
    });
  }
  return tools;
}

function discoverPrompts() {
  const prompts = [];
  for (const name of listDirs(PROMPTS_DIR)) {
    const metaPath = path.join(PROMPTS_DIR, name, 'metadata.json');
    if (!fs.existsSync(metaPath)) continue;
    const promptMdPath = path.join(PROMPTS_DIR, name, 'prompt.md');
    const load = loadJson(metaPath);
    const data = load.data || {};
    let hasPromptMd = false, promptMdEmpty = false;
    if (fs.existsSync(promptMdPath)) {
      hasPromptMd = true;
      promptMdEmpty = fs.readFileSync(promptMdPath, 'utf8').trim().length === 0;
    }
    prompts.push({
      kind: 'prompt', dirName: name, id: data.id || name, path: metaPath,
      promptMdPath, hasPromptMd, promptMdEmpty, load,
      populated: load.ok && !!data.id, data: load.ok ? data : null,
    });
  }
  return prompts;
}

function discoverProtocols() {
  const protocols = [];
  for (const name of listDirs(PROTOCOLS_DIR)) {
    const dir = path.join(PROTOCOLS_DIR, name);
    const protocolPath = path.join(dir, 'protocol.json');
    if (!fs.existsSync(protocolPath)) continue;
    protocols.push({
      kind: 'protocol', dirName: name, dir,
      files: {
        protocol: loadJson(protocolPath),
        workflow: loadJson(path.join(dir, 'workflow.json')),
        checklist: loadJson(path.join(dir, 'checklist.json')),
        validation: loadJson(path.join(dir, 'validation.json')),
        readme: { path: path.join(dir, 'README.md'), exists: fs.existsSync(path.join(dir, 'README.md')) },
      },
    });
  }
  return protocols;
}

const tools = discoverTools();
const prompts = discoverPrompts();
const protocols = discoverProtocols();

// Índices de resolução
const toolById = new Map();
const toolByAlias = new Map();
for (const t of tools) { if (t.id) toolById.set(t.id, t); toolByAlias.set(t.alias, t); }
const promptById = new Map();
for (const p of prompts) promptById.set(p.id, p);
const protocolById = new Map();
const protocolByAlias = new Map();
for (const p of protocols) {
  const d = p.files.protocol.data;
  if (d) {
    if (d.id) protocolById.set(d.id, p);
    if (d.alias) protocolByAlias.set(d.alias, p);
    if (d.legacyAlias) protocolByAlias.set(d.legacyAlias, p);
  }
}

// ==================================================================
// FASE 2 — Resolução do Validation Target
// ==================================================================
const norm = (s) => String(s ?? '').trim().toLowerCase();

function protocolCandidates(p) {
  const d = p.files.protocol.data || {};
  return [p.dirName, d.id, d.alias, d.legacyAlias, d.name].filter(Boolean);
}
function toolCandidates(t) {
  const d = t.data || {};
  return [t.dirName, t.alias, t.id, d.name].filter(Boolean);
}
function promptCandidates(p) {
  const d = p.data || {};
  return [p.dirName, p.id, d.name].filter(Boolean);
}
/** match exacto (normalizado) de um token declarado contra os candidatos de um activo. */
function tokenMatches(token, candidates) {
  const t = norm(token);
  return candidates.some((c) => norm(c) === t);
}

function resolveTargetFile(targetArg) {
  if (!targetArg) return null;
  const asPath = path.isAbsolute(targetArg) ? targetArg : path.join(ROOT, targetArg);
  if (targetArg.endsWith('.json') && fs.existsSync(asPath)) return asPath;
  const inTargets = path.join(ROOT, 'targets', targetArg.endsWith('.json') ? targetArg : `${targetArg}.json`);
  return inTargets;
}

let target = null; // { id, name, version, file, declared:{protocols,tools,prompts}, ignore, active:true }
if (cli.target) {
  const tf = resolveTargetFile(cli.target);
  const load = loadJson(tf);
  if (!load.exists) {
    console.error(`ERRO: target "${cli.target}" não encontrado (${rel(tf)}).`);
    process.exit(2);
  }
  if (!load.ok) {
    console.error(`ERRO: target "${cli.target}" inválido: ${load.empty ? 'ficheiro vazio' : load.error}`);
    process.exit(2);
  }
  const d = load.data;
  target = {
    id: d.id || cli.target,
    name: d.name || d.id || cli.target,
    version: d.version || null,
    file: tf,
    declared: {
      protocols: (d.assets && d.assets.protocols) || [],
      tools: (d.assets && d.assets.tools) || [],
      prompts: (d.assets && d.assets.prompts) || [],
    },
    ignore: d.ignore || [],
    active: true,
  };
}

// Marca cada activo com pertença ao target (__inTarget). Sem target => tudo pertence.
function applyMembership(asset, declaredTokens, candidates) {
  asset.__candidates = candidates;
  asset.__key = `${asset.kind}:${asset.dirName}`;
  asset.__inTarget = target ? declaredTokens.some((tok) => tokenMatches(tok, candidates)) : true;
}
for (const p of protocols) {
  applyMembership(p, target ? target.declared.protocols : [], protocolCandidates(p));
  p.__id = (p.files.protocol.data && p.files.protocol.data.id) || p.dirName;
  p.__populated = p.files.protocol.ok;
}
for (const t of tools) {
  applyMembership(t, target ? target.declared.tools : [], toolCandidates(t));
  t.__id = t.id || t.alias;
  t.__populated = t.populated;
}
for (const p of prompts) {
  applyMembership(p, target ? target.declared.prompts : [], promptCandidates(p));
  p.__id = p.id;
  p.__populated = p.populated;
}

// Activos declarados no target mas inexistentes no repositório => erro de target.
const missingDeclared = { protocols: [], tools: [], prompts: [] };
if (target) {
  const check = (tokens, all, candFn, kind, bucket) => {
    for (const tok of tokens) {
      const found = all.some((a) => tokenMatches(tok, candFn(a)));
      if (!found) {
        bucket.push(tok);
        addError('E_TARGET_ASSET_NOT_FOUND', `Target ${target.name}: activo declarado "${tok}" (${kind}) não existe no repositório`, { ref: tok, kind });
      }
    }
  };
  check(target.declared.protocols, protocols, protocolCandidates, 'protocol', missingDeclared.protocols);
  check(target.declared.tools, tools, toolCandidates, 'tool', missingDeclared.tools);
  check(target.declared.prompts, prompts, promptCandidates, 'prompt', missingDeclared.prompts);
}

// ------------------------------------------------------------------
// Roadmap: referências emitidas por activos IN-TARGET para fora do target.
// ------------------------------------------------------------------
const roadmapRefs = new Set();      // tokens crus (para match difuso de activos)
const roadmapAssetKeys = new Set(); // activos resolvidos com precisão como roadmap
function addRoadmapRef(...vals) {
  for (const v of vals) if (v != null && String(v).trim() !== '') roadmapRefs.add(String(v));
}

/**
 * Classifica uma referência emitida por um activo IN-TARGET.
 *  - resolve para activo IN-TARGET populado  => OK
 *  - resolve para activo IN-TARGET vazio      => erro (hard) / warning (soft)
 *  - resolve para activo OUT-OF-TARGET        => Roadmap (nunca erro)
 *  - não resolve (dangling):  hard => erro ;  soft => Roadmap (ref por resolver)
 */
function classifyRef({ from, fromFile, kind, ref, resolved, hard, missingCode }) {
  if (resolved) {
    if (resolved.__inTarget) {
      addDependency({ from, kind, ref, resolvedTo: resolved.__id, resolved: true, scope: 'target' });
      if (!resolved.__populated) {
        const msg = `${from}: activo do target "${ref}" existe mas está vazio/inválido`;
        if (hard) addError(missingCode, msg, { from, ref, kind, file: relOrU(fromFile) });
        else addWarning('W_REF_TO_UNPOPULATED', msg, { from, ref, kind, file: relOrU(fromFile) });
      }
      return resolved;
    }
    // fora do target => roadmap (link para o futuro)
    roadmapAssetKeys.add(resolved.__key);
    addRoadmapRef(ref, ...(resolved.__candidates || []));
    addDependency({ from, kind, ref, resolvedTo: resolved.__id, resolved: true, scope: 'roadmap' });
    return resolved;
  }
  // dangling
  if (hard) {
    addDependency({ from, kind, ref, resolvedTo: null, resolved: false, scope: 'target' });
    addError(missingCode, `${from}: referência ${kind} "${ref}" não resolve`, { from, ref, kind, file: relOrU(fromFile) });
  } else {
    addRoadmapRef(ref);
    addDependency({ from, kind, ref, resolvedTo: null, resolved: false, scope: 'roadmap' });
  }
  return null;
}

// Códigos curtos de actividade por protocolo (usado por tools/prompts/checklist/validation)
const activityCodesCache = new Map();
function activityShortCodesOf(proto) {
  if (activityCodesCache.has(proto)) return activityCodesCache.get(proto);
  const wf = proto.files.workflow.data;
  if (!wf || !Array.isArray(wf.activities)) { activityCodesCache.set(proto, null); return null; }
  const set = new Set();
  for (const act of wf.activities) { const c = shortActivityCode(act.id); if (c) set.add(c); }
  activityCodesCache.set(proto, set);
  return set;
}

// Detecção de IDs duplicados — apenas entre activos IN-TARGET.
function detectDuplicates(pairs, code, scope) {
  const seen = new Map();
  for (const { id, where } of pairs) {
    if (!id) continue;
    if (seen.has(id)) addError(code, `${scope}: id duplicado "${id}" em ${where} e ${seen.get(id)}`, { id, scope });
    else seen.set(id, where);
  }
}
detectDuplicates(tools.filter((t) => t.__inTarget && t.id).map((t) => ({ id: t.id, where: rel(t.path) })), 'E_DUPLICATE_TOOL_ID', 'Tools');
detectDuplicates(prompts.filter((p) => p.__inTarget && p.data && p.data.id).map((p) => ({ id: p.data.id, where: rel(p.path) })), 'E_DUPLICATE_PROMPT_ID', 'Prompts');
detectDuplicates(
  protocols.filter((p) => p.__inTarget && p.files.protocol.data && p.files.protocol.data.id).map((p) => ({ id: p.files.protocol.data.id, where: rel(p.files.protocol.path) })),
  'E_DUPLICATE_PROTOCOL_ID', 'Protocols');

// ==================================================================
// FASE 3 — Validação de ferramentas IN-TARGET
// ==================================================================
for (const t of tools) {
  if (!t.__inTarget) continue;
  const scopeId = t.id || t.alias;
  if (!checkFile(t.load, { scope: 'Tool', id: scopeId })) continue;

  for (const altId of t.data.alternatives || []) {
    classifyRef({ from: `Tool ${scopeId}`, fromFile: t.path, kind: 'tool.alternative', ref: altId,
      resolved: toolById.get(altId) || null, hard: false });
  }
  for (const uc of t.data.useCases || []) {
    if (!uc.protocol) continue;
    const proto = classifyRef({ from: `Tool ${scopeId} · useCase "${uc.name || ''}"`, fromFile: t.path,
      kind: 'usecase.protocol', ref: uc.protocol, resolved: protocolByAlias.get(uc.protocol) || null, hard: false });
    if (proto && proto.__inTarget && uc.activity) {
      const codes = String(uc.activity).split(',').map((s) => s.trim()).filter(Boolean);
      const available = activityShortCodesOf(proto);
      for (const code of codes) {
        if (available && !available.has(code)) {
          addWarning('W_TOOL_USECASE_ACTIVITY_MISSING',
            `Tool ${scopeId} · useCase refere actividade "${code}" inexistente no workflow de ${uc.protocol}`,
            { from: `Tool ${scopeId}`, ref: code, file: rel(t.path) });
        }
      }
    }
  }
}

// ==================================================================
// FASE 4 — Validação de prompts IN-TARGET
// ==================================================================
for (const p of prompts) {
  if (!p.__inTarget) continue;
  const scopeId = p.id;
  if (!checkFile(p.load, { scope: 'Prompt', id: scopeId })) continue;
  const d = p.data;

  if (!p.hasPromptMd) addError('E_PROMPT_CONTENT_MISSING', `Prompt ${scopeId}: prompt.md inexistente`, { id: scopeId, file: rel(p.promptMdPath) });
  else if (p.promptMdEmpty) addWarning('W_PROMPT_CONTENT_EMPTY', `Prompt ${scopeId}: prompt.md vazio`, { id: scopeId, file: rel(p.promptMdPath) });

  const proto = d.protocol
    ? classifyRef({ from: `Prompt ${scopeId}`, fromFile: p.path, kind: 'prompt.protocol', ref: d.protocol,
        resolved: protocolByAlias.get(d.protocol) || null, hard: true, missingCode: 'E_PROMPT_PROTOCOL_MISSING' })
    : null;
  if (!d.protocol) addWarning('W_PROMPT_NO_PROTOCOL', `Prompt ${scopeId}: sem campo "protocol"`, { id: scopeId, file: rel(p.path) });

  if (proto && proto.__inTarget && d.activity) {
    const available = activityShortCodesOf(proto);
    if (available && !available.has(d.activity)) {
      addError('E_PROMPT_ACTIVITY_MISSING', `Prompt ${scopeId}: actividade "${d.activity}" não existe no workflow de ${d.protocol}`,
        { id: scopeId, ref: d.activity, file: rel(p.path) });
    }
  }

  for (const alias of d.compatibleTools || []) {
    classifyRef({ from: `Prompt ${scopeId}`, fromFile: p.path, kind: 'prompt.compatibleTool', ref: alias,
      resolved: toolByAlias.get(alias) || null, hard: false });
  }
}

// ==================================================================
// FASE 5 — Validação de protocolos IN-TARGET (núcleo executável)
// ==================================================================
const ACTIVITY_REQUIRED_FIELDS = ['id', 'objective', 'instruction', 'tool', 'prompt', 'validation', 'evidence', 'outputs'];

for (const proto of protocols) {
  if (!proto.__inTarget) continue;
  const pid = proto.dirName;
  const okProtocol = checkFile(proto.files.protocol, { scope: 'Protocol', id: pid });

  if (!proto.files.readme.exists) addWarning('W_README_MISSING', `Protocol ${pid}: README.md em falta`, { id: pid });

  if (!okProtocol) {
    checkFile(proto.files.workflow, { scope: 'Workflow', id: pid });
    checkFile(proto.files.checklist, { scope: 'Checklist', id: pid });
    checkFile(proto.files.validation, { scope: 'Validation', id: pid });
    continue;
  }

  const P = proto.files.protocol.data;
  const label = `Protocol ${P.id || pid}`;

  if (P.legacyAlias && P.legacyAlias !== pid && P.alias !== pid) {
    addWarning('W_ALIAS_DIR_MISMATCH',
      `${label}: nome da pasta "${pid}" não corresponde a legacyAlias "${P.legacyAlias}" nem a alias "${P.alias}"`,
      { id: P.id, file: rel(proto.files.protocol.path) });
  }

  // --- workflow.json ---
  const wfLoad = proto.files.workflow;
  const wfOk = checkFile(wfLoad, { scope: 'Workflow', id: P.id || pid });
  const workflow = wfOk ? wfLoad.data : null;

  if (workflow) {
    if (P.workflow && workflow.id && P.workflow !== workflow.id) {
      addError('E_WORKFLOW_ID_MISMATCH', `${label}: protocol.workflow "${P.workflow}" ≠ workflow.json id "${workflow.id}"`, { id: P.id, file: rel(wfLoad.path) });
    }
    addDependency({ from: label, kind: 'protocol.workflow', ref: P.workflow || null, resolvedTo: workflow.id || null, resolved: !!workflow.id && P.workflow === workflow.id, scope: 'target' });

    const activities = Array.isArray(workflow.activities) ? workflow.activities : [];
    if (typeof workflow.totalActivities === 'number' && workflow.totalActivities !== activities.length) {
      addWarning('W_TOTAL_ACTIVITIES_MISMATCH', `${label}: totalActivities=${workflow.totalActivities} mas há ${activities.length} actividades`, { id: P.id, file: rel(wfLoad.path) });
    }
    detectDuplicates(activities.map((a) => ({ id: a.id, where: rel(wfLoad.path) })), 'E_DUPLICATE_ACTIVITY_ID', `${label}/workflow`);

    const compositeIds = new Set(activities.map((a) => a.id));
    for (const act of activities) {
      const aLabel = `${label} · ${act.id || '(sem id)'}`;
      for (const field of ACTIVITY_REQUIRED_FIELDS) {
        const v = act[field];
        if (v == null || (typeof v === 'string' && v.trim() === '')) {
          addWarning('W_ACTIVITY_FIELD_MISSING', `${aLabel}: campo obrigatório "${field}" em falta`, { id: act.id, ref: field, file: rel(wfLoad.path) });
        }
      }
      if (act.tool) classifyRef({ from: aLabel, fromFile: wfLoad.path, kind: 'activity.tool', ref: act.tool, resolved: toolByAlias.get(act.tool) || null, hard: true, missingCode: 'E_ACTIVITY_TOOL_MISSING' });
      for (const alt of act.toolAlternatives || []) classifyRef({ from: aLabel, fromFile: wfLoad.path, kind: 'activity.toolAlternative', ref: alt, resolved: toolByAlias.get(alt) || null, hard: false });
      if (act.prompt) classifyRef({ from: aLabel, fromFile: wfLoad.path, kind: 'activity.prompt', ref: act.prompt, resolved: promptById.get(act.prompt) || null, hard: true, missingCode: 'E_ACTIVITY_PROMPT_MISSING' });
      if (act.nextActivity != null && !compositeIds.has(act.nextActivity)) {
        addError('E_NEXT_ACTIVITY_MISSING', `${aLabel}: nextActivity "${act.nextActivity}" não corresponde a nenhuma actividade`, { id: act.id, ref: act.nextActivity, file: rel(wfLoad.path) });
      }
    }

    // Alcançabilidade da cadeia nextActivity
    if (activities.length > 0) {
      const start = activities.find((a) => a.order === 1) || activities[0];
      const visited = new Set();
      let cur = start, cycle = false;
      while (cur && !cycle) {
        if (visited.has(cur.id)) { cycle = true; break; }
        visited.add(cur.id);
        cur = cur.nextActivity ? activities.find((a) => a.id === cur.nextActivity) : null;
      }
      if (cycle) addError('E_WORKFLOW_CYCLE', `${label}: ciclo detectado na cadeia nextActivity`, { id: P.id, file: rel(wfLoad.path) });
      for (const a of activities) {
        if (!visited.has(a.id)) addWarning('W_ACTIVITY_UNREACHABLE', `${label}: actividade "${a.id}" inalcançável via nextActivity`, { id: a.id, file: rel(wfLoad.path) });
      }
    }
  }

  // --- checklist.json ---
  const ckLoad = proto.files.checklist;
  if (checkFile(ckLoad, { scope: 'Checklist', id: P.id || pid })) {
    const checklist = ckLoad.data;
    if (P.checklist && checklist.id && P.checklist !== checklist.id) {
      addError('E_CHECKLIST_ID_MISMATCH', `${label}: protocol.checklist "${P.checklist}" ≠ checklist.json id "${checklist.id}"`, { id: P.id, file: rel(ckLoad.path) });
    }
    addDependency({ from: label, kind: 'protocol.checklist', ref: P.checklist || null, resolvedTo: checklist.id || null, resolved: !!checklist.id && P.checklist === checklist.id, scope: 'target' });

    const items = (checklist.sections || []).flatMap((s) => s.items || []);
    detectDuplicates(items.map((it) => ({ id: it.id, where: rel(ckLoad.path) })), 'E_DUPLICATE_CHECKLIST_ITEM_ID', `${label}/checklist`);
    const shortCodes = activityShortCodesOf(proto);
    for (const it of items) {
      if (it.activity && shortCodes) {
        if (!shortCodes.has(it.activity)) addError('E_CHECKLIST_ACTIVITY_MISSING', `${label}: item "${it.id}" refere actividade "${it.activity}" inexistente no workflow`, { id: it.id, ref: it.activity, file: rel(ckLoad.path) });
        else addDependency({ from: `${label} · checklist ${it.id}`, kind: 'checklist.activity', ref: it.activity, resolvedTo: it.activity, resolved: true, scope: 'target' });
      }
    }
  }

  // --- validation.json ---
  const vaLoad = proto.files.validation;
  if (checkFile(vaLoad, { scope: 'Validation', id: P.id || pid })) {
    const validation = vaLoad.data;
    const gIds = (validation.globalRules || []).map((r) => ({ id: r.id, where: rel(vaLoad.path) }));
    const aIds = (validation.activityRules || []).flatMap((ar) => (ar.rules || []).map((r) => ({ id: r.id, where: rel(vaLoad.path) })));
    detectDuplicates([...gIds, ...aIds], 'E_DUPLICATE_VALIDATION_RULE_ID', `${label}/validation`);
    const shortCodes = activityShortCodesOf(proto);
    for (const ar of validation.activityRules || []) {
      if (ar.activity && shortCodes) {
        if (!shortCodes.has(ar.activity)) addError('E_VALIDATION_ACTIVITY_MISSING', `${label}: regra refere actividade "${ar.activity}" inexistente no workflow`, { id: validation.id, ref: ar.activity, file: rel(vaLoad.path) });
        else addDependency({ from: `${label} · validation`, kind: 'validation.activity', ref: ar.activity, resolvedTo: ar.activity, resolved: true, scope: 'target' });
      }
    }
  }

  // --- referências declaradas no protocol.json ---
  for (const tref of P.tools || []) {
    let tool = tref.id ? toolById.get(tref.id) : null;
    if (!tool && tref.alias) tool = toolByAlias.get(tref.alias) || null;
    const resolved = classifyRef({ from: label, fromFile: proto.files.protocol.path, kind: 'protocol.tool', ref: tref.id || tref.alias, resolved: tool, hard: true, missingCode: 'E_TOOL_REF_MISSING' });
    if (resolved && resolved.__inTarget && tref.alias && resolved.alias !== tref.alias) {
      addWarning('W_TOOL_ALIAS_MISMATCH', `${label}: alias declarado "${tref.alias}" ≠ alias real "${resolved.alias}" (id ${tref.id})`, { id: P.id, ref: tref.alias, file: rel(proto.files.protocol.path) });
    }
  }
  for (const prRef of P.prompts || []) {
    classifyRef({ from: label, fromFile: proto.files.protocol.path, kind: 'protocol.prompt', ref: prRef, resolved: promptById.get(prRef) || null, hard: true, missingCode: 'E_PROMPT_REF_MISSING' });
  }

  // Coerência: prompts declarados vs prompts usados no workflow
  if (workflow && Array.isArray(workflow.activities)) {
    const declared = new Set(P.prompts || []);
    const used = new Set(workflow.activities.map((a) => a.prompt).filter(Boolean));
    for (const u of used) if (!declared.has(u)) addWarning('W_PROMPT_SET_MISMATCH', `${label}: prompt "${u}" usado no workflow mas não listado em protocol.prompts`, { id: P.id, ref: u, file: rel(proto.files.protocol.path) });
    for (const de of declared) if (!used.has(de)) addWarning('W_PROMPT_SET_MISMATCH', `${label}: prompt "${de}" listado em protocol.prompts mas não usado no workflow`, { id: P.id, ref: de, file: rel(proto.files.protocol.path) });
  }

  for (const pre of P.prerequisites || []) {
    const preId = typeof pre === 'string' ? pre : pre.id;
    classifyRef({ from: label, fromFile: proto.files.protocol.path, kind: 'protocol.prerequisite', ref: preId, resolved: protocolById.get(preId) || protocolByAlias.get(preId) || null, hard: true, missingCode: 'E_PREREQUISITE_MISSING' });
  }
  for (const np of P.nextProtocols || []) {
    const npId = np.id || np.alias;
    const resolved = protocolById.get(np.id) || protocolByAlias.get(np.alias) || null;
    classifyRef({ from: label, fromFile: proto.files.protocol.path, kind: 'protocol.nextProtocol', ref: npId, resolved, hard: false });
    // tokens explícitos para classificar protocolos-destino ainda vazios como Roadmap
    if (!resolved) addRoadmapRef(np.id, np.alias, np.name);
  }
}

// ==================================================================
// FASE 6 — Classificação Roadmap vs Ignored (activos OUT-OF-TARGET)
// ==================================================================
function refMatchesAsset(candidates) {
  for (const r of roadmapRefs) {
    const rl = norm(r);
    for (const c of candidates) {
      const cl = norm(c);
      if (cl && (rl === cl || rl.includes(cl) || cl.includes(rl))) return true;
    }
  }
  return false;
}
function isRoadmap(asset) {
  if (roadmapAssetKeys.has(asset.__key)) return true;
  return refMatchesAsset(asset.__candidates || []);
}

const roadmap = { protocols: [], tools: [], prompts: [] };
const ignored = { protocols: [], tools: [], prompts: [] };

function classifyOutOfTarget(asset, statusFn, bucketKey) {
  if (asset.__inTarget) return;
  const entry = { dir: asset.dirName, id: asset.__id || null, status: statusFn(asset), populated: !!asset.__populated };
  if (isRoadmap(asset)) roadmap[bucketKey].push(entry);
  else ignored[bucketKey].push(entry);
}
for (const p of protocols) classifyOutOfTarget(p, (a) => fileStatus(a.files.protocol), 'protocols');
for (const t of tools) classifyOutOfTarget(t, (a) => fileStatus(a.load), 'tools');
for (const p of prompts) classifyOutOfTarget(p, (a) => fileStatus(a.load), 'prompts');

// ==================================================================
// FASE 7 — Montagem do relatório
// ==================================================================
const targetDeps = report.dependencies.filter((d) => d.scope === 'target');
const roadmapDeps = report.dependencies.filter((d) => d.scope === 'roadmap');
const depsResolved = targetDeps.filter((d) => d.resolved).length;

const targetStatus = report.errors.length > 0 ? 'FAIL' : report.warnings.length > 0 ? 'PASS_WITH_WARNINGS' : 'PASS';
const frontendReady = report.errors.length === 0;

const inT = (arr) => arr.filter((a) => a.__inTarget);
const protoFullyValid = (p) => p.files.protocol.ok && p.files.workflow.ok && p.files.checklist.ok && p.files.validation.ok;

function kindStatus(all, declaredTokens, populatedFn, validFn) {
  const present = inT(all);
  return {
    declared: target ? declaredTokens.length : all.length,
    present: present.length,
    valid: present.filter(validFn).length,
    populated: present.filter(populatedFn).length,
  };
}

const output = {
  $schema: 'researchai-hub/content-runtime-validation-report@2',
  generatedAt: new Date().toISOString(),
  root: rel(ROOT) || '.',
  target: target
    ? { id: target.id, name: target.name, version: target.version, file: rel(target.file), active: true, declared: target.declared }
    : { id: 'all', name: 'Repositório completo', active: false, declared: null },

  repositoryStatus: {
    protocols: { found: protocols.length, populated: protocols.filter((p) => p.__populated).length },
    tools: { found: tools.length, populated: tools.filter((t) => t.__populated).length },
    prompts: { found: prompts.length, populated: prompts.filter((p) => p.__populated).length },
    totalAssets: protocols.length + tools.length + prompts.length,
    populatedAssets: protocols.filter((p) => p.__populated).length + tools.filter((t) => t.__populated).length + prompts.filter((p) => p.__populated).length,
  },

  targetStatus: {
    label: target ? target.name : 'Repositório completo',
    status: targetStatus,
    protocols: { ...kindStatus(protocols, target ? target.declared.protocols : [], (p) => p.__populated, protoFullyValid), missing: missingDeclared.protocols },
    tools: { ...kindStatus(tools, target ? target.declared.tools : [], (t) => t.__populated, (t) => t.__populated), missing: missingDeclared.tools },
    prompts: { ...kindStatus(prompts, target ? target.declared.prompts : [], (p) => p.__populated, (p) => p.__populated && p.hasPromptMd), missing: missingDeclared.prompts },
    dependenciesResolved: depsResolved,
    dependenciesTotal: targetDeps.length,
    errorCount: report.errors.length,
    warningCount: report.warnings.length,
  },

  frontendReady,

  roadmapAssets: roadmap,
  ignoredAssets: ignored,

  assets: {
    protocols: protocols.map((p) => {
      const d = p.files.protocol.data;
      const wf = p.files.workflow.data;
      return {
        dir: p.dirName, id: d ? d.id || null : null, alias: d ? d.alias || null : null, name: d ? d.name || null : null,
        state: d ? d.state || null : null, inTarget: p.__inTarget,
        files: { protocol: fileStatus(p.files.protocol), workflow: fileStatus(p.files.workflow), checklist: fileStatus(p.files.checklist), validation: fileStatus(p.files.validation), readme: p.files.readme.exists ? 'ok' : 'missing' },
        activities: wf && Array.isArray(wf.activities) ? wf.activities.length : 0,
      };
    }),
    tools: tools.map((t) => ({ dir: t.dirName, alias: t.alias, id: t.id, name: t.name, category: t.category, inTarget: t.__inTarget, file: fileStatus(t.load), populated: t.populated })),
    prompts: prompts.map((p) => ({ dir: p.dirName, id: p.id, name: p.data ? p.data.name || null : null, protocol: p.data ? p.data.protocol || null : null, activity: p.data ? p.data.activity || null : null, inTarget: p.__inTarget, file: fileStatus(p.load), hasPromptMd: p.hasPromptMd })),
  },

  dependencies: {
    target: { resolved: targetDeps.filter((d) => d.resolved), unresolved: targetDeps.filter((d) => !d.resolved) },
    roadmap: roadmapDeps,
  },

  errors: report.errors,
  warnings: report.warnings,
};

fs.writeFileSync(OUT, JSON.stringify(output, null, 2) + '\n', 'utf8');

// ==================================================================
// FASE 8 — Resumo na consola
// ==================================================================
if (!cli.quiet) {
  const R = output.repositoryStatus;
  const T = output.targetStatus;
  const line = '─'.repeat(64);
  const nRoadmap = roadmap.protocols.length + roadmap.tools.length + roadmap.prompts.length;
  const nIgnored = ignored.protocols.length + ignored.tools.length + ignored.prompts.length;
  const roadmapDirs = [...roadmap.protocols, ...roadmap.tools, ...roadmap.prompts].map((a) => a.dir);
  const ignoredDirs = [...ignored.protocols, ...ignored.tools, ...ignored.prompts].map((a) => a.dir);

  console.log(line);
  console.log('  Content Runtime Validator — ResearchAI Hub');
  console.log(line);
  console.log('  REPOSITORY STATUS');
  console.log(`    Protocolos:   ${R.protocols.populated}/${R.protocols.found} preenchidos`);
  console.log(`    Ferramentas:  ${R.tools.populated}/${R.tools.found} preenchidas`);
  console.log(`    Prompts:      ${R.prompts.populated}/${R.prompts.found} preenchidos`);
  console.log(line);
  console.log(`  ${T.label.toUpperCase()} STATUS  ·  ${T.status}`);
  console.log(`    Protocolos:   ${T.protocols.valid}/${T.protocols.declared} válidos (${T.protocols.present} presentes)`);
  console.log(`    Ferramentas:  ${T.tools.populated}/${T.tools.declared} preenchidas`);
  console.log(`    Prompts:      ${T.prompts.valid}/${T.prompts.declared} completos`);
  console.log(`    Dependências: ${T.dependenciesResolved}/${T.dependenciesTotal} resolvidas`);
  console.log(`    Erros:        ${T.errorCount}   ·   Warnings: ${T.warningCount}`);
  console.log(line);
  console.log(`  FRONTEND READY: ${frontendReady ? 'SIM ✓' : 'NÃO ✗'}`);
  console.log(line);
  console.log(`  ROADMAP ASSETS (${nRoadmap}): ${roadmapDirs.join(', ') || '—'}`);
  console.log(`  IGNORED ASSETS (${nIgnored}): ${ignoredDirs.join(', ') || '—'}`);
  console.log(line);
  console.log(`  Relatório: ${rel(OUT)}`);
  console.log(line);

  if (T.errorCount > 0) {
    console.log('\n  ERROS:');
    for (const e of report.errors.slice(0, 30)) console.log(`   ✗ [${e.code}] ${e.message}`);
    if (report.errors.length > 30) console.log(`   … +${report.errors.length - 30} (ver relatório)`);
  }
  if (T.warningCount > 0) {
    console.log('\n  WARNINGS:');
    for (const w of report.warnings.slice(0, 15)) console.log(`   ! [${w.code}] ${w.message}`);
    if (report.warnings.length > 15) console.log(`   … +${report.warnings.length - 15} (ver relatório)`);
  }
  console.log('');
}

process.exitCode = report.errors.length > 0 ? 1 : 0;
