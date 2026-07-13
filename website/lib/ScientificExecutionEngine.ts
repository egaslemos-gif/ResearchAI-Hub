/* ============================================================
   ScientificExecutionEngine.ts — Scientific Execution Architecture

   ResearchAI Hub is a Scientific Research Operating System.
   The AI is just one executor among many.

   Architecture:
   Workspace → Protocol → Scientific Task → Execution Profile
       → Execution Engine → Output → Review → Validation → Evidence → Artifact → Knowledge

   Four pillars:
   1. ScientificTask — unit of scientific work (not a prompt)
   2. ExecutionProfile — preferences persisted on workspace, reusable
   3. ExecutionEngine — the executor layer (cloud LLM, external, local, future tools)
   4. TaskPipeline — scientific pipeline, prompt is optional technical detail

   This file contains ONLY:
   - Types & Interfaces
   - Execution Catalog (registry)
   - Factory
   - Provider implementations
   - Metadata & helpers

   No UI logic. No JSX. No React.
   ============================================================ */

/* ============================================================
   §1 — Core Types
   ============================================================ */

/* ---- Engine types (internal classification) ---- */
export type ProviderType = "cloud" | "external" | "local";

/* ---- Engine category labels (user-facing, not technical) ---- */
export const ENGINE_CATEGORY_LABELS: Record<ProviderType, string> = {
  cloud: "ResearchAI Hub",
  external: "Motores Externos",
  local: "Execução Local",
};

/* ---- Engine action labels (what the user will do) ---- */
export function getEngineActionLabel(engineId: string): string {
  const engine = getEngine(engineId);
  if (!engine) return "Executar";
  switch (engine.type) {
    case "cloud":
      return engine.recommended ? "Executar aqui (recomendado)" : "Executar aqui";
    case "external":
      return `Executar no ${engine.label}`;
    case "local":
      return "Executar localmente";
  }
}

/* ============================================================
   §2 — Domain Concepts (each has its own type)
   ============================================================ */

/* ---- Scientific Task (the unit of work, NOT a prompt) ---- */
export interface ScientificTask {
  id: string;
  protocolSlug: string;
  step: number;
  title: string;
  objective: string;
  description: string;
  taskType: TaskType;
  expectedOutput: string;
  inputs?: TaskInput[];
  outputs?: TaskOutput[];
  variables?: Record<string, string>;
  validator?: TaskValidator;
  artifactType?: string;
  retryPolicy?: RetryPolicy;
  evidencePolicy?: EvidencePolicy;
}

export interface TaskInput {
  name: string;
  type: string;
  required: boolean;
  source?: string;
}

export interface TaskOutput {
  name: string;
  type: string;
}

export interface TaskValidator {
  type: "strict" | "standard" | "lenient" | "custom";
  rules?: string[];
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffMs: number;
}

export interface EvidencePolicy {
  requireSources: boolean;
  minSources: number;
  requireCitations: boolean;
}

export type TaskType =
  | "literature-search"
  | "synthesis"
  | "analysis"
  | "validation"
  | "writing"
  | "coding"
  | "data-query"
  | "visualization"
  | "review"
  | "custom";

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  "literature-search": "Pesquisa Bibliográfica",
  "synthesis": "Síntese",
  "analysis": "Análise Comparativa",
  "validation": "Validação",
  "writing": "Escrita Académica",
  "coding": "Programação",
  "data-query": "Consulta de Dados",
  "visualization": "Visualização",
  "review": "Revisão",
  "custom": "Personalizada",
};

/* ---- Execution Profile (persisted on workspace, reusable across protocols) ---- */
export interface ExecutionProfile {
  engineId: string;
  model?: string;
  temperature?: number;
  outputStyle?: ExecutionOutputStyle;
  validationMode?: ExecutionValidationMode;
  promptStrategy?: ExecutionPromptStrategy;
  maxTokens?: number;
}

export type ExecutionOutputStyle = "structured" | "formal" | "narrative" | "technical";
export type ExecutionValidationMode = "strict" | "standard" | "lenient";
export type ExecutionPromptStrategy = "research" | "analytical" | "creative" | "systematic";

/* ---- Backward compat: old executionProvider config ---- */
export interface ExecutionProviderConfig {
  type: ProviderType;
  assistantId: string;
}

/* ---- Execution Engine metadata (catalog entry) ---- */
export interface ExecutionEngine {
  id: string;
  label: string;
  icon: string;
  type: ProviderType;
  description: string;
  url?: string;
  recommended?: boolean;
  models?: string[];
  contextWindow?: string;
  defaultTemperature?: number;
  estimatedTime?: string;
  capabilities?: string[];
  recommendedProtocols?: string[];
  /* Capability resolution — which scientific capabilities this engine provides */
  providesCapabilities?: ScientificCapability[];
}

/* ---- Execution Workflow (per-engine UI flow steps) ---- */
export interface WorkflowStep {
  id: string;
  label: string;
  hint?: string;
}

/* ---- Execution Capability (what the engine can do) ---- */
export type ExecutionCapability =
  | "conversation"
  | "text"
  | "code"
  | "pdf"
  | "web"
  | "images"
  | "streaming"
  | "long-context"
  | "documents"
  | "audio"
  | "sources"
  | "synthesis"
  | "analysis"
  | "writing"
  | "math"
  | "reasoning"
  | "private"
  | "validation"
  | "books";

/* ---- Execution Card data (shown before execution in UI) ---- */
/* Split into basic (user-facing) and advanced (technical) */
export interface ExecutionCardData {
  /* Basic — shown to all users */
  engine: string;
  engineId: string;
  model: string;
  providerType: ProviderType;
  estimatedTime: string;
  expectedOutput: string;
  taskType: string;
  taskTypeLabel: string;
  taskTypeDescription: string;
  artifactType: string;
  /* Advanced — collapsible, for power users */
  contextWindow: string;
  temperature: number;
  outputStyle: string;
  validationMode: string;
  promptTokens: number;
}

/* ============================================================
   §3 — Execution Context & Result
   ============================================================ */

export interface ExecutionContext {
  prompt: string;
  model: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ExecutionResult {
  content: string;
  tokensUsed: number;
  latencyMs: number;
  model: string;
  success: boolean;
  error?: string;
}

export interface StreamChunk {
  delta: string;
  done: boolean;
  tokensSoFar: number;
}

/* ============================================================
   §4 — Execution Provider Interface (internal engine contract)
   ============================================================ */

export interface ExecutionProvider {
  readonly type: ProviderType;
  readonly label: string;
  readonly description: string;

  compilePrompt(ctx: ExecutionContext): string;
  execute(ctx: ExecutionContext): Promise<ExecutionResult>;
  stream(
    ctx: ExecutionContext,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<ExecutionResult>;
  cancel(): void;
  validate(result: ExecutionResult): { valid: boolean; issues: string[] };
}

/* ============================================================
   §5 — Execution Catalog (single registry for all engines)
   ============================================================ */

export const EXECUTION_CATALOG: ExecutionEngine[] = [
  /* --- Execução Integrada --- */
  {
    id: "researchai-cloud",
    label: "ResearchAI Cloud",
    icon: "☁",
    type: "cloud",
    description: "Execução integrada na plataforma",
    models: ["Gemini 2.0 Flash"],
    recommended: true,
    contextWindow: "128k",
    defaultTemperature: 0.2,
    estimatedTime: "~15s",
    capabilities: ["Conversação", "Texto", "Código", "Streaming", "Validação automática"],
    recommendedProtocols: ["revisao-da-literatura"],
    providesCapabilities: ["conversation", "writing", "synthesis", "analysis", "reasoning", "coding", "validation", "literature-search"],
  },

  /* --- Execução Externa --- */
  {
    id: "chatgpt",
    label: "ChatGPT",
    icon: "🤖",
    type: "external",
    description: "Copiar prompt → colar no ChatGPT → colar resposta",
    url: "https://chat.openai.com",
    contextWindow: "128k",
    defaultTemperature: 0.2,
    estimatedTime: "~30s",
    capabilities: ["Conversação", "Texto", "Código", "PDF", "Web", "Imagens"],
    recommendedProtocols: ["revisao-da-literatura"],
    providesCapabilities: ["conversation", "writing", "coding", "pdf-processing", "web-search", "reasoning", "analysis", "synthesis", "literature-search"],
  },
  {
    id: "gemini",
    label: "Gemini",
    icon: "✨",
    type: "external",
    description: "Copiar prompt → colar no Gemini → colar resposta",
    url: "https://gemini.google.com",
    contextWindow: "1M",
    defaultTemperature: 0.2,
    estimatedTime: "~25s",
    capabilities: ["Conversação", "Texto", "Código", "Web", "Imagens", "Contexto longo"],
    recommendedProtocols: ["revisao-da-literatura"],
    providesCapabilities: ["conversation", "writing", "coding", "web-search", "reasoning", "analysis", "synthesis", "literature-search", "pdf-processing"],
  },
  {
    id: "claude",
    label: "Claude",
    icon: "🎭",
    type: "external",
    description: "Copiar prompt → colar no Claude → colar resposta",
    url: "https://claude.ai",
    contextWindow: "200k",
    defaultTemperature: 0.2,
    estimatedTime: "~30s",
    capabilities: ["Contexto longo", "Programação", "Escrita", "Documentos", "Análise"],
    recommendedProtocols: ["revisao-da-literatura"],
    providesCapabilities: ["reasoning", "coding", "writing", "pdf-processing", "analysis", "synthesis", "literature-search", "validation"],
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    icon: "🔍",
    type: "external",
    description: "Copiar prompt → colar no DeepSeek → colar resposta",
    url: "https://chat.deepseek.com",
    contextWindow: "64k",
    defaultTemperature: 0.2,
    estimatedTime: "~30s",
    capabilities: ["Conversação", "Código", "Raciocínio", "Matemática"],
    recommendedProtocols: [],
    providesCapabilities: ["conversation", "coding", "reasoning", "statistics", "analysis"],
  },
  {
    id: "notebooklm",
    label: "NotebookLM",
    icon: "📓",
    type: "external",
    description: "Enviar documento → conversar → extrair resposta",
    url: "https://notebooklm.google.com",
    contextWindow: "500k",
    defaultTemperature: 0.3,
    estimatedTime: "~60s",
    capabilities: ["PDF", "Livros", "Áudio", "Fontes", "Síntese"],
    recommendedProtocols: ["revisao-da-literatura"],
    providesCapabilities: ["pdf-processing", "synthesis", "literature-search", "citation-lookup", "analysis"],
  },

  /* --- Execução Local --- */
  {
    id: "ollama",
    label: "Ollama",
    icon: "🦙",
    type: "local",
    description: "Execução local via Ollama",
    url: "http://localhost:11434",
    contextWindow: "32k",
    defaultTemperature: 0.2,
    estimatedTime: "~45s",
    capabilities: ["Conversação", "Texto", "Código", "Privado"],
    recommendedProtocols: [],
    providesCapabilities: ["conversation", "writing", "coding", "reasoning", "analysis"],
  },
  {
    id: "lm-studio",
    label: "LM Studio",
    icon: "🖥",
    type: "local",
    description: "Execução local via LM Studio",
    url: "http://localhost:1234",
    contextWindow: "32k",
    defaultTemperature: 0.2,
    estimatedTime: "~45s",
    capabilities: ["Conversação", "Texto", "Código", "Privado"],
    recommendedProtocols: [],
    providesCapabilities: ["conversation", "writing", "coding", "reasoning", "analysis"],
  },
  {
    id: "open-webui",
    label: "Open WebUI",
    icon: "🌐",
    type: "local",
    description: "Execução local via Open WebUI",
    url: "http://localhost:3000",
    contextWindow: "32k",
    defaultTemperature: 0.2,
    estimatedTime: "~45s",
    capabilities: ["Conversação", "Texto", "Código", "Privado"],
    recommendedProtocols: [],
    providesCapabilities: ["conversation", "writing", "coding", "reasoning", "analysis"],
  },
];

/* ============================================================
   §6 — Catalog Helpers
   ============================================================ */

export function getEngine(id: string): ExecutionEngine | undefined {
  return EXECUTION_CATALOG.find((e) => e.id === id);
}

export function getEngineLabel(id: string): string {
  return getEngine(id)?.label ?? "Executor";
}

export function getEngineType(id: string): ProviderType {
  return getEngine(id)?.type ?? "cloud";
}

export function getEngineUrl(id: string): string | undefined {
  return getEngine(id)?.url;
}

export function getEnginesByType(type: ProviderType): ExecutionEngine[] {
  return EXECUTION_CATALOG.filter((e) => e.type === type);
}

export function getRecommendedEngines(protocolSlug: string): ExecutionEngine[] {
  return EXECUTION_CATALOG.filter((e) =>
    e.recommendedProtocols?.includes(protocolSlug)
  );
}

/* ---- Backward compat aliases (legacy code may still reference these) ---- */
export const AI_ASSISTANTS = EXECUTION_CATALOG;
export function getAssistant(id: string): ExecutionEngine | undefined {
  return getEngine(id);
}
export function getAssistantLabel(id: string): string {
  return getEngineLabel(id);
}
export function getAssistantType(id: string): ProviderType {
  return getEngineType(id);
}
export function getAssistantUrl(id: string): string | undefined {
  return getEngineUrl(id);
}

/* ============================================================
   §7 — Execution Profile Helpers
   ============================================================ */

export function createDefaultProfile(engineId: string): ExecutionProfile {
  const engine = getEngine(engineId);
  return {
    engineId,
    model: engine?.models?.[0],
    temperature: engine?.defaultTemperature ?? 0.2,
    outputStyle: "structured",
    validationMode: "strict",
    promptStrategy: "research",
  };
}

export function profileFromProviderConfig(config: ExecutionProviderConfig): ExecutionProfile {
  return createDefaultProfile(config.assistantId);
}

/* ============================================================
   §8 — Per-Engine Workflow Steps
   Pipeline: Preparação → Execução → Revisão → Validação → Artefacto
   ============================================================ */

export function getEngineWorkflow(engineId: string): WorkflowStep[] {
  const engine = getEngine(engineId);
  if (!engine) return [];

  switch (engine.type) {
    case "cloud":
      return [
        { id: "prepare", label: "Preparação Científica", hint: "Contexto" },
        { id: "execute", label: "Execução", hint: `${engine?.label ?? "Executor"} · ${engine?.models?.[0] ?? "Streaming"}` },
        { id: "review", label: "Revisão", hint: "Investigador" },
        { id: "validate", label: "Validação", hint: "ResearchAI" },
        { id: "artifact", label: "Artefacto", hint: "Guardar" },
      ];
    case "external":
      if (engineId === "notebooklm") {
        return [
          { id: "prepare", label: "Preparação Científica", hint: "Contexto" },
          { id: "copy", label: "Copiar Prompt" },
          { id: "open", label: `Abrir ${engine.label}`, hint: "Enviar como documento" },
          { id: "converse", label: "Conversar", hint: "Fazer perguntas no NotebookLM" },
          { id: "paste", label: "Extrair resposta" },
          { id: "review", label: "Revisão", hint: "Investigador" },
          { id: "validate", label: "Validar", hint: "ResearchAI" },
          { id: "artifact", label: "Artefacto", hint: "Guardar" },
        ];
      }
      return [
        { id: "prepare", label: "Preparação Científica", hint: "Contexto" },
        { id: "copy", label: "Copiar Prompt" },
        { id: "open", label: `Abrir ${engine.label}` },
        { id: "paste", label: "Colar resposta" },
        { id: "review", label: "Revisão", hint: "Investigador" },
        { id: "validate", label: "Validar", hint: "ResearchAI" },
        { id: "artifact", label: "Artefacto", hint: "Guardar" },
      ];
    case "local":
      return [
        { id: "prepare", label: "Preparação Científica", hint: "Contexto" },
        { id: "execute", label: "Execução", hint: `${engine.label} · Local` },
        { id: "review", label: "Revisão", hint: "Investigador" },
        { id: "validate", label: "Validação", hint: "ResearchAI" },
        { id: "artifact", label: "Artefacto", hint: "Guardar" },
      ];
  }
}

/* ---- Backward compat ---- */
export function getAssistantWorkflow(assistantId: string): WorkflowStep[] {
  return getEngineWorkflow(assistantId);
}

/* ============================================================
   §9 — Execution Card Builder
   ============================================================ */

export function buildExecutionCard(
  profile: ExecutionProfile,
  promptLength: number,
  expectedOutput: string,
  taskType?: string,
  artifactType?: string
): ExecutionCardData {
  const engine = getEngine(profile.engineId);
  const promptTokens = Math.ceil(promptLength / 4);
  const taskTypeKey = (taskType ?? "custom") as TaskType;
  const taskTypeLabel = TASK_TYPE_LABELS[taskTypeKey] ?? TASK_TYPE_LABELS.custom;
  return {
    /* Basic */
    engine: engine?.label ?? "Executor",
    engineId: profile.engineId,
    model: profile.model || engine?.models?.[0] || "—",
    providerType: engine?.type ?? "cloud",
    estimatedTime: engine?.estimatedTime ?? "—",
    expectedOutput,
    taskType: taskTypeLabel,
    taskTypeLabel,
    taskTypeDescription: taskType ?? "—",
    artifactType: artifactType ?? "—",
    /* Advanced */
    contextWindow: engine?.contextWindow ?? "—",
    temperature: profile.temperature ?? engine?.defaultTemperature ?? 0.2,
    outputStyle: profile.outputStyle ?? "structured",
    validationMode: profile.validationMode ?? "strict",
    promptTokens,
  };
}

/* ============================================================
   §10 — Migration & Compatibility
   ============================================================ */

export function migrateExecutionMode(mode: string | undefined): ExecutionProviderConfig {
  switch (mode) {
    case "CLOUD":
      return { type: "cloud", assistantId: "researchai-cloud" };
    case "BYOM":
      return { type: "external", assistantId: "chatgpt" };
    case "LOCAL":
      return { type: "local", assistantId: "ollama" };
    default:
      return { type: "cloud", assistantId: "researchai-cloud" };
  }
}

export function migrateToProfile(
  provider: ExecutionProviderConfig | undefined
): ExecutionProfile {
  if (!provider) return createDefaultProfile("researchai-cloud");
  return createDefaultProfile(provider.assistantId);
}

/* ============================================================
   §11 — Provider Implementations
   ============================================================ */

/* ---- CloudProvider — calls platform API (Sprint 2) ---- */

export class CloudProvider implements ExecutionProvider {
  readonly type = "cloud" as const;
  readonly label = "ResearchAI Cloud";
  readonly description = "Execução integrada na plataforma";

  compilePrompt(ctx: ExecutionContext): string {
    return ctx.prompt;
  }

  async execute(ctx: ExecutionContext): Promise<ExecutionResult> {
    return {
      content: "[Cloud execution — Sprint 2]",
      tokensUsed: 0,
      latencyMs: 0,
      model: ctx.model,
      success: false,
      error: "Cloud execution not yet implemented. Use external engines for now.",
    };
  }

  async stream(
    ctx: ExecutionContext,
    _onChunk: (chunk: StreamChunk) => void
  ): Promise<ExecutionResult> {
    return this.execute(ctx);
  }

  cancel(): void {}

  validate(result: ExecutionResult): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    if (!result.content) issues.push("Resposta vazia");
    if (!result.success) issues.push(result.error || "Erro na execução");
    return { valid: issues.length === 0, issues };
  }
}

/* ---- ExternalProvider — copy/paste flow ---- */

export class ExternalProvider implements ExecutionProvider {
  readonly type = "external" as const;
  readonly label = "Executor Externo";
  readonly description = "Copiar prompt, executar no motor externo, colar resposta";

  compilePrompt(ctx: ExecutionContext): string {
    return ctx.prompt;
  }

  async execute(_ctx: ExecutionContext): Promise<ExecutionResult> {
    return {
      content: "",
      tokensUsed: 0,
      latencyMs: 0,
      model: "manual",
      success: true,
    };
  }

  async stream(
    _ctx: ExecutionContext,
    _onChunk: (chunk: StreamChunk) => void
  ): Promise<ExecutionResult> {
    return this.execute(_ctx);
  }

  cancel(): void {}

  validate(result: ExecutionResult): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    if (!result.content || result.content.trim().length < 10) {
      issues.push("Resposta demasiado curta");
    }
    return { valid: issues.length === 0, issues };
  }
}

/* ---- LocalProvider — local LLM (Ollama, LM Studio, etc.) ---- */

export class LocalProvider implements ExecutionProvider {
  readonly type = "local" as const;
  readonly label = "Executor Local";
  readonly description = "Ollama, LM Studio, Open WebUI";

  compilePrompt(ctx: ExecutionContext): string {
    return ctx.prompt;
  }

  async execute(ctx: ExecutionContext): Promise<ExecutionResult> {
    return {
      content: "[Local execution — Sprint 2]",
      tokensUsed: 0,
      latencyMs: 0,
      model: ctx.model,
      success: false,
      error: "Local execution not yet implemented. Use external engines for now.",
    };
  }

  async stream(
    ctx: ExecutionContext,
    _onChunk: (chunk: StreamChunk) => void
  ): Promise<ExecutionResult> {
    return this.execute(ctx);
  }

  cancel(): void {}

  validate(result: ExecutionResult): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    if (!result.content) issues.push("Resposta vazia");
    if (!result.success) issues.push(result.error || "Erro na execução");
    return { valid: issues.length === 0, issues };
  }
}

/* ============================================================
   §12 — Execution Provider Factory
   ============================================================ */

const providerInstances: Record<ProviderType, ExecutionProvider> = {
  cloud: new CloudProvider(),
  external: new ExternalProvider(),
  local: new LocalProvider(),
};

export class ExecutionProviderFactory {
  static create(profile: ExecutionProfile): ExecutionProvider {
    const engine = getEngine(profile.engineId);
    const type = engine?.type ?? "cloud";
    return providerInstances[type] ?? providerInstances.cloud;
  }

  static createByType(type: ProviderType): ExecutionProvider {
    return providerInstances[type] ?? providerInstances.cloud;
  }

  static createByEngineId(engineId: string): ExecutionProvider {
    const type = getEngineType(engineId);
    return providerInstances[type] ?? providerInstances.cloud;
  }
}

/* ---- Backward compat factory functions ---- */
export function getProvider(type: ProviderType): ExecutionProvider {
  return ExecutionProviderFactory.createByType(type);
}

export function getProviderByAssistant(assistantId: string): ExecutionProvider {
  return ExecutionProviderFactory.createByEngineId(assistantId);
}

/* ============================================================
   §13 — Capability Layer
   Task → Capability → Engine (protocol never chooses engine directly)
   ============================================================ */

export type ScientificCapability =
  | "literature-search"
  | "synthesis"
  | "analysis"
  | "statistics"
  | "citation-lookup"
  | "writing"
  | "coding"
  | "visualization"
  | "diagram"
  | "reasoning"
  | "conversation"
  | "pdf-processing"
  | "web-search"
  | "data-query"
  | "validation"
  | "translation";

export interface CapabilityRequirement {
  capability: ScientificCapability;
  priority: "required" | "preferred" | "optional";
}

export function resolveEnginesForCapability(
  capability: ScientificCapability
): ExecutionEngine[] {
  return EXECUTION_CATALOG.filter(
    (e) => e.providesCapabilities?.includes(capability)
  );
}

export function resolveBestEngine(
  requirements: CapabilityRequirement[]
): ExecutionEngine | undefined {
  const required = requirements.filter((r) => r.priority === "required");
  const preferred = requirements.filter((r) => r.priority === "preferred");

  const candidates = EXECUTION_CATALOG.filter((engine) => {
    const caps = engine.providesCapabilities ?? [];
    return required.every((r) => caps.includes(r.capability));
  });

  if (candidates.length === 0) return undefined;

  const scored = candidates.map((engine) => {
    const caps = engine.providesCapabilities ?? [];
    let score = 0;
    for (const req of [...required, ...preferred]) {
      if (caps.includes(req.capability)) {
        score += req.priority === "required" ? 10 : 5;
      }
    }
    if (engine.recommended) score += 1;
    return { engine, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.engine;
}

/* ============================================================
   §14 — Execution Session (runtime record of each execution)
   ============================================================ */

export type ExecutionSessionState =
  | "pending"
  | "running"
  | "streaming"
  | "reviewing"
  | "validating"
  | "completed"
  | "failed"
  | "cancelled";

export interface ExecutionSession {
  id: string;
  workspaceId: string;
  taskId?: string;
  engineId: string;
  model: string;
  profile: ExecutionProfile;
  state: ExecutionSessionState;
  prompt: string;
  output?: string;
  tokensUsed: number;
  latencyMs: number;
  cost?: number;
  attempts: number;
  logs: ExecutionLogEntry[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ExecutionLogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: unknown;
}

/* ============================================================
   §15 — Scientific Runtime (history, metrics, audit)
   ============================================================ */

export interface ExecutionHistory {
  sessions: ExecutionSession[];
  totalExecutions: number;
  totalTokens: number;
  totalCost: number;
  averageLatencyMs: number;
}

export interface ExecutionMetrics {
  engineId: string;
  totalRuns: number;
  successRate: number;
  averageTokens: number;
  averageLatencyMs: number;
  averageCost: number;
  lastRunAt?: string;
}

export interface ExecutionState {
  currentSession: ExecutionSession | null;
  history: ExecutionSession[];
  isExecuting: boolean;
  canRetry: boolean;
}

/* ============================================================
   §16 — Execution Adapter (provider-agnostic execution contract)
   ============================================================ */

export interface ExecutionAdapter {
  readonly engineId: string;
  readonly providerType: ProviderType;
  prepare(task: ScientificTask, profile: ExecutionProfile): ExecutionContext;
  execute(ctx: ExecutionContext): Promise<ExecutionResult>;
  stream?(ctx: ExecutionContext, onChunk: (chunk: StreamChunk) => void): Promise<ExecutionResult>;
  cancel(): void;
}

/* ============================================================
   §17 — Scientific Workflow Engine (separates workflow from execution)
   ============================================================ */

export interface ScientificWorkflowEngine {
  planTask(task: ScientificTask): CapabilityRequirement[];
  resolveEngine(requirements: CapabilityRequirement[]): ExecutionEngine | undefined;
  executeTask(task: ScientificTask, profile: ExecutionProfile): Promise<ExecutionSession>;
  validateResult(session: ExecutionSession): { valid: boolean; issues: string[] };
}

/* ============================================================
   §18 — Knowledge Layer (prompt/context/artifact builders)
   ============================================================ */

export interface PromptBuilder {
  build(task: ScientificTask, variables: Record<string, string>): string;
}

export interface ContextBuilder {
  build(task: ScientificTask, workspaceId: string): string;
}

export interface VariableResolver {
  resolve(task: ScientificTask, workspaceId: string): Record<string, string>;
}

export interface EvidenceCollector {
  collect(session: ExecutionSession): EvidenceItem[];
}

export interface ArtifactBuilder {
  build(session: ExecutionSession, task: ScientificTask): Artifact;
}

export interface EvidenceItem {
  id: string;
  sessionId: string;
  type: "source" | "metric" | "citation" | "validation";
  value: string;
  source?: string;
}

export interface Artifact {
  id: string;
  sessionId: string;
  taskId: string;
  type: string;
  content: string;
  evidence: EvidenceItem[];
  createdAt: string;
}

/* ============================================================
   §19 — Execution Plan (immutable strategy before execution)
   ============================================================ */

export interface ExecutionPlan {
  id: string;
  taskId: string;
  workspaceId: string;
  capabilityRequirements: CapabilityRequirement[];
  resolvedEngineId: string;
  resolvedModel: string;
  profile: ExecutionProfile;
  expectedValidations: string[];
  createdAt: string;
}

/* ============================================================
   §20 — Artifact Repository (versioned storage)
   ============================================================ */

export interface ArtifactRepository {
  save(artifact: Artifact): void;
  get(id: string): Artifact | undefined;
  getByTask(taskId: string): Artifact[];
  getBySession(sessionId: string): Artifact | undefined;
  listByWorkspace(workspaceId: string): Artifact[];
  compare(taskId: string): Artifact[];
}

/* ============================================================
   §21 — Evidence Repository (persistent evidence store)
   ============================================================ */

export interface EvidenceRepository {
  save(evidence: EvidenceItem): void;
  getBySession(sessionId: string): EvidenceItem[];
  getByArtifact(artifactId: string): EvidenceItem[];
  listByWorkspace(workspaceId: string): EvidenceItem[];
}
