# RFC-002A — Research Protocol Taxonomy

> **Versão:** 1.0
> **Status:** 🟡 DRAFT — aguarda revisão e aprovação
> **Dependência:** RFC-000 (Product Vision) · RFC-002 (Knowledge Architecture)
> **Última atualização:** Julho de 2026
> **Autor:** Egas Lemos

---

## 1. Contexto e Motivação

À medida que o ResearchAI Hub evolui, uma lista plana de protocolos (ex: RL-01, SR-01, PJ-01) torna-se insustentável e difícil de navegar para o utilizador. A plataforma abrange todo o ciclo de vida da investigação científica, exigindo um modelo de classificação escalável que cresça de forma consistente ao longo de anos.

A **RFC-002A** define o modelo taxonómico oficial do ResearchAI Hub. O objectivo é introduzir uma linguagem comum, classificar os protocolos em domínios de conhecimento e garantir que a expansão da biblioteca seja lógica e estruturada.

---

## 2. Conceito: Famílias de Protocolos

Os protocolos deixam de ser uma lista simples. Eles passam a pertencer a **Famílias de Protocolos**.

Cada **Família** representa uma **macro-competência** da investigação científica. Este agrupamento lógico orienta o utilizador e estrutura as jornadas de aprendizagem (cursos, módulos, etc.).

---

## 3. Padrão de Identificação Taxonómica

Para suportar o modelo de famílias, o padrão de identificação dos protocolos evolui para um formato expansível e legível.

### 3.1 Estrutura do Novo ID

```
{FAMILY_CODE}-{SUB_CODE}-{SEQUENCE}
```

- **`FAMILY_CODE`**: Prefixo da família de competência (ex: `LIT`, `WRITE`, `DESIGN`).
- **`SUB_CODE`**: Código específico do protocolo (ex: `RL` para Revisão de Literatura).
- **`SEQUENCE`**: Número sequencial para versionamento ou variações da mesma tarefa (ex: `01`).

### 3.2 Exemplos de Identificação

| ID Antigo | Novo ID Taxonómico | Descrição do Protocolo                   |
|-----------|--------------------|------------------------------------------|
| RL-01     | **LIT-RL-01**      | Revisão da Literatura (Literature)       |
| SR-01     | **LIT-SR-01**      | Revisão Sistemática (Literature)         |
| PJ-01     | **DESIGN-PJ-01**   | Projeto de Investigação (Design)         |
| AR-01     | **WRITE-AR-01**    | Artigo Científico (Writing)              |
| MC-01     | **LIT-MC-01**      | Mapeamento Conceitual (Literature)       |
| DA-01     | **DATA-DA-01**     | Análise de Dados (Data)                  |
| RM-01     | **METHOD-RM-01**   | Desenho Metodológico (Methods)           |
| AC-01     | **COMM-AC-01**     | Apresentação Académica (Communication)   |

---

## 4. As 10 Famílias Fundacionais

Abaixo definem-se as 10 famílias de protocolos inaugurais que cobrem o ciclo de vida da investigação.

### 4.1 Literature Intelligence (LIT)
- **Código**: `LIT`
- **Objetivo**: Capacitar a pesquisa, avaliação, mapeamento e síntese crítica da literatura científica.
- **Competências abrangidas**: Pesquisa booleana, avaliação de fontes, mapeamento bibliométrico, revisões narrativas e sistemáticas.
- **Protocolos previstos**: 
  - `LIT-RL-01` (Revisão da Literatura)
  - `LIT-SR-01` (Revisão Sistemática)
  - `LIT-MC-01` (Mapeamento Conceitual)
- **Dependências**: Nenhuma (fundamental para as restantes).
- **Evolução futura**: Integração de RAG (Retrieval-Augmented Generation) para processamento em lote de centenas de artigos.

### 4.2 Research Design (DESIGN)
- **Código**: `DESIGN`
- **Objetivo**: Estruturar e planear a investigação desde a ideia até ao projeto viável.
- **Competências abrangidas**: Formulação do problema, definição de objectivos, justificação, exequibilidade, planeamento temporal.
- **Protocolos previstos**: 
  - `DESIGN-PJ-01` (Projeto de Investigação)
  - `DESIGN-HP-01` (Formulação de Hipóteses)
- **Dependências**: `LIT` (identificação de lacunas).
- **Evolução futura**: Assistentes interactivos para brainstorming de perguntas de investigação inexploradas.

### 4.3 Scientific Writing (WRITE)
- **Código**: `WRITE`
- **Objetivo**: Orientar a redação, estruturação e clareza de diferentes formatos de textos científicos.
- **Competências abrangidas**: Escrita académica, síntese, paráfrase (sem plágio), coerência estrutural, argumentação científica.
- **Protocolos previstos**: 
  - `WRITE-AR-01` (Artigo Científico)
  - `WRITE-TS-01` (Tese / Dissertação)
  - `WRITE-ABS-01` (Abstract)
- **Dependências**: `LIT`, `DESIGN`, `DATA`, `METHOD`.
- **Evolução futura**: Modelos preditivos de adequação de estilo por revista alvo.

### 4.4 Research Methods (METHOD)
- **Código**: `METHOD`
- **Objetivo**: Ajudar na selecção, desenho e justificação das opções metodológicas.
- **Competências abrangidas**: Desenho quantitativo, qualitativo e misto, selecção de amostras, instrumentos de recolha.
- **Protocolos previstos**: 
  - `METHOD-RM-01` (Desenho Metodológico)
  - `METHOD-QA-01` (Guiões Qualitativos)
- **Dependências**: `DESIGN`.
- **Evolução futura**: Protocolos dedicados por disciplinas específicas (ciências da saúde, humanidades, etc.).

### 4.5 Research Data (DATA)
- **Código**: `DATA`
- **Objetivo**: Facilitar a organização, tratamento, análise e visualização de dados empíricos.
- **Competências abrangidas**: Limpeza de dados, análise estatística, codificação qualitativa, geração de gráficos, gestão de datasets.
- **Protocolos previstos**: 
  - `DATA-DA-01` (Análise de Dados)
  - `DATA-VIZ-01` (Visualização de Dados)
- **Dependências**: `METHOD`.
- **Evolução futura**: Workflows de integração com ferramentas especializadas (Python, R, NVivo, SPSS).

### 4.6 Academic Communication (COMM)
- **Código**: `COMM`
- **Objetivo**: Preparar o investigador para comunicar os seus resultados em eventos e reuniões.
- **Competências abrangidas**: Design de apresentações, preparação de pitches (ex: 3MT), desenvolvimento de posters científicos.
- **Protocolos previstos**: 
  - `COMM-AC-01` (Apresentação Académica)
  - `COMM-PS-01` (Poster Científico)
- **Dependências**: `WRITE`.
- **Evolução futura**: Avaliação de discursos e ensaios com feedback IA de áudio/vídeo.

### 4.7 Research Ethics (ETHICS)
- **Código**: `ETHICS`
- **Objetivo**: Assegurar a integridade, transparência e cumprimento das normas éticas.
- **Competências abrangidas**: Anonimização de dados, elaboração de consentimentos informados, submissão a comissões de ética, mitigação de viés de IA.
- **Protocolos previstos**: 
  - `ETHICS-IC-01` (Consentimento Informado)
  - `ETHICS-CE-01` (Submissão Ética)
- **Dependências**: `DESIGN`, `METHOD`, `DATA`.
- **Evolução futura**: Auditorias automáticas de viés ético em metodologias e prompts.

### 4.8 Research Publishing (PUB)
- **Código**: `PUB`
- **Objetivo**: Navegar no ecossistema de publicações e maximizar as hipóteses de aceitação.
- **Competências abrangidas**: Selecção de revistas, resposta a revisores, cartas ao editor (cover letters), navegação de peer-review.
- **Protocolos previstos**: 
  - `PUB-JR-01` (Selecção de Journal)
  - `PUB-RR-01` (Resposta a Revisores)
- **Dependências**: `WRITE`.
- **Evolução futura**: Avaliadores sintéticos (simulação de peer-review).

### 4.9 Research Impact (IMPACT)
- **Código**: `IMPACT`
- **Objetivo**: Aumentar a visibilidade, citações e o impacto social/prático da investigação.
- **Competências abrangidas**: Divulgação científica em redes académicas, escrita para o grande público (science communication), SEO académico.
- **Protocolos previstos**: 
  - `IMPACT-SC-01` (Comunicação Científica)
  - `IMPACT-SM-01` (Social Media Académico)
- **Dependências**: `PUB`, `COMM`.
- **Evolução futura**: Tracking integrado de métricas (h-index, altmetrics) geradas pelas ferramentas.

### 4.10 Research Funding (FUND)
- **Código**: `FUND`
- **Objetivo**: Captar recursos, redigir candidaturas a bolsas e gerir financiamentos.
- **Competências abrangidas**: Redação de grants, orçamentação, adequação a editais, propostas de valor.
- **Protocolos previstos**: 
  - `FUND-GP-01` (Grant Proposal)
  - `FUND-BD-01` (Bolsa de Doutoramento)
- **Dependências**: `DESIGN`, `METHOD`.
- **Evolução futura**: Monitorização passiva de editais (Horizon Europe, FCT, CAPES) alinhados ao perfil do investigador.

---

## 5. Governança e Evolução Taxonómica

Para assegurar que a taxonomia não se corrompe ao longo do tempo, o ResearchAI Hub obedecerá às seguintes regras de governança:

### 5.1 Criação de Novos Protocolos
Todo o novo protocolo deve:
1. Enquadrar-se obrigatoriamente numa das Famílias existentes (ou justificar a criação de uma nova).
2. Adotar a estrutura ID descrita em §3.1 (`FAMILY-SUBCODE-SEQ`).
3. Declarar as suas dependências utilizando as competências da sua família ou de famílias precedentes.

### 5.2 Adição de Novas Famílias
A criação de uma nova Família é uma **decisão de alto nível (arquitetural)**, requerendo uma nova RFC ou actualização à RFC-002A.
A nova família deve cobrir uma área da investigação que as famílias actuais não comportem (ex: *Research Commercialization* / *Patents*).

### 5.3 Compatibilidade com Protocolos Antigos
O sistema de roteamento (Layer 4 - Presentation) e o Knowledge Registry (Layer 2) manterão **aliases retrocompatíveis**. 
- Um pedido ao Knowledge Registry pelo ID antigo `PRT-RL-01` (ou `RL-01`) deverá resolver para `LIT-RL-01`.
- A propriedade `metadata.legacy_alias` do Knowledge Object deverá armazenar o código clássico para garantir a transição suave sem quebra de links externos.

---

## 6. Implicações Arquiteturais

A introdução das Famílias requer as seguintes alterações nos objetos definidos na **RFC-002**:

1. **Protocol Knowledge Object**: 
   - A propriedade `metadata.category` passa a conter o `FAMILY_CODE`.
   - O `id` adota o novo formato `LIT-RL-01`.
2. **Knowledge Registry**:
   - Suporte para agrupamento por `metadata.category`.
   - Lógica de fallback para identificadores antigos via `metadata.legacy_alias`.

---

## 7. Critérios de Aprovação

Esta RFC considera-se aprovada quando:

- [ ] O conceito de Famílias de Protocolos for aceite.
- [ ] As 10 Famílias fundacionais e os seus escopos forem validados.
- [ ] O padrão de identificação `FAMILY-SUBCODE-SEQ` for aprovado.
- [ ] O plano de retrocompatibilidade (aliases) for aprovado.

---

> *"As ferramentas mudam e a IA evolui, mas as macro-competências da produção de conhecimento científico permanecem universais."*
