# RFC-006 — Academy Architecture

> **Versão:** 1.0
> **Status:** 🟡 DRAFT — aguarda revisão e aprovação
> **Dependência:** RFC-000 (Product Vision) · RFC-004 (Domain Model) · RFC-005 (Learning Experience Architecture) · ADR-007 (Activity Entity)
> **Última atualização:** Julho de 2026
> **Autor:** Egas Lemos

---

## 1. Contexto e Motivação

Ao longo das RFCs fundacionais, o ResearchAI Hub foi definido simultaneamente como uma "plataforma de protocolos" e uma "plataforma de formação". No entanto, durante a revisão estratégica do domínio, identificou-se que estas duas dimensões são **arquitecturalmente distintas** e devem ser separadas para que o produto possa crescer de forma sustentável.

Existem duas camadas:

1. **A Plataforma (ResearchAI Hub)** — O motor permanente. Contém protocolos, ferramentas, prompts, activities. Existe independentemente de qualquer programa de formação. É o **sistema operativo** (RPOS).

2. **Os Programas de Formação (Academy)** — As ofertas pedagógicas. Utilizam os activos da plataforma para construir experiências de aprendizagem estruturadas. São **aplicações** sobre o RPOS.

Sem esta separação, o sistema confunde "o conteúdo que existe na plataforma" com "a experiência que se oferece ao formando", impedindo que:
- O mesmo protocolo seja reutilizado em múltiplos programas.
- Uma instituição crie os seus próprios programas sobre o mesmo motor.
- O conteúdo da plataforma evolua sem afectar programas em curso.

A **RFC-006** formaliza esta separação através do conceito de **Academy Architecture**.

---

## 2. As Duas Camadas do Produto

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    CAMADA 2 — ACADEMY                           │
│                    (Programas de Formação)                       │
│                                                                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│   │ Program  │  │  Course  │  │ Session  │  │ Learning │      │
│   │          │  │          │  │          │  │   Path   │      │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
│   Temporais · Contextuais · Configuráveis · Instanciáveis       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    CAMADA 1 — PLATAFORMA                        │
│                    (Activos Permanentes)                         │
│                                                                 │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│   │Competency│  │ Protocol │  │ Activity │  │  Recipe  │      │
│   │          │  │          │  │          │  │          │      │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│   │   Tool   │  │  Prompt  │  │ Resource │                    │
│   │          │  │          │  │          │                    │
│   └──────────┘  └──────────┘  └──────────┘                    │
│                                                                 │
│   Permanentes · Reutilizáveis · Versionados · Independentes    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Classificação dos Business Objects

### 3.1 Pertence ao Produto Permanente (Plataforma)

Estes objectos existem **independentemente** de qualquer programa de formação. São os activos nucleares do ResearchAI Hub.

| Objecto       | Razão da permanência                                                       |
|---------------|-----------------------------------------------------------------------------|
| **Competency**| Uma competência científica é universal e não pertence a nenhum programa.     |
| **Recipe**    | Uma receita de execução (composição de protocolos) é reutilizável.          |
| **Protocol**  | Um protocolo é um método científico reproduzível, independente do contexto.  |
| **Activity**  | Uma actividade é a menor unidade executável, reutilizável em qualquer protocolo. |
| **Tool**      | Uma ferramenta existe no mercado; a plataforma apenas a cataloga.            |
| **Prompt**    | Um template de prompt é um activo intelectual reutilizável.                  |
| **Resource**  | Um artigo, guia ou template é material de referência permanente.             |

### 3.2 Pertence ao Programa de Formação (Academy)

Estes objectos são **instanciados** quando um programa é criado. Consomem activos da plataforma mas possuem contexto, calendário e público próprios.

| Objecto           | Razão da temporalidade                                                 |
|-------------------|-------------------------------------------------------------------------|
| **Academy**       | A entidade institucional que organiza programas (ResearchAI Academy).   |
| **Program**       | Uma oferta formativa específica com datas, público e objectivos.        |
| **Course**        | Uma unidade pedagógica dentro de um programa, com sequência definida.   |
| **Session**       | Um encontro (síncrono ou assíncrono) dentro de um curso.                |
| **Learning Path** | Um percurso personalizado construído para um programa específico.       |

---

## 4. Definição dos Business Objects

### 4.1 Academy

| Campo             | Valor                                                                    |
|-------------------|--------------------------------------------------------------------------|
| **Objectivo**     | Representar a entidade institucional que organiza e publica programas de formação. |
| **Descrição**     | A Academy é o contentor de topo. No MVP, existe uma única Academy (ResearchAI Academy). No futuro, instituições poderão ter as suas próprias Academies sobre a mesma plataforma. |
| **Responsabilidades** | Agregar programas. Definir identidade. Gerir catálogo de formação.  |
| **Relações**      | Contém → `Programs`.                                                     |
| **Estado**        | Activa · Suspensa · Arquivada.                                          |
| **Ciclo de vida** | Criada → Activa → (Suspensa ↔ Activa) → Arquivada.                     |

### 4.2 Program

| Campo             | Valor                                                                    |
|-------------------|--------------------------------------------------------------------------|
| **Objectivo**     | Certificar um conjunto macro de saberes científicos através de uma experiência formativa completa. |
| **Descrição**     | Uma oferta pedagógica formal com nome, objectivos, público-alvo, calendário e estrutura curricular. Exemplo: *"IA Aplicada à Investigação Científica"*. |
| **Responsabilidades** | Definir o âmbito, duração e resultados da formação. Orquestrar Courses e Learning Paths. |
| **Relações**      | Pertence a → `Academy`. Contém → `Courses`. Utiliza → `Learning Paths`. Avalia → `Competencies`. |
| **Estado**        | Rascunho · Publicado · Em Curso · Encerrado · Arquivado.               |
| **Ciclo de vida** | Rascunho → Publicado → Em Curso → Encerrado → Arquivado.              |

### 4.3 Course

| Campo             | Valor                                                                    |
|-------------------|--------------------------------------------------------------------------|
| **Objectivo**     | Ensinar um bloco temático coerente dentro de um programa.                |
| **Descrição**     | Uma unidade pedagógica sequencial composta por sessões, cada uma mapeando para actividades e protocolos da plataforma. |
| **Responsabilidades** | Estruturar a progressão do formando dentro de um tema. Referenciar Recipes e Protocols. |
| **Relações**      | Pertence a → `Program`. Contém → `Sessions`. Referencia → `Recipes`, `Protocols`, `Competencies`. |
| **Estado**        | Planeado · Activo · Concluído.                                          |
| **Ciclo de vida** | Planeado → Activo → Concluído.                                         |

### 4.4 Session

| Campo             | Valor                                                                    |
|-------------------|--------------------------------------------------------------------------|
| **Objectivo**     | Delimitar um momento de aprendizagem concreto dentro de um curso.        |
| **Descrição**     | Um encontro (presencial, remoto ou assíncrono) com duração definida, objectivos claros e actividades específicas a executar. |
| **Responsabilidades** | Contextualizar o que o formando vai fazer naquele momento. Instanciar Activities do Protocol. |
| **Relações**      | Pertence a → `Course`. Executa → `Activities` (via `Protocol`). Utiliza → `Tools`, `Prompts`. |
| **Estado**        | Agendada · Em Curso · Concluída · Cancelada.                            |
| **Ciclo de vida** | Agendada → Em Curso → Concluída.                                       |

### 4.5 Learning Path

| Campo             | Valor                                                                    |
|-------------------|--------------------------------------------------------------------------|
| **Objectivo**     | Guiar o formando através de uma sequência lógica de competências e protocolos. |
| **Descrição**     | Um percurso curado que liga Competências a Recipes e Protocols, criando uma jornada de desenvolvimento. Pode ser genérico (da plataforma) ou específico (de um programa). |
| **Responsabilidades** | Sequenciar a aquisição de competências. Sugerir o próximo passo. Respeitar pré-requisitos. |
| **Relações**      | Utilizado por → `Program`. Agrupa → `Competencies`. Sequencia → `Recipes`. |
| **Estado**        | Rascunho · Publicado · Activo · Concluído.                              |
| **Ciclo de vida** | Rascunho → Publicado → Activo (por utilizador) → Concluído.            |

### 4.6 Competency

| Campo             | Valor                                                                    |
|-------------------|--------------------------------------------------------------------------|
| **Objectivo**     | Representar uma habilidade científica específica e mensurável.           |
| **Descrição**     | O verdadeiro produto da plataforma (RFC-004). Uma competência é universal, independente de programas, e verificável por evidência. |
| **Responsabilidades** | Definir o que o investigador será capaz de fazer. Servir como alvo de avaliação. |
| **Relações**      | Avaliada por → `Learning Results`. Servida por → `Protocols` (via `Recipes`). Agrupada em → `Learning Paths`. |
| **Estado**        | Descoberta · Em Progresso · Adquirida.                                  |
| **Ciclo de vida** | Descoberta → Em Progresso → Adquirida.                                 |

### 4.7 Recipe

| Campo             | Valor                                                                    |
|-------------------|--------------------------------------------------------------------------|
| **Objectivo**     | Definir uma composição curada de protocolos para resolver um problema científico completo. |
| **Descrição**     | Uma Receita é um **meta-protocolo** — uma orquestração que indica quais protocolos executar, em que ordem, e como os outputs de um alimentam os inputs do seguinte. Enquanto o Protocolo é atómico (uma tarefa), a Receita é molecular (uma solução). |
| **Responsabilidades** | Compor protocolos. Definir fluxo inter-protocolo. Garantir continuidade de dados entre protocolos. |
| **Relações**      | Compõe → `Protocols`. Serve → `Competencies`. Utilizada por → `Learning Paths`, `Courses`. |
| **Estado**        | Rascunho · Publicada · Arquivada.                                       |
| **Ciclo de vida** | Rascunho → Publicada → Arquivada.                                      |

**Exemplo de Receita:**

```
Receita: "Da Ideia ao Artigo Publicado"

  1. LIT-RL-01  (Revisão da Literatura)
       ↓ output: lacunas identificadas
  2. DESIGN-PJ-01  (Projecto de Investigação)
       ↓ output: projecto formalizado
  3. METHOD-RM-01  (Desenho Metodológico)
       ↓ output: metodologia justificada
  4. DATA-DA-01  (Análise de Dados)
       ↓ output: resultados analisados
  5. WRITE-AR-01  (Artigo Científico)
       ↓ output: artigo redigido
  6. PUB-JR-01  (Selecção de Journal)
       ↓ output: artigo submetido
```

### 4.8 Protocol

| Campo             | Valor                                                                    |
|-------------------|--------------------------------------------------------------------------|
| **Objectivo**     | Garantir a reprodução correcta de uma técnica científica específica.     |
| **Descrição**     | O veículo metodológico atómico. Executa um Workflow composto por Activities (ADR-007). |
| **Responsabilidades** | Guiar passo a passo. Garantir rigor. Produzir artefacto concreto.  |
| **Relações**      | Composto por → `Workflow` → `Activities`. Utilizado por → `Recipes`. Serve → `Competencies`. |
| **Estado**        | Seleccionado · Em Execução · Validado.                                  |
| **Ciclo de vida** | Seleccionado → Em Execução → Validado.                                 |

### 4.9 Activity

| Campo             | Valor                                                                    |
|-------------------|--------------------------------------------------------------------------|
| **Objectivo**     | Executar a menor unidade de trabalho significativa do ponto de vista do utilizador. |
| **Descrição**     | Conforme ADR-007: a Activity substitui o Step como unidade visível. Contém internamente micro-steps técnicos invisíveis ao utilizador. |
| **Responsabilidades** | Apresentar objectivo, instrução, ferramenta, prompt. Recolher output. Validar resultado. |
| **Relações**      | Pertence a → `Workflow` (dentro de `Protocol`). Utiliza → `Tools`, `Prompts`. Produz → `Outputs`. Contém → `Steps` (internos). |
| **Estado**        | Pending · Running · WaitingUser · Validating · Completed · Skipped · Cancelled · Error. |
| **Ciclo de vida** | Conforme RFC-003 (State Machine).                                       |

---

## 5. Cadeia de Composição Completa

A cadeia completa do domínio, de cima para baixo:

```
Academy
  └── Program
        └── Course
              └── Session
                    └── Learning Path
                          └── Competency
                                └── Recipe
                                      └── Protocol
                                            └── Workflow
                                                  └── Activity
                                                        ├── Tool
                                                        └── Prompt
```

**Leitura da cadeia:**

> A **Academy** publica **Programs**. Cada Program contém **Courses**. Cada Course é dividido em **Sessions**. Cada Session segue um **Learning Path** que agrupa **Competencies**. Cada Competency é servida por **Recipes**. Cada Recipe orquestra **Protocols**. Cada Protocol executa um **Workflow** composto por **Activities**. Cada Activity utiliza **Tools** e **Prompts** para produzir resultados.

---

## 6. Grafo de Relações

```
┌──────────┐
│ Academy  │
└────┬─────┘
     │ contém
     ▼
┌──────────┐       utiliza       ┌──────────────┐
│ Program  │ ──────────────────► │ Learning Path│
└────┬─────┘                     └──────┬───────┘
     │ contém                           │ agrupa
     ▼                                  ▼
┌──────────┐                     ┌──────────────┐
│  Course  │                     │  Competency  │
└────┬─────┘                     └──────┬───────┘
     │ contém                           │ servida por
     ▼                                  ▼
┌──────────┐       executa       ┌──────────────┐
│ Session  │ ──────────────────► │    Recipe    │
└──────────┘                     └──────┬───────┘
                                        │ compõe
                                        ▼
                                 ┌──────────────┐
                                 │   Protocol   │
                                 └──────┬───────┘
                                        │ orquestra
                                        ▼
                                 ┌──────────────┐
                                 │   Activity   │
                                 └───┬──────┬───┘
                                     │      │
                                uses ▼      ▼ uses
                              ┌──────┐  ┌────────┐
                              │ Tool │  │ Prompt │
                              └──────┘  └────────┘
```

---

## 7. Caso de Aplicação: Formação "IA Aplicada à Investigação Científica"

Para demonstrar como a arquitectura representa um programa real, segue-se a modelação completa da formação inaugural.

### 7.1 Academy

```
Academy: ResearchAI Academy
```

### 7.2 Program

```
Program: "Inteligência Artificial Aplicada à Investigação Científica"
Público: Docentes, investigadores, mestrandos, doutorandos
Duração: 40 horas (8 semanas)
Objectivo: Capacitar investigadores para utilizar IA de forma
           estruturada, ética e reproduzível em todas as fases
           da investigação científica.
```

### 7.3 Courses

| #  | Curso                                            | Duração | Competências-alvo                                |
|----|--------------------------------------------------|---------|--------------------------------------------------|
| C1 | Fundamentos de IA para Investigação              | 4h      | Compreensão de LLMs · Ética de IA · BYOA/BYOT   |
| C2 | Pesquisa e Revisão da Literatura com IA          | 8h      | Pesquisa booleana · Avaliação de fontes · Síntese|
| C3 | Escrita Científica Assistida por IA              | 8h      | Estrutura de artigo · Paráfrase ética · Revisão  |
| C4 | Projecto de Investigação com IA                  | 8h      | Formulação do problema · Metodologia · Planeamento|
| C5 | Análise de Dados com IA                          | 8h      | Análise descritiva · Visualização · Interpretação|
| C6 | Publicação e Comunicação Científica              | 4h      | Selecção de journal · Apresentação · Divulgação  |

### 7.4 Sessions (Exemplo para C2)

| #    | Sessão                                  | Duração | Protocolo Executado |
|------|-----------------------------------------|---------|---------------------|
| S2.1 | Formular a Pergunta de Investigação     | 2h      | LIT-RL-01 (parcial) |
| S2.2 | Estratégia de Busca com IA              | 2h      | LIT-RL-01 (parcial) |
| S2.3 | Avaliação Crítica de Fontes             | 2h      | LIT-RL-01 (parcial) |
| S2.4 | Síntese e Mapeamento Conceitual         | 2h      | LIT-MC-01           |

### 7.5 Learning Paths Utilizados

| Learning Path                | Cursos que o utilizam   |
|------------------------------|-------------------------|
| Literatura Científica        | C2                      |
| Escrita Científica           | C3                      |
| Projeto de Investigação      | C4                      |
| Análise de Dados             | C5                      |
| Publicação                   | C6                      |
| Comunicação Científica       | C6                      |

### 7.6 Recipes Executadas

| Recipe                              | Protocolos compostos                              |
|--------------------------------------|---------------------------------------------------|
| "Revisão Completa da Literatura"     | LIT-RL-01 → LIT-MC-01                            |
| "Do Projecto ao Artigo"              | DESIGN-PJ-01 → METHOD-RM-01 → WRITE-AR-01       |
| "Da Análise à Publicação"            | DATA-DA-01 → DATA-VIZ-01 → WRITE-AR-01 → PUB-JR-01 |

### 7.7 Representação Hierárquica Completa

```
ResearchAI Academy
  └── Program: "IA Aplicada à Investigação Científica"
        ├── Course C1: Fundamentos de IA
        │     ├── Session S1.1: O que é IA
        │     └── Session S1.2: Ética e Limitações
        │
        ├── Course C2: Pesquisa e Revisão da Literatura com IA
        │     ├── Session S2.1 → Activity: Formular Problema
        │     │                    → Protocol: LIT-RL-01
        │     │                      → Activity ACT-001: Definir pergunta
        │     │                        ├── Tool: ChatGPT / Claude
        │     │                        └── Prompt: PRM-001
        │     ├── Session S2.2 → Activity: Estratégia de Busca
        │     ├── Session S2.3 → Activity: Avaliação de Fontes
        │     └── Session S2.4 → Activity: Síntese
        │           → Protocol: LIT-MC-01
        │
        ├── Course C3: Escrita Científica Assistida por IA
        │     └── ... (WRITE-ABS-01, WRITE-AR-01)
        │
        ├── Course C4: Projecto de Investigação com IA
        │     └── ... (DESIGN-PJ-01, METHOD-RM-01)
        │
        ├── Course C5: Análise de Dados com IA
        │     └── ... (DATA-DA-01, DATA-VIZ-01)
        │
        └── Course C6: Publicação e Comunicação
              └── ... (PUB-JR-01, COMM-AC-01)
```

---

## 8. Princípios de Separação

| Princípio                                   | Descrição                                                        |
|----------------------------------------------|------------------------------------------------------------------|
| **Protocolos não pertencem a programas.**    | Um protocolo é um activo permanente. Programas referenciam-no.   |
| **Competências não pertencem a programas.**  | Uma competência é universal. Programas avaliam-na.               |
| **Recipes não pertencem a programas.**       | Uma receita é reutilizável. Programas invocam-na.                |
| **Programas são instâncias temporais.**      | Um programa tem início, fim e público definidos.                 |
| **A plataforma sobrevive aos programas.**    | Se todos os programas forem arquivados, os activos permanecem.   |

---

## 9. Critérios de Aprovação

Esta RFC considera-se aprovada quando:

- [ ] A separação entre Plataforma (activos permanentes) e Academy (programas temporais) for aceite.
- [ ] Os 9 Business Objects e as suas definições forem validados.
- [ ] A introdução do conceito de **Recipe** (meta-protocolo) for aprovada.
- [ ] O grafo de relações for validado.
- [ ] A modelação da formação "IA Aplicada à Investigação Científica" for aceite como demonstração da arquitectura.
- [ ] Os 5 princípios de separação forem aprovados.

---

> *"A plataforma é o solo. Os programas são as colheitas. O solo permanece. As colheitas renovam-se."*
