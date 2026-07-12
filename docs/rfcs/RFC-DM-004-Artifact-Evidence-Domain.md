# RFC-DM-004: Artifact & Evidence Domain

**Status**: Draft
**Layer**: Domain

Este documento formaliza as duas principais unidades de produção de conhecimento da plataforma: *Evidence* e *Artifact*.

## 1. Evidence Lifecycle & Repository
Nem toda a resposta gerada por uma IA deve tornar-se numa evidência. A evidência carece de curadoria pelo investigador.

**Evidence Lifecycle:**
`Captured` ➔ `Reviewed` ➔ `Accepted` ➔ `Linked` (associada a um artefacto) ➔ `Archived`

**Evidence Repository Architecture (DDD):**
Para garantir escalabilidade, a infraestrutura divide as responsabilidades de acesso a dados:
`Evidence Store` (DB) ➔ `Evidence Repository` (Domain Access) ➔ `Evidence Services` (Domain Logic)

## 2. Artifact Lifecycle
Os Artefactos representam os grandes blocos de construção da investigação científica.

**Artifact Lifecycle:**
`Draft` ➔ `Generated` ➔ `Validated` ➔ `Approved` ➔ `Published` ➔ `Archived`

## 3. Artifact Version Contract
Sempre que um artefacto é gerado ou atualizado, ele fá-lo através de uma versão explícita, mantendo a proveniência dos dados intacta. O modelo de versionamento assegura:

`Artifact` ➔ `Version` ➔ `Evidence Set` ➔ `Timestamp` ➔ `Prompt Hash` ➔ `LLM Metadata`

Isto garante que um artefacto produzido amanhã saiba exatamente qual foi o prompt que o instigou e qual a evidência que o fundamenta.
