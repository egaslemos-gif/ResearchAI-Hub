"use client";
import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import type { PromptVariable } from "@/lib/content";
import { ui } from "@/lib/labels";
import { useResearchContext } from "@/lib/researchContext";
import { ResearchContextCard } from "./ResearchContextCard";
import styles from "./PromptCanvas.module.css";

const TOKEN = /\{\{\s*([\w.-]+)\s*\}\}/g;

/**
 * Prompt copiável com preenchimento de variáveis em tempo real.
 * Consome automaticamente o Research Context para variáveis globais da investigação.
 */
export function PromptCanvas({
  body,
  variables,
  showForm = true,
}: {
  body: string;
  variables: PromptVariable[];
  showForm?: boolean;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const { context, schema } = useResearchContext();

  const contextKeys = useMemo(() => schema.map((f: any) => f.id), [schema]);

  const contextVariables = useMemo(
    () => variables.filter((v) => contextKeys.includes(v.name)),
    [variables, contextKeys]
  );

  const localVariables = useMemo(
    () => variables.filter((v) => !contextKeys.includes(v.name)),
    [variables, contextKeys]
  );

  const parts = useMemo(() => {
    const out: { text?: string; name?: string }[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    TOKEN.lastIndex = 0;
    while ((m = TOKEN.exec(body))) {
      if (m.index > last) out.push({ text: body.slice(last, m.index) });
      out.push({ name: m[1] });
      last = m.index + m[0].length;
    }
    if (last < body.length) out.push({ text: body.slice(last) });
    return out;
  }, [body]);

  const getResolvedValue = (name: string) => {
    return contextKeys.includes(name) ? context[name] : values[name];
  };

  const filledText = useMemo(() => {
    TOKEN.lastIndex = 0;
    return body.replace(TOKEN, (_all, name) => getResolvedValue(name) || `{{${name}}}`);
  }, [body, values, context, contextKeys]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(filledText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignora */
    }
  };

  const hasForm = showForm && variables.length > 0;

  return (
    <div className={`${styles.canvas} ${hasForm ? styles.withForm : ""}`}>
      {showForm && contextVariables.length > 0 && (
        <ResearchContextCard requestedFields={contextVariables.map((v) => v.name)} />
      )}

      {showForm && localVariables.length > 0 && (
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          {localVariables.map((v) => (
            <label key={v.name} className={styles.field}>
              <span className={styles.fieldLabel}>
                {v.description || v.name}
                {v.required && <span className={styles.req}> *</span>}
              </span>
              {v.type === "enum" && v.values ? (
                <select
                  className={styles.input}
                  value={values[v.name] || ""}
                  onChange={(e) => setValues((s) => ({ ...s, [v.name]: e.target.value }))}
                >
                  <option value="">—</option>
                  {v.values.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={styles.input}
                  type="text"
                  value={values[v.name] || ""}
                  placeholder={v.name}
                  onChange={(e) => setValues((s) => ({ ...s, [v.name]: e.target.value }))}
                />
              )}
            </label>
          ))}
        </form>
      )}

      <div className={styles.previewWrap}>
        <div className={styles.previewHead}>
          <span className="overline">{ui.terms.prompt}</span>
          <button type="button" className={styles.copyBtn} onClick={copy}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? ui.actions.copied : ui.actions.copy}
          </button>
        </div>
        <pre className={styles.preview}>
          {parts.map((p, i) =>
            p.text !== undefined ? (
              <span key={i}>{p.text}</span>
            ) : getResolvedValue(p.name!) ? (
              <span key={i} className={styles.filled}>
                {getResolvedValue(p.name!)}
              </span>
            ) : (
              <span key={i} className={styles.token}>{`{{${p.name}}}`}</span>
            )
          )}
        </pre>
      </div>
    </div>
  );
}
