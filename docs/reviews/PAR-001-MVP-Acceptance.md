# PAR-001 — Product Acceptance Review (MVP)

> **Versão:** 1.0
> **Data:** Julho de 2026
> **Âmbito:** Vertical Slice RL-01 — Homepage → Competência → Passos → Ferramentas → Prompts → Checklist → Conclusão
> **Decisão do Product Review Board:** ✅ **MVP APPROVED WITH FINAL ADJUSTMENTS**
> **Última revisão antes da publicação na Vercel.**

---

## Sumário executivo

O MVP é coerente, focado e cumpre a promessa Content-First e de linguagem natural. A
experiência é fluida e completável por um docente sem formador. A revisão identificou
**2 melhorias de prioridade Alta** (baixo esforço, alto impacto), aprovadas para implementação
imediata, e um conjunto de polimentos Média/Baixa remetidos para o roadmap do Beta.

**Pontos fortes a preservar:** consistência visual (tokens, dark mode, Lucide), rodapé honesto
"MVP · Formação", checklist "Rigor e Ética" e a Conclusão que reforça as regras críticas.

---

## 1 · UX Review

| ID | Prioridade | Achado | Impacto | Esforço | Justificação |
|----|-----------|--------|---------|---------|--------------|
| UX-1 | Média | Dupla acção primária na Homepage (CTA do hero + botão do cartão em destaque apontam ao mesmo sítio). | Leve hesitação. | Baixo | "Uma acção primária por ecrã". |
| UX-2 | Média | Passo 10 ("Validar com Checklist Final") seguido da página Checklist — dois momentos "checklist". | Ambiguidade no fecho. | Baixo | Clarificar a transição. |
| UX-3 | Média | Progresso só incrementa em "Concluir e avançar"; saltar passos deixa anteriores por marcar. | Barra pode não refletir o estado real. | Baixo–Médio | Fiabilidade do progresso. |
| UX-4 | Média | Falta micro-ligação entre "Abrir ChatGPT" e "Copiar prompt". | Docente novato pode não perceber a sequência. | Baixo | Reduzir hesitação no passo crítico. |
| UX-5 | Baixa | Sem breadcrumb multi-nível. | Baixo (um só percurso). | Médio | Relevante com mais protocolos. |
| UX-6 | Baixa | Biblioteca de Prompts sem indicar competência/passo de origem. | Baixo (10 prompts). | Baixo | Mostrar competência no cartão. |

## 2 · Visual Review

| ID | Prioridade | Achado | Impacto | Esforço | Justificação |
|----|-----------|--------|---------|---------|--------------|
| VIS-1 | Média | Logótipos de ferramenta = 1ª letra → ChatGPT e Consensus mostram ambos "C". | Ambiguidade; aspecto placeholder. | Baixo–Médio | Usar favicon/monograma (derivável do `url`). |
| VIS-2 | Baixa | PromptCanvas com poucas variáveis deixa espaço vazio à esquerda. | Leve. | Baixo | Ajustar layout com ≤3 variáveis. |
| VIS-3 | Baixa | Chips de ferramentas nos prompts em minúsculas. | Leve. | Baixo | Mapear alias → nome de exibição. |
| VIS-4 | Baixa | Placeholders dos inputs mostram o nome técnico (`study_area`). | Leve. | Baixo | Placeholder vazio ou exemplo. |
| VIS-5 | Baixa | Sumário sticky da checklist deixa vazio no topo em ecrãs altos. | Mínimo. | Baixo | Ajuste de espaçamento. |

## 3 · Content Review

| ID | Prioridade | Achado | Impacto | Esforço | Justificação |
|----|-----------|--------|---------|---------|--------------|
| **CON-1** | **Alta** | Termos em inglês expostos: família "Literature Intelligence" e categorias "Production"/"Discovery". | Quebra a promessa de PT; clareza e credibilidade. | Baixo | Princípio de linguagem natural. |
| CON-2 | Média | Código "PR-001" no topo do prompt copiável e em destaque nos cartões. | Ruído técnico no artefacto copiado. | Baixo/Médio | Reduzir carga técnica. |
| CON-3 | Baixa | Sobreposição entre "Porquê" (objectivo) e "O que fazer" (instrução). | Leve redundância. | Baixo | Rever passo a passo. |
| CON-4 | Baixa | Intro da Homepage com 2 linhas. | Mínimo. | Baixo | Poderia ser mais directa. |

## 4 · Trust Review

| ID | Prioridade | Achado | Impacto | Esforço | Justificação |
|----|-----------|--------|---------|---------|--------------|
| **TR-1** | **Alta** | Avisos éticos só na Conclusão; passos de IA sem lembrete inline. | Alto — momento de maior risco sem salvaguarda visível. | Baixo–Médio | As `globalRules` críticas já existem em `validation.json`. |
| TR-2 | Média | Limitações da ferramenta só na página da ferramenta, não no passo de uso. | Médio–alto. | Baixo | Transparência no ponto de uso. |
| TR-3 | Média | Falta sinal de método/credibilidade. | Médio para Beta com docentes. | Médio | Credibilidade percebida. |

**Pontos fortes de confiança (preservar):** Conclusão com as 3 regras críticas; checklist
"Rigor e Ética"; rodapé "MVP · Formação"; BYOA/BYOT bem comunicado.

---

## Veredicto

**ACEITE para publicação, condicionado às 2 melhorias de prioridade Alta.** Nenhum achado é
bloqueante de arquitectura ou de fluxo. Resposta à pergunta de aceitação — *um docente conclui
sozinho?* **Sim** (validado no Checkpoint 2).

---

## Registo de resolução

Decisão oficial: implementar **apenas** as 2 melhorias de prioridade Alta.

| ID | Estado | Implementação |
|----|--------|---------------|
| **CON-1** | ✅ **Implementado** | Mapas PT no frontend (`lib/labels.ts`: `categoryLabel`, `familyLabel`) — "Descoberta", "Produção", "Literatura Científica". Os identificadores internos dos activos (`family: "LIT"`, `category: "discovery"`) **permanecem inalterados**. Verificado: texto visível 100% PT em todas as páginas. |
| **TR-1** | ✅ **Implementado** | Componente `EthicsNote` mostra, nos passos com IA (`tool.toolType === "ai"`), as regras **críticas** de `validation.json → globalRules` (nomes curtos; descrição completa no hover). **Nenhuma regra nova criada** — apenas consumo das existentes. |
| UX-1..6, VIS-1..5, CON-2..4, TR-2..3 | 🗓️ **Roadmap do Beta** | Registadas; não implementadas nesta fase por decisão do Board. |

Após estas duas melhorias, o **MVP é considerado oficialmente concluído** e avança para a
preparação do deploy na Vercel.
