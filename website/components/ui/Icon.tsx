import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";

/**
 * Ícone content-driven. O nome vem dos activos (ex.: protocol.json → icon: "book-open"),
 * que já são nomes Lucide (Design System, Apêndice B) — bind directo, zero mapeamento.
 * Renderizado em Server Components → SVG inline, sem custo no bundle do cliente.
 */
function pascal(name: string): string {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

export function Icon({
  name,
  size = 20,
  ...rest
}: { name: string; size?: number } & Omit<LucideProps, "ref">) {
  const key = pascal(name);
  const lib = LucideIcons as unknown as Record<string, ComponentType<LucideProps>>;
  const Cmp = lib[key] ?? lib.Sparkles;
  return <Cmp size={size} strokeWidth={1.75} aria-hidden {...rest} />;
}
