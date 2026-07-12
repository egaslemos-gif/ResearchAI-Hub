# RFC-TOPOLOGY-001: Workspace Topology Architecture

## 1. Abstract
A arquitetura de UI evolui para um modelo baseado num **Workspace Topology**, estritamente inspirado em IDEs (ex: VSCode).
O Aggregate Root visual do frontend deixa de ser o `ResearchWorkspaceShell` (que passa a atuar apenas como Renderer cego) e passa a ser a `WorkspaceTopology`. A topologia contém Regions, que por sua vez contêm Plugins organizados em Docks. O conceito de "Step Page" é completamente abolido.

## 2. Regions vs Docks
O layout desassocia a responsabilidade visual (Region) da posição visual (Dock). 
Um Plugin declara o seu *Preferred Dock*. A Composition Engine decide a *Region* final onde o Plugin será acoplado, dependendo do dispositivo e estado.

### 2.1 Workspace Docks (Posicionamentos Lógicos)
*   `CENTER`
*   `LEFT`
*   `RIGHT`
*   `BOTTOM`
*   `FLOATING`
*   `MODAL`

### 2.2 Workspace Regions (Responsabilidades Estruturais)
O Shell expõe regiões genéricas de responsabilidade:
*   **Explorer Region:** Árvore de navegação e descoberta. Ex: Protocol Navigator, Knowledge Graph, Files, Literature, Sessions.
*   **Context Region:** Painel inspetor (Inspector). Ex: Research Profile, Prompt Settings, Variables.
*   **Main Region:** Área de foco primário. Ex: Research Console (antigo Prompt), Document Editor, PDF Viewer.
*   **Secondary Region:** Painel auxiliar para resultados e validações. Ex: Evidence Panel, Checklist.
*   **Utility Region:** Ferramentas de suporte não críticas. Ex: Execution Logs, Timeline, Terminal. A Dock pode ser Bottom, Right ou Floating.
*   **Status Region:** Barra de estado universal (Tokens, Conexão, Cloud).

## 3. Arquitetura Final de Composição
O fluxo arquitetural obedece à seguinte hierarquia estrita:
```text
Research Session
        │
Research Runtime
        │
Execution Engine (Conhece o protocolo e dita o estado, não a UI)
        │
Workspace State (Estado agnóstico ex: Preparation, Executing)
        │
Workspace Composition Engine (Agrega Estado + Viewport)
        │
Workspace Topology (O verdadeiro Aggregate Root da UI)
        │
Workspace Plugin Registry (Fornece as instâncias dos Panels/Plugins)
        │
Workspace Renderer (O Shell React)
        │
React DOM
```
