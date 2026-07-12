# RFC-DM-003: Prompt Engine Architecture

**Status**: Draft
**Layer**: Domain / Application

O *Prompt Engine* é um componente central, isolado e agnóstico de UI. Ele é responsável por transformar um modelo abstrato numa instrução perfeitamente alinhada para execução por LLMs ou outras ferramentas.

## 1. Pipeline Architecture
A resolução de um prompt segue a estrutura rigorosa de transformação:

`Template` ➔ `Resolver` ➔ `Variables` (do Research Profile) ➔ `Validators` ➔ `Markdown` ➔ `Prompt` ➔ `Clipboard` (opcional) ➔ `Execution`

## 2. Prompt Immutability Contract
Um *Resolved Prompt* (Prompt resolvido após injeção de variáveis) é estritamente **imutável**.

Se o utilizador alterar o seu *Research Profile* (ex: alterar a Área ou o Nível), o motor não modifica o prompt atual. Em vez disso, gera um **Resolved Prompt v2**.

**Motivo:** Se os prompts fossem mutáveis, o *Prompt Hash* utilizado para rastrear a origem de uma Evidência (Evidence Contract) deixaria de ser fidedigno. A imutabilidade garante rastreabilidade total ("Qual foi o exato texto enviado que gerou esta Evidência?").
