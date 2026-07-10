import Link from "next/link";
import { getTools, getPrompts } from "@/lib/content";
import { ui } from "@/lib/labels";
import { ToolCard } from "@/components/ui/ToolCard";
import { PromptCard } from "@/components/ui/PromptCard";
import { WelcomeBackCard } from "@/components/experience/WelcomeBackCard";
import { EcosystemGrid } from "@/components/home/EcosystemGrid";
import { PlatformStatus } from "@/components/home/PlatformStatus";
import { UpcomingReleases } from "@/components/home/UpcomingReleases";
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

      {/* ---- Recursos para Investigar ---- */}
      {(tools.length > 0 || prompts.length > 0) && (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <h2 className={styles.sectionTitle}>Recursos para Investigar</h2>
              <p className={styles.sectionSub}>Software, serviços e ativos intelectuais que compõem a plataforma.</p>
            </div>
          </div>
          
          <div className={styles.resourcesGrid}>
            <div className={styles.resourceBlock}>
              <div className={styles.resourceBlockHead}>
                <h3 className={styles.resourceBlockTitle}>Ferramentas</h3>
                <Link href="/ferramentas" className={styles.viewAll}>
                  Ver todas <Icon name="arrow-right" size={14} />
                </Link>
              </div>
              <div className={styles.resourceList}>
                {tools.slice(0, 4).map((t) => (
                  <ToolCard key={t.slug} t={t} />
                ))}
              </div>
            </div>

            <div className={styles.resourceBlock}>
              <div className={styles.resourceBlockHead}>
                <h3 className={styles.resourceBlockTitle}>Biblioteca de Prompts</h3>
                <Link href="/prompts" className={styles.viewAll}>
                  Ver todos <Icon name="arrow-right" size={14} />
                </Link>
              </div>
              <div className={styles.resourceList}>
                {prompts.slice(0, 4).map((p) => (
                  <PromptCard key={p.id} p={p} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---- Estado da Plataforma ---- */}
      <PlatformStatus />
      
      {/* ---- Próximos Lançamentos ---- */}
      <UpcomingReleases />
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
