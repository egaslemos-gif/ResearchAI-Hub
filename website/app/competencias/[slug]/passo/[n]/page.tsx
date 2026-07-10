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
import { PromptCanvas } from "@/components/experience/PromptCanvas";
import { EvidencePanel } from "@/components/experience/EvidencePanel";
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
  const evidenceItems = c.steps.map((s) => ({
    id: `ev-${s.order}`,
    title: s.outputs[0] || s.expectedOutput || s.name,
    producedBy: [s.order],
  }));
  // TR-1: avisos éticos contextuais nos passos com IA (regras críticas do validation.json).
  const criticalRules = c.qualityRules.filter(
    (r) => (r.severity || "").toLowerCase() === "critical"
  );
  const isAiStep = step.tool?.toolType === "ai";

  return (
    <div className={styles.page}>
      <div className={styles.top}>
        <Link href={`/competencias/${c.slug}`} className={styles.back}>
          <Icon name="arrow-left" size={16} /> {c.name}
        </Link>
        <ProgressTracker
          slug={c.slug}
          totalSteps={total}
          currentStep={step.order}
          stepMinutes={stepMinutes}
        />
      </div>

      <header className={styles.header}>
        <span className="overline">{ui.step.label(step.order)}</span>
        <h1 className={styles.title}>{step.name}</h1>
        {step.estimatedTime && (
          <span className={styles.time}>
            <Icon name="clock" size={15} /> {step.estimatedTime}
          </span>
        )}
      </header>

      {/* Porquê este passo (Recomendação 2): o objectivo do activo como frase-guia */}
      {step.objective && <p className={styles.why}>{step.objective}</p>}

      {step.instruction && (
        <section className={styles.block}>
          <h2 className={styles.blockLabel}>{ui.terms.instruction}</h2>
          <p className={styles.blockText}>{step.instruction}</p>
        </section>
      )}

      {/* ---- Ferramenta ---- */}
      {step.tool && (
        <section className={styles.toolCard}>
          <div className={styles.toolInfo}>
            <span className={styles.toolLogo}>{(step.tool.name ?? step.tool.alias).charAt(0)}</span>
            <div>
              <strong className={styles.toolName}>{step.tool.name ?? step.tool.alias}</strong>
              {categoryLabel(step.tool.category) && (
                <span className={styles.toolCat}>{categoryLabel(step.tool.category)}</span>
              )}
            </div>
          </div>
          <div className={styles.toolActions}>
            {step.tool.url && (
              <Button href={step.tool.url} external size="sm">
                {ui.actions.openTool(step.tool.name ?? step.tool.alias)}
                <Icon name="arrow-up-right" size={15} />
              </Button>
            )}
            {step.tool.available && (
              <Button href={`/ferramentas/${step.tool.slug}`} variant="ghost" size="sm">
                {ui.actions.view}
              </Button>
            )}
          </div>
          {step.toolAlternatives.length > 0 && (
            <p className={styles.alt}>
              {ui.step.alternatives}:{" "}
              {step.toolAlternatives.map((a) => a.name ?? a.alias).join(" · ")} — {ui.step.withYourTool}
            </p>
          )}
        </section>
      )}

      {/* Aviso ético contextual (TR-1): regras críticas ao usar IA */}
      {isAiStep && criticalRules.length > 0 && <EthicsNote rules={criticalRules} />}

      {/* ---- Prompt ---- */}
      {prompt && prompt.body && (
        <section className={styles.block}>
          <PromptCanvas body={prompt.body} variables={prompt.variables} />
        </section>
      )}

      {/* ---- Resultado esperado ---- */}
      {step.expectedOutput && (
        <section className={styles.result}>
          <span className={styles.resultLabel}>
            <Icon name="flag" size={15} /> {ui.terms.expectedResult}
          </span>
          <p>{step.expectedOutput}</p>
        </section>
      )}

      {/* Evidências da Investigação */}
      <EvidencePanel slug={c.slug} currentStep={step.order} items={evidenceItems} />

      <StepAdvance
        slug={c.slug}
        step={step.order}
        prevHref={prevHref}
        nextHref={nextHref}
        isLast={isLast}
      />
    </div>
  );
}
