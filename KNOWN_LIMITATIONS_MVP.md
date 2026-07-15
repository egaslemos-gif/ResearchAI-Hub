# Known Limitations – MVP

Este documento regista limitações conhecidas que são aceitáveis para a demonstração e estabilizadas durante o *Architecture Freeze*.

## 1. Browser Extensions
Em ambiente de desenvolvimento local, algumas extensões de browser que injetam scripts (como Grammarly, React DevTools, Password Managers, Dark Reader, etc.) podem interagir com as mecânicas internas de empacotamento e provocar o *Error Overlay* (falsos positivos do Turbopack).
**Mitigação:**
- Utilizar um Perfil Guest / Convidado dedicado.
- Modo Incógnito estrito.
- Desativar totalmente as extensões antes da apresentação.

---

## 2. Free-tier APIs
A utilização intensiva de instâncias de Inteligência Artificial gratuitas (como o Gemini ou o Claude livre) pode esgotar a *quota* disponível durante o processo contínuo de revisão e síntese da literatura.
**Mitigação:**
- Rotatividade operacional: Claude → Gemini → GLM → BYIA.

---

## 3. OpenAlex e Conectividade
A integração da pesquisa primária de repositórios (OpenAlex/Semantic Scholar) é estritamente dependente da conectividade e disponibilidade dos respetivos serviços. Timeout ou falha de rede suspenderá a ingestão orgânica de novos metadados.
**Mitigação:**
- Recorrer ao Dataset Oficial preparado previamente (em ficheiro de texto) com os DOI, resumos e *abstracts* já indexados.

---

## 4. Objetivo do MVP
As seguintes funcionalidades não fazem parte do âmbito atual porque o MVP valida exclusivamente:
- A eficácia da metodologia e protocolo (RL-01);
- O fluxo contínuo do investigador;
- A produção mecânica de artefactos estáticos (Markdown/Word/JSON).

**O MVP não valida ainda:**
- Desempenho e velocidade ótima do parser;
- Escalabilidade (volumes muito grandes de dados ou bases multi-gigabyte);
- Múltiplos utilizadores concorrentes ou controlo granular de sessões;
- Execução assíncrona distribuída (background jobs em nuvem).
