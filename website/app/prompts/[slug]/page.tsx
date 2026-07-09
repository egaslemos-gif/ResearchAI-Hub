import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrompt, getCompetency, allPromptSlugs } from "@/lib/content";
import { ui } from "@/lib/labels";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { PromptCanvas } from "@/components/experience/PromptCanvas";
import styles from "./prompt.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return allPromptSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPrompt(slug);
  return { title: p?.name ?? ui.terms.prompt };
}

export default async function PromptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPrompt(slug);
  if (!p) notFound();
  const competency = p.competencySlug ? getCompetency(p.competencySlug) : null;

  return (
    <div className={styles.page}>
      <Link href="/prompts" className={styles.back}>
        <Icon name="arrow-left" size={16} /> {ui.home.promptsTitle}
      </Link>

      <header className={styles.header}>
        <div className={styles.tags}>
          {p.language && <Badge tone="outline">{p.language.toUpperCase()}</Badge>}
        </div>
        <h1 className={styles.title}>{p.name}</h1>
        {p.objective && <p className={styles.objective}>{p.objective}</p>}
        {p.compatibleTools.length > 0 && (
          <div className={styles.compat}>
            <span className={styles.compatLabel}>{ui.terms.tools}:</span>
            {p.compatibleTools.map((t) => (
              <span key={t} className={styles.chip}>
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      {p.body && <PromptCanvas body={p.body} variables={p.variables} />}

      {p.expectedOutput && (
        <section className={styles.result}>
          <span className={styles.resultLabel}>
            <Icon name="flag" size={15} /> {ui.terms.expectedResult}
          </span>
          <p>{p.expectedOutput}</p>
        </section>
      )}

      {competency && (
        <Link href={`/competencias/${competency.slug}`} className={styles.related}>
          <Icon name="graduation-cap" size={16} />
          <span>{competency.name}</span>
          <Icon name="arrow-right" size={15} />
        </Link>
      )}
    </div>
  );
}
