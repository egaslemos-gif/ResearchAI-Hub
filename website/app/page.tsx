import Link from "next/link";
import { getTools, getPrompts } from "@/lib/content";
import { ui } from "@/lib/labels";
import { ToolCard } from "@/components/ui/ToolCard";
import { PromptCard } from "@/components/ui/PromptCard";
import { WelcomeBackCard } from "@/components/experience/WelcomeBackCard";
import { EcosystemGrid } from "@/components/home/EcosystemGrid";
import { PlatformStatus } from "@/components/home/PlatformStatus";
import { Icon } from "@/components/ui/Icon";
import styles from "./home.module.css";

export default function HomePage() {
  const tools = getTools();
  const prompts = getPrompts();

  return (
    <div className={styles.page}>
      <WelcomeBackCard />

      <section className={styles.hero}>
        <span className="overline">{ui.product.name}</span>
        <h1 className={styles.heroTitle}>{ui.home.question}</h1>
        <p className={styles.heroIntro}>{ui.product.intro}</p>
      </section>

      <section className={styles.section}>
        <EcosystemGrid />
      </section>

      {/* ---- Ferramentas ---- */}
      {tools.length > 0 && (
        <section className={styles.section}>
          <SectionHead
            title="Ferramentas mais utilizadas"
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
            title="Biblioteca de Prompts"
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

      {/* ---- Estado da Plataforma ---- */}
      <PlatformStatus />
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
