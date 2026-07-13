"use client";
import React, { useState, useEffect, useRef } from "react";
import { useWorkspace } from "./WorkspaceContext";
import { useWorkspaceStore, SessionState } from "./WorkspaceStoreContext";
import schema from "@/lib/context-schema.json";
import type { PromptVariable } from "@/lib/content";
import { TextField, SelectField } from "./WorkspaceField";
import styles from "./DocumentProperties.module.css";
import { Button } from "../ui/Button";

export function DocumentProperties({ variables }: { variables: PromptVariable[] }) {
  const { session, updateStepProgress, advanceStepState } = useWorkspaceStore();
  const { setToastMessage } = useWorkspace();
  const [isEditing, setIsEditing] = useState(true);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const firstInputRef = useRef<HTMLInputElement | HTMLSelectElement | null>(null);

  const step = session.currentStep || 1;
  const currentStatus: SessionState = session.progress?.[step]?.status || "Draft";
  const documentProperties = session.progress?.[step]?.variables || {};
  const isContextConfirmed = ["ContextConfirmed", "PromptGenerated", "PromptExecuted", "EvidenceValidated", "Completed"].includes(currentStatus);

  // Separate global (workspace) variables from step-specific variables
  const globalVars = variables.filter(v => schema.some((s: any) => s.id === v.name));
  const stepVars = variables.filter(v => !schema.some((s: any) => s.id === v.name));

  // Check if all global variables are already filled in the workspace
  const globalVarsFilled = globalVars.every(v => {
    const val = (session as any)[v.name];
    return val !== undefined && val !== null && String(val).trim() !== "";
  });

  // Auto-confirm context if all global vars are filled AND there are no step-specific vars
  useEffect(() => {
    if (globalVarsFilled && stepVars.length === 0 && currentStatus === "Draft") {
      advanceStepState(step, "ContextConfirmed");
    }
  }, [globalVarsFilled, stepVars.length, currentStatus, step, advanceStepState]);

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
    // Validate required step-specific fields
    const missing: string[] = [];
    stepVars.forEach(v => {
      if (v.required) {
        const val = (localValues[v.name] || "").trim();
        if (!val) {
          missing.push(v.description || v.name);
        }
      }
    });

    if (missing.length > 0) {
      const msg = missing.length === 1
        ? `Campo obrigatório não preenchido: ${missing[0]}`
        : `${missing.length} campos obrigatórios não preenchidos`;
      setToastMessage(`⚠ ${msg}`);
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    // Sync localValues to global state (only step-specific vars; globals are read-only from workspace)
    const localUpdates: Record<string, string> = { ...documentProperties };
    stepVars.forEach(v => {
      localUpdates[v.name] = localValues[v.name] || "";
    });

    updateStepProgress(step, { variables: localUpdates });
    advanceStepState(step, "ContextConfirmed");
    setIsEditing(false);
  };

  // If no step-specific variables, don't render the form at all — context comes from workspace
  if (stepVars.length === 0) return null;

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
          {stepVars.map(v => {
            const value = documentProperties[v.name];
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
          {stepVars.map((v, idx) => {
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
          <Button variant="secondary" onClick={handleSave} className={styles.saveBtn} disabled={!stepVars.every(v => !v.required || (localValues[v.name] || "").trim())}>
            Guardar
          </Button>
        </div>
      )}
    </div>
  );
}

