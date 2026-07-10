# SPEC-006: ResearchAI Hub Design System

**Status**: Active  
**Version**: 1.0.0-beta

Este documento estabelece o Design System e o *UI Contract* para o ResearchAI Hub. O seu propósito é assegurar que todas as futuras expansões (SR-01, Escrita Científica, Análise de Dados, etc.) herdem automaticamente a mesma consistência visual e interativa.

## 1. Princípio Editorial Fundacional

> Toda a interface deverá responder unicamente à pergunta:
> **"O que devo fazer a seguir?"**
>
> Nunca: *"O que este sistema consegue fazer?"*

O ResearchAI Hub não é um catálogo de protocolos; é um assistente proativo. O investigador deve ser conduzido continuamente para a sua próxima necessidade real, eliminando a exploração de menus sem objetivo.

## 2. UI Contract: Tipografia e Identidade Académica
A interface abandona a estética "Dashboard SaaS" para adotar uma linguagem editorial rigorosa, comum em plataformas académicas (Notion, OpenAI, Nature, IEEE).

- **"Mais branco. Mais respiração."**: Evitar caixas e contornos (*borders*) desnecessários. O conteúdo separa-se pelo espaço vazio.
- **Tipografia**: 
  - Títulos (`h1`, `h2`): Serifa (`var(--font-serif)`), conferindo um tom académico e oficial.
  - Interface (`h3+`, corpo): Sem serifa (`var(--font-sans)`), garantindo legibilidade digital.
  - Monospace (`var(--font-mono)`): Utilizado apenas em variáveis de ambiente, badges estruturais ou dados brutos.

## 3. Escala Oficial de Espaçamentos
Todos os ficheiros CSS (`.module.css`) **têm obrigatoriamente** de utilizar a seguinte escala:

| Variável | Valor | Aplicação |
| :--- | :--- | :--- |
| `--gap-section` | `72px` | Distância entre grandes secções horizontais (ex: entre Percursos e Ferramentas). |
| `--gap-block` | `40px` | Distância entre cabeçalho de secção e o seu conteúdo (grid/cards). |
| `--gap-component` | `24px` | Distância entre cartões numa *Grid* ou elementos irmãos independentes. |
| `--gap-internal` | `16px` | Padding interno de *Cards* estruturais ou espaçamento entre elementos num bloco lógico. |
| `--gap-field` | `12px` | Distância entre uma *Label* e um *Input*, ou um Ícone e um Texto numa lista. |

## 4. UI Contract: Interatividade e Estados
Nenhum elemento no ResearchAI Hub deve exibir comportamentos nativos arbitrários (como *underline* azul do browser ou outlines genéricos). Todo o elemento interativo deve transitar por estes 6 estados de forma coordenada.

- **Transição Padrão**: `transition: all 150ms var(--ease-out);`
- **Default**: O estado normal, com contrastes validados no `tokens.css`.
- **Hover**: 
  - Em *Cards*: Efeito de ligeira elevação (`transform: translateY(-2px); box-shadow`).
  - Em hiperligações textuais (`.prose a`): Surge o sublinhado com `text-underline-offset: 3px`.
- **Focus**: Utiliza o *Focus Ring* customizado (`outline: 2px solid var(--color-focus-ring)` e `outline-offset: 2px`), invisível no rato, vísivel no teclado (`:focus-visible`).
- **Pressed**: Sem efeitos de escala exagerados. Ligeiro escurecimento da cor base (`--brand-hover` para `--brand-800`).
- **Disabled**: Elementos bloqueados ou futuros (`Brevemente`) possuem `opacity: 0.7`, `cursor: not-allowed` e recusam interações.
- **Visited**: Cores visitadas são purgadas, mantendo-se fiéis ao estado original.

## 5. UI Contract: Grids
- **Base Grid**: Mobile (1 coluna), Tablet (2 colunas), Desktop Wide (3 colunas).
- Utilizar `gap: var(--gap-component)` nas *Grid layouts*.
