# RFC-DM-001: Domain Model

**Status**: Draft
**Layer**: Domain

Este documento formaliza as entidades basilares da plataforma ResearchAI Hub, assegurando que os protocolos científicos sejam orientados a dados (Data-Driven) e que as entidades tenham identidades únicas e imutáveis.

## 1. Domain Identity Contract
Toda a entidade de domínio deve possuir um identificador imutável. Nunca devem ser utilizados índices ou posições relativas na lógica de negócio.

- **ProtocolId**: ex: `RL-01`
- **StepId**: ex: `RL01-STEP-003` (Nunca `step = 3`)
- **ArtifactId**: ex: `ART-5f8e9a2`
- **EvidenceId**: ex: `EVD-2b1d7c4`
- **PromptId**: ex: `PRM-8a4d2e1`
- **SessionId**: ex: `SES-9c3f1b0`
- **WorkspaceId**: ex: `WS-7d2a5e9`

## 2. Protocol Schema Contract
Um protocolo é estritamente representação de dados, nunca código acoplado à Interface Gráfica. A adição de um protocolo novo requer apenas a criação de um schema.

```json
{
  "protocol": "RL-01",
  "steps": [],
  "artifacts": [],
  "validators": [],
  "tools": [],
  "prompts": []
}
```

## 3. Step Contract
Todo o *Step* (passo) do protocolo deve possuir obrigatoriamente a seguinte estrutura para garantir consistência operacional:

- `Metadata` (Identidade, Título, etc.)
- `Objective`
- `Instructions`
- `Research Profile Schema` (O que era anteriormente chamado "Contexto")
- `Prompt Template`
- `Evidence Schema` (Definição dos dados capturados)
- `Artifact Schema` (O que é produzido)
- `Validation Rules` (Regras para aceitação)
- `Estimated Time`
- `Completion Rules`

## 4. Tool Adapter Contract
As ferramentas (ChatGPT, Gemini, Claude, Local LLMs, etc.) são abstratas para o Sistema Operativo. A UI e a Camada de Aplicação comunicam estritamente através da interface `ToolAdapter`.

```typescript
interface ToolAdapter {
  supportsPrompt(): boolean;
  execute(prompt: Prompt): Promise<ExecutionResult>;
  supportsUpload(): boolean;
  supportsStreaming(): boolean;
  supportsArtifacts(): boolean;
}
```

## 5. Knowledge Graph Contract
O conhecimento gerado pelo investigador forma um grafo lógico e semântico.
`Evidence` ➔ *supports* ➔ `Artifact` ➔ *supports* ➔ `Research Project` ➔ *belongs to* ➔ `Knowledge Base`.
Este contrato estabelece as fundações para pesquisa semântica, RAG, citações e agentes autónomos.
