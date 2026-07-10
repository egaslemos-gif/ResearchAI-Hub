# SPEC-007: Information Architecture

**Status**: Active  
**Version**: 1.0.0-beta

Este documento define a Arquitetura de Informação do ResearchAI Hub. O seu objetivo é congelar a estrutura de navegação e garantir que a jornada do investigador se desenrola de forma lógica, da necessidade primária à competência desenvolvida.

## 1. Hierarquia Oficial da Plataforma
A arquitetura de navegação segue sempre este eixo de aprofundamento:

1. **Homepage** (Dashboard Principal)
2. **Necessidade do Investigador** (Ex: *Fazer revisão da literatura*)
3. **Competência** (Catálogo de Guias / Contexto Global)
4. **Protocolo** (O Workflow propriamente dito - ex: `RL-01`)
5. **Passo** (Ações granulares)
6. **Ferramenta** (A escolha técnica)
7. **Prompt** (A interação com a IA)
8. **Resultado** (Evidência Produzida)
9. **Competência Desenvolvida** (Conclusão do percurso)

## 2. A Sidebar (Menu Lateral)
A *Sidebar* transcende a interface administrativa; atua como a secretária de trabalho virtual do investigador.

- **Workspace**: Espaço pessoal.
  - `Início` (Homepage)
  - `Investigação Atual` (Atalho direto para o Contexto de Sessão em curso)
- **Percursos**: Caminhos metodológicos disponíveis.
  - `Competências` (O catálogo académico organizado por necessidades)
- **Biblioteca**: Recursos estáticos para apoio.
  - `Ferramentas mais utilizadas`
  - `Biblioteca de Prompts`
  - `Recursos` (Guias teóricos/externos)
- **Academy** *(Em desenvolvimento)*: Área de certificação e progressão pedagógica.

## 3. O Fluxo de Estado (Contexto Global)
- **Continuação de Sessão**: Quando o utilizador inicia um protocolo, este assume a "Investigação Atual". Ao regressar à Homepage, o `WelcomeBackCard` deve intercetá-lo de imediato com a opção de retomar a última sessão, sem forçá-lo a procurar o protocolo nos menus.
- **Contexto da Investigação**: Dados como "Área de Estudo" e "Tema" sobrevivem aos *Passos* e *Protocolos*, devendo ser visíveis em todos os breadcrumbs ou painéis superiores sempre que o utilizador está em fase de execução (dentro de um Passo).
