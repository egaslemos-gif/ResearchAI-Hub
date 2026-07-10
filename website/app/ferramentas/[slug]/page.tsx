import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTool, allToolSlugs } from "@/lib/content";
import { ui, categoryLabel } from "@/lib/labels";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import styles from "./tool.module.css";

export const dynamicParams = false;

/** Mapeia categoria de ferramenta para ícone Lucide. */
const CATEGORY_ICONS: Record<string, string> = {
  discovery: "search",
  production: "pen-tool",
  organization: "folder-open",
  reading: "book-open",
  review: "check-circle",
  analysis: "bar-chart-3",
  writing: "file-text",
};
function toolIcon(category: string | null): string {
  if (!category) return "box";
  return CATEGORY_ICONS[category.toLowerCase()] ?? "box";
}

export function generateStaticParams() {
  return allToolSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = getTool(slug);
  return { title: t?.name ?? ui.terms.tool };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = getTool(slug);
  if (!t) notFound();

  return (
    <div className={styles.page}>
      <Link href="/ferramentas" className={styles.back}>
        <Icon name="arrow-left" size={16} /> {ui.nav.tools}
      </Link>

      <header className={styles.hero}>
        <span className={styles.logo} aria-hidden>
          <Icon name={toolIcon(t.category)} size={24} />
        </span>
        <div className={styles.heroMain}>
          <div className={styles.heroTags}>
            {categoryLabel(t.category) && (
              <span className="overline">{categoryLabel(t.category)}</span>
            )}
            {t.free && <Badge tone="success">{ui.meta.free}</Badge>}
            {t.byoa && <Badge tone="brand">{ui.meta.byoa}</Badge>}
            {t.byot && <Badge tone="neutral">{ui.meta.byot}</Badge>}
          </div>
          <h1 className={styles.title}>{t.name}</h1>
          <p className={styles.desc}>{t.description}</p>
          <div className={styles.heroActions}>
            {t.url && (
              <Button href={t.url} external>
                {ui.actions.openExternal}
                <Icon name="arrow-up-right" size={16} />
              </Button>
            )}
            {t.provider && <span className={styles.provider}>{t.provider}</span>}
          </div>
        </div>
      </header>

      {/* ---- O que faz / Limitações (peso igual — rigor científico) ---- */}
      <div className={styles.cols}>
        {t.capabilities.length > 0 && (
          <section className={styles.panel}>
            <h2 className={styles.h2}>{ui.toolPage.capabilities}</h2>
            <ul className={styles.list}>
              {t.capabilities.map((x, i) => (
                <li key={i}>
                  <Icon name="check" size={16} className={styles.ok} /> <span>{x}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
        {t.limitations.length > 0 && (
          <section className={styles.panel}>
            <h2 className={styles.h2}>{ui.toolPage.limitations}</h2>
            <ul className={styles.list}>
              {t.limitations.map((x, i) => (
                <li key={i}>
                  <Icon name="triangle-alert" size={16} className={styles.warn} /> <span>{x}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {t.bestPractices.length > 0 && (
        <section>
          <h2 className={styles.h2}>{ui.toolPage.bestPractices}</h2>
          <ul className={styles.bullets}>
            {t.bestPractices.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </section>
      )}

      {t.useCases.length > 0 && (
        <section>
          <h2 className={styles.h2}>{ui.toolPage.useCases}</h2>
          <div className={styles.useCases}>
            {t.useCases.map((uc, i) => {
              const inner = (
                <>
                  <strong className={styles.ucName}>{uc.name}</strong>
                  <p className={styles.ucDesc}>{uc.description}</p>
                </>
              );
              return uc.competencySlug ? (
                <Link key={i} href={`/competencias/${uc.competencySlug}`} className={styles.useCase}>
                  {inner}
                  <span className={styles.ucLink}>
                    {ui.terms.competency} <Icon name="arrow-right" size={14} />
                  </span>
                </Link>
              ) : (
                <div key={i} className={styles.useCase}>
                  {inner}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {t.alternatives.length > 0 && (
        <section>
          <h2 className={styles.h2}>{ui.toolPage.alternatives}</h2>
          <div className={styles.alts}>
            {t.alternatives.map((a) => (
              <Link key={a.slug} href={`/ferramentas/${a.slug}`} className={styles.alt}>
                <span className={styles.altLogo}>{a.name.charAt(0)}</span>
                {a.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
