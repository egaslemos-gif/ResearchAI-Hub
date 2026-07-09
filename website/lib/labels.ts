/**
 * Linguagem de interface (termos naturais, PT).
 * ------------------------------------------------------------
 * Isto é CROMO da UI (rótulos, títulos de secção, CTAs) — NÃO é conteúdo de
 * domínio. Todo o conteúdo de domínio vem dos activos (ver lib/content.ts).
 *
 * Regra do produto: o utilizador nunca vê conceitos internos da arquitectura
 * (Runtime, Activity, Knowledge Object, Recipe, Workflow Engine). Aqui traduz-se
 * o vocabulário interno para termos naturais.
 */
export const ui = {
  product: {
    name: "ResearchAI Hub",
    tagline:
      "Investigação científica assistida por IA — de forma estruturada, ética e reproduzível.",
    intro:
      "Aprende um método de investigação com IA. Escolhe o que precisas de fazer e a plataforma guia-te, passo a passo, até um resultado concreto.",
  },

  terms: {
    competency: "Competência",
    competencies: "Competências",
    guide: "Guia Prático",
    step: "Passo",
    steps: "Passos",
    tool: "Ferramenta",
    tools: "Ferramentas",
    prompt: "Prompt",
    prompts: "Prompts",
    checklist: "Checklist",
    resources: "Recursos",
    quality: "Critérios de Qualidade",
    deliverables: "O que vais produzir",
    audience: "Para quem é",
    willLearn: "Competências que vais desenvolver",
    objective: "Objectivo",
    instruction: "O que fazer",
    expectedResult: "Resultado esperado",
    estimatedTime: "Tempo estimado",
  },

  nav: {
    home: "Início",
    competencies: "Competências",
    tools: "Ferramentas",
    prompts: "Prompts",
    resources: "Recursos",
  },

  home: {
    question: "O que pretende fazer hoje?",
    featuredKicker: "Começa por aqui",
    competenciesTitle: "Competências",
    competenciesSubtitle: "Guias práticos que te levam da dúvida ao resultado.",
    toolsTitle: "Ferramentas",
    toolsSubtitle: "As ferramentas que vais usar — com boas práticas e limitações.",
    promptsTitle: "Biblioteca de Prompts",
    promptsSubtitle: "Prompts prontos a adaptar para a tua IA preferida.",
  },

  actions: {
    start: "Começar",
    startWith: (name: string) => `Começar pela ${name}`,
    startGuide: "Começar o Guia Prático",
    continue: "Continuar",
    open: "Abrir",
    openTool: (name: string) => `Abrir ${name}`,
    openExternal: "Abrir site",
    view: "Ver",
    viewAll: "Ver tudo",
    viewCompetencies: "Ver todas as competências",
    copy: "Copiar prompt",
    copied: "Copiado!",
    next: "Concluir e avançar",
    finishToChecklist: "Concluir e ver checklist",
    previous: "Anterior",
    finish: "Concluir",
    backToCompetency: "Voltar à competência",
    backHome: "Voltar ao início",
    seePrompt: "Ver prompt completo",
  },

  step: {
    counter: (n: number, total: number) => `Passo ${n} de ${total}`,
    label: (n: number) => `Passo ${n}`,
    alternatives: "Alternativas",
    withYourTool: "Usa a tua IA preferida — o método é o mesmo.",
  },

  progress: {
    guideMeta: (total: number) => `Guia Prático · ${total} passos`,
    done: (done: number, total: number) => `${done} de ${total} concluídos`,
    remaining: (t: string) => `faltam ${t}`,
    produced: "O que já produziste",
    willProduce: "Ainda vais produzir os resultados de cada passo.",
  },

  checklist: {
    title: "Checklist de Qualidade",
    subtitle:
      "Confirma cada ponto antes de concluir. Sê honesto: se algo não está cumprido, volta ao passo correspondente.",
    progress: (done: number, total: number) => `${done} de ${total} verificados`,
    thresholdNote: (pct: number) => `Recomendado: pelo menos ${pct}% cumpridos para concluir.`,
    ready: "Tudo verificado — podes concluir.",
  },

  conclusion: {
    kicker: "Concluído",
    title: (name: string) => `Concluíste: ${name}`,
    lead: "Produziste um resultado científico concreto, com método e de forma reproduzível.",
    produced: "O que produziste",
    remember: "Lembra-te",
  },

  toolPage: {
    capabilities: "O que faz",
    limitations: "Limitações",
    bestPractices: "Boas práticas",
    useCases: "Quando usar",
    alternatives: "Alternativas",
    pricing: "Custo",
  },

  ethics: {
    title: "Uso ético da IA",
  },

  meta: {
    difficulty: {
      beginner: "Iniciante",
      intermediate: "Intermédio",
      advanced: "Avançado",
    } as Record<string, string>,
    // Categorias de ferramenta (código interno → PT). Ver RFC-000 §15.
    category: {
      discovery: "Descoberta",
      production: "Produção",
      organization: "Organização",
      reading: "Leitura",
      review: "Revisão",
      analysis: "Análise",
      writing: "Escrita",
    } as Record<string, string>,
    // Famílias de protocolo (código interno → PT). Ver RFC-002A / RFC-005.
    family: {
      LIT: "Literatura Científica",
      WRITE: "Escrita Científica",
      DATA: "Análise de Dados",
      DESIGN: "Projeto de Investigação",
      COMM: "Comunicação Científica",
      METHOD: "Metodologia",
      PUB: "Publicação",
    } as Record<string, string>,
    free: "Gratuito",
    byoa: "Usa a tua IA",
    byot: "Traz a tua ferramenta",
    stepsSuffix: "passos",
    toolsSuffix: "ferramentas",
    promptsSuffix: "prompts",
  },
} as const;

export function difficultyLabel(d: string | null | undefined): string | null {
  if (!d) return null;
  return ui.meta.difficulty[d] ?? d;
}

/** Categoria de ferramenta em PT (nunca expõe o código interno em inglês). */
export function categoryLabel(c: string | null | undefined): string | null {
  if (!c) return null;
  return ui.meta.category[c.toLowerCase()] ?? c;
}

/** Nome da família em PT a partir do código interno (fallback: valor recebido). */
export function familyLabel(
  code: string | null | undefined,
  fallback?: string | null
): string | null {
  if (code && ui.meta.family[code]) return ui.meta.family[code];
  return fallback ?? null;
}
