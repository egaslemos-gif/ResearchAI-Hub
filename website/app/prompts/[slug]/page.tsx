import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrompt, getCompetency, allPromptSlugs } from "@/lib/content";
import { ui } from "@/lib/labels";
import { Icon } from "@/components/ui/Icon";
import { Badge } from "@/components/ui/Badge";
import { ExecutionLayout, ExecutionGrid } from "@/components/layouts/Layouts";
import { WorkspaceProvider } from "@/components/workspace/WorkspaceContext";
import { DocumentProperties } from "@/components/workspace/DocumentProperties";
import { DocumentViewer } from "@/components/workspace/DocumentViewer";
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
    <WorkspaceProvider>
      <ExecutionLayout
        header={
          <>
            <div className={styles.top}>
              <Link href="/prompts" className={styles.back}>
                <Icon name="arrow-left" size={16} /> {ui.home.promptsTitle}
              </Link>
            </div>
            <header className={styles.header}>
              <div className={styles.tags}>
                {p.language && <Badge tone="outline">{p.language.toUpperCase()}</Badge>}
              </div>
              <h1 className={styles.title}>{p.name}</h1>
            </header>
          </>
        }
        content={
          <ExecutionGrid
            left={
              <>
                {p.objective && <p className={styles.objective}>{p.objective}</p>}

                {p.variables && (
                  <DocumentProperties variables={p.variables} />
                )}

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
                
                {competency && (
                  <Link href={`/competencias/${competency.slug}`} className={styles.related}>
                    <Icon name="graduation-cap" size={16} />
                    <span>{competency.name}</span>
                    <Icon name="arrow-right" size={15} />
                  </Link>
                )}
              </>
            }
            right={
              <>
                {p.body && <DocumentViewer body={p.body} />}

                {p.expectedOutput && (
                  <section className={styles.result}>
                    <span className={styles.resultLabel}>
                      <Icon name="flag" size={15} /> {ui.terms.expectedResult}
                    </span>
                    <p>{p.expectedOutput}</p>
                  </section>
                )}
              </>
            }
          />
        }
      />
    </WorkspaceProvider>
  );
}
