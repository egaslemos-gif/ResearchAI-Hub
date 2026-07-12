# RFC-WORKSPACE-MANIFEST-001: Workspace Shell Manifest

## 1. Abstract
Garantir que o Renderer (o motor visual em React) é uma entidade estritamente declarativa e abstrata. O Renderer **nunca deve conter valores de design hardcoded** (larguras específicas, lógicas complexas de colapso) na sua camada CSS baseada na identificação visual de páginas.

## 2. O Manifesto
A configuração visual base do Shell é declarada e injetada através de um manifesto externo (YAML/JSON).

```yaml
workspace:
  id: research-workspace
  regions:
    explorer:
      collapsible: true
      defaultState: "expanded"
      preferredWidth: 260
    context:
      collapsible: true
      defaultState: "expanded"
      preferredWidth: 320
    main:
      grow: true
      minWidth: 600
    secondary:
      collapsible: false
      preferredWidth: 420
    utility:
      collapsed: true
      preferredHeight: 250
    status:
      fixed: true
      height: 32
```

## 3. Aplicação do Contrato
A `WorkspaceCompositionEngine` combina as regras ditadas por este manifesto com a topologia injetada pelo estado atual, enviando as propriedades finais para o Renderer. O Renderer (React) gera dinamicamente a `Grid` e o `Flexbox` baseando-se unicamente nestes dados agnósticos (via `style={...}` ou CSS Variables ligadas ao estado da topologia).
