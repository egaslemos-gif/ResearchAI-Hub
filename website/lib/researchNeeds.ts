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
    id: "literature-review",
    title: "Revisão da Literatura",
    description: "Conduza uma revisão da literatura estruturada com apoio de Inteligência Artificial.",
    iconName: "book-open",
    status: "available",
    competencyId: "revisao-da-literatura",
  },
  {
    id: "design-project",
    title: "Projeto de Investigação",
    description: "Auxiliará no desenho do projeto científico completo.",
    iconName: "graduation-cap",
    status: "planned",
  },
  {
    id: "methodology",
    title: "Metodologia Científica",
    description: "Apoiará a definição metodológica do estudo.",
    iconName: "flask-conical",
    status: "planned",
  },
  {
    id: "ethics",
    title: "Ética em Investigação",
    description: "Estruturará procedimentos e conformidade ética.",
    iconName: "shield-check",
    status: "planned",
  },
  {
    id: "analyze-data",
    title: "Análise de Dados",
    description: "Orientará o tratamento quantitativo e qualitativo de evidências.",
    iconName: "bar-chart-2",
    status: "planned",
  },
  {
    id: "write-article",
    title: "Redação Científica",
    description: "Assistirá na estruturação de artigos para publicação.",
    iconName: "pen-tool",
    status: "planned",
  },
  {
    id: "science-comm",
    title: "Comunicação Científica",
    description: "Preparará apresentações e disseminação de resultados.",
    iconName: "message-square",
    status: "planned",
  },
  {
    id: "publication",
    title: "Publicação Científica",
    description: "Apoiará a submissão e resposta a revisores.",
    iconName: "file-check-2",
    status: "planned",
  },
  {
    id: "impact",
    title: "Avaliação de Impacto",
    description: "Ajudará a medir a ressonância do trabalho na academia e sociedade.",
    iconName: "trending-up",
    status: "planned",
  }
];
