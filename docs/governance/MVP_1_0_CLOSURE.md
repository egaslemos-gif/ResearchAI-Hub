# ResarchAI Hub - MVP 1.0 Closure

## Estado do Produto
- **Validation Sprint:** Concluída.
- **Release Sprint:** Concluída.
- **MVP Freeze:** Ativo.
- **Release Audit:** Concluída.
- **Deploy Vercel:** Concluído.

## Funcionalidades Disponíveis
- RL-01 (Revisão da Literatura - 10 Passos)
- BYIA (Bring Your Own AI)
- Research Identity (Local - Researcher ID, Session ID, Workspace ID)
- Exportação (Markdown local)
- Documentação (Centro de Conhecimento)
- Landing Page Institucional
- Dashboard Separado
- Roadmap (Visão de Planeamento)
- Exemplos Práticos (Metodologia visível)

## Funcionalidades Planeadas (Pós-MVP)
- Restantes 8 Protocolos Científicos
- Cloud Execution (Pipeline Execution Engine remota)
- SEE (Scientific Extraction Engine via LLM Server)
- SaaS & Multi-user (Autenticação, Perfis)
- Analytics (Métricas de uso e evolução)

## Limitações Conhecidas (Evidências Reais)
- Ausência de sincronização na nuvem; os dados residem apenas em Local/Session Storage no browser do investigador.
- Limite de persistência dependente da higiene do navegador (limpeza de cache apaga a sessão ativa).
- A exportação gera o documento em formato Markdown puro, requerendo formatação adicional manual por parte do investigador num processador de texto (e.g. MS Word) para sumissões APA 7th Edition.
- O modo BYIA exige que o investigador possua contas ativas e limites disponíveis nos LLMs externos (e.g., ChatGPT, Claude, Consensus) para executar as extrações.
