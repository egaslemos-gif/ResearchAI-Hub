import { useState, useMemo } from "react";
import { useResearchContext } from "@/lib/researchContext";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import styles from "./ResearchContextCard.module.css";

export function ResearchContextCard({
  requestedFields = [],
  forceEdit = false,
}: {
  requestedFields?: string[];
  forceEdit?: boolean;
}) {
  const { context, ready, updateContext, schema } = useResearchContext();
  const [isEditing, setIsEditing] = useState(forceEdit);

  // Determinar que campos do schema mostrar.
  // Se requestedFields vier vazio, assumimos que mostramos todos os do schema.
  const fields = useMemo(() => {
    return schema.filter((f) => 
      requestedFields.length === 0 || requestedFields.includes(f.id)
    );
  }, [requestedFields, schema]);

  if (!ready || fields.length === 0) return null;

  // Se algum campo requerido (que esteja nos requestedFields) estiver vazio no context, forçamos edição
  const hasMissingData = fields.some((f) => !context[f.id]);
  const editing = isEditing || hasMissingData || forceEdit;

  const handleUpdate = (id: string, value: string) => {
    updateContext({ [id]: value });
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Icon name="microscope" size={16} className={styles.headerIcon} />
          <span className="overline">Investigação Actual</span>
        </div>
        {!editing && (
          <button 
            type="button" 
            className={styles.editBtn} 
            onClick={() => setIsEditing(true)}
          >
            <Icon name="pencil" size={14} /> Editar
          </button>
        )}
        {editing && !hasMissingData && !forceEdit && (
          <button 
            type="button" 
            className={styles.editBtn} 
            onClick={() => setIsEditing(false)}
          >
            <Icon name="check" size={14} /> Concluir
          </button>
        )}
      </div>

      {editing ? (
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          {fields.map((f) => (
            <label key={f.id} className={styles.field}>
              <span className={styles.fieldLabel}>
                {f.label}
                {f.required && <span className={styles.req}> *</span>}
              </span>
              {f.type === "enum" && f.options ? (
                <select
                  className={styles.input}
                  value={context[f.id] || ""}
                  onChange={(e) => handleUpdate(f.id, e.target.value)}
                >
                  <option value="">—</option>
                  {f.options.map((opt: string) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={styles.input}
                  type="text"
                  value={context[f.id] || ""}
                  placeholder={f.label}
                  onChange={(e) => handleUpdate(f.id, e.target.value)}
                />
              )}
            </label>
          ))}
        </form>
      ) : (
        <dl className={styles.summary}>
          {fields.map((f) => (
            <div key={f.id} className={styles.summaryItem}>
              <dt>{f.label}</dt>
              <dd>{context[f.id] || "—"}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
