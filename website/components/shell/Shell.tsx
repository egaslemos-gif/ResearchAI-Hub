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
        <ul className={styles.navList}>
          {NAV.map((item) => {
            const Ico = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <Ico size={18} strokeWidth={1.75} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className={styles.sidebarFooter}>
          <span className="overline">ResearchAI Hub · Beta</span>
        </div>
      </nav>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} aria-hidden />}

      <main className={styles.main}>{children}</main>
    </div>
  );
}
