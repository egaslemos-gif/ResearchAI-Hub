import type { ReactNode } from "react";
import styles from "./Badge.module.css";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info" | "outline";

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return <span className={`${styles.badge} ${styles[tone]} ${className}`.trim()}>{children}</span>;
}
