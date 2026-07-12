import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompetency, getPrompt, getCompetencies } from "@/lib/content";
import { ui, categoryLabel } from "@/lib/labels";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { EthicsNote } from "@/components/ui/EthicsNote";
import { ProgressTracker } from "@/components/experience/ProgressTracker";
import { StepAdvance } from "@/components/experience/StepAdvance";
import { ExecutionLayout, ExecutionGrid } from "@/components/layouts/Layouts";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceContext";
import { ResearchWorkspace } from "@/components/workspace/ResearchWorkspace/ResearchWorkspace";
import { ResearchDocument } from "@/components/workspace/ResearchDocument/ResearchDocument";
import { Section } from "@/components/workspace/ResearchDocument/Sections/Section";
import { DynamicPromptRenderer } from "@/components/workspace/ResearchDocument/MarkdownEngine/DynamicPromptRenderer";
import { PromptCardContainer } from "@/components/workspace/PromptCard";
import { WorkspacePlugins } from "@/components/workspace/Plugins/WorkspacePlugins";
import { EvidencePlugin } from "@/components/workspace/Plugins/EvidencePlugin";
import { DocumentProperties } from "@/components/workspace/DocumentProperties";
import { ResearchStepHeader } from "@/components/experience/ResearchStepHeader";
import styles from "./step.module.css";

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
  // TR-1: avisos éticos contextuais nos passos com IA (regras críticas do validation.json).
  const criticalRules = c.qualityRules.filter(
    (r) => (r.severity || "").toLowerCase() === "critical"
  );
  const isAiStep = step.tool?.toolType === "ai";

  return (
    <WorkspaceProvider>
      <ResearchWorkspace initialMode="workspace">
        <ExecutionLayout
          header={
            <>
              <div className={styles.top}>
              <ProgressTracker
                slug={c.slug}
                totalSteps={total}
                currentStep={step.order}
                stepMinutes={stepMinutes}
                timelineSteps={timelineSteps}
              />
            </div>

            <ResearchStepHeader 
              title={c.name}
              expectedArtifact={step.outputs[0] || step.expectedOutput || null}
            />
          </>
        }
        content={
          <div className={styles.verticalFlow}>
            {/* FASE 1: PREPARAR */}
            <Section id="preparation" title="Preparation Workspace" defaultOpen={true} collapsible={false}>
                <div className={styles.preparationFlow}>
                  {prompt && prompt.variables && prompt.variables.length > 0 && (
                    <div className={styles.prepBlock}>
                      <DocumentProperties variables={prompt.variables} />
                    </div>
                  )}

                  {step.objective && (
                    <div className={styles.prepBlock}>
                      <h4 className={styles.prepTitle}>Objetivo</h4>
                      <div className={styles.docSectionBody}>{step.objective}</div>
                    </div>
                  )}

                  {step.instruction && (
                    <div className={styles.prepBlock}>
                      <h4 className={styles.prepTitle}>O que fazer</h4>
                      <div className={styles.docSectionBody}>{step.instruction}</div>
                    </div>
                  )}
                </div>
              </Section>

            {/* FASE 2: EXECUTAR */}
            <div className={styles.phaseExecutar}>
              {prompt && prompt.body ? (
                <PromptCardContainer 
                  toolName={step.tool?.name ?? step.tool?.alias}
                  toolUrl={step.tool?.url ?? undefined}
                  hasEthicsWarning={isAiStep && criticalRules.length > 0}
                  criticalRules={criticalRules}
                  content={prompt.body}
                />
              ) : (
                <div className={styles.docSectionBody}>Nenhum prompt associado a este passo.</div>
              )}
            </div>

            {/* FASE 3: RECOLHER / RESULTADO ESPERADO */}
            {step.expectedOutput && (
              <div className={styles.phaseRecolher}>
                <Section id="expected" title="Resultado esperado" defaultOpen={true}>
                  <div className={styles.docSectionBody}>{step.expectedOutput}</div>
                </Section>
              </div>
            )}

            {/* FASE 4 & 5: VALIDAR E CONCLUIR */}
            <div className={styles.phaseValidar}>
              <Section id="checklist" title="Checklist de Validação" defaultOpen={true}>
                <WorkspacePlugins>
                  <EvidencePlugin items={evidenceItems} />
                </WorkspacePlugins>
                
                <div className={styles.docAdvance}>
                  <StepAdvance
                    slug={c.slug}
                    step={step.order}
                    prevHref={prevHref}
                    nextHref={nextHref}
                    isLast={isLast}
                  />
                </div>
              </Section>
            </div>
          </div>
        }
      />
      </ResearchWorkspace>
    </WorkspaceProvider>
  );
}
