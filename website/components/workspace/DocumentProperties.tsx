"use client";
import React, { useState, useEffect, useRef } from "react";
import { useWorkspace } from "./WorkspaceContext";
import { useResearchSession, SessionState } from "./ResearchSessionContext";
import schema from "@/lib/context-schema.json";
import type { PromptVariable } from "@/lib/content";
import { TextField, SelectField } from "./WorkspaceField";
import styles from "./DocumentProperties.module.css";
import { Button } from "../ui/Button";

export function DocumentProperties({ variables }: { variables: PromptVariable[] }) {
  const { session, updateSession, updateStepProgress, advanceStepState } = useResearchSession();
  const { setToastMessage } = useWorkspace();
  const [isEditing, setIsEditing] = useState(true);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

  const step = session.currentStep || 1;
  const currentStatus: SessionState = session.progress?.[step]?.status || "Draft";
  const documentProperties = session.progress?.[step]?.variables || {};
  const isContextConfirmed = ["ContextConfirmed", "PromptGenerated", "PromptExecuted", "EvidenceValidated", "Completed"].includes(currentStatus);

  // Initialize localValues from global state when opening edit mode
  useEffect(() => {
    if (isEditing) {
      const initialLocal: Record<string, string> = {};
      const docProps = session.progress?.[step]?.variables || {};
      variables.forEach(v => {
        const isGlobal = schema.some((s: any) => s.id === v.name);
        initialLocal[v.name] = isGlobal ? ((session as any)[v.name] || "") : (docProps[v.name] || "");
      });
      
      setLocalValues(prev => {
        // Only update state if values actually changed to prevent infinite loops
        const keys = Object.keys(initialLocal);
        const prevKeys = Object.keys(prev);
        if (keys.length !== prevKeys.length) return initialLocal;
        const hasChanged = keys.some(k => prev[k] !== initialLocal[k]);
        return hasChanged ? initialLocal : prev;
      });
    }
  }, [isEditing, variables, session, step]);

  // Auto-collapse se os dados já vieram preenchidos
  useEffect(() => {
    if (variables.length === 0) return;
    if (isContextConfirmed) {
      setIsEditing(false);
    }
  }, [variables, isContextConfirmed]);

  const handleEdit = () => {
    setIsEditing(true);
    advanceStepState(step, "Draft");
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 50);
  };

  const handleSave = () => {
    // Sync localValues to global state
    const globalUpdates: any = {};
    const localUpdates: Record<string, string> = { ...documentProperties };
    
    variables.forEach(v => {
      const isGlobal = schema.some((s: any) => s.id === v.name);
      if (isGlobal) {
        globalUpdates[v.name] = localValues[v.name] || "";
      } else {
        localUpdates[v.name] = localValues[v.name] || "";
      }
    });

    if (Object.keys(globalUpdates).length > 0) {
      updateSession(globalUpdates);
    }
    
    updateStepProgress(step, { variables: localUpdates });
    advanceStepState(step, "ContextConfirmed");
    setIsEditing(false);
    
    setToastMessage("✓ Contexto confirmado!");
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (variables.length === 0) return null;

  return (
    <div className={styles.properties}>
      <div className={styles.propertiesHeader}>
        <h4 className="prepTitle" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0 }}>Research Profile</h4>
        {!isEditing && (
          <button className={styles.editBtn} onClick={handleEdit}>
            Editar
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className={styles.ideSummary}>
          {variables.map(v => {
            const isGlobal = schema.some((s: any) => s.id === v.name);
            const value = isGlobal ? (session as any)[v.name] : documentProperties[v.name];
            const label = v.description || v.name;
            return (
              <div key={v.name} className={styles.ideSummaryRow}>
                <span className={styles.ideSummaryLabel}>{label}</span>
                <span className={styles.ideSummaryValue}>{value || "—"}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.inspectorFields}>
          {variables.map((v, idx) => {
            const value = localValues[v.name] || "";
            const label = v.description || v.name;
            const requiredLabel = v.required ? `${label} *` : label;

            const handleChange = (val: string) => {
              setLocalValues(prev => ({ ...prev, [v.name]: val }));
            };

            const refCb = (el: any) => {
              if (idx === 0) firstInputRef.current = el;
            };

            if (v.type === "enum" && v.values) {
              const options = [{ label: "—", value: "" }, ...v.values.map(opt => ({ label: opt, value: opt }))];
              return (
                <div key={v.name} ref={refCb}>
                  <SelectField
                    id={v.name}
                    label={requiredLabel}
                    value={value}
                    options={options}
                    onChange={(e) => handleChange(e.target.value)}
                  />
                </div>
              );
            }

            return (
              <div key={v.name} ref={refCb}>
                <TextField
                  id={v.name}
                  label={requiredLabel}
                  value={value}
                  disabled={false}
                  placeholder={label ? `Digite ${label.toLowerCase()}...` : "Clique para introduzir..."}
                  onChange={(e) => handleChange(e.target.value)}
                />
              </div>
            );
          })}
          
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-subtle)', margin: 'var(--space-4) 0' }} />
          <Button variant="secondary" onClick={handleSave} className={styles.saveBtn}>
            Confirmar Contexto
          </Button>
        </div>
      )}
    </div>
  );
}

