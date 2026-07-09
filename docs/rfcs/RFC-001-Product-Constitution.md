# RFC-001 — Product Constitution: Research Protocol OS (RPOS)

> **Versão:** 0.1 (draft)
> **Status:** 🟡 DRAFT — aguarda revisão e aprovação
> **Dependência:** RFC-000 (Product Vision)
> **Última atualização:** Julho de 2026
> **Autor:** Egas Lemos

---

## 1. Contexto e Motivação

A RFC-000 estabelece que o ResearchAI Hub é uma plataforma de **Protocolos de Investigação Científica**. Cada protocolo (RL-01, SR-01, AR-01, etc.) representa uma tarefa científica completa com fluxo, etapas, ferramentas, prompts e critérios de validação.

À medida que o número de protocolos crescer, surgirão desafios previsíveis:

| Desafio                     | Consequência sem arquitectura unificada                        |
|-----------------------------|----------------------------------------------------------------|
| Duplicação de lógica        | Cada protocolo reimplementa workflow, checklists, progresso    |
| Inconsistência de UX        | Utilizador aprende uma interface diferente por protocolo       |
| Dificuldade de escalar      | Adicionar novo protocolo exige repensar a plataforma           |
| Acoplamento com ferramentas | Mudança numa ferramenta afecta múltiplos protocolos            |
| Manutenção difícil          | Actualizar um componente comum requer tocar em todos os protocolos |

**A RFC-001 propõe resolver todos estes problemas com um único conceito arquitectónico: o Research Protocol OS (RPOS).**

---

## 2. Conceito Fundacional — Research Protocol OS (RPOS)

### 2.1 Analogia

```
┌─────────────────────────────────────────────────┐
│                Sistema Operativo                │
│                                                 │
│   App A    App B    App C    App D               │
│    ↓        ↓        ↓        ↓                 │
│  ┌──────────────────────────────────────────┐   │
│  │           Serviços do Sistema            │   │
│  │  (ficheiros, rede, UI, memória, I/O)     │   │
│  └──────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────┐   │
│  │              Kernel                      │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

Traduzindo para o ResearchAI Hub:

```
┌─────────────────────────────────────────────────┐
│            Research Protocol OS (RPOS)           │
│                                                  │
│  RL-01    SR-01    AR-01    PJ-01    DA-01       │
│   ↓        ↓        ↓        ↓        ↓         │
│ ┌──────────────────────────────────────────────┐ │
│ │          Serviços da Plataforma              │ │
│ │  Workflow · Prompts · Tools · Checklists     │ │
│ │  Progress · Examples · Validation · Export   │ │
│ └──────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────┐ │
│ │           Protocol Kernel                    │ │
│ │  (runtime que executa qualquer protocolo)    │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### 2.2 Definição Formal

> **Research Protocol OS (RPOS)** é a arquitectura fundacional do ResearchAI Hub na qual cada Protocolo de Investigação é tratado como uma **aplicação declarativa** executada sobre um **runtime comum** que fornece todos os serviços partilhados da plataforma.

### 2.3 Princípios Arquitectónicos

| #  | Princípio                        | Descrição                                                                 |
|----|----------------------------------|---------------------------------------------------------------------------|
| P1 | **Protocolo como Aplicação**     | Cada protocolo é uma unidade auto-contida com manifesto declarativo       |
| P2 | **Kernel Único**                 | Existe um único runtime que sabe executar qualquer protocolo              |
| P3 | **Serviços Partilhados**         | Workflow, prompts, ferramentas, checklists são serviços do OS             |
| P4 | **Separação de Concerns**        | O protocolo descreve *o quê*; o kernel decide *como*                     |
| P5 | **Extensão por Instalação**      | Novo protocolo = nova "app instalada", sem alterar o kernel              |
| P6 | **Consistência por Construção**  | Todos os protocolos herdam automaticamente a mesma UX                    |
| P7 | **Independência de Fornecedor**  | BYOA + BYOT são abstraídos como serviços, não acoplados ao protocolo     |

---

## 3. Arquitectura em Camadas

### 3.1 Diagrama de Camadas

```
┌─────────────────────────────────────────────────────┐
│                   CAMADA 4                          │
│               Presentation Layer                     │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │  Home  │ │Protocol│ │  Step  │ │ Tools  │       │
│  │  Page  │ │  View  │ │  View  │ │  Page  │       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
├─────────────────────────────────────────────────────┤
│                   CAMADA 3                          │
│            Protocol Apps (Declarative)               │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ RL-01  │ │ SR-01  │ │ AR-01  │ │ PJ-01  │       │
│  │manifest│ │manifest│ │manifest│ │manifest│       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
├─────────────────────────────────────────────────────┤
│                   CAMADA 2                          │
│            Platform Services (Shared)                │
│  ┌──────────────────────────────────────────────┐   │
│  │ WorkflowEngine  │ PromptEngine │ ToolRegistry│   │
│  │ ChecklistEngine │ ProgressMgr  │ ExampleStore│   │
│  │ ValidationEngine│ ExportEngine │ SearchIndex │   │
│  └──────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│                   CAMADA 1                          │
│              Protocol Kernel (Runtime)               │
│  ┌──────────────────────────────────────────────┐   │
│  │ ManifestParser  │ StepExecutor │ StateManager│   │
│  │ ServiceLocator  │ EventBus     │ Config      │   │
│  └──────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│                   CAMADA 0                          │
│              Data & Persistence Layer                │
│  ┌──────────────────────────────────────────────┐   │
│  │ LocalStorage/DB │ Content (MD/JSON) │ Assets │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 3.2 Descrição de cada Camada

#### Camada 0 — Data & Persistence

Armazena todo o conteúdo estático (protocolos, prompts, exemplos) e dados dinâmicos (progresso do utilizador, preferências).

| Componente      | Responsabilidade                                                |
|-----------------|-----------------------------------------------------------------|
| Content Store   | Ficheiros Markdown/JSON que definem protocolos, prompts, exemplos |
| Persistence     | LocalStorage (MVP) → Supabase (v4)                              |
| Assets          | Imagens, ícones, diagramas de fluxo                             |

#### Camada 1 — Protocol Kernel

O runtime que sabe ler um manifesto de protocolo e executá-lo.

| Componente       | Responsabilidade                                               |
|------------------|----------------------------------------------------------------|
| ManifestParser   | Lê e valida o manifesto JSON/YAML do protocolo                 |
| StepExecutor     | Orquestra a navegação entre etapas do workflow                  |
| StateManager     | Gere o estado actual do utilizador dentro de um protocolo       |
| ServiceLocator   | Resolve referências a serviços da Camada 2                     |
| EventBus         | Comunicação desacoplada entre componentes                      |
| Config           | Configurações globais da plataforma                            |

#### Camada 2 — Platform Services

Serviços partilhados que qualquer protocolo pode consumir.

| Serviço            | Responsabilidade                                             |
|--------------------|--------------------------------------------------------------|
| WorkflowEngine     | Executa fluxos de etapas com dependências e branching         |
| PromptEngine       | Renderiza e adapta prompts com variáveis contextuais          |
| ToolRegistry       | Catálogo de ferramentas com metadata (BYOA + BYOT)            |
| ChecklistEngine    | Gere checklists dinâmicas com estado de conclusão             |
| ProgressManager    | Calcula e persiste progresso por protocolo                    |
| ExampleStore       | Biblioteca de exemplos indexada por protocolo e etapa         |
| ValidationEngine   | Avalia critérios de qualidade de cada etapa                   |
| ExportEngine       | Exporta resultados em múltiplos formatos                     |
| SearchIndex        | Pesquisa full-text sobre protocolos, prompts e ferramentas    |

#### Camada 3 — Protocol Apps

Cada protocolo é definido de forma **declarativa** num ficheiro manifesto.

O manifesto descreve:
- Metadata (código, nome, versão, categoria)
- Fluxo de etapas (steps)
- Ferramentas recomendadas por etapa
- Prompts associados
- Critérios de validação
- Checklist
- Dependências entre protocolos

> **O protocolo NÃO contém lógica de execução.** A lógica está no Kernel.

#### Camada 4 — Presentation Layer

Interface do utilizador que consome dados do Kernel e dos Services.

| Componente    | Responsabilidade                                                  |
|---------------|-------------------------------------------------------------------|
| Home Page     | Dashboard com protocolos disponíveis e progresso                  |
| Protocol View | Visão geral de um protocolo: objectivo, fluxo, competências      |
| Step View     | Interface de uma etapa: prompt, ferramenta, validação, resultado  |
| Tools Page    | Catálogo de ferramentas categorizadas                             |

---

## 4. Protocol Manifest — Especificação

### 4.1 Estrutura do Manifesto

Cada protocolo é descrito num ficheiro `protocol.json` (ou `protocol.yaml`):

```json
{
  "id": "RL-01",
  "version": "1.0",
  "name": "Revisão da Literatura",
  "description": "Protocolo para conduzir uma revisão da literatura científica de forma estruturada e assistida por IA.",
  "category": "literature",
  "icon": "book-open",
  "difficulty": "intermediate",
  "estimatedTime": "4-8 horas",
  "competencies": [
    "Definir problema de investigação",
    "Construir estratégia de busca",
    "Avaliar fontes científicas",
    "Sintetizar evidências",
    "Produzir revisão escrita"
  ],
  "prerequisites": [],
  "nextProtocols": ["SR-01", "AR-01"],
  "deliverables": [
    "Tabela comparativa de estudos",
    "Revisão preliminar redigida",
    "Checklist de qualidade"
  ],
  "steps": [
    {
      "id": "RL-01-S01",
      "name": "Definir Problema de Investigação",
      "order": 1,
      "objective": "Formular a pergunta de investigação e os objectivos.",
      "tools": ["chatgpt", "claude", "gemini"],
      "toolCategory": "production",
      "prompts": ["RL-01-P01", "RL-01-P02"],
      "expectedOutput": "Pergunta de investigação formulada + objectivos definidos",
      "validationCriteria": [
        "A pergunta é específica e delimitada",
        "Os objectivos são mensuráveis",
        "O tema é exequível"
      ],
      "examples": ["RL-01-E01"],
      "nextStep": "RL-01-S02"
    },
    {
      "id": "RL-01-S02",
      "name": "Construir Estratégia de Busca",
      "order": 2,
      "objective": "Definir termos, operadores booleanos e bases de dados.",
      "tools": ["google-scholar", "scopus", "consensus"],
      "toolCategory": "discovery",
      "prompts": ["RL-01-P03"],
      "expectedOutput": "Estratégia de busca documentada",
      "validationCriteria": [
        "Termos definidos em PT e EN",
        "Operadores booleanos aplicados",
        "Pelo menos 2 bases de dados selecionadas"
      ],
      "examples": ["RL-01-E02"],
      "nextStep": "RL-01-S03"
    }
  ],
  "checklist": [
    "Pergunta de investigação formulada",
    "Estratégia de busca documentada",
    "Fontes avaliadas quanto à qualidade",
    "Tabela comparativa preenchida",
    "Revisão redigida e revista"
  ],
  "qualityCriteria": [
    "Coerência entre pergunta e fontes selecionadas",
    "Diversidade de bases de dados consultadas",
    "Rigor na avaliação das fontes",
    "Clareza e objectividade na síntese"
  ]
}
```

### 4.2 Convenções de Identificação

| Entidade  | Formato          | Exemplo        |
|-----------|------------------|----------------|
| Protocolo | `XX-NN`          | `RL-01`        |
| Etapa     | `XX-NN-SNN`      | `RL-01-S01`    |
| Prompt    | `XX-NN-PNN`      | `RL-01-P01`    |
| Exemplo   | `XX-NN-ENN`      | `RL-01-E01`    |
| Checklist | `XX-NN-CNN`      | `RL-01-C01`    |

### 4.3 Categorias de Protocolo

| Código | Categoria                    |
|--------|------------------------------|
| RL     | Revisão da Literatura        |
| SR     | Revisão Sistemática          |
| PJ     | Projeto de Investigação      |
| AR     | Artigo Científico            |
| DA     | Análise de Dados             |
| MC     | Mapeamento Conceitual        |
| MT     | Metodologia *(futuro)*       |
| ET     | Ética *(futuro)*             |
| AP     | Apresentação *(futuro)*      |

---

## 5. Serviços Partilhados — Especificação

### 5.1 ToolRegistry

O ToolRegistry é o serviço que implementa os princípios **BYOA** e **BYOT**.

```json
{
  "id": "chatgpt",
  "name": "ChatGPT",
  "provider": "OpenAI",
  "category": "production",
  "type": "ai",
  "url": "https://chat.openai.com",
  "description": "Assistente de IA conversacional para produção de texto.",
  "capabilities": ["text-generation", "analysis", "summarization"],
  "alternatives": ["claude", "gemini"],
  "icon": "chatgpt-icon"
}
```

Categorias de ferramentas:

| Categoria     | Propósito                          | Exemplos                                   |
|---------------|------------------------------------|--------------------------------------------|
| `discovery`   | Descoberta e pesquisa científica   | Consensus, Google Scholar, Scopus          |
| `organization`| Gestão bibliográfica               | Zotero, Mendeley                           |
| `reading`     | Leitura e análise de documentos    | NotebookLM, SciSpace, ChatPDF             |
| `production`  | Produção e escrita                 | ChatGPT, Claude, Gemini                    |
| `review`      | Revisão linguística e tradução     | LanguageTool, Grammarly, DeepL Write       |
| `analysis`    | Análise de dados                   | Python, R, SPSS, Excel                     |
| `visualization`| Visualização                      | Canva, Mermaid, Draw.io                    |

### 5.2 PromptEngine

O PromptEngine renderiza prompts com **variáveis contextuais**, permitindo que o mesmo prompt se adapte ao contexto do utilizador.

```markdown
# RL-01-P01: Formulação do Problema

Actua como orientador de investigação científica.

O meu tema de investigação é: {{research_topic}}
A minha área de estudo é: {{study_area}}
O meu nível académico é: {{academic_level}}

Ajuda-me a:
1. Formular uma pergunta de investigação clara e delimitada
2. Definir 3 objectivos específicos
3. Identificar palavras-chave relevantes

Formato da resposta:
- Pergunta de investigação (máximo 2 frases)
- Objectivos numerados
- 5-8 palavras-chave em PT e EN
```

### 5.3 WorkflowEngine

Responsável por:
- Renderizar o fluxo de etapas (linear ou com branching)
- Gerir transições entre etapas
- Verificar pré-condições de cada etapa
- Registar conclusão de etapas

### 5.4 ChecklistEngine

Cada protocolo termina com uma checklist. O ChecklistEngine:
- Renderiza a checklist a partir do manifesto
- Permite marcar itens como concluídos
- Calcula percentagem de conclusão
- Emite feedback quando a checklist está completa

### 5.5 ProgressManager

Calcula o progresso global do utilizador:

```
Progresso do Protocolo = (etapas concluídas / total de etapas) × 100
Progresso Global = média ponderada de todos os protocolos
```

---

## 6. Fluxo de Execução de um Protocolo

```
Utilizador seleciona protocolo
        │
        ▼
ManifestParser carrega protocol.json
        │
        ▼
StepExecutor identifica etapa actual
        │
        ▼
┌───────────────────────────────────┐
│        Etapa N                    │
│                                   │
│  1. Objectivo apresentado         │
│  2. Ferramenta recomendada        │
│  3. Prompt renderizado            │
│  4. Utilizador executa tarefa     │
│  5. Validação dos critérios       │
│  6. Resultado registado           │
│  7. Próxima etapa                 │
│                                   │
└───────────────────────────────────┘
        │
        ▼
Checklist final
        │
        ▼
Protocolo concluído → Próximo protocolo sugerido
```

---

## 7. Vantagens do RPOS

| Vantagem                            | Descrição                                                           |
|-------------------------------------|---------------------------------------------------------------------|
| **Escalabilidade**                  | Novo protocolo = novo manifesto. Sem alteração do kernel.            |
| **Consistência de UX**             | Todos os protocolos usam os mesmos componentes de UI.                |
| **Manutenção simplificada**        | Actualizar um serviço (ex: PromptEngine) beneficia todos os protocolos. |
| **Independência de conteúdo**      | Conteúdo científico separado da lógica de execução.                  |
| **Onboarding rápido**              | Aprender a usar um protocolo = saber usar todos.                     |
| **Testabilidade**                  | Cada camada pode ser testada independentemente.                      |
| **Contribuição externa** *(futuro)*| Investigadores podem propor novos protocolos via manifesto.           |

---

## 8. Implicações para o MVP

Para o MVP (conforme RFC-000 §20), o RPOS materializa-se assim:

| Componente                | Implementação MVP                                              |
|---------------------------|----------------------------------------------------------------|
| Protocol Kernel           | JavaScript simples que lê JSON e renderiza steps               |
| ManifestParser            | `fetch()` de ficheiro `protocol.json` estático                 |
| WorkflowEngine            | Navegação linear entre steps (sem branching)                   |
| PromptEngine              | Template literals com `{{variáveis}}`                          |
| ToolRegistry              | Array estático de ferramentas em `tools.json`                  |
| ChecklistEngine           | Checkboxes com estado em LocalStorage                          |
| ProgressManager           | Contador simples em LocalStorage                               |
| Presentation Layer        | HTML/CSS/JS vanilla com design premium                         |
| Content Store             | Ficheiros `.json` e `.md` estáticos                            |

> **Regra de ouro do MVP:** Implementar a arquitectura RPOS de forma simples mas correcta, para que a evolução futura seja extensão e não reescrita.

---

## 9. Estrutura de Ficheiros Proposta

```
ResearchAI-Hub/
├── docs/
│   └── rfcs/
│       ├── RFC-000-Product-Vision.md
│       └── RFC-001-Product-Constitution.md
├── src/
│   ├── index.html
│   ├── css/
│   │   ├── design-tokens.css
│   │   ├── components.css
│   │   └── pages.css
│   ├── js/
│   │   ├── kernel/
│   │   │   ├── manifest-parser.js
│   │   │   ├── step-executor.js
│   │   │   ├── state-manager.js
│   │   │   └── event-bus.js
│   │   ├── services/
│   │   │   ├── workflow-engine.js
│   │   │   ├── prompt-engine.js
│   │   │   ├── tool-registry.js
│   │   │   ├── checklist-engine.js
│   │   │   ├── progress-manager.js
│   │   │   └── search-index.js
│   │   ├── ui/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   └── router.js
│   │   └── app.js
│   └── assets/
│       ├── icons/
│       └── images/
├── content/
│   ├── protocols/
│   │   ├── RL-01/
│   │   │   ├── protocol.json
│   │   │   ├── prompts/
│   │   │   │   ├── RL-01-P01.md
│   │   │   │   └── RL-01-P02.md
│   │   │   └── examples/
│   │   │       ├── RL-01-E01.md
│   │   │       └── RL-01-E02.md
│   │   └── SR-01/  (v2)
│   ├── tools/
│   │   └── tools.json
│   └── training/
│       └── ai-fundamentals/
├── .agents/
│   └── AGENTS.md
└── README.md
```

---

## 10. Relação com RFCs Futuras

| RFC     | Tema                              | Dependência com RPOS                              |
|---------|-----------------------------------|----------------------------------------------------|
| RFC-002 | Design System                     | Define tokens e componentes da Camada 4             |
| RFC-003 | Protocol Manifest Spec            | Detalha o schema completo do manifesto              |
| RFC-004 | RL-01 Protocol Content            | Primeiro protocolo a ser implementado               |
| RFC-005 | Tool Registry Spec                | Detalha o catálogo BYOA/BYOT                        |
| RFC-006 | Prompt Engine Spec                | Sistema de templates e variáveis                    |
| RFC-007 | Training Module                   | Módulo de formação (Camada 3, tipo especial)        |
| RFC-008 | MVP Implementation                | Plano de implementação técnica do MVP               |

---

## 11. Decisões Arquitectónicas Registadas (ADR)

### ADR-001: Protocolos são declarativos, não imperativos

**Contexto:** Os protocolos poderiam conter lógica de execução (JavaScript) ou ser puramente declarativos (JSON/YAML).

**Decisão:** Protocolos são **puramente declarativos**. Toda a lógica reside no Kernel.

**Razão:** Permite que especialistas em investigação (não-programadores) criem protocolos. Reduz complexidade. Garante consistência.

### ADR-002: MVP usa vanilla HTML/CSS/JS

**Contexto:** Frameworks como React/Vue/Next.js poderiam ser usados.

**Decisão:** MVP usa **HTML/CSS/JavaScript vanilla**.

**Razão:** Simplicidade. Sem dependências. Deploy instantâneo. Equipa pequena. Migração futura facilitada pela separação de camadas.

### ADR-003: Conteúdo separado do código

**Contexto:** O conteúdo dos protocolos poderia estar embutido no código.

**Decisão:** Conteúdo vive em `content/` como ficheiros JSON e Markdown. Código vive em `src/`.

**Razão:** Permite editar conteúdo sem tocar no código. Facilita contribuições externas. Permite CMS futuro.

---

## 12. Questões em Aberto

> [!IMPORTANT]
> As seguintes questões devem ser respondidas antes de prosseguir para a implementação:

1. **Formato do manifesto:** JSON ou YAML? JSON é mais simples de parsear no browser. YAML é mais legível para autores de protocolos. **Recomendação:** JSON para o MVP, com possibilidade de YAML via build step no futuro.

2. **Granularidade dos prompts:** Os prompts devem viver dentro do `protocol.json` ou em ficheiros `.md` separados referenciados por ID? **Recomendação:** Ficheiros separados — permite prompts longos e formatados.

3. **Nível de interactividade no MVP:** O utilizador apenas lê e avança? Ou pode introduzir dados (ex: tema de investigação) que alimentam os prompts? **Recomendação:** Permitir pelo menos input do tema de investigação para demonstrar o PromptEngine.

4. **Idioma da interface:** Apenas português? Ou preparar i18n desde o início? **Recomendação:** Português no MVP, mas com strings externalizadas para facilitar i18n futuro.

5. **Hosting do MVP:** GitHub Pages? Vercel? Netlify? **Recomendação:** Vercel ou Netlify pela simplicidade de deploy de static sites.

---

## 13. Critérios de Aprovação

Esta RFC considera-se aprovada quando:

- [ ] O conceito RPOS é aceite como arquitectura fundacional
- [ ] A estrutura de camadas é validada
- [ ] O formato do Protocol Manifest é aceite
- [ ] A estrutura de ficheiros é aprovada
- [ ] As questões em aberto são respondidas
- [ ] O mapa de RFCs futuras é validado

---

> *"Se o ResearchAI Hub é uma plataforma de protocolos, então o RPOS é o sistema que torna qualquer protocolo executável."*
