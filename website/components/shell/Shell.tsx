"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Home, GraduationCap, Wrench, MessageSquareText, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { ui } from "@/lib/labels";
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
  const [open, setOpen] = useState(false);

  // fecha o drawer ao navegar
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className={styles.shell}>
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
          <span className={styles.brandMark} aria-hidden>
            R
          </span>
          <span className={styles.brandName}>{ui.product.name}</span>
        </Link>

        <div className={styles.topbarRight}>
          <ThemeToggle />
        </div>
      </header>

      <nav
        className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}
        aria-label="Navegação principal"
      >
        <div className={styles.navGroup}>
          <span className={styles.navGroupTitle}>Workspace</span>
          <ul className={styles.navList}>
            <li>
              <Link
                href="/"
                className={`${styles.navItem} ${isActive("/", true) ? styles.navItemActive : ""}`}
              >
                Início
              </Link>
            </li>
            {/* O "Investigação Atual" apenas encaminhará para as competências por enquanto se não houver contexto específico na App router mas a ideia é ter aqui o link direto */}
            <li>
              <Link
                href="/competencias"
                className={`${styles.navItem} ${isActive("/competencias/RL-01", false) ? styles.navItemActive : ""}`}
              >
                Investigação Atual
              </Link>
            </li>
          </ul>
        </div>

        <div className={styles.navGroup}>
          <span className={styles.navGroupTitle}>Percursos</span>
          <ul className={styles.navList}>
            <li>
              <Link
                href="/competencias"
                className={`${styles.navItem} ${isActive("/competencias", true) ? styles.navItemActive : ""}`}
              >
                Competências
              </Link>
            </li>
          </ul>
        </div>

        <div className={styles.navGroup}>
          <span className={styles.navGroupTitle}>Biblioteca</span>
          <ul className={styles.navList}>
            <li>
              <Link
                href="/ferramentas"
                className={`${styles.navItem} ${isActive("/ferramentas") ? styles.navItemActive : ""}`}
              >
                Ferramentas
              </Link>
            </li>
            <li>
              <Link
                href="/prompts"
                className={`${styles.navItem} ${isActive("/prompts") ? styles.navItemActive : ""}`}
              >
                Prompts
              </Link>
            </li>
            <li>
              <span className={`${styles.navItem} ${styles.navItemDisabled}`}>Recursos</span>
            </li>
          </ul>
        </div>

        <div className={styles.navGroup}>
          <span className={styles.navGroupTitle}>Academy</span>
          <ul className={styles.navList}>
            <li>
              <span className={`${styles.navItem} ${styles.navItemDisabled}`}>Brevemente</span>
            </li>
          </ul>
        </div>

        <div className={styles.sidebarFooter}>
          <span className="overline">ResearchAI Hub · Beta</span>
        </div>
      </nav>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} aria-hidden />}

      <main className={styles.main}>{children}</main>
    </div>
  );
}
