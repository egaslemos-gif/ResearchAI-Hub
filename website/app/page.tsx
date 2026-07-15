import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { PublicLayout } from "@/components/layouts/Layouts";
import styles from "./landing.module.css";
import { EcosystemGrid } from "@/components/home/EcosystemGrid";

export default function LandingPage() {
  return (
    <PublicLayout>
      <div className={styles.landingContainer}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.badge}>ResearchAI Hub MVP 1.0</div>
          <h1 className={styles.title}>Scientific Research Operating System</h1>
          <p className={styles.subtitle}>
            A plataforma metodológica que orienta investigadores através de protocolos rigorosos. 
            Orientado pelo Evidence First Manifesto.
          </p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <Icon name="check-circle" size={18} />
              Protocol Driven Research
            </div>
            <div className={styles.feature}>
              <Icon name="check-circle" size={18} />
              Evidence First
            </div>
            <div className={styles.feature}>
              <Icon name="check-circle" size={18} />
              Research Workflow Platform
            </div>
          </div>

          <div className={styles.ctaGroup}>
            <Link href="/dashboard" className={styles.primaryCta}>
              Entrar na Plataforma <Icon name="arrow-right" size={20} />
            </Link>
            <Link href="/docs/como-funciona" className={styles.secondaryCta}>
              Ver Como Funciona <Icon name="book-open" size={20} />
            </Link>
          </div>

          <div style={{ marginTop: "4rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", background: "var(--color-surface)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--color-border)", textAlign: "left", width: "100%" }}>
            <div>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-subtle)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Status</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, color: "var(--color-text)" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }}></span> Training Ready
              </div>
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-subtle)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Validation Sprint</div>
              <div style={{ fontWeight: 600, color: "var(--color-text)" }}>Concluída</div>
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-subtle)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Release Sprint</div>
              <div style={{ fontWeight: 600, color: "var(--color-text)" }}>Concluída</div>
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-subtle)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Protocolos</div>
              <div style={{ fontWeight: 600, color: "var(--color-text)" }}>1 Disponível <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>· 8 Planeados</span></div>
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-subtle)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Modo Oficial</div>
              <div style={{ fontWeight: 600, color: "var(--color-text)" }}>BYIA</div>
            </div>
            <div>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-subtle)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Compliance</div>
              <div style={{ fontWeight: 600, color: "var(--color-text)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <div>Evidence First <span style={{ color: "#10b981" }}>✔</span></div>
                <div>Research Identity <span style={{ color: "#10b981" }}>✔</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* Ecosystem Section */}
        <section style={{ padding: "4rem 2rem", background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "1rem" }}>Competências Científicas</h2>
              <p style={{ fontSize: "1.25rem", color: "var(--color-text-muted)", maxWidth: "800px", margin: "0 auto" }}>
                O ResearchAI Hub é projectado para apoiar todas as fases da investigação científica, desde a concepção até à publicação.
              </p>
            </div>
            
            <EcosystemGrid />
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div>ResearchAI Hub MVP 1.0</div>
          <div>Scientific Research Operating System | Validation Sprint Approved | Protocol Driven Research | Evidence First</div>
          <div>&copy; {new Date().getFullYear()} Universidade Licungo / ResearchAI Hub. Todos os direitos reservados.</div>
          
          <div className={styles.footerLinks}>
            <Link href="/docs">Centro de Conhecimento</Link>
            <Link href="/exemplos">Exemplos</Link>
            <Link href="/sobre">Sobre a Plataforma</Link>
            <Link href="/citar">Como Citar</Link>
            <Link href="/release-notes">Release Notes</Link>
          </div>
        </footer>
      </div>
    </PublicLayout>
  );
}
