/* ============================================================
   WorkspaceFactory — single point of workspace creation

   Validates → creates → validates object → returns
   If validation fails, throws WorkspaceValidationError.
   No partial workspace is ever persisted.

   REGRA 1: Workspace só existe se for válido
   REGRA 4: Não confiar apenas na UI — createWorkspace valida novamente
   REGRA 5: createWorkspace() é transacional
   REGRA 9: Workspace Schema — contrato único
   ============================================================ */

import type { ExecutionProfile, ExecutionProviderConfig, ProviderType } from "@/lib/ScientificExecutionEngine";
import { EXECUTION_CATALOG, createDefaultProfile, migrateToProfile, getEngineType } from "@/lib/ScientificExecutionEngine";

/* ---- Helper: safely get engine type from engineId ---- */
function getEngineTypeSafe(engineId: string): ProviderType {
  return getEngineType(engineId);
}

/* ---- Workspace Status (REGRA 6) ---- */
export type WorkspaceStatus = "DRAFT" | "READY" | "ARCHIVED" | "COMPLETED";

/* ---- Validation result ---- */
export interface WorkspaceValidationResult {
  valid: boolean;
  errors: string[];
}

/* ---- Required fields schema (REGRA 9) ---- */
export interface WorkspaceInput {
  title: string;
  protocolSlug: string;
  studyArea: string;
  researchTopic: string;
  academicLevel: string;
  language?: string;
  executionProfile?: ExecutionProfile;
  executionProvider?: ExecutionProviderConfig; // legacy compat
}

/* ---- Validation rules (REGRA 3) ---- */
const RULES = {
  researchTopic: { required: true, minLength: 5, maxLength: 200 },
  studyArea: { required: true, minLength: 3, maxLength: 100 },
  academicLevel: { required: true, allowed: ["licenciatura", "mestrado", "doutoramento"] },
  protocolSlug: { required: true, minLength: 1 },
} as const;

const VALID_PROVIDER_TYPES: ProviderType[] = ["cloud", "external", "local"];

export function validateWorkspaceInput(input: Partial<WorkspaceInput>): WorkspaceValidationResult {
  const errors: string[] = [];

  // researchTopic (Tema)
  if (!input.researchTopic || input.researchTopic.trim().length === 0) {
    errors.push("Tema de investigação é obrigatório");
  } else if (input.researchTopic.trim().length < RULES.researchTopic.minLength) {
    errors.push(`Tema deve ter pelo menos ${RULES.researchTopic.minLength} caracteres`);
  } else if (input.researchTopic.trim().length > RULES.researchTopic.maxLength) {
    errors.push(`Tema deve ter no máximo ${RULES.researchTopic.maxLength} caracteres`);
  }

  // studyArea (Área de estudo)
  if (!input.studyArea || input.studyArea.trim().length === 0) {
    errors.push("Área de estudo é obrigatória");
  } else if (input.studyArea.trim().length < RULES.studyArea.minLength) {
    errors.push(`Área de estudo deve ter pelo menos ${RULES.studyArea.minLength} caracteres`);
  } else if (input.studyArea.trim().length > RULES.studyArea.maxLength) {
    errors.push(`Área de estudo deve ter no máximo ${RULES.studyArea.maxLength} caracteres`);
  }

  // academicLevel (Nível académico)
  if (!input.academicLevel || !RULES.academicLevel.allowed.includes(input.academicLevel as any)) {
    errors.push("Nível académico é obrigatório");
  }

  // executionProfile (Executor Científico)
  const profile = input.executionProfile
    ?? (input.executionProvider ? migrateToProfile(input.executionProvider) : undefined);
  if (!profile || !profile.engineId || !EXECUTION_CATALOG.some(e => e.id === profile.engineId)) {
    errors.push("Executor Científico é obrigatório");
  }

  // protocolSlug
  if (!input.protocolSlug || input.protocolSlug.trim().length === 0) {
    errors.push("Protocolo é obrigatório");
  }

  return { valid: errors.length === 0, errors };
}

/* ---- Factory: create a valid workspace object (REGRA 5) ---- */
export class WorkspaceValidationError extends Error {
  constructor(public errors: string[]) {
    super(`Workspace validation failed: ${errors.join("; ")}`);
    this.name = "WorkspaceValidationError";
  }
}

export interface WorkspaceEntity {
  id: string;
  title: string;
  protocolSlug: string;
  studyArea: string;
  researchTopic: string;
  academicLevel: string;
  language: string;
  executionProfile: ExecutionProfile;
  executionProvider: ExecutionProviderConfig; // legacy compat
  currentStep: number;
  status: WorkspaceStatus;
  createdAt: string;
  updatedAt: string;
  artifacts: Record<number, unknown>;
  progress: Record<number, unknown>;
}

export function createWorkspaceEntity(
  input: WorkspaceInput,
  generateId: () => string
): WorkspaceEntity {
  // Step 1: validate input
  const validation = validateWorkspaceInput(input);
  if (!validation.valid) {
    throw new WorkspaceValidationError(validation.errors);
  }

  const now = new Date().toISOString();

  // Step 2: create object
  const profile = input.executionProfile
    ?? (input.executionProvider ? migrateToProfile(input.executionProvider) : createDefaultProfile("researchai-cloud"));
  const legacyProvider: ExecutionProviderConfig = input.executionProvider
    ?? { type: getEngineTypeSafe(profile.engineId), assistantId: profile.engineId };

  const ws: WorkspaceEntity = {
    id: generateId(),
    title: input.researchTopic.trim(),
    protocolSlug: input.protocolSlug,
    studyArea: input.studyArea.trim(),
    researchTopic: input.researchTopic.trim(),
    academicLevel: input.academicLevel,
    language: input.language || "pt",
    executionProfile: profile,
    executionProvider: legacyProvider,
    currentStep: 1,
    status: "READY",
    createdAt: now,
    updatedAt: now,
    artifacts: {},
    progress: {},
  };

  // Step 3: validate object (defensive)
  if (!ws.studyArea || !ws.researchTopic || !ws.academicLevel || !ws.executionProfile) {
    throw new WorkspaceValidationError(["Workspace object failed post-creation validation"]);
  }

  return ws;
}

/* ---- Check if workspace is ready for protocol consumption (REGRA 7) ---- */
export function isWorkspaceReady(ws: { status: WorkspaceStatus; studyArea: string; researchTopic: string } | null | undefined): boolean {
  if (!ws) return false;
  if (ws.status !== "READY" && ws.status !== "COMPLETED") return false;
  if (!ws.studyArea || !ws.researchTopic) return false;
  return true;
}
