# RFC-005 — Learning Experience Architecture (LXA)

> **Versão:** 1.0
> **Status:** 🟡 DRAFT — aguarda revisão e aprovação
> **Dependência:** RFC-000 (Product Vision) · RFC-004 (Domain Model)
> **Última atualização:** Julho de 2026
> **Autor:** Egas Lemos

---

## 1. Contexto e Motivação

A RFC-004 estabeleceu que o verdadeiro produto do ResearchAI Hub não são os protocolos — são as **Competências**. No entanto, faltava definir a experiência concreta do utilizador: como ele descobre uma necessidade, como é guiado pela plataforma, como interrompe e retoma, e como a plataforma reconhece a evolução alcançada.

A **RFC-005** define a **Learning Experience Architecture (LXA)** — a arquitectura da experiência de aprendizagem do ponto de vista do utilizador. Não descreve componentes visuais. Não descreve frontend. Descreve o modelo conceptual da jornada, os percursos disponíveis e a forma como a plataforma mede progresso com maturidade e rigor.

---

## 2. Princípio Fundacional

> O utilizador **nunca** entra no ResearchAI Hub procurando uma ferramenta.
> O utilizador entra procurando **desenvolver uma competência científica**.

Toda a experiência é desenhada a partir desta premissa. A plataforma não é um catálogo de ferramentas com tutoriais; é um sistema de desenvolvimento profissional orientado por resultados de investigação.

---

## 3. A Jornada do Utilizador — Modelo Conceptual

A experiência completa de um utilizador no ResearchAI Hub segue uma cadeia causal de 8 fases:

```
┌──────────────┐
│ 1. NECESSIDADE│  O utilizador reconhece uma lacuna científica.
└──────┬───────┘
       ▼
┌──────────────┐
│ 2. COMPETÊNCIA│  A plataforma traduz a lacuna numa Competência formal.
└──────┬───────┘
       ▼
┌──────────────┐
│ 3. PERCURSO  │  A plataforma apresenta o Learning Path adequado.
└──────┬───────┘
       ▼
┌──────────────┐
│ 4. PROTOCOLO │  O utilizador entra no Protocolo recomendado.
└──────┬───────┘
       ▼
┌──────────────┐
│ 5. WORKFLOW  │  O utilizador executa as etapas metodológicas.
└──────┬───────┘
       ▼
┌──────────────┐
│ 6. STEP      │  Cada etapa envolve ferramentas, prompts e validação.
└──────┬───────┘
       ▼
┌──────────────┐
│ 7. RESULTADO │  O utilizador produz um artefacto concreto.
└──────┬───────┘
       ▼
┌──────────────────────┐
│ 8. COMPETÊNCIA       │  A competência é formalmente reconhecida
│    DESENVOLVIDA      │  pela plataforma.
└──────────────────────┘
```

Cada fase é **obrigatória no modelo conceptual** (embora o utilizador possa entrar directamente num protocolo se já souber o que procura). A plataforma deverá sempre permitir o acesso ao contexto completo da cadeia — de onde veio e para onde vai.

---

## 4. Fases da Experiência — Especificação

### 4.1 Fase 1 — Necessidade

O utilizador chega à plataforma com uma **necessidade real**:

- *"Preciso de fazer uma revisão da literatura para a minha tese."*
- *"Quero escrever um artigo científico."*
- *"Preciso de analisar os dados que recolhi."*

A plataforma deverá apresentar **pontos de entrada por necessidade**, não por ferramenta nem por tecnologia.

**Exemplos de necessidades mapeadas:**

| Necessidade do utilizador                        | Competência alvo                              |
|--------------------------------------------------|-----------------------------------------------|
| "Preciso de encontrar artigos sobre o meu tema"  | Pesquisa bibliográfica estruturada            |
| "Quero comparar estudos"                         | Análise comparativa de literatura             |
| "Preciso de escrever a metodologia"              | Redação metodológica científica               |
| "Quero saber se os meus dados fazem sentido"     | Análise e interpretação de dados              |
| "Preciso de preparar uma apresentação"           | Comunicação científica oral                   |
| "Quero submeter um artigo a uma revista"         | Processo de publicação científica             |

### 4.2 Fase 2 — Competência

A plataforma traduz a necessidade numa **Competência formal e mensurável** (conforme definido na RFC-004).

Cada Competência possui:

| Campo                   | Descrição                                                          |
|-------------------------|--------------------------------------------------------------------|
| Nome                    | Nome descritivo e claro                                            |
| Descrição               | O que o investigador será capaz de fazer após adquiri-la           |
| Indicadores de domínio  | Critérios objectivos que comprovam a aquisição                     |
| Nível de complexidade   | Fundamental · Intermédio · Avançado                                |
| Família taxonómica      | Código da família (RFC-002A): LIT, WRITE, DATA, etc.              |

### 4.3 Fase 3 — Percurso (Learning Path)

A plataforma sugere o **Learning Path** mais adequado ao perfil e à necessidade do utilizador. Os percursos são definidos na §5 desta RFC.

O utilizador pode:
- Aceitar o percurso sugerido.
- Explorar percursos alternativos.
- Entrar directamente num protocolo (bypass do percurso).

### 4.4 Fase 4 — Protocolo

O utilizador entra num Protocolo específico. A interface deverá comunicar imediatamente:

1. **O que vai fazer** — Objectivo do protocolo.
2. **O que vai precisar** — Ferramentas e tempo estimado.
3. **O que vai produzir** — Entregáveis concretos.
4. **Onde está no percurso** — Contexto dentro do Learning Path.

### 4.5 Fase 5 — Workflow

O Protocolo instancia o seu Workflow (conforme RFC-003). O utilizador vê:

- A etapa actual (Step activo).
- O progresso dentro do workflow.
- As etapas futuras (sem detalhe para evitar sobrecarga).

### 4.6 Fase 6 — Step

Cada Step segue o ciclo de vida definido na RFC-003 (Pending → Running → WaitingUser → Validating → Completed). A experiência dentro de cada Step é:

1. **Objectivo** — O que esta etapa pretende alcançar.
2. **Instrução** — O que o utilizador deve fazer.
3. **Ferramenta** — Qual ferramenta utilizar (com alternativas BYOA/BYOT).
4. **Prompt** — O prompt a copiar/adaptar, com variáveis preenchidas.
5. **Validação** — Critérios para confirmar que o output está correcto.
6. **Avançar** — Transição para o próximo Step.

### 4.7 Fase 7 — Resultado

Ao concluir o Workflow, o utilizador terá produzido um **artefacto concreto**:

| Protocolo       | Artefacto produzido                                |
|-----------------|-----------------------------------------------------|
| LIT-RL-01       | Tabela comparativa + revisão preliminar redigida    |
| LIT-SR-01       | Protocolo PRISMA + matriz de extracção de dados     |
| WRITE-AR-01     | Artigo científico estruturado                       |
| DESIGN-PJ-01    | Projecto de investigação formalizado                |
| DATA-DA-01      | Relatório de análise de dados                       |
| COMM-AC-01      | Apresentação científica preparada                   |

### 4.8 Fase 8 — Competência Desenvolvida

A plataforma reconhece formalmente a competência adquirida. Esta fase é o **fecho do ciclo** e o verdadeiro produto do ResearchAI Hub.

---

## 5. Learning Paths — Os Percursos Inaugurais

### 5.1 Percurso: Literatura Científica

| Campo          | Valor                                                                   |
|----------------|-------------------------------------------------------------------------|
| **Objectivo**  | Capacitar o investigador a pesquisar, avaliar e sintetizar literatura científica de forma sistemática. |
| **Competências** | Pesquisa booleana · Avaliação de fontes · Síntese crítica · Mapeamento bibliométrico · Revisão narrativa · Revisão sistemática |
| **Protocolos** | `LIT-RL-01` (Revisão da Literatura) → `LIT-MC-01` (Mapeamento Conceitual) → `LIT-SR-01` (Revisão Sistemática) |
| **Pré-requisitos** | Nenhum (percurso fundacional).                                      |
| **Resultados** | Tabela comparativa de estudos · Mapa conceitual · Revisão redigida · Protocolo PRISMA (SR) |

---

### 5.2 Percurso: Escrita Científica

| Campo          | Valor                                                                   |
|----------------|-------------------------------------------------------------------------|
| **Objectivo**  | Desenvolver competências de redação científica rigorosa, clara e publicável. |
| **Competências** | Estruturação de artigo · Paráfrase ética · Argumentação científica · Redação de abstract · Revisão linguística |
| **Protocolos** | `WRITE-ABS-01` (Abstract) → `WRITE-AR-01` (Artigo Científico) → `WRITE-TS-01` (Tese/Dissertação) |
| **Pré-requisitos** | Percurso "Literatura Científica" (recomendado).                     |
| **Resultados** | Abstract redigido · Artigo estruturado · Capítulos de tese                |

---

### 5.3 Percurso: Projeto de Investigação

| Campo          | Valor                                                                   |
|----------------|-------------------------------------------------------------------------|
| **Objectivo**  | Estruturar e planear uma investigação completa desde a ideia até ao projecto viável. |
| **Competências** | Formulação do problema · Definição de objectivos · Justificação · Planeamento temporal · Desenho metodológico |
| **Protocolos** | `DESIGN-PJ-01` (Projeto de Investigação) → `DESIGN-HP-01` (Formulação de Hipóteses) → `METHOD-RM-01` (Desenho Metodológico) |
| **Pré-requisitos** | Percurso "Literatura Científica" (obrigatório).                     |
| **Resultados** | Projecto de investigação formalizado · Cronograma · Proposta metodológica  |

---

### 5.4 Percurso: Análise de Dados

| Campo          | Valor                                                                   |
|----------------|-------------------------------------------------------------------------|
| **Objectivo**  | Organizar, tratar, analisar e visualizar dados empíricos de forma reproduzível. |
| **Competências** | Limpeza de dados · Análise estatística descritiva · Codificação qualitativa · Geração de gráficos · Interpretação de resultados |
| **Protocolos** | `DATA-DA-01` (Análise de Dados) → `DATA-VIZ-01` (Visualização de Dados) |
| **Pré-requisitos** | Percurso "Projeto de Investigação" (recomendado).                   |
| **Resultados** | Dataset tratado · Relatório estatístico · Gráficos publicáveis           |

---

### 5.5 Percurso: Publicação

| Campo          | Valor                                                                   |
|----------------|-------------------------------------------------------------------------|
| **Objectivo**  | Navegar no ecossistema de publicações científicas e maximizar as hipóteses de aceitação. |
| **Competências** | Selecção de revista · Formatação segundo normas · Redação de cover letter · Resposta a revisores · Compreensão de peer-review |
| **Protocolos** | `PUB-JR-01` (Selecção de Journal) → `PUB-RR-01` (Resposta a Revisores) |
| **Pré-requisitos** | Percurso "Escrita Científica" (obrigatório).                        |
| **Resultados** | Artigo formatado para submissão · Cover letter · Carta de resposta a revisores |

---

### 5.6 Percurso: Comunicação Científica

| Campo          | Valor                                                                   |
|----------------|-------------------------------------------------------------------------|
| **Objectivo**  | Preparar o investigador para comunicar resultados em contextos académicos e públicos. |
| **Competências** | Design de apresentações · Argumentação oral · Poster científico · Pitch de investigação · Divulgação para não-especialistas |
| **Protocolos** | `COMM-AC-01` (Apresentação Académica) → `COMM-PS-01` (Poster Científico) → `IMPACT-SC-01` (Comunicação Científica) |
| **Pré-requisitos** | Pelo menos um protocolo completo de qualquer percurso.              |
| **Resultados** | Apresentação preparada · Poster científico · Texto de divulgação          |

---

## 6. Gestão da Sessão do Utilizador

### 6.1 Iniciar uma Sessão

O utilizador pode iniciar de **três formas**:

| Modo de entrada      | Descrição                                                               |
|----------------------|-------------------------------------------------------------------------|
| **Por necessidade**  | Declara o que precisa de fazer. A plataforma sugere Competência + Percurso + Protocolo. |
| **Por percurso**     | Navega directamente para um Learning Path e escolhe por onde começar.   |
| **Por protocolo**    | Acede directamente a um protocolo específico (utilizadores avançados).  |

### 6.2 Interromper uma Sessão (Suspend)

O utilizador pode interromper a qualquer momento. O sistema:

1. Serializa o `StateSnapshot` (RFC-003) com o estado de todos os Steps.
2. Preserva todos os outputs já produzidos.
3. Regista o timestamp e a fase exacta da interrupção.
4. No MVP: armazena em LocalStorage.
5. No futuro (v4): sincroniza com base de dados remota.

### 6.3 Retomar uma Sessão (Resume)

Quando o utilizador regressa:

1. A plataforma detecta sessões pendentes.
2. Apresenta um resumo: *"Deixaste a Revisão da Literatura na Etapa 3 — Avaliação de Fontes."*
3. O utilizador escolhe retomar ou abandonar.
4. Se retomar: o Runtime hidrata o StateSnapshot e posiciona a interface exactamente no ponto de interrupção.

### 6.4 Concluir uma Sessão

O encerramento ocorre quando:

1. O último Step do Workflow atinge o estado `Completed`.
2. A Checklist do Protocolo é validada a 100%.
3. O Learning Result é gerado e registado.
4. A Competência é marcada como **Adquirida**.

---

## 7. Medição de Evolução — Filosofia

### 7.1 Princípio Anti-Gamificação

> O ResearchAI Hub **nunca** utilizará gamificação infantil.
> Nada de estrelas, pontos, badges decorativos, leaderboards ou streaks.

A razão é simples: o público são **investigadores, docentes e profissionais**. A motivação é **intrínseca** (produzir investigação de qualidade), não extrínseca (coleccionar troféus digitais).

### 7.2 O que a Plataforma Mede

A evolução do utilizador é representada exclusivamente através de **Competências Desenvolvidas** — indicadores concretos e verificáveis.

| Métrica                         | Descrição                                                          |
|----------------------------------|--------------------------------------------------------------------|
| **Competências Adquiridas**     | Lista de competências formalmente reconhecidas pela plataforma     |
| **Protocolos Concluídos**       | Quantos protocolos foram executados do início ao fim               |
| **Artefactos Produzidos**       | Lista de entregáveis concretos gerados (tabelas, artigos, etc.)    |
| **Percursos Activos**           | Learning Paths em que o utilizador está inscrito                   |
| **Percursos Concluídos**        | Learning Paths finalizados com todas as competências adquiridas    |
| **Tempo Investido**             | Horas acumuladas em sessões de aprendizagem                       |

### 7.3 Evidência de Competência

Cada competência adquirida é sustentada por **evidência verificável**:

```
┌──────────────────────────────┐
│   Competência Adquirida      │
│                              │
│   "Pesquisa Bibliográfica    │
│    Estruturada"              │
│                              │
│   Evidência:                 │
│   ├─ Protocolo LIT-RL-01    │
│   │  concluído em 12/07/2026 │
│   ├─ Checklist validada 100% │
│   ├─ Artefacto: Tabela       │
│   │  comparativa (15 estudos)│
│   └─ Tempo: 6h 30min         │
│                              │
│   Nível: Intermédio          │
└──────────────────────────────┘
```

Não há "nota". Há **completude verificável**. Ou a competência foi adquirida (todos os critérios satisfeitos) ou está em progresso.

### 7.4 Perfil de Investigador

A acumulação de competências constrói um **Perfil de Investigador** — um mapa visual e semântico de tudo o que o utilizador já domina e do que falta desenvolver.

```
Perfil de Investigador
──────────────────────────────────────────

Literatura Científica     ████████████░░  85%
  ✔ Pesquisa bibliográfica
  ✔ Avaliação de fontes
  ◻ Revisão sistemática

Escrita Científica        ████░░░░░░░░░░  30%
  ✔ Redação de abstract
  ◻ Artigo científico
  ◻ Tese/Dissertação

Projeto de Investigação   ░░░░░░░░░░░░░░   0%
  ◻ Formulação do problema
  ◻ Desenho metodológico

Análise de Dados          ░░░░░░░░░░░░░░   0%
  ◻ Análise descritiva
  ◻ Visualização
```

Este perfil **não é gamificação**. É um **mapa de competências científicas** — o mesmo conceito utilizado em frameworks profissionais de desenvolvimento de carreira.

---

## 8. Mapa de Dependências entre Percursos

Os percursos não são ilhas. Possuem dependências lógicas que reflectem a sequência natural da investigação:

```
                    ┌─────────────────────┐
                    │ Literatura          │
                    │ Científica          │
                    │ (Fundacional)       │
                    └─────────┬───────────┘
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
        ┌────────────┐ ┌───────────┐ ┌──────────────┐
        │ Escrita    │ │ Projeto de│ │ Comunicação  │
        │ Científica │ │Investigação│ │ Científica   │
        └─────┬──────┘ └─────┬─────┘ └──────────────┘
              │              │
              ▼              ▼
        ┌───────────┐ ┌──────────┐
        │ Publicação│ │ Análise  │
        │           │ │ de Dados │
        └───────────┘ └──────────┘
```

| Percurso                  | Pré-requisito obrigatório     | Pré-requisito recomendado     |
|---------------------------|-------------------------------|-------------------------------|
| Literatura Científica     | —                             | —                             |
| Escrita Científica        | Literatura Científica         | —                             |
| Projeto de Investigação   | Literatura Científica         | —                             |
| Análise de Dados          | —                             | Projeto de Investigação       |
| Publicação                | Escrita Científica            | —                             |
| Comunicação Científica    | —                             | Pelo menos 1 protocolo        |

---

## 9. Princípios Imutáveis da Experiência

| #  | Princípio                                                                    |
|----|------------------------------------------------------------------------------|
| 1  | **Orientação por necessidade.** O utilizador nunca procura ferramentas.      |
| 2  | **Clareza imediata.** Cada ecrã responde: *"O que devo fazer agora?"*        |
| 3  | **Progresso verificável.** Competências, não pontos.                         |
| 4  | **Interrupção segura.** Qualquer sessão pode ser pausada e retomada.         |
| 5  | **Resultado concreto.** Cada protocolo termina com um artefacto tangível.    |
| 6  | **Respeito pelo utilizador.** Sem gamificação infantil, sem dark patterns.   |
| 7  | **Autonomia progressiva.** A plataforma guia no início, liberta com a experiência. |
| 8  | **Método sobre ferramenta.** A IA muda, o método científico permanece.       |

---

## 10. Critérios de Aprovação

Esta RFC considera-se aprovada quando:

- [ ] A jornada de 8 fases (Necessidade → Competência Desenvolvida) for aceite.
- [ ] Os 6 Learning Paths inaugurais e as suas definições forem validados.
- [ ] Os 3 modos de entrada (por necessidade, percurso, protocolo) forem aprovados.
- [ ] O modelo Suspend/Resume da sessão for aceite.
- [ ] A filosofia anti-gamificação e o modelo de Competências Desenvolvidas for aprovado.
- [ ] O mapa de dependências entre percursos for validado.
- [ ] Os 8 princípios imutáveis da experiência forem aceites.

---

> *"No ResearchAI Hub, o investigador não colecciona badges — constrói competências. Não soma pontos — produz conhecimento."*
