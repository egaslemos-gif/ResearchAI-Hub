import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompetency, allCompetencySlugs } from "@/lib/content";
import { ui } from "@/lib/labels";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import styles from "./done.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return allCompetencySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCompetency(slug);
  return { title: c ? ui.conclusion.title(c.name) : ui.conclusion.kicker };
}

export default async function DonePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCompetency(slug);
  if (!c) notFound();

  return (
    <div className={styles.page}>
      <div className={styles.badge}>
        <Icon name="circle-check-big" size={30} />
      </div>
      <span className="overline">{ui.conclusion.kicker}</span>
      <h1 className={styles.title}>{ui.conclusion.title(c.name)}</h1>
      <p className={styles.lead}>{ui.conclusion.lead}</p>

      {c.deliverables.length > 0 && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>{ui.conclusion.produced}</h2>
          <ul className={styles.list}>
            {c.deliverables.map((d, i) => (
              <li key={i}>
                <Icon name="file-check" size={16} /> <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {c.qualityRules.length > 0 && (
        <section className={styles.remember}>
          <h2 className={styles.cardTitle}>{ui.conclusion.remember}</h2>
          <ul className={styles.list}>
            {c.qualityRules.map((r, i) => (
              <li key={i}>
                <Icon name="shield-check" size={16} /> <span>{r.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className={styles.actions}>
        <Button href="/" size="lg">
          {ui.actions.backHome}
        </Button>
        <Button href="/competencias" variant="secondary" size="lg">
          {ui.actions.viewCompetencies}
        </Button>
      </div>
    </div>
  );
}
