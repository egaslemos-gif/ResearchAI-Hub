"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

/* ============================================================
   ArtifactStore — localStorage-based store for step artifacts
   Each step produces a structured artifact that feeds the next.
   ============================================================ */

export interface TemaArtifact {
  studyArea: string;
  researchTopic: string;
  academicLevel: string;
  delimited: string;
  feasibility: string;
  createdAt: string;
}

export interface PerguntaArtifact {
  researchQuestion: string;
  generalObjective: string;
  specificObjectives: string[];
  keywordsPT: string[];
  keywordsEN: string[];
  createdAt: string;
}

export interface Article {
  id: string;
  title: string;
  authors: string;
  year: string;
  source: string;
  doi?: string;
  abstract?: string;
}

export interface ArticleListArtifact {
  articles: Article[];
  searchQueries: string[];
  createdAt: string;
}

export interface SelectedArticle extends Article {
  selected: boolean;
  justification: string;
}

export interface SelectionArtifact {
  inclusionCriteria: string[];
  exclusionCriteria: string[];
  articles: SelectedArticle[];
  createdAt: string;
}

export interface ReadingCard {
  articleId: string;
  articleTitle: string;
  objective: string;
  methodology: string;
  sample: string;
  results: string;
  limitations: string;
  contribution: string;
  quality: string;
  createdAt: string;
}

export interface ReadingCardsArtifact {
  cards: ReadingCard[];
  createdAt: string;
}

export interface ComparisonRow {
  articleId: string;
  articleTitle: string;
  objective: string;
  methodology: string;
  sample: string;
  results: string;
  limitations: string;
}

export interface ComparisonTableArtifact {
  rows: ComparisonRow[];
  convergences: string[];
  divergences: string[];
  createdAt: string;
}

export interface ResearchGap {
  id: string;
  description: string;
  justification: string;
  addressable: string;
}

export interface GapsArtifact {
  gaps: ResearchGap[];
  createdAt: string;
}

export interface SynthesisTheme {
  id: string;
  name: string;
  description: string;
  evidence: string;
  articles: string[];
}

export interface SynthesisArtifact {
  themes: SynthesisTheme[];
  trends: string[];
  contradictions: string[];
  createdAt: string;
}

export interface ReviewArtifact {
  title: string;
  introduction: string;
  body: string;
  conclusion: string;
  references: string[];
  wordCount: number;
  createdAt: string;
}

export interface ExportArtifact {
  format: "docx" | "pdf" | "markdown";
  content: string;
  filename: string;
  exportedAt: string;
}

export type Artifact =
  | { type: "tema"; data: TemaArtifact }
  | { type: "pergunta"; data: PerguntaArtifact }
  | { type: "article-list"; data: ArticleListArtifact }
  | { type: "selection"; data: SelectionArtifact }
  | { type: "reading-cards"; data: ReadingCardsArtifact }
  | { type: "comparison-table"; data: ComparisonTableArtifact }
  | { type: "gaps"; data: GapsArtifact }
  | { type: "synthesis"; data: SynthesisArtifact }
  | { type: "review"; data: ReviewArtifact }
  | { type: "export"; data: ExportArtifact };

export type ArtifactMap = Record<number, Artifact>;

interface ArtifactStoreContextType {
  artifacts: ArtifactMap;
  ready: boolean;
  saveArtifact: (step: number, artifact: Artifact) => void;
  getArtifact: (step: number) => Artifact | undefined;
  getTema: () => TemaArtifact | null;
  getPergunta: () => PerguntaArtifact | null;
  getArticleList: () => ArticleListArtifact | null;
  getSelection: () => SelectionArtifact | null;
  getReadingCards: () => ReadingCardsArtifact | null;
  getComparisonTable: () => ComparisonTableArtifact | null;
  getGaps: () => GapsArtifact | null;
  getSynthesis: () => SynthesisArtifact | null;
  getReview: () => ReviewArtifact | null;
  clearAll: () => void;
}

const STORAGE_KEY = "raihub:v2:artifacts";

const ArtifactStoreContext = createContext<ArtifactStoreContextType | undefined>(undefined);

function loadArtifacts(): ArtifactMap {
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as ArtifactMap;
    }
  } catch {}
  return {};
}

export function ArtifactStoreProvider({ children }: { children: ReactNode }) {
  const [artifacts, setArtifacts] = useState<ArtifactMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setArtifacts(loadArtifacts());
    setReady(true);
  }, []);

  const saveArtifact = useCallback((step: number, artifact: Artifact) => {
    setArtifacts((prev) => {
      const next = { ...prev, [step]: artifact };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const getArtifact = useCallback((step: number) => artifacts[step], [artifacts]);

  const getTema = useCallback(() => {
    const a = artifacts[1];
    return a?.type === "tema" ? a.data : null;
  }, [artifacts]);

  const getPergunta = useCallback(() => {
    const a = artifacts[2];
    return a?.type === "pergunta" ? a.data : null;
  }, [artifacts]);

  const getArticleList = useCallback(() => {
    const a = artifacts[3];
    return a?.type === "article-list" ? a.data : null;
  }, [artifacts]);

  const getSelection = useCallback(() => {
    const a = artifacts[4];
    return a?.type === "selection" ? a.data : null;
  }, [artifacts]);

  const getReadingCards = useCallback(() => {
    const a = artifacts[5];
    return a?.type === "reading-cards" ? a.data : null;
  }, [artifacts]);

  const getComparisonTable = useCallback(() => {
    const a = artifacts[6];
    return a?.type === "comparison-table" ? a.data : null;
  }, [artifacts]);

  const getGaps = useCallback(() => {
    const a = artifacts[7];
    return a?.type === "gaps" ? a.data : null;
  }, [artifacts]);

  const getSynthesis = useCallback(() => {
    const a = artifacts[8];
    return a?.type === "synthesis" ? a.data : null;
  }, [artifacts]);

  const getReview = useCallback(() => {
    const a = artifacts[9];
    return a?.type === "review" ? a.data : null;
  }, [artifacts]);

  const clearAll = useCallback(() => {
    setArtifacts({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  return (
    <ArtifactStoreContext.Provider
      value={{
        artifacts,
        ready,
        saveArtifact,
        getArtifact,
        getTema,
        getPergunta,
        getArticleList,
        getSelection,
        getReadingCards,
        getComparisonTable,
        getGaps,
        getSynthesis,
        getReview,
        clearAll,
      }}
    >
      {children}
    </ArtifactStoreContext.Provider>
  );
}

export function useArtifactStore() {
  const ctx = useContext(ArtifactStoreContext);
  if (!ctx) {
    throw new Error("useArtifactStore must be used within ArtifactStoreProvider");
  }
  return ctx;
}
