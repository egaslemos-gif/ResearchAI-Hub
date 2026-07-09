import { Icon } from "./Icon";
import { ui } from "@/lib/labels";
import styles from "./EthicsNote.module.css";

/**
 * Aviso ético contextual (TR-1). Mostra, de forma curta, as regras CRÍTICAS já
 * definidas em validation.json (globalRules). Não cria regras novas — apenas
 * apresenta as existentes no momento em que o utilizador usa IA.
 * O nome curto é visível; a descrição completa fica no title (hover).
 */
export function EthicsNote({
  rules,
}: {
  rules: { name: string | null; text: string }[];
}) {
  if (!rules.length) return null;
  return (
    <aside className={styles.note} aria-label={ui.ethics.title}>
      <div className={styles.head}>
        <Icon name="shield-alert" size={16} />
        <span>{ui.ethics.title}</span>
      </div>
      <ul className={styles.list}>
        {rules.map((r, i) => (
          <li key={i} title={r.text}>
            {r.name || r.text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
