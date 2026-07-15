import { ReactNode } from "react";
import styles from "./Layouts.module.css";

// ---------------------------------------------------------
// Nível 2: Content Layouts
// ---------------------------------------------------------

export function CompactLayout({ children }: { children: ReactNode }) {
  return <div className={styles.compact}>{children}</div>;
}

export function ReadingLayout({ children }: { children: ReactNode }) {
  return <div className={styles.reading}>{children}</div>;
}

export function ProtocolLayout({ children }: { children: ReactNode }) {
  return <div className={styles.protocol}>{children}</div>;
}

export function WideLayout({ children }: { children: ReactNode }) {
  return <div className={styles.wide}>{children}</div>;
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return <div className={styles.public}>{children}</div>;
}

// ---------------------------------------------------------
// Execution Layout & Regions
// ---------------------------------------------------------

export function ExecutionLayout({
  header,
  content,
  footer,
}: {
  header?: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className={styles.execution}>
      {header && <header className={styles.headerRegion}>{header}</header>}
      <main className={styles.contentRegion}>{content}</main>
      {footer && <footer className={styles.footerActions}>{footer}</footer>}
    </div>
  );
}

// ---------------------------------------------------------
// Execution Grid Component (Dentro do ContentRegion do ExecutionLayout)
// ---------------------------------------------------------

export function ExecutionGrid({
  left,
  right,
  variant = "sidebar-main",
}: {
  left: ReactNode;
  right: ReactNode;
  variant?: "sidebar-main" | "main-sidebar";
}) {
  return (
    <div className={styles.executionGrid} data-variant={variant}>
      <div className={styles.executionLeft}>{left}</div>
      <div className={styles.executionRight}>{right}</div>
    </div>
  );
}
