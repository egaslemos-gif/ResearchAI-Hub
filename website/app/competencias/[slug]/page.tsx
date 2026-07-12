import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompetency, allCompetencySlugs } from "@/lib/content";
import { ui, difficultyLabel, familyLabel } from "@/lib/labels";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressTracker } from "@/components/experience/ProgressTracker";
import { ProtocolTabs } from "@/components/experience/ProtocolTabs";
import { ProtocolLayout } from "@/components/layouts/Layouts";
import styles from "./competency.module.css";

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
  return { title: c?.name ?? ui.terms.competency };
}

export default async function CompetencyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCompetency(slug);
  if (!c) notFound();

  return (
    <ProtocolLayout>
      <div className={styles.pageContent}>
        <Link href="/competencias" className={styles.back}>
          <Icon name="arrow-left" size={16} /> {ui.nav.competencies}
        </Link>

      {/* ---- Cabeçalho da experiência ---- */}
      <header className={styles.heroHeader}>
        <div className={styles.heroTop}>
          <div className={styles.heroTags}>
            <span className={styles.icon}>
              <Icon name={c.icon} size={20} />
            </span>
            {familyLabel(c.family, c.familyName) && (
              <span className="overline">{familyLabel(c.family, c.familyName)}</span>
            )}
            {c.difficulty && <Badge tone="neutral">{difficultyLabel(c.difficulty)}</Badge>}
          </div>
          <h1 className={styles.title}>{c.name}</h1>
          <p className={styles.desc}>{c.description}</p>
        </div>

        <div className={styles.heroBottom}>
          <div className={styles.metaRow}>
            {c.estimatedTime && (
              <span className={styles.metaItem}>
                <Icon name="clock" size={15} /> {c.estimatedTime}
              </span>
            )}
            <span className={styles.metaItem}>
              <Icon name="list-checks" size={15} /> {c.stepCount} {ui.meta.stepsSuffix}
            </span>
            <span className={styles.metaItem}>
              <Icon name="wrench" size={15} /> {c.toolCount} {ui.meta.toolsSuffix}
            </span>
          </div>

          <div className={styles.heroActions}>
            <div className={styles.progressInline}>
              <ProgressTracker
                slug={c.slug}
                totalSteps={c.stepCount}
                stepMinutes={c.steps.map((s) => s.minutes)}
              />
            </div>
            <Button size="lg" href={`/competencias/${c.slug}/passo/1`}>
              {ui.actions.startGuide}
              <Icon name="arrow-right" size={18} />
            </Button>
          </div>
        </div>
      </header>

      <ProtocolTabs
        guiaContent={
          <>
            <div className={styles.cols}>
              {c.deliverables.length > 0 && (
                <section>
                  <h2 className={styles.h2}>{ui.terms.deliverables}</h2>
                  <ul className={styles.list}>
                    {c.deliverables.map((d, i) => (
                      <li key={i}>
                        <Icon name="file-check" size={16} /> <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {c.targetAudience.length > 0 && (
                <section>
                  <h2 className={styles.h2}>{ui.terms.audience}</h2>
                  <ul className={styles.list}>
                    {c.targetAudience.map((a, i) => (
                      <li key={i}>
                        <Icon name="user-round" size={16} /> <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {c.tools.length > 0 && (
              <section>
                <h2 className={styles.h2}>{ui.terms.tools}</h2>
                <div className={styles.tools}>
                  {c.tools.map((t) =>
                    t.available ? (
                      <Link key={t.alias} href={`/ferramentas/${t.slug}`} className={styles.tool}>
                        <span className={styles.toolLogo}>{(t.name ?? t.alias).charAt(0)}</span>
                        <span className={styles.toolText}>
                          <strong>{t.name ?? t.alias}</strong>
                          {t.role && <span className={styles.toolRole}>{t.role}</span>}
                        </span>
                        <Icon name="arrow-up-right" size={15} />
                      </Link>
                    ) : (
                      <span key={t.alias} className={styles.tool}>
                        <span className={styles.toolLogo}>{(t.name ?? t.alias).charAt(0)}</span>
                        <span className={styles.toolText}>
                          <strong>{t.name ?? t.alias}</strong>
                        </span>
                      </span>
                    )
                  )}
                </div>
              </section>
            )}
          </>
        }
        passosContent={
          <section>
            <h2 className={styles.h2}>{ui.terms.guide}</h2>
            <ol className={styles.steps}>
              {c.steps.map((s) => (
                <li key={s.order} className={styles.stepCard}>
                  <div className={styles.stepNum}>{s.order}</div>
                  <div className={styles.stepBody}>
                    <h3 className={styles.stepName}>{s.name}</h3>
                    <dl className={styles.stepMeta}>
                      {s.estimatedTime && (
                        <div>
                          <dt>{ui.terms.estimatedTime}</dt>
                          <dd>{s.estimatedTime}</dd>
                        </div>
                      )}
                      {s.expectedOutput && (
                        <div>
                          <dt>{ui.terms.expectedResult}</dt>
                          <dd>{s.expectedOutput}</dd>
                        </div>
                      )}
                      {s.tool?.name && (
                        <div>
                          <dt>{ui.terms.tool}</dt>
                          <dd>{s.tool.name}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  <Button variant="secondary" href={`/competencias/${c.slug}/passo/${s.order}`}>
                    {ui.actions.start}
                  </Button>
                </li>
              ))}
            </ol>
          </section>
        }
        evidenciasContent={
          <section>
            <h2 className={styles.h2}>Evidências</h2>
            <p className={styles.desc}>Espaço reservado para visualização das evidências recolhidas durante o protocolo.</p>
          </section>
        }
        checklistContent={
          <section>
            <h2 className={styles.h2}>Checklist de Validação</h2>
            <p className={styles.desc}>Lista de critérios de qualidade a validar no fim do protocolo.</p>
          </section>
        }
      />
      </div>
    </ProtocolLayout>
  );
}
