# RFC-COMPOSITION-001: Workspace Composition Engine

## 1. Responsabilidade
A `WorkspaceCompositionEngine` atua como a única ponte legítima entre a lógica de negócio (`Execution Engine`) e a apresentação visual (`WorkspaceTopology`).

A Execution Engine responde apenas com estados abstratos da investigação (ex: `Preparation`, `Executing`, `Reviewing`, `Completed`). Ela nunca conhece `Panels`, `Regions` ou `CSS`. A conversão de "Estado" para "Interface Visual" é a responsabilidade exclusiva da Composition Engine.

## 2. Contrato de Entrada e Saída
```typescript
interface CompositionContext {
  state: WorkspaceState;    // Preparation, Executing, Reviewing...
  viewport: Viewport;       // Desktop, Tablet, Mobile (Breakpoint)
  session: Session;
  runtime: Runtime;
}

interface WorkspaceCompositionEngine {
  compose(context: CompositionContext): WorkspaceTopology;
}
```

## 3. Exemplo de Saída (Topology Record)
A `WorkspaceTopology` resultante não contém componentes React, é puramente descritiva e serve de *mapa* para o Renderer:
```json
{
  "explorer": [
      "protocol-navigator"
  ],
  "context": [
      "research-profile",
      "prompt-settings"
  ],
  "main": [
      "research-console"
  ],
  "secondary": [],
  "utility": [],
  "status": [
      "status-bar"
  ]
}
```

## 4. Sensibilidade ao Viewport (Plataforma)
A composição determina o layout final com base no dispositivo ativo (`viewport`), adaptando o posicionamento dos *Docks*:
*   **Desktop:** O cenário ideal. Ex: `Explorer (Left) | Main (Center) | Context (Right)`.
*   **Tablet:** O ecrã fica mais pequeno. Ex: `Explorer` é removido e passa a ser um Modal flutuante. `Main` e `Context` partilham o ecrã.
*   **Mobile:** Compressão total. Apenas a `Main Region` é visível em contínuo. `Explorer` e `Context` transformam-se em Bottom Sheets.
