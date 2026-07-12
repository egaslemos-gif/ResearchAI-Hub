"use client";
import { useCallback, useEffect, useState } from "react";
import schema from "./context-schema.json";

export type ResearchContext = {
  id: string;
  protocolId: string;
  studyArea: string;
  researchTopic: string;
  academicLevel: string;
  language: string;
  currentStep: number;
  createdAt: string;
  updatedAt: string;
  status: "active" | "completed";
  [key: string]: any; // Para futura expansão via schema
};

const STORAGE_KEY = "raihub:v1:research_context";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function getInitialContext(): Partial<ResearchContext> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return {};
}

/**
 * Hook para consumir e atualizar o contexto da investigação actual.
 */
export function useResearchContext() {
  const [context, setContext] = useState<Partial<ResearchContext>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setContext(getInitialContext());
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setContext(getInitialContext());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /**
   * Actualiza propriedades individuais no contexto.
   * Auto-save imediato no localStorage.
   */
  const updateContext = useCallback((updates: Partial<ResearchContext>) => {
    setContext((prev) => {
      const now = new Date().toISOString();
      const isNew = !prev.id;
      
      const next: Partial<ResearchContext> = {
        ...prev,
        ...updates,
        id: prev.id || generateId(),
        status: prev.status || "active",
        createdAt: prev.createdAt || now,
        updatedAt: now,
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        // Despachar evento para sincronizar outras abas e componentes
        window.dispatchEvent(new CustomEvent("research_context_updated", { detail: { source: "useResearchContext" } }));
      } catch {}

      return next;
    });
  }, []);

  const clearContext = useCallback(() => {
    setContext({});
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("research_context_updated"));
    } catch {}
  }, []);

  // Ouve eventos locais disparados na mesma aba (storage event só funciona noutras abas)
  useEffect(() => {
    const onLocalUpdate = (e: Event) => {
      if (e instanceof CustomEvent && e.detail?.source === "useResearchContext") {
        return; // Ignore events dispatched by ourselves to prevent double renders and cursor jumping
      }
      setContext(getInitialContext());
    };
    window.addEventListener("research_context_updated", onLocalUpdate);
    return () => window.removeEventListener("research_context_updated", onLocalUpdate);
  }, []);

  return {
    context,
    ready,
    updateContext,
    clearContext,
    schema,
  };
}
