# ADR-007 — Introdução da Entidade Activity

> **Data:** Julho de 2026
> **Status:** Aceite
> **Afecta:** RFC-002 (Knowledge Architecture) · RFC-003 (Protocol Runtime) · RFC-004 (Domain Model)

---

## Contexto

As RFCs 002, 003 e 004 definiram que um Protocolo contém um Workflow, que por sua vez contém **Steps**. O Step era a menor unidade executável pelo Runtime.

Na prática, porém, a granularidade de um Step revelou-se ambígua: por vezes representava uma micro-tarefa técnica (ex: "copiar o prompt"), outras vezes representava uma macro-tarefa pedagógica (ex: "Definir o Problema de Investigação"). Esta ambiguidade compromete:

- A clareza para o utilizador (o que é "um passo"?).
- A modelação do Runtime (que nível de estado gerir?).
- A medição de progresso (quando contar como "feito"?).

---

## Decisão

Introduz-se uma nova entidade de domínio: **Activity**.

A **Activity** passa a ser a **menor unidade executável pelo Runtime** do ponto de vista do utilizador. Os Protocolos deixam de ser compostos directamente por Steps. Passam a ser compostos por **Activities**.

As Activities poderão, internamente, conter vários **Steps técnicos** (micro-instruções invisíveis ao utilizador que o Runtime processa sequencialmente dentro da Activity).

**Nova hierarquia:**

```
Protocol
  └── Workflow
        └── Activity    ← nova camada (visível ao utilizador)
              └── Step  ← agora é micro-instrução interna (invisível)
```

---

## Schema da Activity

Toda Activity deverá possuir obrigatoriamente os seguintes campos:

```json
{
  "id": "",
  "objective": "",
  "instruction": "",
  "tool": "",
  "prompt": "",
  "validation": {},
  "evidence": {},
  "outputs": []
}
```

| Campo          | Tipo       | Descrição                                                               |
|----------------|------------|-------------------------------------------------------------------------|
| `id`           | `string`   | Identificador único (ex: `PRT-001.WFL-001.ACT-001`)                    |
| `objective`    | `string`   | O que esta actividade pretende alcançar                                 |
| `instruction`  | `string`   | Instrução clara e accionável para o utilizador                          |
| `tool`         | `string`   | Referência ao Knowledge Object da ferramenta recomendada (TOL-xxx)      |
| `prompt`       | `string`   | Referência ao Knowledge Object do prompt associado (PRM-xxx)            |
| `validation`   | `object`   | Critérios que determinam se o output é aceitável                        |
| `evidence`     | `object`   | Tipo de evidência que comprova a execução (screenshot, texto, ficheiro) |
| `outputs`      | `array`    | Lista de artefactos produzidos pela actividade                          |

---

## Implicações

### Para o Knowledge Architecture (RFC-002)

Um novo tipo de Knowledge Object é adicionado ao catálogo:

| #  | Tipo         | Código | Descrição                                                   |
|----|--------------|--------|-------------------------------------------------------------|
| 13 | **Activity** | `ACT`  | Menor unidade executável do ponto de vista do utilizador     |

O tipo `Step` (`STP`) permanece como Knowledge Object, mas o seu papel muda: passa de "unidade visível" para "micro-instrução interna de uma Activity".

### Para o Protocol Runtime (RFC-003)

O ciclo de vida de 8 estados (Pending → Running → WaitingUser → Validating → Completed → Skipped → Cancelled → Error) aplica-se agora à **Activity**, não ao Step.

Os Steps internos de uma Activity são processados pelo Runtime de forma transparente, sem exposição ao utilizador.

### Para o Domain Model (RFC-004)

A Activity integra-se como Business Object de execução prática, posicionando-se entre o Workflow e o antigo Step:

| Antes                          | Agora                                          |
|--------------------------------|-------------------------------------------------|
| Workflow → Step → Tool/Prompt  | Workflow → Activity → Step (interno) → Tool/Prompt |

### Para a Convenção de IDs (RFC-002 §5)

Novo formato de ID composto:

| ID                               | Descrição                                        |
|----------------------------------|--------------------------------------------------|
| `PRT-001.WFL-001.ACT-001`       | Primeira Activity do workflow do protocolo RL-01 |
| `PRT-001.WFL-001.ACT-001.STP-001` | Primeiro Step interno da Activity              |

---

## Consequências

- **Positivas**: Clareza para o utilizador (uma Activity = uma tarefa significativa). Flexibilidade para o Runtime (Steps internos invisíveis). Medição de progresso mais precisa.
- **Negativas**: Acrescenta um nível à hierarquia. Requer actualização dos schemas de protocolo existentes (ainda vazios, impacto zero).

---

## Alternativas Consideradas

1. **Manter apenas Steps com atributo de visibilidade.** Rejeitada por introduzir ambiguidade semântica no modelo.
2. **Renomear Step para Activity.** Rejeitada por perder a utilidade de ter micro-instruções internas.
3. **Duas camadas (Activity + Step).** Aceite — combina clareza pedagógica com granularidade técnica.

---

> *"O utilizador vê Activities. O Runtime processa Steps. A separação protege a experiência sem sacrificar o controlo."*
