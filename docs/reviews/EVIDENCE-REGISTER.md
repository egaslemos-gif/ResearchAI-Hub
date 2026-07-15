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
| EV-003 | Fixed (end-to-end) | Scientific | corrida live (revisão) | **Alucinação**: revisão citou 4 fontes, 0 no repositório (4 inventadas) — `article_text` nunca chegava ao PR-005. | `article_text` ← PR-004 (`variableResolver`, EV-004) **+ referências reais no PR-009 (EV-007)**. | **Resolvida end-to-end** (SAT-003 isolado + **SAT-004 em fluxo real**): revisão cita **3/3** artigos reais (Chan & Hu 2023; Baidoo-Anu & Owusu Ansah 2023; Cooper 2023), **0 inventadas**, listados em "Referências". SAT-004 (browser, PR-003→PR-010, tudo 200): `hallucinationFree: true`, refs **3/3 grounded**. Ver EV-007/EV-008. |
| **EV-004** | **Fixed** | **Method** | **SAT-001** (browser real) | Pesquisa PR-003 enviava a **pergunta pt-PT (com `?`)** como query OpenAlex → **HTTP 400** → 0 artigos → PR-004 vazio. | **keywords EN** como query + remover wildcards `?`/`*` (`PipelineExecutionEngine.tsx`). | **20 artigos; PR-003 concluído; continuidade PR-003→PR-004 restaurada.** |
| **EV-005** | **Fixed** | **Infrastructure** | **SAT-002** (browser real) | Extractor de fichas dividia por "Ficha"; Claude titula `## ARTIGO N` → **0 fichas** apesar de conteúdo fundamentado. | Acrescentar `ARTIGO N` como separador (aditivo; "Ficha" preservado). | **0 → 6 fichas** (4 completas); sem regressão Gemini; `tsc` 0. |
| EV-006 | Deferred | Infrastructure | SAT-002 | PR-005 com 6 fichas numa só chamada **truncou** (~5 artigos) — `maxTokens` do route = **4096** (default). | — (decisão metodológica futura, ver abaixo) | Registado; não bloqueia a formação. |
| **EV-007** | **Fixed (raiz)** | **Scientific** | **SAT-003** (before/after live) | **Causa-raiz da alucinação no PR-009**: o prompt ordena *"usa APENAS as referências dos artigos que analisei; não inventes"* mas o bloco "Materiais disponíveis" só recebia `{{thematic_synthesis}}` (temas de-identificados) + `{{gaps}}` — **nunca as referências reais** (autor/ano vivem em `selected_articles`; achados por artigo em `reading_cards`). Modelo instruído a citar só reais mas sem lista → inventa (Hodges, Marinoni) ou escreve sem citações. | **Prompt-only**: injectar `{{selected_articles}}` + `{{reading_cards}}` no PR-009, exigir secção `## 5. Referências` e reforçar a regra anti-invenção. Resolver já computava ambas as variáveis (0 mudanças no resolver). | **OLD**: 0 citações fundamentadas, 0/3 títulos. **NEW** (mesmo contexto a montante): **3/3** artigos reais citados (20× no total), **0 inventadas**, secção Referências com os 3, + nota que recusa fundamentar sem fonte. `tsc` 0. |
| **EV-008** | **Fixed** | **Infrastructure** | **SAT-003** | O extractor da revisão (`extractReviewArtifact`) lê referências via `extractListItems` → só apanha listas com marcador (`-`/`1.`); referências académicas (APA) são **parágrafos simples** → `refs=0` mesmo com secção Referências presente. Escondia a alucinação (0 refs = nada para o provenance verificar). | **Aditivo**: `extractReferenceList` (fallback quando list-items=0) divide por parágrafos, exige ano, ignora separadores/notas. | Revisão NEW: **0 → 3** refs. Fixtures: **10/22** passam a extrair refs (antes menos); expõe refs inventadas do GLM → alucinação agora **mensurável**. Sem regressão (fallback só dispara a 0). |
| **EV-009** | **Fixed** | **Infrastructure** | **SAT-005/006** (raws reais Claude) | Três extractores falhavam no formato do Claude (headings/parágrafos): (a) **PR-009 `body`** — `extractSection` parava no 1.º `###` → guardava só o tema 2.1 (2.2–2.5 perdidos); (b) **PR-007 `gaps`=0** — Claude usa subtítulos por lacuna, não listas; `gapSection` truncava no 1.º `**Descrição:**` (SECTION_STOP); (c) **PR-006 conv/div=0** — sub-pontos em `**N.N Título**` + parágrafos. | (a) `extractSectionDeep` + corte antes de Referências/Conclusão; (b) *split* do **response completo** pelos títulos de lacuna — **tolerante a emoji (`### 🔴 LACUNA 1 —`) e numeração decimal (`Lacuna 1.1`)** (o SAT-006 revelou que a versão só-inteiros do SAT-005 falhava em fluxo); (c) `extractRawSection` (ignora SECTION_STOP) + sub-títulos a negrito. Fallbacks **aditivos** (só disparam a 0). | Raws reais: `body` **→5/5 temas**, `gaps` **0→5/6/8** (4 formatos), conv **0→4**, div **0→3**. **SAT-006 em fluxo: `pass`** — gaps=8 e artefacto do PR-007 **volta a persistir** (o `null` era efeito da guarda de artefacto vazio + gaps=0). Fixtures sem regressão; `tsc` 0. |

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

**SAT-003 (concluído):** foco no PR-009 (revisão final) e na **alucinação end-to-end** (EV-003). Método
*before/after* determinístico + live, isolando o **prompt do PR-009** como única variável (contexto a montante
idêntico). Achados: **EV-007** (causa-raiz — o prompt nunca recebia as referências reais) e **EV-008** (extractor
não lia referências em parágrafo). Ambos corrigidos e verificados: a revisão passa de **0 → 3/3** artigos reais
citados, **0 inventadas**. Evidências: `website/.evidence/SAT-003/` (`verify-pr009-grounding.mjs`,
`verify-review-extractor.mjs`, `pr009-old-review.txt` vs `pr009-new-review.txt`).
> Nota de método: no teste controlado, com síntese de-identificada, o prompt OLD **omite** citações (ensaio sem
> fontes); na corrida live original (run1) **inventava** nomes famosos (Hodges, Marinoni). Duas faces do mesmo
> defeito. O NEW resolve ambas.

**SAT-004 (concluído):** re-corrida da cadeia completa **PR-003 → PR-010 no browser real** com o PR-009
corrigido, para validar **em fluxo** (não só isolado). Resultado: todos os passos a **200**; PR-005=3 fichas,
PR-006=5 linhas, PR-008=5 temas, PR-009=2538 palavras. **Provenance do PR-009: 3/3 referências fundamentadas no
repositório, 0 inventadas, 3/3 autores citados no corpo → `hallucinationFree: true`.** Evidências:
`website/.evidence/SAT-004/` (`sat4-driver.mjs`, `sat4-log.txt`, `pr009-review.txt`, screenshots PR-005..PR-010).

**SAT-005 (concluído):** limpeza dos três achados de extractor visíveis no SAT-004 — `body` do PR-009 truncado,
`gaps`=0 e conv/div=0 (**EV-009**). Método: diagnosticar e corrigir contra os **outputs brutos reais** do SAT-004
(PR-006/PR-009 do `content` guardado; PR-007 recapturado por API), fallbacks aditivos, regressão sobre 22 fixtures
por passo. Resultado: `body` 5/5 temas, `gaps` 0→5, conv 0→4, div 0→3; sem regressão; `tsc` 0. Evidências:
`website/.evidence/SAT-005/` (`capture-pr007.mjs`, `verify-fixes.mjs`, `regress-all.mjs`, `raw-PR-007.txt`).
> Nota: PR-007 não persistia o artefacto quando `gaps`=0 (guarda de artefacto vazio) — daí `artifacts[7]=null` no
> SAT-004. Com `gaps`>0 deve voltar a persistir; **confirmar num re-run em fluxo (SAT-006)**.

**SAT-006 (concluído):** re-run completo PR-003→PR-010 em fluxo real com os extractores corrigidos. 1.ª passagem
**revelou** que o fix de `gaps` do SAT-005 (só `### Lacuna N` inteiro) falhava em fluxo — o Claude também usa
`### 🔴 LACUNA 1 —` (emoji) e `### Lacuna 1.1 —` (decimal). Amostrei 3 saídas reais, generalizei o *split* e
re-corri: **`pass` total** — cards=3, rows=5, conv=4, div=3, **gaps=8 e PR-007 persiste**, temas=8, revisão
2662 palavras com **3/3 refs fundamentadas, 0 inventadas**. Evidências: `website/.evidence/SAT-006/`
(`sat6-driver.mjs`, `sample-pr007.mjs`, `raw-PR-007-s{1,2,3}.txt`, `sat6-log.txt`, `pr009-review.txt`, screenshots).

**Próximo SAT (SAT-007):** re-medir tudo no dashboard `/qualidade` com estes artefactos completos (score/passo,
circulação, consistência, culpa) e comparar com o baseline. Achado pré-existente a decidir: `extractListItems`
sobre-conta gaps em fixtures Gemini/GLM (16–34 itens vs. 3–5 esperados). Deferidos: `maxTokens`/fichas-por-artigo
do PR-005 (EV-006); persistência de artefactos vazios (a guarda que apagava o PR-007 esconde falhas — considerar
guardar sempre o bruto).
