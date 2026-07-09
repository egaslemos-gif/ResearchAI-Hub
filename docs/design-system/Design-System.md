# ResearchAI Hub — Design System

> **Versão:** 1.0
> **Status:** 🟡 DRAFT — aguarda aprovação (bloqueia o início do frontend)
> **Dependência:** RFC-000 (Product Vision) · RFC-001 (Product Constitution) · RFC-003 (Protocol Runtime) · RFC-004 (Domain Model) · RFC-005 (Learning Experience) · ADR-007 (Activity)
> **Última atualização:** Julho de 2026
> **Autor:** Egas Lemos

---

## 0. Sobre este documento

Este é o **contrato visual oficial** de toda a plataforma ResearchAI Hub. Nenhuma
interface deverá ser construída fora dos tokens, componentes e vistas aqui definidos.

A arquitectura está **congelada** e o MVP está **validado** (`Validation Target: MVP · PASS ·
Frontend Ready: TRUE`). Este documento **não altera** a arquitectura nem os protocolos —
define apenas como o conteúdo já existente é apresentado.

### 0.1 Referência estética

A qualidade visual deverá aproximar-se de **Linear · Stripe · Notion · GitHub · OpenAI ·
Vercel · Google AI Studio**. Traços comuns que herdamos:

- Fundo neutro, muito espaço branco, densidade calma.
- Um **único** acento cromático, usado com parcimónia.
- Tipografia sans humanista, tracking apertado nos títulos.
- Bordas de 1px em vez de sombras pesadas; raios de canto discretos.
- Movimento rápido e subtil (150–200 ms).
- Teclado em primeiro lugar; command palette (⌘K).

> **Proibido:** interfaces pesadas, dashboards administrativos, painéis densos de widgets,
> gamificação infantil (estrelas, pontos, badges decorativos, streaks), dark patterns.

### 0.2 Regra Content-First (inegociável)

> **Nenhum conteúdo é hardcoded.** Todo o texto, título, ícone, ferramenta, prompt, critério
> e etapa é carregado a partir dos activos (`protocol.json`, `workflow.json`, `checklist.json`,
> `validation.json`, `tool.json`, `metadata.json`, `prompt.md`).

Cada componente e vista deste documento inclui uma tabela **Content Binding** que liga
cada slot da UI ao campo exacto do activo. Se um slot não tiver origem num activo, não existe.

---

## 1. Princípios de Design

| # | Princípio | O que significa na prática |
|---|-----------|-----------------------------|
| 1 | **Conteúdo antes de cromo** | A tipografia e o espaço são a interface. Cromo (bordas, sombras, cor) apenas onde acrescenta significado. |
| 2 | **Um acento, usado com disciplina** | O indigo de marca marca *a acção actual*. Se tudo tem cor, nada tem. |
| 3 | **Silêncio visual** | Neutros calmos, superfícies quase brancas/quase pretas, ruído zero. A interface recua para o conteúdo científico avançar. |
| 4 | **Densidade calma** | Informação suficiente por ecrã (GitHub/Notion), nunca sobrecarga. Espaço generoso entre blocos. |
| 5 | **Hierarquia por escala e peso**, não por caixas | Preferir tamanho/peso/cor de texto a molduras. Reduzir o número de bordas. |
| 6 | **Bordas > sombras** | Superfícies definidas por 1px de borda. Sombras apenas para elevação real (menus, popovers, modais). |
| 7 | **Consistência de raio e ritmo** | Todos os raios e espaços derivam de uma escala única (§3, §4). Nada de valores ad-hoc. |
| 8 | **Acessível por omissão** | Contraste AA (§17), foco visível, alvos ≥ 40px, `prefers-reduced-motion` respeitado. |
| 9 | **Estático, mas vivo** | Micro-interacções rápidas e físicas; nunca decorativas. Estado sempre legível sem animação. |
| 10 | **Académico, não corporativo** | Tom sóbrio, editorial, credível. Zero linguagem de marketing, zero ilustrações lúdicas. |

---

## 2. Princípios de UX

Herdados de RFC-000 §16–17 e RFC-005 §9. Cada ecrã responde a **uma** pergunta:
**"O que devo fazer agora?"**

| # | Princípio | Aplicação |
|---|-----------|-----------|
| 1 | **Orientação por necessidade** | Pontos de entrada por *"preciso de…"*, nunca por ferramenta. |
| 2 | **Clareza imediata** | Uma acção primária por ecrã. Tudo o resto é secundário e visualmente subordinado. |
| 3 | **Poucos cliques, muito foco** | Caminho mais curto para a próxima acção. Sem navegação em árvore profunda. |
| 4 | **Pouco texto, muito exemplo** | Instrução curta + exemplo concreto. O exemplo ensina mais que o parágrafo. |
| 5 | **Progresso verificável** | Competências e completude, **nunca** pontos/badges (RFC-005 §7.1). |
| 6 | **Interrupção segura** | Qualquer sessão pausa e retoma no ponto exacto (Suspend/Resume, RFC-003 §7). |
| 7 | **Resultado concreto** | Cada protocolo termina num artefacto tangível, sempre visível como meta. |
| 8 | **Autonomia progressiva** | Guiar o principiante; libertar o experiente (modo foco, atalhos, bypass). |
| 9 | **Método sobre ferramenta** | A IA é intermutável (BYOA/BYOT); o método permanece. A UI expõe alternativas sem fricção. |
| 10 | **Respeito** | Sem gamificação infantil, sem dark patterns, sem interrupções desnecessárias. |

**Padrões de interacção obrigatórios:** Command palette (⌘K) para navegação/pesquisa · atalhos
de teclado no Protocol View (`Enter` avançar, `Esc` sair do foco) · estados vazios que ensinam ·
skeletons em vez de spinners · toasts discretos, nunca modais para confirmações triviais.

---

## 3. Grid & Layout

Grelha de **12 colunas**, base de **4px**, gutter de 24px (desktop) / 16px (mobile).

### 3.1 Breakpoints

| Token | Largura | Alvo |
|-------|---------|------|
| `sm`  | ≥ 640px | telemóvel grande |
| `md`  | ≥ 768px | tablet |
| `lg`  | ≥ 1024px | laptop |
| `xl`  | ≥ 1280px | desktop |
| `2xl` | ≥ 1536px | ecrã amplo |

### 3.2 Contentores (largura máxima)

| Token | Valor | Uso |
|-------|-------|-----|
| `--container-prose` | `42rem` (672px) | **Leitura / execução** — Protocol View, Prompt View. Medida ideal 65–75 caracteres. |
| `--container-content` | `64rem` (1024px) | Páginas de detalhe (Tool View, Recipe View). |
| `--container-wide` | `80rem` (1280px) | Catálogos e listagens. |
| `--container-full` | `100%` (max 1536px) | Raramente; nunca conteúdo de leitura a toda a largura. |

### 3.3 Molde de aplicação (App Shell)

```
┌──────────────────────────────────────────────────────────────┐
│  Top bar  ·  logo · breadcrumb ······················ ⌘K · ◐  │  56px
├──────────┬───────────────────────────────────────────────────┤
│          │                                                     │
│  Sidebar │              Conteúdo (container centrado)          │
│  240px   │              max-width conforme a vista             │
│ (colapsa │                                                     │
│  em md)  │                                                     │
│          │                                                     │
└──────────┴───────────────────────────────────────────────────┘
```

- **Sidebar** 240px, colapsável; desaparece < `lg` (vira drawer).
- **Protocol View** entra em **modo foco**: esconde a sidebar, centra `--container-prose`.
- Conteúdo sempre centrado; nunca alinhado à esquerda a toda a largura em ecrãs largos.

---

## 4. Spacing

Escala geométrica com base **4px**. Uso exclusivo destes tokens — sem valores soltos.

```css
--space-0:  0;
--space-1:  0.25rem;  /*  4px */
--space-2:  0.5rem;   /*  8px */
--space-3:  0.75rem;  /* 12px */
--space-4:  1rem;     /* 16px */
--space-5:  1.25rem;  /* 20px */
--space-6:  1.5rem;   /* 24px */
--space-8:  2rem;     /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-24: 6rem;     /* 96px */
```

**Ritmo recomendado:**

| Contexto | Espaço |
|----------|--------|
| Gap entre ícone e label | `--space-2` (8px) |
| Padding interno de botão (md) | `12px / 16px` |
| Padding interno de card | `--space-6` (24px) |
| Gap entre campos de formulário | `--space-4` (16px) |
| Gap entre blocos de secção | `--space-8`–`--space-12` |
| Margem entre secções de página | `--space-16`–`--space-24` |

---

## 5. Escala Tipográfica

### 5.1 Fontes

| Papel | Família | Uso |
|-------|---------|-----|
| **Sans (UI)** | `Inter`, depois `Geist`, `system-ui`, sans-serif | Toda a interface e títulos. |
| **Serif (Leitura)** | `Source Serif 4`, `Georgia`, serif | *Opcional e parcimonioso* — prosa longa de leitura (objectivo/descrição de protocolo). |
| **Mono** | `Geist Mono`, `JetBrains Mono`, `ui-monospace` | Prompts (`prompt.md`), IDs (`PRT-001`), variáveis `{{var}}`, valores técnicos. |

```css
--font-sans: "Inter", "Geist", system-ui, -apple-system, "Segoe UI", sans-serif;
--font-serif: "Source Serif 4", Georgia, "Times New Roman", serif;
--font-mono: "Geist Mono", "JetBrains Mono", ui-monospace, "SF Mono", monospace;
```

### 5.2 Escala (base 16px, ratio ~1.2)

| Token | Tamanho | Line-height | Peso | Tracking | Uso |
|-------|---------|-------------|------|----------|-----|
| `display` | 36px | 40px | 600 | -0.02em | Título de landing / entrada |
| `h1` | 30px | 36px | 600 | -0.02em | Título de página (nome do protocolo) |
| `h2` | 24px | 32px | 600 | -0.01em | Secção |
| `h3` | 20px | 28px | 600 | -0.01em | Subsecção / título de card |
| `h4` | 18px | 26px | 600 | 0 | Título de actividade |
| `body-lg` | 18px | 28px | 400 | 0 | Prosa de leitura (instruções longas) |
| `body` | 16px | 24px | 400 | 0 | Texto base |
| `body-sm` | 14px | 20px | 400 | 0 | Texto secundário, metadados |
| `caption` | 13px | 18px | 500 | 0 | Legendas, labels de campo |
| `overline` | 12px | 16px | 600 | 0.06em | Etiquetas (UPPERCASE): família, categoria, estado |
| `mono` | 14px | 22px | 400 | 0 | Prompts, código, IDs |

**Regras:** máximo dois pesos por ecrã (400 + 600). Títulos nunca em maiúsculas totais
(excepto `overline`). Medida de leitura 65–75 caracteres. Números tabulares em progresso e tempos.

---

## 6. Paleta Oficial

Duas famílias: **Neutral** (fundação) e **Brand / Research Indigo** (acção). Escalas 50–950.

### 6.1 Neutral (cinza frio)

```css
--neutral-25:  #FCFCFD;
--neutral-50:  #F7F8FA;
--neutral-100: #EFF1F4;
--neutral-200: #DDE1E7;
--neutral-300: #C4CAD4;
--neutral-400: #97A0AE;
--neutral-500: #6C7686;   /* texto muted */
--neutral-600: #515A69;
--neutral-700: #3B4351;
--neutral-800: #262C37;
--neutral-900: #171B22;
--neutral-950: #0C0E13;   /* canvas dark */
```

### 6.2 Brand — Research Indigo

```css
--brand-50:  #EEF2FF;
--brand-100: #E0E7FF;
--brand-200: #C7D2FE;
--brand-300: #A5B4FC;
--brand-400: #818CF8;   /* interactive em dark */
--brand-500: #6366F1;
--brand-600: #4F46E5;   /* PRIMÁRIO (light) */
--brand-700: #4338CA;
--brand-800: #3730A3;
--brand-900: #312E81;
--brand-950: #1E1B4B;
```

> O indigo é o **único** acento de marca. Reservado para: acção primária, estado activo,
> foco, link, e o indicador de "etapa actual". Nunca decorativo.

---

## 7. Semantic Colors

A UI usa **tokens semânticos** (significado), nunca hex crus. Isto permite trocar o tema
(claro/escuro) sem tocar nos componentes.

### 7.1 Tokens semânticos base

```css
:root {
  /* superfícies */
  --color-bg:            var(--neutral-25);
  --color-surface:       #FFFFFF;
  --color-surface-raised:#FFFFFF;
  --color-surface-sunken:var(--neutral-50);

  /* bordas */
  --color-border:        var(--neutral-200);
  --color-border-strong: var(--neutral-300);

  /* texto */
  --color-text:          var(--neutral-900);
  --color-text-muted:    var(--neutral-500);
  --color-text-subtle:   var(--neutral-400);

  /* marca / interacção */
  --color-brand:         var(--brand-600);
  --color-brand-hover:   var(--brand-700);
  --color-brand-subtle:  var(--brand-50);
  --color-on-brand:      #FFFFFF;
  --color-link:          var(--brand-600);
  --color-focus-ring:    var(--brand-500);
}
```

### 7.2 Estados (intenção)

| Intenção | Fg | Fill (solid) | Tint (bg) | Uso |
|----------|-----|--------------|-----------|-----|
| **Success** | `#047857` | `#059669` | `#ECFDF5` | Validação passou, actividade concluída |
| **Warning** | `#B45309` | `#D97706` | `#FFFBEB` | Requer atenção, validação em curso |
| **Danger** | `#B91C1C` | `#DC2626` | `#FEF2F2` | Erro, referência inválida, destrutivo |
| **Info** | `#1D4ED8` | `#2563EB` | `#EFF6FF` | Neutro informativo, etapa em execução |

### 7.3 Cores de estado do Runtime (RFC-003 §4)

Mapeamento **obrigatório** dos 8 estados do ciclo de vida da Activity:

| Estado | Cor / token | Representação visual |
|--------|-------------|----------------------|
| `Pending` | `--color-text-subtle` (neutral-400) | Círculo vazio, texto muted |
| `Running` | Info (`#2563EB`) | Círculo com anel, pulsar subtil |
| `WaitingUser` | **Brand indigo** | Círculo preenchido a indigo — "é a sua vez" |
| `Validating` | Warning (`#D97706`) | Círculo com spinner âmbar |
| `Completed` | Success (`#059669`) | Círculo com ✓ verde |
| `Skipped` | Neutral-400 (tracejado) | Círculo tracejado, label "Ignorada" |
| `Cancelled` | Neutral-500 | Círculo com traço, texto esbatido |
| `Error` | Danger (`#DC2626`) | Círculo com ! vermelho |

> Cor **nunca** é o único sinal (§17). Cada estado tem também ícone e label textual.

---

## 8. Botões

Uma acção primária por contexto. Raio `--radius-md` (6px). Transição 150ms ease-out.

### 8.1 Variantes

| Variante | Uso | Light |
|----------|-----|-------|
| **Primary** | Acção principal ("Iniciar protocolo", "Avançar") | fill `--color-brand`, texto branco |
| **Secondary** | Acção secundária | superfície branca, borda `--color-border`, texto `--color-text` |
| **Ghost** | Terciária / barras de ferramentas | transparente, hover `--neutral-100` |
| **Subtle** | Acção calma em fundo tint | fill `--brand-50`, texto `--brand-700` |
| **Danger** | Destrutiva (cancelar sessão) | fill Danger ou borda Danger |
| **Link** | Navegação inline | texto `--color-link`, sublinhado no hover |

### 8.2 Tamanhos

| Tamanho | Altura | Padding H | Texto | Uso |
|---------|--------|-----------|-------|-----|
| `sm` | 32px | 12px | `body-sm` | Denso, toolbars |
| `md` | 40px | 16px | `body-sm`/`body` | **Padrão** |
| `lg` | 48px | 20px | `body` | Acção principal de página |

### 8.3 Estados

`default → hover` (escurece/eleva 1 step) `→ active` (comprime, sem sombra) `→ focus-visible`
(anel `2px` `--color-focus-ring` + offset 2px) `→ disabled` (opacidade 45%, sem ponteiro) `→
loading` (spinner + label, largura preservada, não clicável).

```
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│  Iniciar protocolo│   │  Ver ferramentas  │   │  ⟳ A validar…     │
└───────────────────┘   └───────────────────┘   └───────────────────┘
   Primary / md            Secondary / md           Primary / loading
```

Botão com ícone: ícone Lucide 16–18px, gap 8px. Ícone-só: 40×40, `aria-label` obrigatório.

---

## 9. Cards

Superfície contentora. Borda 1px por omissão; sombra só quando interactivo/elevado.

### 9.1 Variantes

| Variante | Aparência | Uso |
|----------|-----------|-----|
| **Default** | `--color-surface` + borda | Agrupar conteúdo estático |
| **Interactive** | + hover (borda `--brand-300`, sombra `sm`, translada -1px) | Item clicável (protocolo, ferramenta) |
| **Outline** | Sem fill, só borda | Blocos secundários, estados vazios |
| **Tinted** | Fill semântico subtil | Callouts (aviso ético, dica) |
| **Elevated** | Sombra `md`, sem borda | Popovers, menus, modais |

Raio `--radius-lg` (8px) · padding `--space-6` (24px) · gap interno `--space-4`.

### 9.2 Protocol Card (catálogo)

O card mais importante do produto. Bind directo a `protocol.json`.

```
┌─────────────────────────────────────────────┐
│ ◫ book-open        LIT · Intermédio          │  ← icon + família + dificuldade
│                                               │
│ Revisão da Literatura                         │  ← name (h3)
│ Conduzir uma revisão estruturada assistida    │  ← description (2 linhas, clamp)
│ por IA, do tema à revisão preliminar.         │
│                                               │
│ ◷ 4–8 h   ·   10 actividades   ·   2 tools    │  ← estimatedTime · nº activities · nº tools
│                                               │
│ ●●●●●●●●●●  ▸ Continuar                        │  ← progresso (se sessão) + CTA
└─────────────────────────────────────────────┘
```

**Content Binding — Protocol Card**

| Slot | Campo do activo |
|------|-----------------|
| Ícone | `protocol.json → icon` (nome Lucide) |
| Etiqueta família | `familyName` / `family` |
| Dificuldade | `difficulty` |
| Título | `name` |
| Descrição | `description` |
| Tempo | `estimatedTime` |
| Nº actividades | `workflow.json → totalActivities` |
| Nº ferramentas | `tools.length` |
| Estado / progresso | Runtime (LocalStorage) — nunca hardcoded |

---

## 10. Lists

Listas legíveis, densidade calma, divisores subtis (1px `--color-border`) em vez de caixas.

| Tipo | Uso | Notas |
|------|-----|-------|
| **Definition list** | Metadados de protocolo/ferramenta (label → valor) | 2 colunas em `md+`, empilha em `sm` |
| **Activity list** | Etapas do workflow | Ordenada, cada item com estado do runtime (§7.3) |
| **Checklist** | `checklist.json` | Checkbox + texto + ligação à actividade de origem |
| **Tool list** | Ferramentas de um protocolo | Ícone + nome + papel + fase |
| **Capability list** | `capabilities` / `bestPractices` / `limitations` | Bullets com ícone semântico (✓ / ⚠) |
| **Nav list** | Sidebar | Item com ícone, estado activo a indigo |

Item de lista: altura mínima 40px, padding vertical `--space-3`, gap ícone-texto `--space-3`.
Estados: hover `--neutral-50`, activo `--brand-50` + barra indigo 2px à esquerda.

**Checklist item (bind a `checklist.json`)**

```
☐  O tema de investigação está claramente definido e delimitado
   └ Actividade ACT-001                                    ← item.activity
```

| Slot | Campo |
|------|-------|
| Texto | `checklist.sections[].items[].text` |
| Ligação | `items[].activity` → Activity do workflow |
| Secção | `sections[].name` |
| Threshold de aprovação | `passingThreshold` (ex.: 90%) |

---

## 11. Progress

Progresso é **verificável**, nunca lúdico (RFC-005 §7). Sem pontos, sem badges.

### 11.1 Componentes

| Componente | Uso | Aparência |
|------------|-----|-----------|
| **Linear bar** | Progresso do workflow (X de N actividades) | 6px, track `--neutral-200`, fill `--color-brand`, números tabulares |
| **Step rail (stepper)** | Coluna de etapas no Protocol View | Vertical, nós coloridos por estado (§7.3), linha conectora |
| **Circular** | Resumo compacto num card | Anel fino, % ao centro |
| **Competency meter** | Perfil de Investigador (RFC-005 §7.4) | Barra por competência com itens ✔/◻ |

### 11.2 Step rail (núcleo do Protocol View)

```
●─── ACT-001  Definir o Tema            Completed   ✓
│
●─── ACT-002  Refinar a Pergunta        Completed   ✓
│
◉─── ACT-003  Pesquisar no Consensus    WaitingUser ← actual (indigo)
│
○─── ACT-004  Seleccionar Artigos       Pending
│
○─── ACT-005  Analisar Artigos          Pending
```

**Competency meter (anti-gamificação)**

```
Literatura Científica     ████████████░░  85%
  ✔ Pesquisa bibliográfica estruturada
  ✔ Avaliação de fontes
  ◻ Revisão sistemática
```

Origem: `protocol.json → competencies` + Runtime. Percentagem = completude verificável, não nota.

---

## 12. Protocol View

A vista central do produto. **Modo foco**: `--container-prose` (672px), sidebar recolhida.
Responde sempre a *"O que devo fazer agora?"*. Uma actividade de cada vez.

```
┌──────────────────────────────────────────────────────────┐
│ ← Revisão da Literatura            Actividade 3 de 10  ●●●○○○ │  header + progresso
├────────────┬─────────────────────────────────────────────┤
│ STEP RAIL  │  ACT-003 · Pesquisar Literatura no Consensus │  h4 (activity.name)
│            │                                               │
│ ● ACT-001  │  Objectivo                                    │  activity.objective
│ ● ACT-002  │  Encontrar artigos relevantes com base na     │
│ ◉ ACT-003  │  pergunta de investigação.                    │
│ ○ ACT-004  │                                               │
│ ○ ACT-005  │  Instrução                                    │  activity.instruction
│ ○ …        │  Abra o Consensus e introduza a sua pergunta… │
│            │                                               │
│            │  ┌─ Ferramenta ──────────────────────────┐    │  activity.tool → tool.json
│            │  │ ◫ Consensus  · descoberta              │    │  (+ toolAlternatives = BYOT)
│            │  │ [ Abrir Consensus ↗ ]  Alternativas ▾  │    │
│            │  └────────────────────────────────────────┘    │
│            │                                               │
│            │  ┌─ Prompt ──────────────────────── copiar ┐   │  activity.prompt → prompt.md
│            │  │ Procura artigos sobre {{tema}} …        │   │  (variáveis preenchidas)
│            │  └────────────────────────────────────────┘   │
│            │                                               │
│            │  ┌─ Validação ───────────────────────────┐    │  activity.validation.criteria
│            │  │ ☐ Pelo menos 10 artigos relevantes      │    │
│            │  │ ☐ Fontes peer-reviewed                  │    │
│            │  └────────────────────────────────────────┘    │
│            │                                               │
│            │  Resultado esperado · lista de 10–20 artigos  │  activity.expectedOutput
│            │                                    [ Avançar → ]│  → nextActivity
└────────────┴─────────────────────────────────────────────┘
```

- Uma acção primária: **Avançar** (bloqueada até a validação mínima ser satisfeita —
  `validation.minimumCriteria`, RFC-003: `Validating → Completed`).
- Callout ético fixo quando aplicável (VAL-G global, ex.: "Verifique pessoalmente cada citação").
- Suspend/Resume: sair preserva estado; ao voltar, retoma na actividade exacta.

**Content Binding — Protocol View**

| Slot | Campo |
|------|-------|
| Título / progresso | `protocol.name` · `workflow.totalActivities` · Runtime |
| Rail | `workflow.activities[]` (id, order, estado runtime) |
| Nome / objectivo / instrução | `activity.name` · `objective` · `instruction` |
| Ferramenta + alternativas | `activity.tool` · `toolAlternatives` → `tool.json` |
| Prompt | `activity.prompt` → `prompts/<id>/prompt.md` + `metadata.variables` |
| Validação | `activity.validation.criteria` · `minimumCriteria` |
| Resultado / evidência | `activity.expectedOutput` · `evidence` · `outputs` |
| Regras éticas | `validation.json → globalRules` (severity `critical`) |
| Próximo | `activity.nextActivity` |

---

## 13. Recipe View

> **Recipe = meta-protocolo** (RFC-006 §4.7): orquestra vários protocolos em sequência, onde
> o output de um alimenta o input do seguinte. *"Protocolo é atómico (tarefa); Recipe é molecular
> (solução)."* Vista **forward-looking (v2+)** — o MVP tem só o protocolo `RL-01`. Especificada
> agora porque a arquitectura está congelada e o contrato deve prevê-la.

Contentor `--container-content`. Apresenta a receita como um **percurso de protocolos**, não como
execução passo-a-passo (isso é o Protocol View de cada protocolo componente).

```
┌──────────────────────────────────────────────────────────┐
│ ◫ Da Ideia ao Artigo Publicado           Receita · 3 fases │  recipe.name
│ Orquestra os protocolos necessários para levar uma ideia   │  recipe.description
│ até um artigo submetido.                                   │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  ①  Revisão da Literatura        LIT-RL-01     ✓ concluído │  protocolo 1 (estado)
│      produz → Tabela comparativa + revisão                 │  output → input
│          │                                                 │
│          ▼  alimenta                                       │
│  ②  Projeto de Investigação      DESIGN-PJ-01  ◉ actual    │  protocolo 2
│      produz → Projecto formalizado                         │
│          │                                                 │
│          ▼                                                 │
│  ③  Artigo Científico            WRITE-AR-01   ○ bloqueado │  protocolo 3
│      produz → Artigo estruturado                           │
│                                                            │
│                              [ Continuar em Projeto de… → ]│  CTA → Protocol View
└──────────────────────────────────────────────────────────┘
```

- Cada nó = **Protocol Card compacto** (§9.2) + banda de estado + relação `output → input`.
- Nós bloqueados até o anterior concluir. CTA abre o Protocol View do protocolo actual.
- Zero conteúdo próprio: título/passos derivam da definição da recipe; cada nó lê o `protocol.json`
  do protocolo referenciado.

**Content Binding — Recipe View**

| Slot | Campo |
|------|-------|
| Título / descrição | `recipe.name` · `recipe.description` |
| Nós (protocolos) | `recipe.steps[] → protocolId` → `protocol.json` |
| Artefacto por nó | `protocol.deliverables` / fluxo output→input da recipe |
| Estado por nó | Runtime (concluído/actual/bloqueado) |

---

## 14. Tool View

Página de conhecimento de uma ferramenta (BYOT). Contentor `--container-content`. Sóbria,
factual — capacidades, boas práticas e **limitações** com igual destaque (rigor científico).

```
┌──────────────────────────────────────────────────────────┐
│ ◫ Consensus                              descoberta · IA   │  name · category · toolType
│ Motor de pesquisa científica que sintetiza evidências de   │  description
│ artigos peer-reviewed.               [ Abrir Consensus ↗ ] │  url
│ Provider: Consensus NLP · Gratuito com limite              │  provider · pricing.free
├──────────────────────────────────────────────────────────┤
│ Capacidades              │ Limitações                      │  capabilities | limitations
│ ✓ Pesquisa semântica     │ ⚠ Apenas em inglês              │
│ ✓ Síntese de evidências  │ ⚠ Base mais limitada que Scopus │
├──────────────────────────────────────────────────────────┤
│ Boas práticas                                              │  bestPractices (checklist calmo)
│ • Formular a pesquisa como pergunta em inglês              │
│ • Verificar o indicador de consenso                        │
├──────────────────────────────────────────────────────────┤
│ Quando usar (casos)                                        │  useCases[]
│ ┌ Exploração inicial de um tema ── LIT-RL-01 · ACT-003 ┐   │  useCase → protocol/activity
│ └──────────────────────────────────────────────────────┘   │
│ Alternativas: Semantic Scholar                             │  alternatives[] → tool.json
└──────────────────────────────────────────────────────────┘
```

Badges **BYOA** / **BYOT** conforme `byoa` / `byot`. Capacidades e Limitações lado-a-lado
(nunca esconder limitações — é um princípio do produto).

**Content Binding — Tool View**

| Slot | Campo (`tool.json`) |
|------|---------------------|
| Cabeçalho | `name` · `category` · `toolType` · `provider` · `url` |
| Descrição | `description` |
| Preço | `pricing.free` · `freeLimitations` · `paidPlans` |
| Capacidades / Limitações | `capabilities[]` · `limitations[]` |
| Boas práticas | `bestPractices[]` |
| Casos de uso | `useCases[]` (→ `protocol`, `activity`) |
| Alternativas | `alternatives[]` (→ `tool.json`) |
| Badges | `byoa` · `byot` |

---

## 15. Prompt View

Um prompt é um **template determinístico** (`prompt.md`) com variáveis (`metadata.json`).
Contentor `--container-prose`. Inspiração: OpenAI Playground / Google AI Studio — foco no
copiar/adaptar, sem executar (BYOA: o utilizador leva-o para a sua IA).

```
┌──────────────────────────────────────────────────────────┐
│ Definição do Tema de Investigação        PR-001 · pt       │  name · id · language
│ Auxiliar o investigador a definir e delimitar o tema.      │  objective
│ Compatível: ChatGPT · Claude · Gemini                      │  compatibleTools (chips)
├────────────────────────┬─────────────────────────────────┤
│  Variáveis             │  Prompt                     copiar│  metadata.variables | prompt.md
│  ┌───────────────────┐ │  ┌──────────────────────────────┐ │
│  │ Área de estudo *  │ │  │ És um assistente metodológico.│ │  (mono; variáveis realçadas
│  │ [_______________] │ │  │ Ajuda-me a definir um tema em  │ │   a indigo, preenchidas em
│  │ Interesse *       │ │  │ {{study_area}} sobre           │ │   tempo real a partir do
│  │ [_______________] │ │  │ {{research_interest}} ao nível │ │   formulário à esquerda)
│  │ Nível ▾ mestrado  │ │  │ {{academic_level}}.            │ │
│  └───────────────────┘ │  └──────────────────────────────┘ │
│                        │  Resultado esperado: tema definido │  expectedOutput
│                        │  [ Copiar prompt ]  [ Abrir no ↗ ] │  → tool
└────────────────────────┴─────────────────────────────────┘
```

- Formulário à esquerda gerado a partir de `variables` (string/enum/required); preenche o
  template em tempo real. Variáveis não preenchidas ficam realçadas.
- **Copiar prompt** é a acção primária. "Abrir no…" leva à ferramenta compatível (BYOA).
- Corpo do prompt em `--font-mono`; `{{variáveis}}` a indigo.

**Content Binding — Prompt View**

| Slot | Campo |
|------|-------|
| Título / objectivo | `metadata.name` · `objective` |
| Meta | `id` · `language` · `version` |
| Compatibilidade | `metadata.compatibleTools[]` → `tool.json` |
| Formulário | `metadata.variables[]` (`name`, `type`, `values`, `required`) |
| Corpo | `prompts/<id>/prompt.md` |
| Resultado | `metadata.expectedOutput` |
| Protocolo/actividade | `metadata.protocol` · `activity` |

---

## 16. Navigation

Navegação mínima, sempre orientada por necessidade (RFC-005 §6.1).

### 16.1 Estrutura

| Zona | Conteúdo |
|------|----------|
| **Top bar** (56px) | Logo/breadcrumb à esquerda · Command palette (⌘K) · toggle tema (◐) · perfil |
| **Sidebar** (240px) | Início · Protocolos · Ferramentas · Prompts · Percursos · Perfil de Investigador |
| **Breadcrumb** | Percurso › Protocolo › Actividade (contexto da cadeia, RFC-005 §3) |
| **Command palette** | Pesquisa universal por necessidade/protocolo/ferramenta/prompt; navegação por teclado |

### 16.2 Regras

- Item de nav activo: texto/ícone indigo + barra 2px à esquerda; nunca fundo cheio pesado.
- **Protocol View entra em modo foco** — a sidebar recolhe; volta ao sair.
- Máximo 6 itens de topo na sidebar. Sem menus em cascata profundos.
- Breadcrumb permite subir na cadeia (de onde vim → para onde vou), sempre visível.
- Sem tab bars densas, sem mega-menus, sem navegação administrativa.

---

## 17. Dark Mode

Primeira classe, não um "skin". Ativado por `[data-theme="dark"]` (segue `prefers-color-scheme`
por omissão, com toggle manual persistido). Fundo quase-preto **frio**, nunca preto puro;
superfícies elevam por luminância, não por sombra.

```css
[data-theme="dark"] {
  --color-bg:            var(--neutral-950);   /* #0C0E13 */
  --color-surface:       #14171D;
  --color-surface-raised:#1B1F27;
  --color-surface-sunken:#0F1218;

  --color-border:        #262B34;
  --color-border-strong: #333A45;

  --color-text:          #E7EAF0;
  --color-text-muted:    #99A2B2;
  --color-text-subtle:   #6C7686;

  --color-brand:         var(--brand-400);   /* mais claro p/ contraste */
  --color-brand-hover:   var(--brand-300);
  --color-brand-subtle:  rgba(99,102,241,0.14);
  --color-on-brand:      #0C0E13;
  --color-link:          var(--brand-300);
  --color-focus-ring:    var(--brand-400);
}
```

**Regras dark:** tints semânticos passam a fills de baixa opacidade (ex.: `rgba(5,150,105,.15)`
para success) com texto claro; brand desce para 400/300; elevação por `surface-raised` +
sombra mínima; imagens/ícones herdam `currentColor`. Contraste texto/fundo ≥ 4.5:1 (AA) em
ambos os temas — verificar cada par de tokens.

---

## 18. Responsividade

Mobile-first. A experiência de **execução** (Protocol View) é prioritária em todos os tamanhos.

| Breakpoint | Comportamento |
|------------|---------------|
| `< sm` (telemóvel) | Coluna única. Sidebar → drawer. Step rail → barra de progresso horizontal no topo. Ferramenta/Prompt/Validação empilham. Formulário do Prompt acima do corpo. |
| `sm–md` (tablet) | Coluna única larga (`--container-prose`). Definition lists a 2 colunas onde couber. |
| `lg` (laptop) | App shell completo: sidebar 240px + conteúdo centrado. Protocol View com step rail lateral. |
| `xl+` (desktop) | Larguras máximas aplicadas; conteúdo de leitura **nunca** ultrapassa `--container-prose`. Margens laterais crescem, a medida não. |

**Regras:** alvos de toque ≥ 44px em mobile · uma acção primária sempre visível (sticky footer
no Protocol View mobile) · sem tabelas de scroll horizontal para conteúdo essencial (reflow para
definition list) · tipografia fluida ligeira entre `sm` e `xl`.

---

## Apêndice A — Tokens de fundação adicionais

```css
:root {
  /* raios */
  --radius-sm: 4px;
  --radius-md: 6px;    /* botões, inputs */
  --radius-lg: 8px;    /* cards */
  --radius-xl: 12px;   /* modais, superfícies grandes */
  --radius-full: 9999px;

  /* elevação (usar com parcimónia) */
  --shadow-xs: 0 1px 2px rgba(16,18,23,0.04);
  --shadow-sm: 0 1px 3px rgba(16,18,23,0.08), 0 1px 2px rgba(16,18,23,0.04);
  --shadow-md: 0 4px 12px rgba(16,18,23,0.10);
  --shadow-lg: 0 12px 32px rgba(16,18,23,0.14);

  /* movimento */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 120ms;
  --duration-base: 180ms;
  --duration-slow: 240ms;

  /* foco */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition-duration: 1ms !important; }
}
```

## Apêndice B — Iconografia

- **Conjunto oficial: Lucide** (stroke, 1.5–2px). Alinha com o campo `protocol.json → icon`
  (ex.: `"book-open"`), que **é** um nome de ícone Lucide — bind directo, zero mapeamento manual.
- Tamanhos: 16px (inline/botão), 20px (nav/listas), 24px (cabeçalhos). Herdam `currentColor`.
- Ícones nunca sozinhos como único portador de significado (acompanhados de label ou `aria-label`).

## Apêndice C — Acessibilidade (AA obrigatório)

- Contraste ≥ 4.5:1 (texto) / 3:1 (UI e texto grande), verificado em ambos os temas.
- `:focus-visible` sempre presente (anel indigo, §Apêndice A). Nunca `outline: none` sem substituto.
- Navegação completa por teclado; ordem de foco lógica; `Esc` fecha overlays.
- Estado nunca comunicado só por cor (ícone + label + cor).
- Alvos ≥ 40px (44px em toque). `prefers-reduced-motion` respeitado.
- Idioma: `lang="pt"` por omissão; prompts carregam `metadata.language`.

## Apêndice D — Mapa de vinculação de conteúdo (resumo)

| Vista / componente | Activo fonte |
|--------------------|--------------|
| Protocol Card, Protocol View | `protocols/<alias>/protocol.json` · `workflow.json` · `checklist.json` · `validation.json` |
| Recipe View | definição da recipe (v2) → referencia `protocol.json` de cada protocolo |
| Tool View | `tools/<alias>/tool.json` |
| Prompt View | `prompts/<id>/metadata.json` + `prompt.md` |
| Progresso / estado | Runtime (RFC-003, LocalStorage no MVP) — **nunca** hardcoded |

> **Recordatório final:** se um elemento visual não tem origem num destes activos ou no Runtime,
> não deverá existir na interface. O Design System apresenta conteúdo; não o inventa.

---

## Critérios de aprovação

Este Design System considera-se aprovado — e o frontend pode iniciar — quando:

- [ ] Os 10 Princípios de Design e os 10 Princípios de UX forem aceites.
- [ ] Os tokens de fundação (grid, spacing, tipografia, paleta, semânticos) forem validados.
- [ ] As cores dos 8 estados do Runtime forem confirmadas.
- [ ] Os componentes (Botões, Cards, Lists, Progress) forem aprovados.
- [ ] As 4 vistas de domínio (Protocol, Recipe, Tool, Prompt) e os seus Content Bindings forem validados.
- [ ] Navegação, Dark Mode e Responsividade forem aceites.
- [ ] A regra Content-First (zero conteúdo hardcoded) for reafirmada como vinculativa.

---

> *"A melhor interface para investigação é a que desaparece: o método à frente, a ferramenta atrás,
> e sempre uma resposta clara à pergunta — o que devo fazer agora?"*
