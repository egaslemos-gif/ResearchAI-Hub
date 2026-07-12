# RFC-DM-002: Research Session

**Status**: Draft
**Layer**: Domain

Este documento define o contrato da Sessão de Investigação e o Workflow padrão de execução.

## 1. Research Session Contract
Uma sessão representa uma única execução de um protocolo científico por um investigador. 

**Regra de Ouro**: A `Session` nunca depende da UI. A UI depende da `Session`.

O estado de uma Sessão contém:
- `Protocol` (A referência imutável ao schema)
- `Current Step` (O ponto atual de execução)
- `Evidence` (Conjunto de evidências capturadas)
- `Artifacts` (Conjunto de artefactos gerados)
- `Variables` (O estado do Research Profile resolvido)
- `History` (Registo de ações para persistência e Undo/Redo)
- `Timeline` (Progresso através do Stepper)
- `Workspace State` (Metadados da sessão, tempo gasto, etc.)

## 2. Workflow Contract
A execução de um passo não se resume a "Gerar um Prompt e ler". Segue um método científico restrito.

**Fluxo Linear do Workflow:**
1. `Prompt` (Resolução de variáveis e templates)
2. `Execution` (Envio para a Tool/Adapter)
3. `Evidence Capture` (A IA responde, e os dados úteis são capturados para a *Evidence Store*)
4. `Evidence Review` (O investigador aceita ou refina a evidência)
5. `Artifact Update` (A evidência aprovada integra o Artefacto, gerando uma nova versão)
6. `Validation` (O sistema valida as *Completion Rules*)
7. `Completion` (Passo concluído, avança na Timeline)
