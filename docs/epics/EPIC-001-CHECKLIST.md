# Epic 1: Artifact Domain Architecture

Este documento regista os passos de implementação para o Épico 1, divididos em micro-épicos por ordem de dependência. O progresso deve ser acompanhado assinalando com `[x]` as tarefas completadas.

## EPIC-001A — Foundation
- [x] Shared Kernel
- [x] Result Pattern
- [x] Domain Errors
- [x] Entity
- [x] AggregateRoot
- [x] ValueObject
- [x] UniqueEntityID
- [x] DomainEvent

> [!WARNING]
> **TRACK B SUSPENDED**
> O desenvolvimento dos micro-épicos 001B a 001E encontra-se temporariamente suspenso. A sua implementação apenas será retomada após o **Experience Freeze** (TRACK A), garantindo que o Domínio é modelado com base numa interface e fluxos (ex: RL-01) 100% estabilizados e validados.

## EPIC-001B — Protocol Domain
- [ ] Protocol
- [ ] Step
- [ ] PromptTemplate
- [ ] ValidationRule
- [ ] ToolDefinition

## EPIC-001C — Session Domain
- [ ] ResearchSession
- [ ] Workflow
- [ ] Variables
- [ ] Session State

## EPIC-001D — Artifact Domain
- [ ] Evidence
- [ ] Artifact
- [ ] ArtifactVersion
- [ ] EvidenceSet

## EPIC-001E — Infrastructure
- [ ] Repository Ports
- [ ] Mock Repositories
- [ ] Use Cases
- [ ] Factories
- [ ] Events
- [ ] Tests (Unit ➔ Contract ➔ Integration ➔ E2E)

