# Guia Operacional
**Formação:** Inteligência Artificial Aplicada à Investigação Científica

Este documento detalha as necessidades técnicas, logísticas e de preparação para garantir a execução fluida da formação presencial de 4 horas.

---

## 1. Requisitos Logísticos e de Espaço

- **Sala de Formação:** Formato em U ou ilhas de trabalho. Privilegiar a mobilidade do formador para acompanhar os ecrãs dos formandos.
- **Projecção:** Projector HD ou ecrã interactivo com visibilidade clara para texto de prompts. Acesso a cabo HDMI e adaptador USB-C.
- **Quadro Branco / Flipchart:** Fundamental para desenhar diagramas de fluxo conceptuais rápidos (e.g., PICo) e explicar o mapeamento de variáveis nos prompts.
- **Tomadas de Energia:** Pelo menos uma tomada disponível por participante (utilização intensiva de portáteis durante 4h).

---

## 2. Requisitos Tecnológicos (Infraestrutura)

- **Internet Profissional:** Ligação Wi-Fi estável, de alta velocidade, capaz de suportar até 20 utilizadores em simultâneo a executar consultas a Large Language Models.
- **Acessos de Rede (Firewall):** O administrador de sistemas do local deve confirmar com 48h de antecedência que os seguintes domínios NÃO estão bloqueados na rede local:
  - `chat.openai.com`
  - `claude.ai`
  - `gemini.google.com`
  - `consensus.app`

---

## 3. Requisitos Tecnológicos (Formandos)

- **Equipamento:** Cada formando deve trazer um computador portátil próprio (tablets/smartphones não são adequados para copy/paste de prompts complexos e gestão de tabelas).
- **Contas de Acesso (Onboarding Prévio):** A organização deve enviar um email 72h antes da sessão instruindo os formandos a criarem contas gratuitas (sign-up concluído) nas seguintes plataformas:
  - Consensus (consensus.app)
  - ChatGPT (chat.openai.com) ou Claude (claude.ai)

---

## 4. Checklist do Formador (Dia da Formação)

### T - 60 minutos
- [ ] Testar ligação Wi-Fi no portátil do formador.
- [ ] Testar projectores e adaptar a resolução (fontes de texto grandes para demonstração de prompts).
- [ ] Verificar acesso aos 4 domínios críticos (Consensus, ChatGPT, Claude, Gemini).
- [ ] Abrir localmente: Slides (03-Presentation), Prompts base (06-Handouts), Ficheiro do Caso de Estudo.

### T - 15 minutos
- [ ] Distribuir material de apoio (se em formato físico) ou link para partilha da pasta na cloud.
- [ ] Confirmar logins com os primeiros formandos a chegar.

---

## 5. Plano de Contingência

A tecnologia pode falhar. O formador deve estar preparado para os seguintes cenários:

| Risco / Cenário de Falha | Acção de Mitigação (Backup Plan) |
|--------------------------|----------------------------------|
| **Falha de Wi-Fi Global** | O formador muda para hotspot 5G próprio e a formação passa de "prática distribuída" para "demonstração guiada" interactiva no projector. Os formandos debatem os prompts e o formador executa. |
| **ChatGPT offline/lento** | Transição imediata para o Claude.ai ou Gemini. A instrução pedagógica é agnóstica à ferramenta (BYOA). |
| **Consensus offline** | Substituir o Exercício 2 por uma pesquisa no Semantic Scholar ou no Google Scholar, e usar o ChatGPT para analisar os abstracts exportados. |
| **Formandos sem conta criada** | Fornecer documento Word com os "outputs pré-gerados" do Caso de Estudo Oficial, permitindo que leiam a análise caso não consigam executá-la em tempo real. |
