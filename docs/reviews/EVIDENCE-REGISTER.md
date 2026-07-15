# Evidence Register — Validação Empírica do ResearchAI Hub

> Registo vivo de **evidências obtidas por execução real** (SAT — System Acceptance Tests),
> não por opinião nem por RFC. Cada entrada segue o ciclo: hipótese → observação → falha →
> análise → correção mínima → nova observação → resultado.
>
> Princípio operativo destilado deste registo:
> **uma pergunta científica não é uma query de pesquisa.** A pergunta serve a investigação;
> a query serve o motor bibliográfico. São objetos distintos e não devem ser reutilizados
> um pelo outro.

---

## 1 · Evidências (EV-nnn)

**Legenda — Tipo:** `Confirmed` (hipótese confirmada) · `Refuted` (hipótese rejeitada) · `Fixed` (bloqueio resolvido) · `Deferred` (adiado).
**Legenda — Categoria:** `Method` (metodologia/circulação) · `Infrastructure` (executor/API/tokens) · `Scientific` (impacto científico/integridade) · `UX` (experiência).

| ID | Tipo | Categoria | Origem | Evidência | Correção | Resultado |
|----|------|-----------|--------|-----------|----------|-----------|
| EV-001 | Fixed | Infrastructure | quality tooling | PR-005 *field-bleed*: o extractor (Gemini) transbordava campos entre secções da ficha. | Lookahead com dois-pontos em `SECTION_STOP`. | Campos deixam de transbordar (fixtures). |
| EV-002 | Confirmed | Method | quality tooling (live) | O contexto **não circulava** entre os 10 passos (baseline: 54/100, 3/10 passam, circulação 76%). | Causas-raiz em EV-004/EV-005 + resolver. | Diagnóstico tipado por culpa; circulação PR-003→PR-005 agora provada. |
| EV-003 | Fixed (raiz) | Scientific | corrida live (revisão) | **Alucinação**: revisão citou 4 fontes, 0 no repositório (4 inventadas) — `article_text` nunca chegava ao PR-005. | `article_text` ← artigos seleccionados no PR-004 (`variableResolver`) + EV-004. | **Raiz resolvida** (SAT-002): PR-005 recebe *abstracts* reais e produz análise fundamentada. **End-to-end no PR-009 por re-medir (SAT-003).** |
| **EV-004** | **Fixed** | **Method** | **SAT-001** (browser real) | Pesquisa PR-003 enviava a **pergunta pt-PT (com `?`)** como query OpenAlex → **HTTP 400** → 0 artigos → PR-004 vazio. | **keywords EN** como query + remover wildcards `?`/`*` (`PipelineExecutionEngine.tsx`). | **20 artigos; PR-003 concluído; continuidade PR-003→PR-004 restaurada.** |
| **EV-005** | **Fixed** | **Infrastructure** | **SAT-002** (browser real) | Extractor de fichas dividia por "Ficha"; Claude titula `## ARTIGO N` → **0 fichas** apesar de conteúdo fundamentado. | Acrescentar `ARTIGO N` como separador (aditivo; "Ficha" preservado). | **0 → 6 fichas** (4 completas); sem regressão Gemini; `tsc` 0. |
| EV-006 | Deferred | Infrastructure | SAT-002 | PR-005 com 6 fichas numa só chamada **truncou** (~5 artigos) — `maxTokens` do route = **4096** (default). | — (decisão metodológica futura, ver abaixo) | Registado; não bloqueia a formação. |

**Prova de circulação EV-003→resolvida (SAT-002, determinística):** prompt resolvido do PR-005 = 12 005 chars,
`{{article_text}}` resolvido, **6 blocos "Resumo:"**, **6/6** títulos seleccionados presentes. Execução real (Claude,
`claude-sonnet-4-6`): resposta refere **4/6** títulos e recusa-se a inventar (*"o resumo não explicita limitações"*).
Evidências: `website/.evidence/SAT-002/`.

**Nota de ambiente (SAT-002):** Gemini free-tier devolveu **429 RESOURCE_EXHAUSTED** (limit: 0). Rotação para
Claude (documentada) desbloqueou. O *failover* automático em `route.ts` depende de chaves NVIDIA ausentes localmente.

**EV-006 — decisão metodológica futura (não é "aumentar maxTokens"):** subir o `maxTokens` resolve para 6 artigos
mas volta a falhar com 10. A solução estrutural é **gerar as fichas por artigo** (loop: 1 prompt → 1 ficha → guardar →
próximo) ou um **batch configurável** (ex.: `batchSize = 2|3`). Escala independentemente do nº de artigos e mantém cada
resposta pequena e fundamentada. A adiar (não impede a formação); a decidir antes de suportar seleções grandes.

**Propriedade demonstrada — independência do executor:** o mesmo protocolo produziu os mesmos artefactos com
Gemini (PR-003) e Claude (PR-005). *O ativo é o protocolo, não o executor.* (a consolidar nos restantes passos.)

**Detalhe operacional EV-004** — SAT-001, 2026-07-14, Playwright + Chromium real contra `localhost:3000`.
Antes: `POST /api/search` → 400 (*"Wildcards (* or ?) require exact search"*). Depois: → 200, `count=20`,
artefacto `article-list` com autores/ano/fonte/DOI/**abstract**, e PR-004 mostra "ARTIGOS ENCONTRADOS (20)".
Evidências: `website/.evidence/SAT-001/`.

---

## 2 · Achados de UX descobertos em execução (UX-nnn)

> Distintos dos achados de *design review* (PAR-001, UX-1..6). Estes emergem de SAT reais.

| ID | Prioridade | Achado | Impacto | Decisão |
|----|-----------|--------|---------|---------|
| **UX-004** | **Média** | A **ação principal** do PR-003 ("Pesquisar automaticamente") **não está visível na primeira entrada** do passo. Na chegada (`Draft`) mostra-se o editor manual; o botão automático só surge em `Ready`/`ContextConfirmed`, hoje só alcançável guardando o editor manual (que exige ≥1 artigo à mão). | O investigador vem "para pesquisar artigos" e não encontra a ação de imediato. | 🗓️ **Registado, não corrigido** — não bloqueia (o caminho manual conclui o passo). Recomendação: expor a pesquisa automática logo na entrada do PR-003 (estado inicial `Ready` para o passo 3, ou botão de pesquisa dentro do `ArticleListEditor`). |

---

## 3 · Método SAT

1. Ambiente de execução real (browser funcional, não simulação).
2. Percorrer o protocolo como investigador, a partir de um ponto definido.
3. Ao surgir um bloqueio: **parar**, registar a evidência, aplicar **apenas a correção mínima**.
4. **Re-executar** e comparar o resultado (antes/depois).
5. Registar a evidência aqui (EV-nnn) e na memória do projeto.

**SAT-002 (concluído):** cadeia PR-003 → PR-004 → PR-005. Hipótese **confirmada** — `article_text` circula
(6/6) e a análise é fundamentada (Claude, sem alucinação). Novo bloqueio de extractor (EV-005) encontrado e
corrigido. Relatório: `website/.evidence/SAT-002/SAT-002-report.md`.

**Próximo SAT (SAT-003):** completar a cadeia até **PR-009/PR-010** e **re-medir a alucinação end-to-end** (EV-003)
na revisão final — verificar que as referências citadas correspondem a artigos reais do repositório. Alvos
secundários: `maxTokens` do PR-005 (EV-006) e extractor inline-bold do Gemini.
