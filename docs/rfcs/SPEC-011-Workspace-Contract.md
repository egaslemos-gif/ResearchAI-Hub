# SPEC-011: Workspace Contract

## 1. Workspace Philosophy

O ResearchAI Hub não é um conjunto de "páginas web". É um **Document Workspace**. A filosofia principal dita que o utilizador nunca muda de aplicação ou de contexto estrutural ao longo de uma investigação. Quer esteja a consultar um Passo de Protocolo, a editar um Prompt ou a rever uma Ferramenta, a fundação arquitetural é rigorosamente a mesma. 

O centro de qualquer ecrã é a **Research Task** em curso, manifestada através de um **Documento Técnico** (Prompt, Checklist, Matriz) que o investigador tem de produzir ou consumir.

---

## 2. Workspace Regions

Cada página operacional (Workspace) implementa obrigatoriamente um contrato de regiões geográficas e semânticas. O ecrã divide-se em 5 regiões principais, distribuídas ao longo de um eixo de topo para o fundo e numa grelha central (*Execution Grid*).

### 1. Navigation Region (Sidebar/TopNav)
A região de navegação macro da plataforma. Intocável durante a execução da tarefa.

### 2. Header Region
Localizada no topo do espaço útil. Confere contexto imediato sobre o que está a ser executado.
- **Responsabilidades**: Navegação regressiva (*Breadcrumbs*), Título do Documento/Tarefa, Tags, Métricas de Tempo, Barra de Progresso, Ações Globais.

### 3. Execution Region (LEFT Panel)
A "oficina" da tarefa. Contém as alavancas e o contexto operacional.
- **Responsabilidades**: Configurar o documento, consultar instruções e abrir as ferramentas externas.
- **Componentes Permitidos**: 
  - `TaskContext` (Objetivos e Instruções)
  - `DocumentProperties` (Inputs, Configurações - estilo Notion)
  - `ToolCard` (Lançador do ChatGPT, Consensus, etc.)
  - `EthicsNote` (Alertas críticos)

### 4. Document Region (CENTER/RIGHT Panel)
O "artefacto" em produção. Esta é a região nobre, desenhada editorialmente para conforto de leitura, sem contornos de ecrã ou barreiras artificiais.
- **Responsabilidades**: Apresentar o conteúdo rico (Markdown), destacar variáveis, guiar o resultado.
- **Componentes Permitidos**:
  - `DocumentViewer` (Renderizador de Prompts, Guias, Checklists, Tabelas)
  - `ExpectedResult` (O target de produção)

### 5. Evidence Region (Bottom/Contextual)
A validação do trabalho. Regista aquilo que foi concretamente extraído e adicionado à base de conhecimento.
- **Responsabilidades**: Validar o ciclo da *Research Task*.
- **Componentes Permitidos**:
  - `EvidencePanel` (Artefactos gravados)

---

## 3. Allowed Components & Interaction Rules

- **Inputs invisíveis**: Os componentes da `Execution Region` (nomeadamente `DocumentProperties`) comportam-se visualmente como "propriedades do documento" e não como formulários de um dashboard administrativo. Linhas finas, ausência de caixas densas, tipografia utilitária.
- **Componente Agnóstico**: O `DocumentViewer` não "sabe" o que é um Prompt. Ele sabe receber uma string de Markdown enriquecido e um dicionário de propriedades e renderizá-los, destacando as propriedades correspondentes no texto.
- **Comunicação State-Driven**: O estado do Workspace é garantido por um contexto global por sessão operacional (`WorkspaceProvider`). O `DocumentProperties` atualiza as propriedades, o `DocumentViewer` escuta e reage.

---

## 4. Layout Rules

- **Execution Layout**: As regiões de `Execution` e `Document` inserem-se no `ExecutionGrid` que deve respeitar uma largura máxima (`--container-execution` ex: 1400px), mas permitir 100% de ocupação do ecrã disponível para minimizar a sensação de compressão.
- **Rácio de Grelha**: `grid-template-columns: 1fr 1fr` em desktop, ou `minmax(300px, 400px) 1fr`. Com a evolução para 3 painéis (Painel IA), a grelha passará a `300px 1fr 300px`.
- **Scroll Global**: É terminantemente proibido o uso de `max-height` e `overflow: auto` (scrollbars internos) dentro da `Document Region`. O *scroll* pertence à página.

---

## 5. State Management (Workspace Session)

O componente `<WorkspaceProvider>` envolve toda a árvore do `ExecutionLayout`. 
O Provider armazena o "Sessão de Investigação Ativa":
- `researchContext`: Os dados persistentes da investigação (Tema, Área, Nível).
- `documentProperties`: Valores voláteis injetados pelo utilizador nas propriedades locais da tarefa (ex: "Tom de Escrita").
- `activeTask`: Referência ao Passo do Protocolo ou Prompt isolado.

As regiões limitam-se a despachar (*dispatch*) ou ler do *Provider*, eliminando a necessidade de componentes complexos que juntam Inputs e Viewers (desacoplamento total).

---

## 6. Future Extensions (AI Integration)

Este contrato já prevê a futura integração de Agentes IA de forma nativa. Na próxima *major release*, uma nova região será adicionada sem quebrar a UI atual:

### AI Assistant Region (RIGHT Panel)
A `Document Region` passará a ocupar o `CENTER`, libertando o lado direito para o assistente.
- **Responsabilidades**: Sugerir propriedades, preencher inputs automaticamente, rever a qualidade do resultado introduzido nas evidências, gerar comentários ao documento.
- **Integração**: O agente terá acesso em tempo real ao `WorkspaceProvider`.
