import type { ReactNode } from "react";
import styles from "./CatalogGrid.module.css";

export function CatalogGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className={styles.empty}>{children}</div>;
}
