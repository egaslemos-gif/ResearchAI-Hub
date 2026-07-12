# RFC-PANEL-001: Workspace Plugin Registry & Panel Lifecycle

## 1. Workspace Plugin Registry
Para escalar e suportar N protocolos futuros, a plataforma requer um sistema formal de extensibilidade. O catálogo estático de painéis ("Panels Registry") é substituído pelo `WorkspacePluginRegistry`.

Cada integração (ex: PDF Viewer, Mermaid Graph, Zotero Citation Manager) passa a declarar metadados estritos que determinam o seu comportamento e visibilidade sem que o Core Shell tenha de ser alterado.

```typescript
interface WorkspacePlugin {
  id: string;                 // Ex: "pdf-viewer"
  name: string;               // Ex: "PDF Reader"
  version: string;
  supportedRegions: string[]; // Ex: ["main", "secondary", "floating"]
  preferredDock: DockTarget;  // Ex: "CENTER"
  priority: number;           // Z-index lógico
  dependencies: string[];     // Ex: requer "document-manager" ativo
  visibilityRules: Rule[];    // Ex: "show-if-has-pdf-evidence"
  actions: PluginAction[];    // Ex: "extract-text"
  capabilities: string[];
}
```

## 2. Panel Lifecycle
Um `WorkspacePanel` é a instância em memória (ou estado persistente visual) do plugin. Para prevenir fugas de memória (memory leaks) e gerir o estado isolado entre as trocas constantes de contexto, todos os Painéis devem implementar um ciclo de vida obrigatório orquestrado pela Topology.

```typescript
interface WorkspacePanel {
  /** Inicia recursos, workers, fetch de dados prévios. */
  mount(): void;          
  
  /** Renderiza no DOM, ganha foco principal. */
  activate(): void;       
  
  /** Removido do ecrã, mas preserva recursos locais pesados. */
  deactivate(): void;     
  
  /** Regista snapshots de estado (ex: posição de scroll, texto digitado). */
  serialize(): any;       
  
  /** Destruição total, limpeza de listeners e websockets. */
  dispose(): void;        
}
```
