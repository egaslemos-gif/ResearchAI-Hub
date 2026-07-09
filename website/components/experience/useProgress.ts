"use client";
import { useCallback, useEffect, useState } from "react";

/**
 * Progresso persistente do utilizador (Ajuste 4).
 * MVP: apenas LocalStorage. Guarda os passos concluídos e os itens da checklist
 * por competência. Não introduz entidades de domínio nem toca no Runtime.
 */
type ProgressState = { steps: number[]; checklist: string[] };
const key = (slug: string) => `raihub:v1:progress:${slug}`;

function read(slug: string): ProgressState {
  try {
    const raw = localStorage.getItem(key(slug));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        steps: Array.isArray(parsed.steps) ? parsed.steps : [],
        checklist: Array.isArray(parsed.checklist) ? parsed.checklist : [],
      };
    }
  } catch {
    /* ignora */
  }
  return { steps: [], checklist: [] };
}

export function useProgress(slug: string) {
  const [state, setState] = useState<ProgressState>({ steps: [], checklist: [] });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(read(slug));
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key(slug)) setState(read(slug));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [slug]);

  const save = useCallback(
    (next: ProgressState) => {
      setState(next);
      try {
        localStorage.setItem(key(slug), JSON.stringify(next));
      } catch {
        /* ignora */
      }
    },
    [slug]
  );

  const markStep = useCallback(
    (n: number) => setState((s) => {
      if (s.steps.includes(n)) return s;
      const next = { ...s, steps: [...s.steps, n].sort((a, b) => a - b) };
      try {
        localStorage.setItem(key(slug), JSON.stringify(next));
      } catch {}
      return next;
    }),
    [slug]
  );

  const toggleChecklist = useCallback(
    (itemKey: string) => setState((s) => {
      const has = s.checklist.includes(itemKey);
      const next = {
        ...s,
        checklist: has ? s.checklist.filter((k) => k !== itemKey) : [...s.checklist, itemKey],
      };
      try {
        localStorage.setItem(key(slug), JSON.stringify(next));
      } catch {}
      return next;
    }),
    [slug]
  );

  const reset = useCallback(() => save({ steps: [], checklist: [] }), [save]);

  return {
    ready,
    steps: state.steps,
    checklist: state.checklist,
    stepsDone: state.steps.length,
    markStep,
    toggleChecklist,
    reset,
  };
}
