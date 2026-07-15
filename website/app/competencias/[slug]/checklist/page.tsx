import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompetency, allCompetencySlugs } from "@/lib/content";
import { ui } from "@/lib/labels";
import { Icon } from "@/components/ui/Icon";
import { ChecklistTracker } from "@/components/experience/ChecklistTracker";
import styles from "./checklist.module.css";

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
  return { title: `${ui.checklist.title} · ${c?.name ?? ""}` };
}

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCompetency(slug);
  if (!c || !c.checklist) notFound();

  return (
    <div className={styles.page}>
      <Link href={`/competencias/${c.slug}/passo/${c.stepCount}`} className={styles.back}>
        <Icon name="arrow-left" size={16} /> {c.name}
      </Link>

      <header className={styles.header}>
        <span className="overline">{c.name}</span>
        <h1 className={styles.title}>{ui.checklist.title}</h1>
        <p className={styles.subtitle}>{ui.checklist.subtitle}</p>
      </header>

      <ChecklistTracker
        slug={c.slug}
        sections={c.checklist.sections}
        total={c.checklist.total}
        threshold={c.checklist.threshold}
        concludeHref={`/competencias/${c.slug}/concluido`}
      />
    </div>
  );
}
