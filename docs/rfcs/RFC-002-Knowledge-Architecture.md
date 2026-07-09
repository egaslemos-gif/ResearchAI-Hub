# RFC-002 — Knowledge Architecture

> **Versão:** 1.0
> **Status:** 🟡 DRAFT — aguarda revisão e aprovação
> **Dependência:** RFC-000 (Product Vision) · RFC-001 (Product Constitution)
> **Última atualização:** Julho de 2026
> **Autor:** Egas Lemos

---

## 1. Contexto e Motivação

A RFC-001 estabelece o conceito de **Research Protocol OS (RPOS)** — uma arquitectura em camadas onde protocolos são aplicações declarativas executadas sobre um kernel comum.

Contudo, o ResearchAI Hub **não é apenas uma aplicação**. É uma **plataforma de conhecimento**.

Protocolos, workflows, prompts, ferramentas, exemplos e exercícios não são simplesmente "ficheiros no disco". São **unidades de conhecimento** que possuem identidade, relações, estado e semântica própria.

Se o Runtime tratar estes elementos como ficheiros, ficará acoplado à estrutura física de pastas. Qualquer reorganização de directórios quebrará o sistema.

Se, pelo contrário, o Runtime tratar estes elementos como **Objectos de Conhecimento** (Knowledge Objects), passará a depender apenas de metadados — e a estrutura física torna-se um mero detalhe de armazenamento.

> **Princípio Fundacional:**
> O Runtime nunca deverá depender da estrutura física das pastas. Deverá depender apenas dos metadados dos Knowledge Objects.

---

## 2. Definição

### 2.1 Knowledge Object (KO)

> Um **Knowledge Object** é a unidade atómica de conteúdo do ResearchAI Hub. Todo elemento que exista na plataforma — desde um protocolo completo até um único prompt — é representado como um Knowledge Object com identidade, tipo, metadados e relações explícitas.

### 2.2 Knowledge Graph

> O **Knowledge Graph** é o grafo dirigido formado por todos os Knowledge Objects e as suas relações. É a representação completa do conhecimento da plataforma.

### 2.3 Knowledge Registry

> O **Knowledge Registry** é o índice centralizado que permite ao Runtime localizar, resolver e carregar qualquer Knowledge Object a partir do seu identificador, independentemente da sua localização física.

---

## 3. Tipos de Knowledge Object

O ResearchAI Hub define **12 tipos** de Knowledge Object na versão 1.0:

| #  | Tipo            | Código | Descrição                                                                |
|----|-----------------|--------|--------------------------------------------------------------------------|
| 1  | **Protocol**    | `PRT`  | Tarefa científica completa com fluxo estruturado                         |
| 2  | **Workflow**    | `WFL`  | Sequência ordenada de etapas dentro de um protocolo                      |
| 3  | **Step**        | `STP`  | Etapa individual de um workflow com objectivo e validação                 |
| 4  | **Decision Node** | `DCN` | Ponto de decisão que ramifica o fluxo com base em critérios             |
| 5  | **Tool**        | `TOL`  | Ferramenta externa (IA ou não) utilizada numa etapa                      |
| 6  | **Prompt**      | `PRM`  | Template de prompt com variáveis contextuais                             |
| 7  | **Example**     | `EXM`  | Exemplo concreto de aplicação de uma etapa ou técnica                    |
| 8  | **Exercise**    | `EXR`  | Actividade prática que o utilizador deve realizar                        |
| 9  | **Checklist**   | `CKL`  | Lista de verificação com critérios de conclusão                          |
| 10 | **Resource**    | `RSC`  | Material de apoio (artigo, vídeo, template, dataset)                     |
| 11 | **Course**      | `CRS`  | Agrupamento pedagógico de módulos                                        |
| 12 | **Module**      | `MOD`  | Unidade temática dentro de um curso                                      |

---

## 4. Anatomia de um Knowledge Object

Todo Knowledge Object deverá possuir obrigatoriamente os seguintes **10 campos**:

### 4.1 Schema Base

```json
{
  "id": "",
  "name": "",
  "type": "",
  "description": "",
  "objective": "",
  "relations": [],
  "dependencies": [],
  "metadata": {},
  "state": "",
  "version": ""
}
```

### 4.2 Especificação de Campos

| Campo            | Tipo       | Obrigatório | Descrição                                                          |
|------------------|------------|-------------|--------------------------------------------------------------------|
| `id`             | `string`   | ✔           | Identificador único global do objecto                              |
| `name`           | `string`   | ✔           | Nome legível para humanos                                          |
| `type`           | `enum`     | ✔           | Tipo do KO (um dos 12 tipos definidos)                             |
| `description`    | `string`   | ✔           | Descrição concisa do propósito do objecto                          |
| `objective`      | `string`   | ✔           | O que o objecto pretende alcançar ou ensinar                       |
| `relations`      | `array`    | ✔           | Lista de relações com outros KOs                                   |
| `dependencies`   | `array`    | ✔           | KOs que devem existir/estar concluídos antes deste                 |
| `metadata`       | `object`   | ✔           | Metadados específicos do tipo (extensível)                         |
| `state`          | `enum`     | ✔           | Estado actual do ciclo de vida                                     |
| `version`        | `string`   | ✔           | Versão semântica do objecto                                        |

---

## 5. Sistema de Identificação

### 5.1 Formato do ID

Cada Knowledge Object possui um identificador único com o formato:

```
{TYPE_CODE}-{SEQUENCE}
```

| Componente     | Descrição                              | Exemplo        |
|----------------|----------------------------------------|----------------|
| `TYPE_CODE`    | Código do tipo (ver §3)                | `PRT`, `STP`   |
| `SEQUENCE`     | Número sequencial com padding          | `001`, `042`   |

### 5.2 IDs Compostos

Para objectos que pertencem hierarquicamente a outro, utiliza-se notação composta:

```
{PARENT_ID}.{TYPE_CODE}-{SEQUENCE}
```

**Exemplos:**

| ID                          | Descrição                                                    |
|-----------------------------|--------------------------------------------------------------|
| `PRT-001`                   | Protocolo RL-01 (Revisão da Literatura)                      |
| `PRT-001.WFL-001`           | Workflow principal do protocolo RL-01                        |
| `PRT-001.WFL-001.STP-001`   | Primeira etapa do workflow do RL-01                          |
| `PRT-001.WFL-001.STP-001.PRM-001` | Primeiro prompt da primeira etapa do RL-01             |
| `PRT-001.CKL-001`           | Checklist do protocolo RL-01                                 |
| `TOL-001`                   | Ferramenta ChatGPT (global, sem parent)                      |
| `CRS-001`                   | Curso de Fundamentos de IA                                   |
| `CRS-001.MOD-001`           | Primeiro módulo do curso                                     |

### 5.3 Mapeamento para Códigos Legíveis

Os identificadores internos mapeiam para os códigos legíveis definidos na RFC-000:

| ID Interno | Código Legível | Nome                        |
|------------|----------------|-----------------------------|
| `PRT-001`  | `RL-01`        | Revisão da Literatura       |
| `PRT-002`  | `SR-01`        | Revisão Sistemática         |
| `PRT-003`  | `PJ-01`        | Projeto de Investigação     |
| `PRT-004`  | `AR-01`        | Artigo Científico           |
| `PRT-005`  | `MC-01`        | Mapeamento Conceitual       |
| `PRT-006`  | `DA-01`        | Análise de Dados            |

O campo `metadata.alias` armazena o código legível:

```json
{
  "id": "PRT-001",
  "metadata": {
    "alias": "RL-01"
  }
}
```

---

## 6. Ciclo de Vida (State)

Cada Knowledge Object segue um ciclo de vida predefinido:

```
                ┌─────────┐
                │  DRAFT  │
                └────┬────┘
                     │
                     ▼
                ┌─────────┐
          ┌─────│ REVIEW  │─────┐
          │     └─────────┘     │
          ▼                     ▼
    ┌───────────┐         ┌──────────┐
    │ PUBLISHED │         │ REJECTED │
    └─────┬─────┘         └──────────┘
          │
          ▼
    ┌──────────┐
    │ ARCHIVED │
    └──────────┘
```

| Estado        | Descrição                                                          |
|---------------|--------------------------------------------------------------------|
| `DRAFT`       | Em construção, não visível para utilizadores                       |
| `REVIEW`      | Pronto para revisão, aguarda aprovação                             |
| `PUBLISHED`   | Activo e visível na plataforma                                     |
| `REJECTED`    | Não aprovado, requer revisão (pode voltar a DRAFT)                 |
| `ARCHIVED`    | Descontinuado, preservado para referência histórica                |

---

## 7. Sistema de Relações

### 7.1 Tipos de Relação

As relações entre Knowledge Objects são **tipadas e direccionais**:

| Relação        | Descrição                                           | Inversa           |
|----------------|-----------------------------------------------------|--------------------|
| `contains`     | O KO contém outro KO como parte da sua estrutura    | `belongs_to`       |
| `uses`         | O KO utiliza outro KO durante a sua execução        | `used_by`          |
| `requires`     | O KO depende de outro KO como pré-requisito         | `required_by`      |
| `produces`     | O KO gera outro KO como resultado                   | `produced_by`      |
| `suggests`     | O KO recomenda outro KO como próximo passo          | `suggested_by`     |
| `replaces`     | O KO substitui uma versão anterior de outro KO      | `replaced_by`      |
| `references`   | O KO faz referência a outro KO sem dependência      | `referenced_by`    |
| `validates`    | O KO valida o resultado de outro KO                 | `validated_by`     |

### 7.2 Formato de uma Relação

```json
{
  "type": "contains",
  "target": "PRT-001.WFL-001",
  "label": "Workflow principal",
  "required": true
}
```

| Campo      | Tipo      | Descrição                                              |
|------------|-----------|--------------------------------------------------------|
| `type`     | `enum`    | Tipo da relação (ver tabela §7.1)                      |
| `target`   | `string`  | ID do Knowledge Object alvo                            |
| `label`    | `string`  | Descrição legível da relação                           |
| `required` | `boolean` | Se a relação é obrigatória para a integridade do KO    |

### 7.3 Grafo de Relações — Cadeia Principal

```
┌──────────┐     contains     ┌──────────┐     contains     ┌──────────┐
│ Protocol │ ───────────────► │ Workflow │ ───────────────► │   Step   │
│ (PRT)    │                  │ (WFL)    │                  │  (STP)   │
└──────────┘                  └──────────┘                  └────┬─────┘
                                                                 │
                              ┌───────────────┬──────────────────┤
                              │               │                  │
                         uses ▼          uses ▼             uses ▼
                        ┌──────┐       ┌────────┐        ┌──────────┐
                        │ Tool │       │ Prompt │        │ Example  │
                        │(TOL) │       │ (PRM)  │        │  (EXM)   │
                        └──────┘       └───┬────┘        └──────────┘
                                           │
                                  produces ▼
                                    ┌──────────┐
                                    │ Resultado│
                                    └──────────┘
```

### 7.4 Grafo Completo de Relações

```
┌─────────┐   contains   ┌──────────┐   contains    ┌──────────┐
│ Course  │ ────────────► │  Module  │ ─────────────►│ Protocol │
│ (CRS)   │               │  (MOD)   │               │  (PRT)   │
└─────────┘               └──────────┘               └────┬─────┘
                                                          │
                                          ┌───────────────┼───────────────┐
                                          │               │               │
                                 contains ▼      contains ▼      contains ▼
                               ┌──────────┐    ┌──────────┐    ┌──────────┐
                               │ Workflow │    │Checklist │    │ Resource │
                               │  (WFL)   │    │  (CKL)   │    │  (RSC)   │
                               └────┬─────┘    └──────────┘    └──────────┘
                                    │
                        ┌───────────┼───────────┐
                        │           │           │
               contains ▼ contains ▼           ▼ contains
              ┌──────────┐ ┌──────────┐  ┌──────────────┐
              │   Step   │ │   Step   │  │Decision Node │
              │  (STP)   │ │  (STP)   │  │   (DCN)      │
              └────┬─────┘ └──────────┘  └──────────────┘
                   │
       ┌───────────┼───────────┬───────────┐
       │           │           │           │
  uses ▼      uses ▼      uses ▼     uses ▼
┌──────┐   ┌────────┐  ┌─────────┐ ┌──────────┐
│ Tool │   │ Prompt │  │ Example │ │ Exercise │
│(TOL) │   │ (PRM)  │  │  (EXM)  │ │  (EXR)   │
└──────┘   └────────┘  └─────────┘ └──────────┘
```

---

## 8. Schemas Específicos por Tipo

Cada tipo de Knowledge Object estende o schema base (§4.1) com campos específicos no objecto `metadata`.

### 8.1 Protocol (PRT)

```json
{
  "id": "PRT-001",
  "name": "Revisão da Literatura",
  "type": "Protocol",
  "description": "Protocolo para conduzir uma revisão da literatura científica de forma estruturada e assistida por IA.",
  "objective": "Capacitar o investigador a realizar uma revisão da literatura completa, desde a formulação do problema até à síntese escrita.",
  "relations": [
    { "type": "contains", "target": "PRT-001.WFL-001", "label": "Workflow principal", "required": true },
    { "type": "contains", "target": "PRT-001.CKL-001", "label": "Checklist de conclusão", "required": true },
    { "type": "suggests", "target": "PRT-002", "label": "Próximo: Revisão Sistemática", "required": false },
    { "type": "suggests", "target": "PRT-004", "label": "Próximo: Artigo Científico", "required": false }
  ],
  "dependencies": [],
  "metadata": {
    "alias": "RL-01",
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
    "deliverables": [
      "Tabela comparativa de estudos",
      "Revisão preliminar redigida",
      "Checklist de qualidade"
    ]
  },
  "state": "DRAFT",
  "version": "1.0.0"
}
```

### 8.2 Workflow (WFL)

```json
{
  "id": "PRT-001.WFL-001",
  "name": "Fluxo Principal — Revisão da Literatura",
  "type": "Workflow",
  "description": "Sequência de etapas para completar uma revisão da literatura.",
  "objective": "Guiar o investigador pela sequência correcta de tarefas.",
  "relations": [
    { "type": "belongs_to", "target": "PRT-001", "label": "Protocolo pai", "required": true },
    { "type": "contains", "target": "PRT-001.WFL-001.STP-001", "label": "Etapa 1", "required": true },
    { "type": "contains", "target": "PRT-001.WFL-001.STP-002", "label": "Etapa 2", "required": true }
  ],
  "dependencies": [],
  "metadata": {
    "flowType": "linear",
    "totalSteps": 5
  },
  "state": "DRAFT",
  "version": "1.0.0"
}
```

### 8.3 Step (STP)

```json
{
  "id": "PRT-001.WFL-001.STP-001",
  "name": "Definir Problema de Investigação",
  "type": "Step",
  "description": "Formular a pergunta de investigação e os objectivos.",
  "objective": "O investigador deverá ter uma pergunta clara e objectivos mensuráveis.",
  "relations": [
    { "type": "belongs_to", "target": "PRT-001.WFL-001", "label": "Workflow pai", "required": true },
    { "type": "uses", "target": "TOL-001", "label": "ChatGPT", "required": false },
    { "type": "uses", "target": "TOL-002", "label": "Claude", "required": false },
    { "type": "uses", "target": "PRM-001", "label": "Prompt de formulação", "required": true },
    { "type": "uses", "target": "EXM-001", "label": "Exemplo de pergunta", "required": false }
  ],
  "dependencies": [],
  "metadata": {
    "order": 1,
    "toolCategory": "production",
    "expectedOutput": "Pergunta de investigação formulada + objectivos definidos",
    "validationCriteria": [
      "A pergunta é específica e delimitada",
      "Os objectivos são mensuráveis",
      "O tema é exequível"
    ],
    "nextStep": "PRT-001.WFL-001.STP-002"
  },
  "state": "DRAFT",
  "version": "1.0.0"
}
```

### 8.4 Decision Node (DCN)

```json
{
  "id": "PRT-001.WFL-001.DCN-001",
  "name": "Tipo de Revisão",
  "type": "DecisionNode",
  "description": "Determinar se a revisão deve ser narrativa ou sistemática.",
  "objective": "Encaminhar o investigador para o fluxo adequado.",
  "relations": [
    { "type": "belongs_to", "target": "PRT-001.WFL-001", "label": "Workflow pai", "required": true }
  ],
  "dependencies": [
    "PRT-001.WFL-001.STP-001"
  ],
  "metadata": {
    "question": "O seu objectivo requer uma revisão narrativa ou sistemática?",
    "branches": [
      { "condition": "narrativa", "target": "PRT-001.WFL-001.STP-003", "label": "Revisão Narrativa" },
      { "condition": "sistematica", "target": "PRT-002.WFL-001.STP-001", "label": "Revisão Sistemática (protocolo SR-01)" }
    ]
  },
  "state": "DRAFT",
  "version": "1.0.0"
}
```

### 8.5 Tool (TOL)

```json
{
  "id": "TOL-001",
  "name": "ChatGPT",
  "type": "Tool",
  "description": "Assistente de IA conversacional para produção de texto.",
  "objective": "Auxiliar na geração, análise e síntese de texto científico.",
  "relations": [
    { "type": "used_by", "target": "PRT-001.WFL-001.STP-001", "label": "Etapa RL-01 S01", "required": false }
  ],
  "dependencies": [],
  "metadata": {
    "provider": "OpenAI",
    "category": "production",
    "toolType": "ai",
    "url": "https://chat.openai.com",
    "capabilities": ["text-generation", "analysis", "summarization"],
    "alternatives": ["TOL-002", "TOL-003"],
    "byoa": true
  },
  "state": "PUBLISHED",
  "version": "1.0.0"
}
```

### 8.6 Prompt (PRM)

```json
{
  "id": "PRM-001",
  "name": "Formulação do Problema de Investigação",
  "type": "Prompt",
  "description": "Prompt para auxiliar na formulação de uma pergunta de investigação.",
  "objective": "Gerar uma pergunta de investigação clara, delimitada e exequível.",
  "relations": [
    { "type": "used_by", "target": "PRT-001.WFL-001.STP-001", "label": "Etapa RL-01 S01", "required": true }
  ],
  "dependencies": [],
  "metadata": {
    "category": "literature-review",
    "compatibleTools": ["TOL-001", "TOL-002", "TOL-003"],
    "variables": [
      { "name": "research_topic", "type": "string", "required": true },
      { "name": "study_area", "type": "string", "required": true },
      { "name": "academic_level", "type": "enum", "values": ["licenciatura", "mestrado", "doutoramento"], "required": true }
    ],
    "contentRef": "prompts/PR-001/prompt.md"
  },
  "state": "DRAFT",
  "version": "1.0.0"
}
```

### 8.7 Example (EXM)

```json
{
  "id": "EXM-001",
  "name": "Exemplo — Pergunta sobre IA na Educação",
  "type": "Example",
  "description": "Exemplo de formulação de pergunta de investigação na área de IA aplicada à educação.",
  "objective": "Demonstrar o resultado esperado da etapa de formulação do problema.",
  "relations": [
    { "type": "used_by", "target": "PRT-001.WFL-001.STP-001", "label": "Etapa RL-01 S01", "required": false }
  ],
  "dependencies": [],
  "metadata": {
    "category": "literature-review",
    "studyArea": "Educação",
    "contentRef": "examples/EXM-001/"
  },
  "state": "DRAFT",
  "version": "1.0.0"
}
```

### 8.8 Exercise (EXR)

```json
{
  "id": "EXR-001",
  "name": "Exercício — Formular a sua pergunta de investigação",
  "type": "Exercise",
  "description": "O investigador deverá formular a sua própria pergunta seguindo o modelo apresentado.",
  "objective": "Aplicar a técnica de formulação do problema ao tema do investigador.",
  "relations": [
    { "type": "used_by", "target": "PRT-001.WFL-001.STP-001", "label": "Etapa RL-01 S01", "required": false }
  ],
  "dependencies": [
    "EXM-001"
  ],
  "metadata": {
    "type": "hands-on",
    "estimatedTime": "20 minutos",
    "instructions": [],
    "evaluationCriteria": []
  },
  "state": "DRAFT",
  "version": "1.0.0"
}
```

### 8.9 Checklist (CKL)

```json
{
  "id": "PRT-001.CKL-001",
  "name": "Checklist — Revisão da Literatura",
  "type": "Checklist",
  "description": "Lista de verificação para confirmar a conclusão do protocolo RL-01.",
  "objective": "Garantir que todos os passos foram executados e os critérios de qualidade atingidos.",
  "relations": [
    { "type": "belongs_to", "target": "PRT-001", "label": "Protocolo RL-01", "required": true },
    { "type": "validates", "target": "PRT-001.WFL-001", "label": "Valida o workflow", "required": true }
  ],
  "dependencies": [],
  "metadata": {
    "items": [],
    "passingThreshold": 1.0
  },
  "state": "DRAFT",
  "version": "1.0.0"
}
```

### 8.10 Resource (RSC)

```json
{
  "id": "RSC-001",
  "name": "Guia PRISMA 2020",
  "type": "Resource",
  "description": "Directrizes PRISMA para relatório de revisões sistemáticas.",
  "objective": "Fornecer referência normativa para conduzir revisões sistemáticas.",
  "relations": [
    { "type": "referenced_by", "target": "PRT-002", "label": "Usado no SR-01", "required": false }
  ],
  "dependencies": [],
  "metadata": {
    "resourceType": "guide",
    "format": "pdf",
    "url": "",
    "language": "en",
    "citation": ""
  },
  "state": "DRAFT",
  "version": "1.0.0"
}
```

### 8.11 Course (CRS)

```json
{
  "id": "CRS-001",
  "name": "Fundamentos de IA para Investigação",
  "type": "Course",
  "description": "Curso introdutório sobre Inteligência Artificial aplicada à investigação científica.",
  "objective": "Preparar o investigador para utilizar IA de forma consciente e eficaz.",
  "relations": [
    { "type": "contains", "target": "CRS-001.MOD-001", "label": "Módulo 1", "required": true }
  ],
  "dependencies": [],
  "metadata": {
    "level": "beginner",
    "estimatedDuration": "8 horas",
    "totalModules": 0,
    "certificate": false
  },
  "state": "DRAFT",
  "version": "1.0.0"
}
```

### 8.12 Module (MOD)

```json
{
  "id": "CRS-001.MOD-001",
  "name": "O que é Inteligência Artificial",
  "type": "Module",
  "description": "Introdução aos conceitos fundamentais de IA relevantes para investigação.",
  "objective": "Compreender o que é IA, os seus tipos e as suas limitações.",
  "relations": [
    { "type": "belongs_to", "target": "CRS-001", "label": "Curso pai", "required": true },
    { "type": "suggests", "target": "CRS-001.MOD-002", "label": "Próximo módulo", "required": false }
  ],
  "dependencies": [],
  "metadata": {
    "order": 1,
    "estimatedDuration": "1 hora",
    "resources": [],
    "exercises": []
  },
  "state": "DRAFT",
  "version": "1.0.0"
}
```

---

## 9. Knowledge Registry

### 9.1 Propósito

O Knowledge Registry é o serviço central que:

1. **Indexa** todos os Knowledge Objects da plataforma
2. **Resolve** IDs para localizações físicas
3. **Valida** a integridade do Knowledge Graph
4. **Pesquisa** KOs por tipo, estado, relação ou metadado

### 9.2 Princípio de Indireção

```
┌───────────┐                ┌───────────────────┐                ┌──────────────┐
│  Runtime   │ ── resolve ──► │ Knowledge Registry │ ── localiza ──► │ Ficheiro(s)  │
│  Engine    │   (por ID)     │                   │   (por path)    │ no disco     │
└───────────┘                └───────────────────┘                └──────────────┘
```

> O Runtime **nunca** acede a ficheiros directamente por caminho. Solicita sempre ao Registry a localização de um KO a partir do seu ID.

### 9.3 Formato do Registry Index

```json
{
  "version": "1.0.0",
  "lastUpdated": "",
  "objects": {
    "PRT-001": {
      "type": "Protocol",
      "path": "protocols/RL-01/protocol.json",
      "state": "DRAFT"
    },
    "TOL-001": {
      "type": "Tool",
      "path": "tools/chatgpt/tool.json",
      "state": "PUBLISHED"
    },
    "PRM-001": {
      "type": "Prompt",
      "path": "prompts/PR-001/metadata.json",
      "state": "DRAFT"
    }
  }
}
```

### 9.4 Resolução de Referências

Quando um KO referencia outro KO (ex: `"target": "TOL-001"`), o Registry:

1. Recebe o ID `TOL-001`
2. Consulta o índice
3. Retorna o caminho `tools/chatgpt/tool.json`
4. Carrega o ficheiro
5. Retorna o KO ao Runtime

Esta indireção garante que **mover um ficheiro de pasta nunca quebra o sistema** — basta actualizar o Registry Index.

---

## 10. Validação de Integridade

### 10.1 Regras de Integridade

| Regra                          | Descrição                                                        |
|--------------------------------|------------------------------------------------------------------|
| **Unicidade de ID**            | Nenhum ID pode estar duplicado no Registry                       |
| **Referência válida**          | Toda relação `target` deve apontar para um ID existente          |
| **Tipo consistente**           | O `type` declarado deve corresponder ao código no ID             |
| **Dependências resolvíveis**   | Todas as dependências devem existir no Registry                  |
| **Ciclos proibidos**           | Relações `contains` não podem formar ciclos                      |
| **Parent válido**              | IDs compostos devem ter parents existentes                       |
| **Estado consistente**         | Um KO `PUBLISHED` não pode depender de um KO `DRAFT`            |

### 10.2 Níveis de Validação

| Nível      | Quando executa                    | O que valida                              |
|------------|-----------------------------------|-------------------------------------------|
| **Syntax** | Na escrita do KO                  | Schema JSON válido, campos obrigatórios   |
| **Graph**  | Na construção do Registry         | Referências, ciclos, unicidade            |
| **State**  | Na publicação                     | Dependências publicadas, completude       |

---

## 11. Convenções de Armazenamento Físico

Embora o Runtime não dependa da estrutura de pastas, é necessária uma convenção de arrumação para os humanos que editam o repositório.

### 11.1 Mapeamento Tipo → Directório

| Tipo           | Directório base         | Ficheiro principal    |
|----------------|-------------------------|-----------------------|
| Protocol       | `protocols/{alias}/`    | `protocol.json`       |
| Workflow       | `protocols/{alias}/`    | `workflow.json`       |
| Step           | `protocols/{alias}/`    | `workflow.json`       |
| Decision Node  | `protocols/{alias}/`    | `workflow.json`       |
| Tool           | `tools/{slug}/`         | `tool.json`           |
| Prompt         | `prompts/{code}/`       | `metadata.json`       |
| Example        | `examples/{code}/`      | `example.json`        |
| Exercise       | `examples/{code}/`      | `exercise.json`       |
| Checklist      | `protocols/{alias}/`    | `checklist.json`      |
| Resource       | `assets/`               | `resource.json`       |
| Course         | `courses/{code}/`       | `course.json`         |
| Module         | `courses/{code}/`       | `module.json`         |

### 11.2 Regra de Ouro

> A localização física é uma **conveniência para humanos**. A localização semântica é a **verdade para o Runtime**.

---

## 12. Implicações Arquitectónicas

### 12.1 Para o Protocol Kernel (RFC-001)

O Kernel passa a operar sobre Knowledge Objects em vez de ficheiros directamente:

```
Antes (RFC-001):  ManifestParser → lê protocol.json → executa steps
Agora (RFC-002):  Registry → resolve PRT-001 → Kernel → executa KOs
```

### 12.2 Para os Platform Services (RFC-001)

Cada serviço da Camada 2 passa a receber Knowledge Objects tipados:

| Serviço          | Recebe                                          |
|------------------|-------------------------------------------------|
| WorkflowEngine   | KO tipo `Workflow` com relações para `Step` e `DecisionNode` |
| PromptEngine     | KO tipo `Prompt` com `variables` e `contentRef`  |
| ToolRegistry     | KO tipo `Tool` com `capabilities` e `alternatives` |
| ChecklistEngine  | KO tipo `Checklist` com `items`                   |

### 12.3 Para o Content (RFC-007)

Todo o conteúdo da plataforma é agora descrito como Knowledge Objects. A RFC-007 especificará os formatos de conteúdo (Markdown, JSON) e os schemas de validação.

---

## 13. Relação com RFCs

| RFC     | Impacto da Knowledge Architecture                                  |
|---------|---------------------------------------------------------------------|
| RFC-000 | Sem alteração — o conceito de protocolos é preservado               |
| RFC-001 | O Kernel opera sobre KOs via Registry em vez de ficheiros directos  |
| RFC-003 | O Protocol Framework utiliza KO tipo Protocol como base             |
| RFC-004 | O Workflow Engine processa KOs tipo Workflow, Step, DecisionNode    |
| RFC-005 | O Tool Registry é a implementação do KO tipo Tool                   |
| RFC-006 | O Prompt Engine renderiza KOs tipo Prompt                           |
| RFC-007 | O Content Architecture mapeia KOs para formatos de ficheiro         |
| RFC-008 | O Frontend consome KOs via Registry API                             |

---

## 14. Decisões Arquitectónicas

### ADR-004: Knowledge Objects como unidade fundamental

**Contexto:** O sistema podia tratar conteúdo como ficheiros com convenções de nome, ou como objectos semânticos com identidade e relações.

**Decisão:** Todo conteúdo é um **Knowledge Object** com schema formal.

**Razão:** Permite ao Runtime operar independentemente da organização de pastas. Possibilita pesquisa, validação e composição programática de conteúdo. Prepara a plataforma para funcionalidades futuras (Knowledge Graph visual, recomendações, analytics).

### ADR-005: IDs compostos para hierarquia

**Contexto:** IDs podiam ser planos (ex: `STP-047`) ou compostos (ex: `PRT-001.WFL-001.STP-001`).

**Decisão:** IDs compostos com notação de ponto para objectos hierárquicos.

**Razão:** O ID encode a hierarquia, tornando explícita a pertença de cada objecto. Facilita queries hierárquicas ("todos os steps do PRT-001") sem necessidade de traversar relações.

### ADR-006: Registry como indireção obrigatória

**Contexto:** O Runtime podia aceder directamente a ficheiros por convenção de caminho, ou via um índice intermediário.

**Decisão:** Registry Index obrigatório. O Runtime nunca acede a caminhos directamente.

**Razão:** Desacopla completamente a organização física do modelo lógico. Mover um ficheiro requer apenas actualizar o Registry, sem impacto no Runtime.

---

## 15. Critérios de Aprovação

Esta RFC considera-se aprovada quando:

- [ ] O conceito de Knowledge Object é aceite como unidade fundamental
- [ ] Os 12 tipos são validados
- [ ] O schema base (10 campos) é aprovado
- [ ] O sistema de IDs (simples e compostos) é aceite
- [ ] Os 8 tipos de relação são validados
- [ ] O ciclo de vida (5 estados) é aprovado
- [ ] O conceito de Knowledge Registry é aceite
- [ ] As regras de integridade são validadas
- [ ] Os ADRs são aceites

---

> *"Se o RPOS é o sistema operativo, os Knowledge Objects são os blocos fundamentais a partir dos quais tudo é construído."*
