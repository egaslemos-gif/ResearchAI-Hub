# ResearchAI Hub — Roadmap v1.1 (UX/UI)

> Itens adiados do Sprint A (v1.0.0-beta.2) por alterarem a experiência funcional.

## Sprint B — Discovery & Navigation (v1.1)

### Homepage — Research Workspace

- [ ] Adicionar bloco de **6 Action Cards** acima dos protocolos:
  - 🔍 Encontrar artigos científicos
  - 📖 Fazer revisão da literatura
  - ✍️ Escrever artigo científico
  - 🎓 Desenvolver projecto
  - 📊 Analisar dados
  - 🤖 Aprender IA para investigação
- [ ] Cada cartão liga ao protocolo correspondente ou a `/competencias`
- [ ] Grid 3×2 em desktop, 2×3 em tablet, 1×6 em mobile

### Sidebar — Linguagem Natural

- [ ] Renomear "Competências" → **"Protocolos"**
- [ ] Renomear "Prompts" → **"Biblioteca"**
- [ ] Adicionar item **"Recursos"** (com ícone Lightbulb)
- [ ] Substituir ícones:
  - `GraduationCap` → `BookOpen` (Protocolos)
  - `MessageSquareText` → `Library` (Biblioteca)

### Labels (lib/labels.ts)

- [ ] `nav.competencies` → "Protocolos"
- [ ] `nav.prompts` → "Biblioteca"
- [ ] Adicionar `nav.resources` → "Recursos"
- [ ] `home.competenciesTitle` → "Protocolos de Investigação"
- [ ] `home.competenciesSubtitle` → "Percursos guiados — da pergunta de investigação ao resultado concreto."
- [ ] `home.promptsTitle` → "Biblioteca de Templates"
- [ ] `actions.viewCompetencies` → "Explorar protocolos"

### Reordenação da Homepage

- [ ] Protocolos em destaque → Ferramentas → Biblioteca de Templates → Recursos

---

## Pré-requisitos

Antes de executar o Sprint B, validar com utilizadores:
1. Os novos labels ("Protocolos", "Biblioteca") são claros?
2. Os 6 Action Cards cobrem os cenários de uso principais?
3. O item "Recursos" tem conteúdo suficiente para justificar entrada na sidebar?

## Notas

- Nenhuma destas alterações afecta a arquitectura, runtime ou conteúdo dos activos.
- Todas são alterações de camada de apresentação e strings de UI.
