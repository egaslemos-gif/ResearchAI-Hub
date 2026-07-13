import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompetency, getPrompt, getCompetencies } from "@/lib/content";
import { ui } from "@/lib/labels";
import { ProgressTracker } from "@/components/experience/ProgressTracker";
import { ResearchStepHeader } from "@/components/experience/ResearchStepHeader";
import { WorkspaceBootstrap } from "@/components/workspace/WorkspaceBootstrap";
import type { StepData } from "@/components/workspace/StepDataContext";

export const dynamicParams = false;

export function generateStaticParams() {
  const out: { slug: string; n: string }[] = [];
  for (const c of getCompetencies()) {
    const full = getCompetency(c.slug);
    full?.steps.forEach((s) => out.push({ slug: c.slug, n: String(s.order) }));
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; n: string }>;
}): Promise<Metadata> {
  const { slug, n } = await params;
  const c = getCompetency(slug);
  const step = c?.steps.find((s) => String(s.order) === n);
  return { title: step ? `${ui.step.label(step.order)} · ${c!.name}` : ui.terms.guide };
}

export default async function StepPage({
  params,
}: {
  params: Promise<{ slug: string; n: string }>;
}) {
  const { slug, n } = await params;
  const c = getCompetency(slug);
  if (!c) notFound();
  const step = c.steps.find((s) => String(s.order) === n);
  if (!step) notFound();

  const total = c.steps.length;
  const prompt = step.promptId ? getPrompt(step.promptId) : null;
  const isLast = step.order >= total;
  const prevHref =
    step.order > 1 ? `/competencias/${c.slug}/passo/${step.order - 1}` : `/competencias/${c.slug}`;
  const nextHref = isLast
    ? `/competencias/${c.slug}/checklist`
    : `/competencias/${c.slug}/passo/${step.order + 1}`;

  const stepMinutes = c.steps.map((s) => s.minutes);
  const timelineSteps = c.steps.map(s => ({
    order: s.order,
    name: s.name,
    minutes: s.minutes
  }));

  const evidenceItems = c.steps.map((s) => ({
    id: `ev-${s.order}`,
    label: s.outputs[0] || s.expectedOutput || s.name,
    completed: s.order < step.order,
  }));
  const criticalRules = c.qualityRules.filter(
    (r) => (r.severity || "").toLowerCase() === "critical"
  );
  const isAiStep = step.tool?.toolType === "ai";

  const header = (
    <>
      <nav
        aria-label="Navegação do passo"
        style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", marginBottom: "var(--space-2)", fontSize: "0.85rem" }}
      >
        <Link href={`/competencias/${c.slug}`} style={{ color: "var(--color-text-muted)" }}>
          ← {ui.actions.backToCompetency}
        </Link>
        {step.order > 1 && (
          <Link href={prevHref} style={{ color: "var(--color-text-muted)" }}>
            {ui.actions.previous} · {ui.step.label(step.order - 1)}
          </Link>
        )}
      </nav>
      <ProgressTracker
        slug={c.slug}
        totalSteps={total}
        currentStep={step.order}
        stepMinutes={stepMinutes}
        timelineSteps={timelineSteps}
      />
      <ResearchStepHeader
        title={c.name}
        expectedArtifact={step.outputs[0] || step.expectedOutput || null}
        protocolId={c.slug.toUpperCase()}
        stepNumber={step.order}
        estimatedTime={step.minutes}
      />
    </>
  );

  const stepData: StepData = {
    slug: c.slug,
    stepOrder: step.order,
    totalSteps: total,
    competencyName: c.name,
    stepObjective: step.objective || null,
    stepInstruction: step.instruction || null,
    stepExpectedOutput: step.expectedOutput || null,
    expectedArtifactType: step.artifactType || "tema",
    stepOutputs: step.outputs,
    stepMinutes: step.minutes,
    promptBody: prompt?.body ?? null,
    promptVariables: prompt?.variables ?? null,
    toolName: step.tool?.name ?? step.tool?.alias ?? null,
    toolUrl: step.tool?.url ?? null,
    isAiStep,
    criticalRules,
    evidenceItems,
    prevHref,
    nextHref,
    isLast,
  };

  return <WorkspaceBootstrap header={header} stepData={stepData} />;
}
