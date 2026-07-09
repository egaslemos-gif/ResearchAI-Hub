import Link from "next/link";
import { getCompetencies, getTools, getPrompts } from "@/lib/content";
import { ui } from "@/lib/labels";
import { CompetencyCard } from "@/components/ui/CompetencyCard";
import { ToolCard } from "@/components/ui/ToolCard";
import { PromptCard } from "@/components/ui/PromptCard";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import styles from "./home.module.css";

export default function HomePage() {
  const competencies = getCompetencies();
  const tools = getTools();
  const prompts = getPrompts();

  const [featured, ...rest] = competencies;

  return (
    <div className={styles.page}>
      {/* ---- Hero: responde "O que pretende fazer hoje?" + CTA principal ---- */}
      <section className={styles.hero}>
        <span className="overline">{ui.product.name}</span>
        <h1 className={styles.heroTitle}>{ui.home.question}</h1>
        <p className={styles.heroIntro}>{ui.product.intro}</p>
        {featured && (
          <div className={styles.heroCta}>
            <Button size="lg" href={`/competencias/${featured.slug}`}>
              {ui.actions.startWith(featured.name)}
              <Icon name="arrow-right" size={18} />
            </Button>
            <Button size="lg" variant="secondary" href="/competencias">
              {ui.actions.viewCompetencies}
            </Button>
          </div>
        )}
      </section>

      {/* ---- Competência em destaque + restantes (tudo dos activos) ---- */}
      {featured && (
        <section className={styles.section}>
          <SectionHead
            kicker={ui.home.featuredKicker}
            title={ui.home.competenciesTitle}
            subtitle={ui.home.competenciesSubtitle}
            href="/competencias"
          />
          <CompetencyCard c={featured} featured />
          {rest.length > 0 && (
            <div className={styles.grid3}>
              {rest.map((c) => (
                <CompetencyCard key={c.slug} c={c} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---- Ferramentas ---- */}
      {tools.length > 0 && (
        <section className={styles.section}>
          <SectionHead
            title={ui.home.toolsTitle}
            subtitle={ui.home.toolsSubtitle}
            href="/ferramentas"
          />
          <div className={styles.grid3}>
            {tools.map((t) => (
              <ToolCard key={t.slug} t={t} />
            ))}
          </div>
        </section>
      )}

      {/* ---- Biblioteca de Prompts (pré-visualização) ---- */}
      {prompts.length > 0 && (
        <section className={styles.section}>
          <SectionHead
            title={ui.home.promptsTitle}
            subtitle={ui.home.promptsSubtitle}
            href="/prompts"
          />
          <div className={styles.grid3}>
            {prompts.slice(0, 6).map((p) => (
              <PromptCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHead({
  kicker,
  title,
  subtitle,
  href,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  href: string;
}) {
  return (
    <div className={styles.sectionHead}>
      <div>
        {kicker && <span className="overline">{kicker}</span>}
        <h2 className={styles.sectionTitle}>{title}</h2>
        {subtitle && <p className={styles.sectionSub}>{subtitle}</p>}
      </div>
      <Link href={href} className={styles.viewAll}>
        {ui.actions.viewAll}
        <Icon name="arrow-right" size={15} />
      </Link>
    </div>
  );
}
