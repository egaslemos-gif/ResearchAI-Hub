import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "ghost" | "subtle" | "danger" | "link";
type Size = "sm" | "md" | "lg";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonProps = BaseProps &
  (
    | ({ href: string; external?: boolean } & Record<string, unknown>)
    | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  );

/** Botão do Design System (§8). Renderiza <a>/Link quando `href` é dado. */
export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...rest
}: ButtonProps) {
  const cls = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`.trim();

  if ("href" in rest && rest.href) {
    const { href, external, ...anchorRest } = rest as { href: string; external?: boolean };
    if (external) {
      return (
        <a href={href} className={cls} target="_blank" rel="noreferrer noopener" {...anchorRest}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...(anchorRest as Record<string, unknown>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={cls} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
