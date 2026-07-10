# SPEC-009: Brand Identity

## 1. Visão Geral
Esta especificação define a cristalização da **Brand Strategy (SPEC-008)** em propriedades visuais e comportamentais. O **ResearchAI Hub** exige um *UI Contract* assente na clareza absoluta, garantindo um ambiente imersivo de investigação.

## 2. Emotional Design
O design deve suscitar uma resposta emocional precisa no utilizador (docente, investigador, doutorando):
- **Confiança e Rigor:** O sistema é previsível. Não há saltos de layout ou estados "partidos". 
- **Serenidade e Foco:** Ausência quase total de distrações periféricas. Fundos monocromáticos claros ou escuros, com baixa saturação. O investigador "mergulha" no método.
- **Clareza e Ausência de Ruído Visual:** O conteúdo é rei (*Content First*). As molduras, bordas e botões existem apenas para servir o conteúdo, nunca para o ofuscar.

## 3. Paleta de Cores Oficial

### 3.1. Cor Primária: Research Indigo
Abandono do azul elétrico (Startups SaaS). Adoção de um Índigo muito escuro, altamente desaturado e profundo, remetendo para a tinta de caneta-tinteiro clássica ou encadernações académicas.
- **Brand Base (`--brand-600` / `--color-brand`)**: Indigo profundo e sóbrio.
- **Brand Hover**: Indigo ainda mais escuro (quase carvão azulado).
- **Brand Subtle**: Um fundo cinza muito ligeiro com toque quase impercetível de azul frio.

### 3.2. Semânticas Editoriais
Não usamos "Verde Sucesso" fluorescente nem "Vermelho Erro" de alarme de incêndio. As cores de feedback são silenciadas:
- **Disponível (Success)**: Verde Sálvia ou Musgo. Evoca progresso natural.
- **Em desenvolvimento (Warning)**: Âmbar/Ocre suave. Sugere "em construção" sem gritar perigo.
- **Brevemente (Disabled/Ghost)**: Cinza quente editorial. Indica planeamento sem competir por atenção.
- **Erro (Danger)**: Vermelho tijolo ou terracota.

## 4. Tipografia Académica
O sistema herda a taxonomia da `SPEC-006` mas impõe regras estritas:
- **Serifa (Conteúdo e Artigos)**: Usada em blocos de leitura longa ou saída de Prompts gerados para dar autoridade ao texto.
- **Sans-Serif (UI e Controlos)**: Usada estritamente para controlos da plataforma (Botões, Menus, Sidebar, Badges). 

## 5. Iconografia e Brand Mark
- **Brand Mark (Logo)**: Um ícone minimalista, puramente vetorial e geométrico (Placeholder Premium). Remete para a estrutura de uma página de relatório científico ou a ligação hierárquica do conhecimento (ex: *node graph* ou blocos sobrepostos). Zero letras ou acrónimos estáticos.
- **Ícones da Interface (`lucide-react`)**: Traço limpo (`strokeWidth={1.5}` a `1.75`), nunca preenchidos (`fill`), garantindo consistência técnica.

## 6. Micro-interações
- **Hover & Focus**: Todos os elementos interativos partilham a mesma transição de 150ms (`transition: all 150ms ease-out`).
- **Motion**: Proibidas animações espalhafatosas (`bounce`, `elastic`). Apenas `fade` e `subtle slide` são permitidos. A sensação mecânica de mudança de estado deve ser imediata mas polida.
