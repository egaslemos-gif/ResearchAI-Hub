# RFC-EX-001 — Experience Layer Architecture & Freeze Contract

**Version**: `1.0.0`
**Status**: `Candidate`

Este documento atua como um **Documento Fundacional** para o desenvolvimento contínuo da interface e estabelece a arquitetura visual, estrutural e comportamental (Experience Layer) do projeto. O seu propósito principal é criar uma base sólida, inalterável na sua essência arquitetural, escalável e agnóstica para todos os protocolos científicos atuais e futuros (RL-01, SR-01, PJ-01, etc.).

---

## 1. Interaction Contract
Todo o componente interativo deverá obedecer a um ciclo explícito e consistente: `Idle` -> `Hover` -> `Focus` -> `Action` -> `Loading` -> `Success` -> `Idle`.

## 2. Accessibility Contract
Garantir foco visível, navegação por teclado, labels adequadas (aria-label), contraste WCAG AA, tamanhos mínimos de toque (≥ 44px) e leitura limpa por Screen Readers.

## 3. Design Token Contract
Proibido o uso de valores de layout/cor "hardcoded". Obrigatório o uso de *Design Tokens* (`var(--color-surface)`, `var(--spacing-lg)`).

## 4. Research Artifact Contract
O passo assume o objetivo de gerar um artefacto e deve expor esse facto e o seu estado explícito no topo. 
Exemplo: **Artefacto deste passo**: `Tema da Investigação` | **Estado**: `Em construção` -> `✓ Concluído`.

## 5. Protocol Independence Contract
Os dados derivam inteiramente do protocolo (schema) sem hardcoding de `RL-01`, `ChatGPT` ou literais na UI.
O frontend apenas consome a abstração: `Protocol` -> `Step` -> `Prompt` -> `Artifact` -> `Tool`.

## 6. Step Contract
A estrutura estrita e imutável do passo é: `Metadata` -> `Objective` -> `Instructions` -> `Research Context` -> `Primary Artifact (Estado)` -> `PromptCard` -> `Actions` -> `Expected Output` -> `Checklist` -> `Completion Validation`.

## 7. PromptCard Architecture
Desmembramento visual em componentes pequenos e independentes: `PromptCard` (Container pai utilizando o `ExecutionGrid`) contendo -> `PromptHeader`, `ResearchStepTimeline` (recebe estado), `PromptViewer`, `PromptActions`, `PromptFeedback`.

## 8. Prompt Engine Contract
Função pura de domínio isolada (`PromptEngine`). É ela que alimenta tanto o `PromptViewer` quanto a cópia direta para o `Clipboard` (`ResolvedPrompt`). Nunca se extrai texto a copiar do DOM (`innerText`).

## 9. Layout & Vertical Rhythm Contract
Fluxo vertical contínuo num layout confortável (ex: `max-width: 980px`). Sem `position: absolute` em conteúdos primários, sem alturas fixas, margens negativas ou overflow escondido. Gaps regulares de acordo com os design tokens. Usa a grelha `ExecutionGrid` estritamente na divisão `Prompt/Actions`.

## 10. Performance Contract
Para suportar prompts de até 1500 linhas: nenhuma interação local (expandir, executar, copiar) pode provocar re-renders totais da página, do Sidebar, do Header ou do Workspace. Atualizações confinadas ao `PromptCard`.

## 11. Future Extension Contract
Integrações futuras (IA integrada, Histórico, Comentários) serão feitas exclusivamente via `Slots`, `Hooks`, `Composition` e `Providers`. A estrutura base não deve ser adulterada para "encaixar" uma feature.

## 12. Design Freeze Contract
*A arquitetura visual e estrutural da Experience Layer fica congelada.* Melhorias de acessibilidade, correções de defeitos, otimizações de desempenho e adaptações necessárias para novos protocolos continuam permitidas **desde que não violem os contratos desta RFC**. Preferências visuais injustificadas (ex: mexer em tamanhos de fontes sem resolver um erro) serão rejeitadas no MVP.

## 13. Domain/UI Boundary Contract
Os componentes da Experience Layer **não podem conter regras de negócio**. Existe uma barreira rígida:
* **Domain Layer**: Protocolos, Passos, `PromptEngine`, `ResearchSession`, Validation Rules, State Machine.
* **Experience Layer**: Renderização, Navegação, Feedback, Layout, Interações.
É proibido calcular regras científicas, decidir transições complexas de estado ou resolver variáveis do Prompt nos componentes React.

## 14. Component API Contract
Os componentes visuais devem ser "Dumb Components".
O `PromptCard`, por exemplo, recebe `ResolvedPrompt`, `PromptState`, e `Callbacks`. Não deve importar `useResearchSession`, nem manipular contexto/router.

## 15. Naming Convention Contract
Nomenclatura congelada:
* **Containers** (Têm acesso a estado): `PromptCard`, `StepPage`, `ResearchWorkspace`.
* **Presentation** (Dumb): `PromptViewer`, `PromptHeader`, `PromptTimeline`, `PromptActions`.
* **Hooks**: `usePrompt`, `useResearchSession`.
* **Providers**: `ResearchSessionProvider`, `WorkspaceProvider`.

## 16. Visual Regression Contract
Toda a alteração futura na Experience Layer deverá gerar screenshots de comparação automáticos para Desktop, Tablet e Mobile contra a versão FROZEN, de forma a captar overlaps subtis e erros colapsáveis.

## 17. Developer Experience (DX) Contract
Qualquer novo protocolo **deverá conseguir reutilizar a Experience Layer sem alterar nenhum componente existente**. A implementação de um novo protocolo (ex: SR-01) apenas requer a definição do schema de dados. Nenhum componente React é adicionado ou alterado.

## 18. Testing Pyramid Contract
Obrigatória a existência de testes nos três níveis:
* **Unitários**: `PromptEngine`, State Machine, Validation Rules.
* **Integração**: `ResearchSession` interactuando com `PromptCard` e `StepAdvance`.
* **E2E**: Fluxo de utilizador ininterrupto (ex: RL-01 do Passo 1 → Passo 10).

## 19. RFC Governance Contract
Toda a alteração que viole qualquer contrato desta RFC deverá obrigatoriamente:
* Justificar o motivo da alteração;
* Identificar quais os contratos impactados;
* Indicar os riscos de regressão;
* Ser documentada através de uma nova RFC ou ADR.
Nenhuma alteração estrutural pode ser implementada diretamente no código sem que a documentação arquitetural seja atualizada primeiro.

---

## Related Documents
* RFC-DM-001 — Domain Model *(Pendente)*
* RFC-DS-001 — Design System *(Pendente)*
* RFC-KP-001 — Knowledge Platform *(Pendente)*
* RFC-AI-001 — AI Integration *(Pendente)*
* ADR-001 — Architecture Principles *(Pendente)*

---

## Experience Freeze Validation (Auditoria Final)
A Experience Layer será submetida à seguinte bateria obrigatória. Somente após passagem positiva, esta RFC transitará para **Status: Frozen**.
* [ ] Auditoria Responsiva global (320, 375, 768, 1024, 1440, 1920)
* [ ] React Profiler (rastreamento de re-renders no Sidebar/Header isolados do Prompt)
* [ ] Auditoria Lighthouse (Performance, Acessibilidade, Melhores Práticas)
* [ ] Navegação integral por teclado exclusiva
* [ ] Cópia do Prompt extraída cirurgicamente do `PromptEngine` (sem templates ou Markdown quebrado)
* [ ] Fluxo Teste Completo (End-to-End) do RL-01 (Passo 1 ao 10).
