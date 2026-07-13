# BACKLOG-TECH-DEBT — ResearchAI Hub

> **Estado**: CONGELADO — nenhum item será implementado no Sprint actual.
> Sprint actual: **Research Workspace Shell**.
> Este ficheiro existe apenas para que a dívida técnica não se perca e não distraia agentes LLM do bloqueador real.

---

## 1. Mock Data (violação Content-First)

| ID | Ficheiro | Problema |
|----|----------|----------|
| TD-MOCK-01 | `components/home/ArtifactsPanel.tsx:6-10` | `MOCK_ARTIFACTS` — 3 artefactos fictícios hardcoded |
| TD-MOCK-02 | `components/home/RecentActivityPanel.tsx:6-10` | `MOCK_ACTIVITY` — actividade fictícia hardcoded |
| TD-MOCK-03 | `components/experience/ResearchSessionHeader.tsx:42-67` | Valores hardcoded ("10%", "2h", "18h", "Tema definido", "Formular pergunta") |
| TD-MOCK-04 | `components/home/EcosystemGrid.tsx:23` | `"4 competências"` e `"~12 horas"` hardcoded em todos os cards |
| TD-MOCK-05 | `lib/researchNeeds.ts` | `RESEARCH_NEEDS` hardcoded em vez de consumir `getCompetencies()` |

## 2. Endpoints de Debug

| ID | Ficheiro | Problema |
|----|----------|----------|
| TD-DBG-01 | `app/api/debug/route.ts` | Endpoint de debug exposto em produção |
| TD-DBG-02 | `app/api/debug2/route.ts` | Endpoint de debug exposto em produção |
| TD-DBG-03 | `app/api/debug3/route.ts` | Endpoint de debug exposto em produção |

## 3. Estado Duplicado

| ID | Ficheiro | Problema |
|----|----------|----------|
| TD-STATE-01 | `lib/researchContext.ts` vs `ResearchSessionContext.tsx` | Dois sistemas de contexto em localStorage (`raihub:v1:research_context` vs `raihub:v2:research_session`). `researchContext.ts` parece legacy e deveria ser removido ou consolidado. |

## 4. Lógica Frágil

| ID | Ficheiro | Problema |
|----|----------|----------|
| TD-FRAGILE-01 | `components/experience/ContextBar.tsx:22` | `pathname.includes("/RL-01")` — mas URLs públicos usam slugs (`/revisao-da-literatura`), não IDs técnicos. A condição nunca match. |
| TD-FRAGILE-02 | `components/experience/ContextBar.tsx:34-38` | Hardcoded `PR-001`, `PR-002` para passos específicos de RL-01. |

## 5. Acessibilidade

| ID | Ficheiro | Problema |
|----|----------|----------|
| TD-A11Y-01 | `components/shell/Shell.tsx:14-19` | Array `NAV` definido mas não usado — navegação é duplicada com lista hardcoded |
| TD-A11Y-02 | `components/experience/ResearchSessionHeader.tsx:76-98` | Dropdown não fecha ao clicar fora (falta `useEffect` com listener de `click` no `document`) |
| TD-A11Y-03 | Vários componentes | Faltam `aria-current` em links de navegação activos |

## 6. SEO e Performance

| ID | Ficheiro | Problema |
|----|----------|----------|
| TD-SEO-01 | `app/ferramentas/[slug]/page.tsx` | Sem `generateMetadata` com Open Graph |
| TD-SEO-02 | `app/prompts/[slug]/page.tsx` | Sem `generateMetadata` com Open Graph |
| TD-SEO-03 | Raiz do projecto | Sem `sitemap.ts` |
| TD-SEO-04 | Raiz do projecto | Sem `robots.ts` |
| TD-PERF-01 | `app/layout.tsx:22-26` | Google Fonts via CDN em vez de `next/font` (causa FOUT e bloqueia render) |

## 7. TypeScript

| ID | Ficheiro | Problema |
|----|----------|----------|
| TD-TS-01 | `ResearchSessionContext.tsx:40` | `schema: any` |
| TD-TS-02 | `PromptCardContainer.tsx:14` | `criticalRules?: any[]` |
| TD-TS-03 | `content.ts:185` | `type Raw = Record<string, any>` |
| TD-TS-04 | `context-schema.json` import | Importado como `any` em múltiplos sítios |

## 8. DX (Developer Experience)

| ID | Problema |
|----|----------|
| TD-DX-01 | Sem testes (playwright-core em devDeps mas sem testes visíveis) |
| TD-DX-02 | Sem ESLint configurado |
| TD-DX-03 | Sem Prettier configurado |
| TD-DX-04 | `README.md` da raiz tem apenas 1 linha |

## 9. Componentes Deprecados

| ID | Ficheiro | Problema |
|----|----------|----------|
| TD-DEP-01 | `ResearchDocument/MarkdownEngine/PromptInteractionFlow.tsx` | Marcado `@deprecated` na linha 26 mas ainda presente no código |
| TD-DEP-02 | `workspace/DocumentViewer.tsx` | Duplica lógica de `DynamicPromptRenderer` + `ResearchMarkdown` (resolução de variáveis + render markdown) |
| TD-DEP-03 | `workspace/VisibilityWrappers.tsx` | `RequireContextConfirmed` usa `maxHeight: 2000px` inline — solução frágil |

---

## Regra de Ouro

> Nenhum item deste backlog deve ser abordado enquanto o **Research Workspace Shell** não estiver concluído.
> O Sprint actual tem um único objectivo: estabilizar o Workspace Shell.
