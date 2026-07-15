# RFC-003 — Protocol Runtime Specification

> **Versão:** 1.0
> **Status:** 🟡 DRAFT — aguarda revisão e aprovação
> **Dependência:** RFC-001 (Product Constitution) · RFC-002 (Knowledge Architecture)
> **Última atualização:** Julho de 2026
> **Autor:** Egas Lemos

---

## 1. Contexto e Motivação

A [RFC-001](RFC-001-Product-Constitution.md) definiu o **Research Protocol OS (RPOS)**, onde os protocolos são executados por um Kernel centralizado. No entanto, faltava definir a **mecânica exata** dessa execução. 

Para que o ResearchAI Hub funcione como um assistente metodológico resiliente, não pode ser um mero renderizador de texto ou uma lista de tarefas (checklist) estática. O sistema deve gerir fluxos de trabalho longos, reter progresso de forma persistente e lidar com desvios na jornada do utilizador.

A **RFC-003** define formalmente como o Runtime Engine executa os protocolos, estabelecendo o princípio de **Máquina de Estados (State Machine)**.

---

## 2. Princípio Fundacional: Protocolo como Máquina de Estados

> O Runtime **nunca** executa um protocolo como uma lista linear de passos. O Runtime interpreta e avalia **estados**.

Cada protocolo é uma Máquina de Estados Finita (Finite State Machine). A execução avança não por "passar para a página seguinte", mas sim pela transição de um estado válido para outro, despoletada por eventos concretos.

Isto permite que:
1. Qualquer protocolo possa ser pausado e retomado.
2. A validação de outputs bloqueie a progressão de forma segura.
3. Decisões do utilizador ramifiquem a jornada de forma determinística.

---

## 3. Elementos do Runtime

O Runtime Engine interpreta cinco componentes fundamentais durante a execução:

| Componente     | Função no Runtime                                                            |
|----------------|-------------------------------------------------------------------------------|
| **State**      | O estado actual do Step (ex: `Running`, `WaitingUser`).                      |
| **Transitions**| As regras que definem como passar de um estado para o próximo (ex: `Pending -> Running`). |
| **Events**     | Ações explícitas (humanas ou do sistema) que forçam a avaliação de uma Transição. |
| **Validation** | O conjunto de regras de negócio (Critérios) avaliadas antes da transição para `Completed`. |
| **Outputs**    | Os artefactos (texto, ficheiros, JSON) gerados num Step, preservados no State da Sessão. |

---

## 4. Ciclo de Vida de um Step

Cada etapa (`Step`) do protocolo obedece a um ciclo de vida rigoroso, sendo obrigado a assumir um dos seguintes **5 Estados** (simplificação introduzida no MVP face à especificação teórica original):

### 4.1 Estados (MVP)

1. **`Draft`**: Estado inicial. O investigador está a consultar a documentação metodológica, a instrução e o contexto do passo, preparando a execução ou editando o editor manual.
2. **`ContextConfirmed`**: O investigador compreendeu o objectivo do passo e confirmou a sua preparação, estando pronto para iniciar a orquestração ou execução.
3. **`PromptGenerated`**: O Workspace avaliou o manifesto, substituiu as variáveis de contexto (`{{article_text}}`, `{{research_question}}`, etc.) e instanciou um prompt determinístico pronto a ser executado.
4. **`PromptExecuted`**: A instrução foi executada pelo agente de IA (via integração directa ou externa). A resposta bruta foi gerada e, se aplicável, processada pelos extractores de artefactos.
5. **`EvidenceValidated`**: O utilizador aceitou o artefacto gerado (ou editou o mesmo) e este foi persistido no `WorkspaceStore`. Este estado desbloqueia os passos subsequentes.

### 4.2 Matriz de Transições de Estado

O diagrama seguinte ilustra as transições válidas no ciclo de vida de um Step.

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> ContextConfirmed : Preparação Concluída
    
    ContextConfirmed --> PromptGenerated : Gerar Instrução
    
    PromptGenerated --> PromptExecuted : Executar IA
    PromptGenerated --> Draft : Voltar Atrás / Editar
    
    PromptExecuted --> EvidenceValidated : Aceitar & Guardar
    PromptExecuted --> PromptGenerated : Nova Execução (Retry)
    
    EvidenceValidated --> [*]
```

**Exemplo Prático de Fluxo (MVP):**
```
Draft → (lê a teoria e valida as variáveis) 
ContextConfirmed → (clica em preparar) 
PromptGenerated → (lê o prompt avançado e clica em Executar) 
PromptExecuted → (recebe a resposta, lê o JSON) 
EvidenceValidated → (clica em Aceitar e Guardar) 
Completed (avança de passo)
```

> **Nota Arquitetural:** O modelo original prevê 8 estados (incluindo `Skipped` e `Cancelled`), necessários para `Decision Nodes` e branching (V2). A implementação MVP foca-se exclusivamente na pipeline sequencial (Linear Flow).

---

## 5. Decision Nodes (Ramificação)

Nem todos os protocolos são lineares. O Runtime suporta **Decision Nodes** (Nós de Decisão), representados por etapas que avaliam variáveis ou inputs e alteram o estado de outros Steps futuros.

**Exemplo de Execução de um Decision Node:**
- **Pergunta**: *"Existe literatura suficiente após a pesquisa inicial?"*
- **Transição A (Sim)**: O Step actual vai para `Completed` e o Step `Refinar Pesquisa` é marcado como `Skipped`. O fluxo avança para `Análise Temática`.
- **Transição B (Não)**: O Step actual vai para `Completed`, o Step `Refinar Pesquisa` passa de `Pending` para `Running`.

---

## 6. Eventos Internos do Runtime

Para garantir a total rastreabilidade, todas as mudanças de estado são provocadas por **Eventos**. O EventBus (Camada 1, RFC-001) emite e regista estes eventos:

| Evento                 | Acionador / Significado                                                       |
|------------------------|-------------------------------------------------------------------------------|
| `UserInput`            | O utilizador introduziu dados (texto, selecção) num formulário/interface.     |
| `ToolExecuted`         | O utilizador indicou que utilizou a ferramenta (ex: abriu o ChatGPT).         |
| `PromptGenerated`      | O sistema processou o `PromptEngine` e exibiu o prompt final com variáveis.   |
| `ValidationPassed`     | O mecanismo de validação (manual ou automático) confirmou o critério do Step. |
| `ValidationFailed`     | O output não atendeu aos requisitos (redireciona para correção/WaitingUser).  |
| `Timeout`              | Limite de tempo excedido a aguardar um callback de sistema externo.           |
| `Cancel`               | O utilizador interrompeu explicitamente o protocolo em andamento.             |

---

## 7. Persistência e Interrupção (Resume/Suspend)

O objectivo supremo desta arquitectura baseada em Estados é permitir que **qualquer protocolo seja interrompido e retomado posteriormente**, mesmo numa versão totalmente estática (MVP sem base de dados backend).

### 7.1 Mecanismo de Serialização
Como o Runtime é impulsionado apenas pelo estado atual, a totalidade da execução pode ser preservada. 

A cada emissão de um evento que altere o Estado de um Step, o Runtime exporta o **StateSnapshot**.

O `StateSnapshot` contém:
1. ID do Protocolo.
2. Dicionário de Steps com os seus Estados (ex: `{"STP-001": "Completed", "STP-002": "WaitingUser"}`).
3. Outputs armazenados (`{"STP-001_output": "Pergunta de Investigação X"}`).

No MVP estático, este `StateSnapshot` é armazenado no **LocalStorage** do browser. Quando o utilizador regressa, o Runtime hidrata a Máquina de Estados e restabelece a UI exactamente no ponto da interrupção.

---

## 8. Critérios de Aprovação

Esta RFC considera-se aprovada quando:

- [ ] O modelo de Máquina de Estados for aceite como base do Runtime.
- [ ] A lista de 8 Estados do ciclo de vida for validada.
- [ ] O fluxo de transições (Diagrama/Matriz) for aprovado.
- [ ] O mecanismo de nós de decisão (Decision Nodes) for aceite.
- [ ] O catálogo inicial de Eventos for validado.
- [ ] O modelo de serialização (StateSnapshot) para resumir protocolos for aprovado.

---

> *"No ResearchAI Hub, a investigação não avança porque se mudou de página, avança porque se cumpriu um estado. O método científico exige previsibilidade."*
