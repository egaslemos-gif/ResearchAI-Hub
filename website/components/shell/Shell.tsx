"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Home, GraduationCap, Wrench, MessageSquareText, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { ui } from "@/lib/labels";
import { useResearchSession } from "@/components/workspace/ResearchSessionContext";
import { ContextBar } from "@/components/experience/ContextBar";
import styles from "./Shell.module.css";

// Rotas = estrutura da aplicação (não é conteúdo de domínio). Rótulos vêm de lib/labels.
const NAV = [
  { href: "/", label: ui.nav.home, icon: Home, exact: true },
  { href: "/competencias", label: ui.nav.competencies, icon: GraduationCap },
  { href: "/ferramentas", label: ui.nav.tools, icon: Wrench },
  { href: "/prompts", label: ui.nav.prompts, icon: MessageSquareText },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // Mobile drawer
  const [collapsed, setCollapsed] = useState(false); // Desktop sidebar
  const { session } = useResearchSession();

  // fecha o drawer ao navegar
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className={`${styles.shell} ${collapsed ? styles.shellCollapsed : ""}`}>
      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.menuBtn}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link href="/" className={styles.brand}>
          <Logo className={styles.brandMark} />
          <span className={styles.brandName}>{ui.product.name}</span>
        </Link>

        <div className={styles.topbarRight}>
          <ThemeToggle />
        </div>
      </header>

      <nav
        className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""} ${collapsed ? styles.sidebarCollapsed : ""}`}
        aria-label="Navegação principal"
      >
        <div className={styles.navGroup}>
          <span className={styles.navGroupTitle}>Workspace</span>
          <div className={styles.navGroupContent}>
            {session.status === "active" && session.researchTopic ? (
              <div className={styles.contextBlock}>
                <span className={styles.contextLabel}>Investigação Atual</span>
                <span className={styles.contextTopic}>{session.researchTopic}</span>
                <span className={styles.contextArea}>{session.studyArea}</span>

                <div className={styles.contextSeparator} />

                <span className={styles.contextLabel}>Protocolo</span>
                <span className={styles.contextValue}>{session.currentProtocol || "Revisão da Literatura"}</span>

                <div className={styles.contextSeparator} />

                <span className={styles.contextLabel}>Progresso</span>
                <span className={styles.contextValue}>{session.currentStep ? `Passo ${session.currentStep} / 10` : "-"}</span>
                <span className={styles.contextState}>Em progresso</span>
              </div>
            ) : (
              <div className={styles.contextBlock}>
                <span className={styles.contextLabel}>Nenhuma investigação</span>
                <span className={styles.contextArea}>Inicia um protocolo para ver o contexto.</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.contextSeparator} style={{ margin: "var(--space-2) 0 var(--space-4) 0" }} />

        <div className={styles.navGroup}>
          <span className={styles.navGroupTitle}>Plataforma</span>
          <div className={styles.navGroupContent}>
            <ul className={styles.navList}>
              <li>
                <Link href="/" className={`${styles.navItem} ${isActive("/", true) ? styles.navItemActive : ""}`}>
                  <Home size={18} />
                  <span className={styles.navLabel}>Início</span>
                </Link>
              </li>
              <li>
                <Link href="/competencias" className={`${styles.navItem} ${isActive("/competencias", true) || isActive("/competencias/RL-01") ? styles.navItemActive : ""}`}>
                  <GraduationCap size={18} />
                  <span className={styles.navLabel}>Competências</span>
                </Link>
              </li>
              <li>
                <Link href="/ferramentas" className={`${styles.navItem} ${isActive("/ferramentas") ? styles.navItemActive : ""}`}>
                  <Wrench size={18} />
                  <span className={styles.navLabel}>Ferramentas</span>
                </Link>
              </li>
              <li>
                <Link href="/prompts" className={`${styles.navItem} ${isActive("/prompts") ? styles.navItemActive : ""}`}>
                  <MessageSquareText size={18} />
                  <span className={styles.navLabel}>Prompts</span>
                </Link>
              </li>
              <li>
                <span className={`${styles.navItem} ${styles.navItemDisabled}`}>
                  <span className={styles.navLabel}>Academy</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.contextSeparator} style={{ margin: "auto 0 var(--space-2) 0" }} />

        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.collapseBtn}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>
      </nav>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} aria-hidden />}

      <div className={styles.mainWrapper}>
        <ContextBar />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
