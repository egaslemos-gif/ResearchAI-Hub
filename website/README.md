# ResearchAI Hub — Frontend (MVP)

Frontend do ResearchAI Hub. **Content-First**: consome exclusivamente os activos do
repositório (`protocol.json`, `workflow.json`, `checklist.json`, `validation.json`,
`tool.json`, `metadata.json`, `prompt.md`). Zero conteúdo hardcoded.

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · CSS Modules · Lucide.
- **Design:** tokens de `docs/design-system/Design-System.md` (v1.0) em `styles/tokens.css`.
- **Camada de conteúdo:** `lib/content.ts` é o **único** ponto de acesso aos activos.
- **Sem** login, favoritos, notas, sincronização, IA integrada ou chat (fora do âmbito do MVP).

### Estado: MVP concluído (aprovado com ajustes finais)

Revisão de aceitação registada em [`docs/reviews/PAR-001-MVP-Acceptance.md`](../docs/reviews/PAR-001-MVP-Acceptance.md).
Ajustes finais implementados:

- **CON-1 — linguagem 100% PT:** categorias e famílias em inglês nos activos são traduzidas
  no frontend (`lib/labels.ts` → `categoryLabel`, `familyLabel`). Os identificadores internos
  dos activos permanecem inalterados.
- **TR-1 — avisos éticos contextuais:** o componente `EthicsNote` mostra as regras críticas de
  `validation.json` nos passos que usam IA (sem criar regras novas).

## Desenvolvimento

Requer Node.js ≥ 18. A partir de `website/`:

```bash
npm install      # primeira vez
npm run dev      # http://localhost:3000
```

## Build de produção

```bash
npm run build    # gera páginas estáticas (lê os activos em build-time)
npm start        # serve a build
```

Todas as páginas são **estáticas** (SSG). Os activos são lidos no *build*, não em runtime.

## Deploy (Vercel)

O repositório é um monorepo: os activos vivem na raiz e o frontend em `website/`. Como
o Vercel clona o repositório inteiro antes de compilar, a leitura dos activos em `../`
funciona em build-time.

**Configuração no projeto Vercel:**

- **Root Directory:** `website`
- **Framework Preset:** Next.js (detectado automaticamente)
- **Build Command / Install Command:** predefinidos do Next.js

Ou via CLI (a partir de `website/`, após autenticação `vercel login`):

```bash
vercel          # preview
vercel --prod   # produção
```

> Nota: o deploy público requer autenticação na conta Vercel do projeto. Não é executado
> automaticamente — corre um dos comandos acima quando quiseres publicar.

## Estrutura

```
app/            rotas (Server Components; slugs amigáveis)
components/
  shell/        App Shell + navegação + tema
  ui/           componentes do Design System
  experience/   progresso persistente, passo, prompt, checklist (client)
lib/
  content.ts    acesso aos activos (Content-First)
  labels.ts     linguagem de interface (termos naturais)
  paths.ts      localização da raiz do repositório
styles/tokens.css   tokens do Design System
```
