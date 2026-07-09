# Content Runtime Validator (orientado por Targets)

Validador da arquitectura **Content-First** do ResearchAI Hub.

O objectivo **não** é construir interface. É verificar se os activos existentes
(protocolos, ferramentas, prompts) podem ser **interpretados automaticamente** pelo
runtime — antes de se iniciar o frontend com segurança.

> Sem interface gráfica · Sem React · Sem componentes · Zero dependências (só Node builtins).

---

## Validation Targets

Um **Target** representa o conjunto de activos que oficialmente pertencem a uma
determinada versão do produto (ex: `MVP`, `MVP-2`, `Release-1`, `Workshop-IA`,
`Research-Track`). O validador valida **apenas** os activos do target seleccionado.

Os targets vivem em [`targets/`](../targets/), um ficheiro `.json` por target:

```jsonc
// targets/mvp.json
{
  "id": "mvp",
  "name": "MVP",
  "assets": {
    "protocols": ["RL-01"],
    "tools": ["consensus", "chatgpt"],
    "prompts": ["PR-001", "…", "PR-010"]
  },
  "ignore": []
}
```

Os tokens são comparados (sem distinção de maiúsculas) contra o nome da pasta, `id`,
`alias`, `legacyAlias` ou `name` de cada activo — por isso `"consensus"`, `"Consensus"`
ou `"TOL-004"` referem todos a mesma ferramenta.

### Regra fundamental

Activos **fora do target nunca são erro**. São classificados como:

- **Roadmap Assets** — activos fora do target que são *referenciados* por activos do
  target (ex: `nextProtocols`, `toolAlternatives`, `compatibleTools`). São o "próximo passo".
- **Ignored Assets** — activos fora do target que *ninguém* do target referencia.

Isto permite que o MVP seja considerado **válido mesmo existindo activos futuros ainda vazios**.

---

## Como executar

Requer Node.js ≥ 18.

```bash
# validar apenas o MVP
node validator/validate.mjs --target=mvp

# sem target => valida o repositório completo (modo estrito)
node validator/validate.mjs

# via npm (a partir de validator/)
cd validator && npm run validate:mvp
```

Opções:

| Flag                 | Descrição                                                        |
|----------------------|------------------------------------------------------------------|
| `--target=<id>`      | Target a validar (`targets/<id>.json`). Aceita `--target <id>`.  |
| `--root <dir>`       | Raiz do repositório a validar (por omissão: pasta acima daqui).  |
| `--out <ficheiro>`   | Caminho do relatório (por omissão: `<root>/validation-report.json`). |
| `--quiet`            | Não imprime o resumo na consola.                                 |

**Código de saída:** `0` se o target não tiver erros (o frontend pode arrancar);
`1` se existirem erros; `2` se o target indicado não existir/for inválido. Ideal para CI.

---

## O que valida

1. **Descoberta automática** — percorre `protocols/`, `tools/` e `prompts/`.
2. **Leitura** de `protocol.json`, `workflow.json`, `checklist.json`,
   `validation.json`, `tool.json` e `metadata.json` (+ `prompt.md`).
3. **Resolução de referências** entre:
   - Protocolo → Workflow, Checklist, Validation, Tools, Prompts, Prerequisites, NextProtocols
   - Workflow → Activities (cadeia `nextActivity`), Tools, Prompts
   - Checklist / Validation → Activities (por código curto `ACT-xxx`)
   - Tool → Protocolos (`useCases`), Tools (`alternatives`)
   - Prompt → Protocolo, Activity, Tools compatíveis, `prompt.md`
4. **Detecção** de: referências inválidas, ficheiros inexistentes/vazios/inválidos,
   IDs duplicados (globais e locais) e dependências em falta.

### Severidade

- **Erro** — quebra a interpretação em runtime (ficheiro vazio/ausente, JSON inválido,
  id duplicado, referência de execução que não resolve: tool/prompt de uma actividade,
  workflow/checklist do protocolo, actividade referida por checklist/validation).
- **Warning** — link navegável/soft que não resolve (`nextProtocols`, `alternatives`,
  `useCases`), referência a activo existente mas ainda **não preenchido**, ou
  incoerências não bloqueantes (`totalActivities`, README em falta, alias vs pasta).

---

## Relatório: `validation-report.json`

Contém as quatro secções pedidas — **Repository Status**, **Target/MVP Status**,
**Frontend Ready** e **Roadmap Assets** (+ Ignored Assets):

```jsonc
{
  "target": { "id": "mvp", "name": "MVP", "declared": { … } },

  "repositoryStatus": {                    // fotografia do repositório inteiro
    "protocols": { "found": 6, "populated": 1 },
    "tools":     { "found": 7, "populated": 2 },
    "prompts":   { "found": 10, "populated": 10 },
    "totalAssets": 23, "populatedAssets": 13
  },

  "targetStatus": {                        // "MVP Status" — só os activos do target
    "label": "MVP",
    "status": "PASS | PASS_WITH_WARNINGS | FAIL",
    "protocols": { "declared": 1, "present": 1, "valid": 1, "missing": [] },
    "tools":     { "declared": 2, "present": 2, "valid": 2, "missing": [] },
    "prompts":   { "declared": 10, "present": 10, "valid": 10, "missing": [] },
    "dependenciesResolved": 94, "dependenciesTotal": 94,
    "errorCount": 0, "warningCount": 0
  },

  "frontendReady": true,                   // false enquanto o target tiver erros

  "roadmapAssets": { "protocols": [ … ], "tools": [ … ], "prompts": [ … ] },
  "ignoredAssets": { "protocols": [ … ], "tools": [ … ], "prompts": [ … ] },

  "assets":      { /* inventário completo com flag inTarget */ },
  "dependencies":{ "target": { "resolved": [ … ], "unresolved": [ … ] }, "roadmap": [ … ] },
  "errors":      [ { "code", "message", "file", … } ],   // apenas activos do target
  "warnings":    [ … ]
}
```

---

## Estado actual (referência)

Apenas o protocolo **RL-01**, as ferramentas **consensus** e **chatgpt**, e os **10 prompts**
estão preenchidos — que são precisamente os activos do target `mvp`. Por isso:

```
node validator/validate.mjs --target=mvp   →  MVP STATUS: PASS · FRONTEND READY: SIM · exit 0
```

- **Roadmap** (referenciados pelo MVP mas ainda vazios): `AR-01`, `MC-01`, `SR-01`, `claude`, `gemini`.
- **Ignored** (fora do âmbito do MVP): `DA-01`, `PJ-01`, `notebooklm`, `semantic-scholar`, `zotero`.

Sem `--target`, o validador corre em modo estrito sobre todo o repositório e reporta os
pacotes vazios como erro (útil para acompanhar o progresso global do conteúdo).
