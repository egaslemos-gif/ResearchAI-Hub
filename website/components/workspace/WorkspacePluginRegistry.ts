import React from "react";
import { ResearchProfilePanel } from "./panels/ResearchProfilePanel";
import { ResearchConsolePanel } from "./panels/ResearchConsolePanel";
import { ValidationInspectorPanel } from "./panels/ValidationInspectorPanel";
import { StepAdvancePanel } from "./panels/StepAdvancePanel";

export type PanelId =
  | "research-profile"
  | "research-console"
  | "execution-status"
  | "evidence"
  | "inspector"
  | "checklist"
  | "expected-result"
  | "step-advance";

type PanelComponent = React.ComponentType;

const REGISTRY: Record<PanelId, PanelComponent> = {
  "research-profile": ResearchProfilePanel,
  "research-console": ResearchConsolePanel,
  "execution-status": () => null,
  "evidence": () => null,
  "inspector": ValidationInspectorPanel,
  "checklist": () => null,
  "expected-result": () => null,
  "step-advance": StepAdvancePanel,
};

export function resolvePanel(id: PanelId): PanelComponent {
  return REGISTRY[id] ?? (() => null);
}

export function isRegistered(id: string): id is PanelId {
  return id in REGISTRY;
}
