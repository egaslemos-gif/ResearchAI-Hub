export type ResearchNeedStatus = "available" | "development" | "planned";

export interface ResearchNeed {
  id: string;
  title: string;
  description: string;
  iconName: string;
  status: ResearchNeedStatus;
  competencyId?: string;
  learningPathId?: string;
  recipeId?: string;
  protocolId?: string;
}

export const RESEARCH_NEEDS: ResearchNeed[] = [
  {
    id: "search-literature",
    title: "Encontrar artigos científicos",
    description: "Aprenda a localizar literatura científica relevante utilizando motores de pesquisa académicos.",
    iconName: "search",
    status: "planned",
  },
  {
    id: "literature-review",
    title: "Fazer revisão da literatura",
    description: "Conduza uma revisão da literatura estruturada com apoio de Inteligência Artificial.",
    iconName: "book-open",
    status: "available",
    competencyId: "revisao-da-literatura",
  },
  {
    id: "write-article",
    title: "Escrever um artigo científico",
    description: "Estruture, redija, melhore e prepare artigos científicos para publicação.",
    iconName: "pen-tool",
    status: "development",
  },
  {
    id: "design-project",
    title: "Desenvolver um projeto de investigação",
    description: "Construa um projeto completo desde a definição do problema até ao plano metodológico.",
    iconName: "graduation-cap",
    status: "planned",
  },
  {
    id: "analyze-data",
    title: "Analisar dados",
    description: "Explore técnicas quantitativas e qualitativas para interpretar dados de investigação.",
    iconName: "bar-chart-2",
    status: "planned",
  },
  {
    id: "organize-references",
    title: "Organizar referências",
    description: "Aprenda a gerir referências bibliográficas utilizando ferramentas especializadas.",
    iconName: "library",
    status: "planned",
  },
  {
    id: "learn-ai",
    title: "Aprender Inteligência Artificial para Investigação",
    description: "Domine o uso ético e eficiente da IA aplicada à investigação científica.",
    iconName: "bot",
    status: "planned",
  },
];
