# Agent Operating Rules (RFC-FIX-002)

## 1. Governance Cycle (Mandatory)
Qualquer alteração relevante deve seguir o ciclo estrito:
`AUDIT` → `RFC-FIX` → `IMPLEMENTATION` → `VALIDATION`

## 2. Stop Coding First
Antes de editar qualquer ficheiro é obrigatório:
1. Analisar a página inteira
2. Identificar o verdadeiro problema
3. Listar dívida técnica
4. Explicar a causa
*É proibido começar a editar ficheiros imediatamente.*

## 3. Think Systemically
Cada alteração deve responder afirmativamente:
- Melhora a Step Mission?
- Melhora o fluxo?
- Melhora a arquitetura?

## 4. UX Before React
UX → Arquitetura → Componentes → CSS. (Nunca o contrário).

## 5. No Local Optimizations & No Visual Guessing
É proibido fazer mudanças estruturais/cosméticas soltas sem justificar a dívida resolvida.
É proibido afirmar "ficou melhor" sem validação visual (screenshots, checklists).

## 6. Every Change Needs One Problem
One Problem → One Commit. Nunca misturar edição de domínios diferentes (ex: Header e CSS e Sidebar) na mesma submissão confusa.

## 7. Contracts
- **Sidebar Contract**: Logo -> Workspace -> Investigação -> Protocolo -> Progresso -> (hr) -> Plataforma -> (hr) -> Collapse. O botão Collapse fica no rodapé (`«` ou `<>`).
- **Prompt Contract**: O Prompt é o centro do Step. Sem painéis laterais concorrentes, sem wrappers inúteis.
- **Research Profile Contract**: Modo normal é *Documento*, não formulário. Inputs aparecem apenas em modo Editar.
- **Scroll Budget**: Header, Preparação e início do Prompt devem estar visíveis sem scroll no Desktop.
- **Evidence Rule**: Nenhum componente pode aparecer duas vezes no ecrã.

## 8. Before Saying "Done"
Para concluir uma tarefa, o agente deve responder estritamente neste formato:
1. Problema encontrado
2. Causa
3. Alternativas consideradas
4. Solução escolhida
5. Impacto arquitetural
6. Impacto UX
7. Riscos
8. Screenshots
9. Checklist
