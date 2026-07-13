# CURRENT_ARCHITECTURE.md — Fonte Única da Verdade

> **Este documento é a única referência válida para qualquer agente LLM que entre no projecto.**
> Se uma RFC antiga contradizer este ficheiro, **este ficheiro prevalece**.
> Última actualização: Sprint Research Workspace Shell.

---

## 1. Estado do Projecto

| Campo | Valor |
|-------|-------|
| **Projecto** | ResearchAI Hub |
| **Stack** | Next.js 16 (App Router, Turbopack, SSG) · React 19 · TypeScript 5.9 · CSS Modules |
| **Localização** | `e:\PROJECTOS IA\UNILICUNGO\ResearchAI-Hub` |
| **Frontend** | `website/` |
| **Activos (Content-First)** | Raiz do monorepo: `protocols/`, `tools/`, `prompts/` |
| **Deploy** | Vercel |
| **Dev server** | `http://localhost:3000` |

## 2. Sprint Actual

**Sprint: Estabilizar a experiência do Step Page**

Objectivo único: transformar a página actual do Step num Workspace profissional.
Critério de sucesso: **"Um investigador consegue executar o RL-01 inteiro sem se perder."**

### Congelamento Arquitectural

A arquitectura proposta foi considerada suficientemente madura.
A partir deste momento entra em vigor o seguinte congelamento:

**É proibido criar:**
- Novas RFCs
- Novas Engines
- Novos Registries
- Novos Providers
- Novos Contexts
- Novos Layout Managers
- Novos Renderers
- Novos Manifestos
- Novas abstrações

Toda a infraestrutura arquitectural necessária para o MVP considera-se suficiente.

### Sequência de Sprints

```
Sprint 1: Melhorar apenas o layout actual do Step Page
    ↓ (sem alterar arquitectura, sem criar novos componentes, sem mover ficheiros)

Sprint 2: Quando o layout estiver aprovado:
    ↓ extrair ResearchConsole
    ↓ extrair ContextInspector
    ↓ extrair ProtocolExplorer

Sprint 3: Quando os 3 componentes estiverem estáveis:
    ↓ criar WorkspaceShell

Sprint 4: Só então ligar:
    ↓ Composition Engine
    ↓ Plugin Registry
    ↓ WorkspaceTopology
```

### Regra de PR

Cada PR deve alterar no máximo:
- **um** componente
- **uma** responsabilidade
- **um** comportamento

Nunca reescrever a aplicação inteira.

### Critério de Sucesso

O sucesso do Sprint **não** será: "A arquitectura ficou mais elegante."
Será: **"Um investigador consegue executar o RL-01 inteiro sem se perder."**

Se esse critério não for atingido, nenhuma nova abstração será introduzida.

## 3. Blocker Actual

A página do Step (`app/competencias/[slug]/passo/[n]/page.tsx`) usa um fluxo vertical único (`verticalFlow`) que empilha todas as fases (Preparação, Execução, Resultado, Validação) numa só coluna de 980px. Isto não é um Workspace — é um documento longo que o utilizador tem de fazer scroll para encontrar cada secção.

O blocker não é arquitectural. É de UX. O utilizador precisa de:
1. Ver simultaneamente o contexto (instruções, propriedades) e o prompt
2. Saber onde está no protocolo sem fazer scroll
3. Avançar sem se perder

### Estado dos componentes do Workspace

| Componente | Ficheiro | Estado |
|------------|----------|--------|
| `ResearchWorkspace` | `workspace/ResearchWorkspace/ResearchWorkspace.tsx` | Protótipo — wrapper `div` com `data-*` attrs |
| `WorkspaceContext` | `workspace/WorkspaceContext.tsx` | Funcional — mode, capabilities, toast, accordion |
| `WorkspaceCapabilities` | `workspace/ResearchWorkspace/WorkspaceCapabilities.ts` | Funcional — 4 modos definidos |
| `WorkspaceEvents` | `workspace/ResearchWorkspace/WorkspaceEvents.ts` | Funcional — EventBus simples |
| `ResearchSessionContext` | `workspace/ResearchSessionContext.tsx` | Funcional — sessão persistente em localStorage |
| `ResearchDocument` | `workspace/ResearchDocument/ResearchDocument.tsx` | Protótipo — Navigator + article |
| `ResearchNavigator` | `workspace/Navigator/ResearchNavigator.tsx` | Protótipo — lista de secções com scroll spy |
| `NavigationEngine` | `workspace/Navigator/NavigationEngine.ts` | Funcional — registry de secções + anchor tracking |
| `Section` | `workspace/ResearchDocument/Sections/Section.tsx` | Funcional — collapsível + IntersectionObserver |
| `ResearchMarkdown` | `workspace/ResearchDocument/MarkdownEngine/ResearchMarkdown.tsx` | Funcional — react-markdown + remark-gfm + rehype-raw |
| `DynamicPromptRenderer` | `workspace/ResearchDocument/MarkdownEngine/DynamicPromptRenderer.tsx` | Funcional — resolve variáveis + render markdown |
| `PromptCard` | `workspace/PromptCard/PromptCard.tsx` | Funcional — dumb component |
| `PromptCardContainer` | `workspace/PromptCard/PromptCardContainer.tsx` | Funcional — container com estado |
| `DocumentProperties` | `workspace/DocumentProperties.tsx` | Funcional — formulário de variáveis |
| `DocumentViewer` | `workspace/DocumentViewer.tsx` | **Duplicado** — mesma lógica que DynamicPromptRenderer |
| `PromptInteractionFlow` | `workspace/ResearchDocument/MarkdownEngine/PromptInteractionFlow.tsx` | **Deprecado** — monolito, viola RFC-EX-001 |
| `EvidencePlugin` | `workspace/Plugins/EvidencePlugin.tsx` | Protótipo — checklist simples |
| `WorkspacePlugins` | `workspace/Plugins/WorkspacePlugins.tsx` | Protótipo — apenas wrapper div |
| `VisibilityWrappers` | `workspace/VisibilityWrappers.tsx` | Frágil — maxHeight inline |
| `ExecutionLayout` | `components/layouts/Layouts.tsx` | Funcional — header/content/footer |
| `ExecutionGrid` | `components/layouts/Layouts.tsx` | Funcional — left/right grid (não usado no Step Page) |

## 4. RFCs Vigentes

As seguintes RFCs são a **única** referência arquitectural válida:

| RFC | Título | Status | Função |
|-----|--------|--------|--------|
| `RFC-TOPOLOGY-001` | Workspace Topology Architecture | **Vigente** | Define Regions, Docks e hierarquia de composição |
| `RFC-COMPOSITION-001` | Workspace Composition Engine | **Vigente** | Define o contrato de entrada/saída da Composition Engine |
| `RFC-PANEL-001` | Workspace Plugin Registry & Panel Lifecycle | **Vigente** | Define Plugin Registry e ciclo de vida dos Panels |
| `RFC-WORKSPACE-MANIFEST-001` | Workspace Shell Manifest | **Vigente** | Define o manifesto visual do Shell (larguras, colapso) |
| `SPEC-011` | Workspace Contract | **Vigente** | Define filosofia, Regions, componentes permitidos e regras de layout |
| `RFC-EX-001` | Experience Layer Architecture & Freeze Contract | **Vigente** | Define contratos de interacção, acessibilidade, design tokens e freeze |
| `RFC-DM-001` | Domain Model | **Vigente** | Define identidades de domínio e schema de protocolos |
| `RFC-DM-002` | Research Session | **Vigente** | Define sessão e workflow linear |
| `RFC-DM-003` | Prompt Engine Architecture | **Vigente** | Define pipeline de resolução de prompts |
| `RFC-DM-004` | Artifact & Evidence Domain | **Vigente** | Define lifecycle de evidence e artifact |

## 5. RFCs Substituídas / Deprecadas

| RFC | Status | Motivo |
|-----|--------|--------|
| `RFC-000-Product-Vision.md` | Histórico | Documento de visão, não arquitectural |
| `RFC-001-Product-Constitution.md` | Histórico | Constituição do produto, não arquitectural |
| `RFC-002-Knowledge-Architecture.md` | Histórico | Arquitectura de conhecimento, fora do escopo do Sprint |
| `RFC-002A-Research-Protocol-Taxonomy.md` | Histórico | Taxonomia de protocolos, não afecta o Workspace Shell |
| `RFC-003-Protocol-Runtime-Specification.md` | Histórico | Spec de runtime, fora do escopo do Sprint |
| `RFC-004-Domain-Model.md` | **Substituída por RFC-DM-001** | Modelo de domínio antigo |
| `RFC-005-Learning-Experience-Architecture.md` | Histórico | Arquitectura de aprendizagem, fora do escopo |
| `RFC-006-Academy-Architecture.md` | Histórico | Academy, fora do escopo |
| `RFC-007-Content-Architecture.md` | Vazia | Nunca escrita |
| `RFC-008-Frontend-Architecture.md` | Vazia | Nunca escrita |
| `RFC-009-Roadmap.md` | Vazia | Nunca escrita |

## 6. Sprint 1 — Plano Aprovado

**Objectivo:** Transformar a página actual do Step num Workspace profissional.
**Critério de sucesso:** "Um investigador consegue executar o RL-01 inteiro sem se perder."

### Regras do Sprint

- **Nenhum novo componente React** poderá ser criado durante o Sprint 1.
- **Cada PR** deve modificar, no máximo, uma responsabilidade visual. Caso um PR altere layout, comportamento e arquitectura simultaneamente, deverá ser dividido.
- Sem alterar arquitectura, sem mover ficheiros, sem criar abstrações.

### Sequência de PRs

```
PR-0:   Limpeza estrutural (DOM + CSS) — eliminar wrappers vazios, divs decorativas, margens/paddings duplicados
   ↓
PR-1A:  Trocar verticalFlow por ExecutionGrid (sem mover componentes — apenas verificar que o grid funciona)
   ↓
PR-1B:  Reposicionar blocos (Preparation → esquerda, Prompt → direita com prioridade visual absoluta, Resultado + Checklist abaixo do Prompt)
   ↓
PR-2:   Prompt Viewer — remover overflow interno (max-height/overflow-y do .viewer)
   ↓
PR-3:   Research Header — transformar em Issue Header (protocolo, passo, tempo, artefacto, estado)
   ↓
VALIDAÇÃO UX
   ↓
Sprint 2 (extracção de componentes)
```

### Layout Alvo (PR-1B)

```
┌──────────────────────────────────────────────┐
│ HEADER (Issue Header)                        │
│  RL-01 · Revisão da Literatura               │
│  PR-002 · Passo 2 · 25 min                   │
│  Artefacto: Pergunta científica              │
│  Estado: Em execução                         │
├──────────────┬───────────────────────────────┤
│              │                               │
│ Preparation  │        PROMPT                 │
│ ├ Properties │                               │
│ ├ Objectivo  │                               │
│ ├ Instruções │                               │
│              │                               │
│              │                               │
├──────────────┼───────────────────────────────┤
│              │ Resultado                     │
│              │ Checklist                     │
└──────────────┴───────────────────────────────┘
```

O Prompt ocupa praticamente toda a coluna principal.
Resultado e Checklist aparecem abaixo, não concorrem pelo mesmo espaço.

## 7. Regras para Agentes LLM

1. **Não sugerir** melhorias de SEO, OpenGraph, sitemap, robots, README, ESLint, Prettier, testes, mock data, endpoints de debug, EcosystemGrid, acessibilidade ou cleanup de TypeScript. Tudo isto está em `BACKLOG-TECH-DEBT.md` e congelado.
2. **Não criar** novas RFCs, Engines, Registries, Providers, Contexts, Layout Managers, Renderers, Manifestos ou abstrações. A arquitectura está congelada.
3. **Não misturar** regras de RFCs deprecadas com as vigentes. Em caso de dúvida, este ficheiro prevalece.
4. **Foco único**: melhorar a experiência do Step Page actual. O critério de sucesso é "Um investigador consegue executar o RL-01 inteiro sem se perder."
5. **Cada PR**: no máximo um componente, uma responsabilidade, um comportamento.
6. **Antes de implementar**, apresentar o plano e aguardar aprovação.
