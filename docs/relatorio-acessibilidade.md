# Relatório de conformidade de acessibilidade — AcessoTrip (telas do MVP)

**Referência:** WCAG 2.1 nível AA (RNF01 do PI) · **Data:** 16/11/2026 · **Escopo:** 25 rotas B2C e B2B do protótipo em código (`acessotrip-web`).

## 1. Método

| Técnica | Ferramenta | Onde |
|---|---|---|
| Varredura automatizada | axe-core 4 via `@axe-core/playwright` (regras wcag2a, wcag2aa, wcag21a, wcag21aa, best-practice) | `tests/a11y.spec.ts`, 25 rotas × 2 larguras (390 px e 1280 px) |
| Estados de interação | Playwright + axe com o estado aberto | erros de formulário, diálogo de denúncia, painel de filtros, autocomplete |
| Navegação só por teclado | Playwright (Tab, setas, Enter, Esc) | landing → resultados → ficha → avaliar |
| Reflow (1.4.10) | largura de 320 px, todas as rotas | sem rolagem horizontal |
| Redimensionar texto (1.4.4) | fonte raiz a 200 % em 1280 px | landing, resultados, ficha, painel, onboarding |
| Lint estático | oxlint com plugin `jsx-a11y` | todo o `src/` |
| Revisão de design | impeccable (detector + revisor final) | tokens, contraste, estados |

Como rodar:

```bash
npm run lint
npx playwright test
```

## 2. Resultado

- **axe:** 0 violações críticas ou sérias nas 25 rotas, nas duas larguras, e nos estados de interação.
- **Teclado, reflow e texto a 200 %:** aprovados depois das correções da seção 4.
- **Total:** 57 testes aprovados (3 pulados de propósito, porque cada um roda em uma única largura).

## 3. Critérios WCAG 2.1 AA verificados

| Critério | Como foi atendido | Evidência |
|---|---|---|
| 1.1.1 Conteúdo não textual | Fotos com texto alternativo conferido contra a imagem real; fotos decorativas dos cards com `alt=""`; ícones com `aria-hidden` e texto ao lado | axe `image-alt`; revisão manual das 14 fotos |
| 1.3.1 Informação e relações | `header`/`nav`/`main`/`aside`, hierarquia h1→h3, `fieldset`/`legend` nos grupos, `label` em todos os campos, `dl` na prévia da ficha | axe; árvore de acessibilidade |
| 1.3.5 Propósito da entrada | `autocomplete` em nome, e-mail, senha, endereço, telefone | código (`Auth.tsx`, `Partner.tsx`) |
| 1.4.1 Uso de cor | Status sempre com ícone **e** texto (Atende / Atende parcialmente / Não atende / Não informado) | `StatusBadge`, `NeedStatusPill` |
| 1.4.3 Contraste mínimo | Contraste calculado dos tokens: texto 18,3:1, secundário 9,6:1, terciário 6,4:1 (5,9:1 sobre o cinza de fundo), marca 7,2:1. Selos de status sobre o próprio fundo: "Atende" 5,8:1, "Atende parcialmente" 6,1:1, "Não atende" 5,8:1, "Não informado" 6,7:1 | axe `color-contrast`; `src/index.css` |
| 1.4.4 Redimensionar texto | Tudo em `rem`; cabeçalho quebra em linhas a 200 % | teste "texto a 200 %" |
| 1.4.10 Reflow | Sem rolagem horizontal em 320 px | teste "reflow 320px" |
| 1.4.11 Contraste não textual | Bordas de campos `#8a95a3` (3,04:1); anel de foco azul de 3 px | tokens |
| 1.4.12 Espaçamento de texto | Sem alturas fixas em blocos de texto | inspeção |
| 2.1.1 Teclado | Todos os controles são `button`, `a`, `input` ou `select` nativos; autocomplete com setas/Enter/Esc; galeria com botões | teste de teclado |
| 2.1.2 Sem armadilha de teclado | Diálogo nativo `<dialog>` fecha com Esc e devolve o foco a quem abriu | teste do diálogo |
| 2.4.1 Pular blocos | Link "Pular para o conteúdo" como primeiro item focável | teste de teclado |
| 2.4.2 Página com título | `document.title` = título h1 + "· AcessoTrip" a cada rota | `RouteFocus` |
| 2.4.3 Ordem do foco | Ao trocar de rota o foco vai para o h1; no envio com erro, para o resumo de erros | testes |
| 2.4.6 Cabeçalhos e rótulos | Botões nomeiam a ação ("Publicar avaliação", "Enviar denúncia") | revisão de texto |
| 2.4.7 Foco visível | Contorno de 3 px `#0b4fc4` com afastamento de 2 px; branco em fundo escuro | `index.css` |
| 2.5.3 Rótulo no nome | Texto visível contido no nome acessível (ex.: "Denunciar avaliação de Carlos R.") | axe `label-content-name-mismatch` |
| 2.5.5 (AAA, adotado) Alvo de toque | Mínimo de 44×44 px em todos os controles | classes `min-h-11`/`size-11` |
| 3.1.1 Idioma | `<html lang="pt-BR">` | `index.html` |
| 3.2.2 Na entrada | Filtros atualizam a lista sem mudar de página; o total é anunciado | `role="status"` em Resultados |
| 3.3.1 / 3.3.3 Erro e sugestão | Mensagem junto ao campo (`aria-describedby`, `aria-invalid`) que diz como corrigir, mais resumo com links | `ErrorSummary`, `TextField` |
| 3.3.2 Rótulos ou instruções | Dicas acima do campo ("Mínimo de 8 caracteres") | formulários |
| 4.1.2 Nome, função, valor | `aria-pressed` em chips e favoritos, `aria-expanded` no botão Filtros, combobox ARIA 1.2, `role="progressbar"` com `aria-valuetext` | axe; código |
| 4.1.3 Mensagens de status | Toasts e contagem de resultados em `aria-live="polite"` | `Layout.tsx`, `Search.tsx` |
| 2.3.3 / prefers-reduced-motion | Animações e transições zeradas quando o sistema pede menos movimento | `index.css` |

## 4. Problemas encontrados e corrigidos durante a validação

| # | Problema | Critério | Correção |
|---|---|---|---|
| 1 | Barra de navegação inferior presa no topo: o `backdrop-filter` do cabeçalho virava o bloco de contenção do `position: fixed` | 1.3.2 / usabilidade | barra movida para fora do `<header>` |
| 2 | Ao ir da landing para os resultados (troca de layout), o foco não ia para o novo h1 | 2.4.3 | foco de rota centralizado no roteador (`RouteFocus`) |
| 3 | No carregamento inicial, o foco era levado ao h1 (efeito duplo do StrictMode), o que pulava o "Pular para o conteúdo" | 2.4.1 | comparação com a rota anterior |
| 4 | Ficha técnica com 26–34 px de rolagem horizontal em 320 px (selo de status sem quebra) | 1.4.10 | cabeçalho da categoria com quebra de linha |
| 5 | Cabeçalho do parceiro estourando 149 px com texto a 200 % | 1.4.4 | cabeçalho e menu com `flex-wrap` |
| 6 | Textos alternativos que não batiam com a foto (ex.: "Recepção" numa foto de quarto) | 1.1.1 | 7 `alt` reescritos depois de conferir as imagens |
| 7 | Upload de fotos com `<label>` usado como botão, sem foco visível | 2.1.1 / 2.4.7 | trocado por `<button>` que aciona o `input` |
| 8 | "Não informado" rebaixava o resumo para "Atende parcialmente", e itens que não se aplicam (elevador em hotel térreo) contavam como falha | veracidade da informação | o resumo usa só o que foi informado; criado o status "Não se aplica" |
| 9 | Selo aparecia em local que ainda não tinha atingido o critério (8 de 10) | veracidade | selo só com avaliações positivas ≥ 10; o Selo saiu da lista de benefícios do Premium |
| 10 | Resumo por necessidade não dizia o que atende | 3.3.2 / compreensão | frases por necessidade: "Atendem: rampa (1:12, 8,3%), portas (90 cm)…" |
| 11 | No celular, o contato ficava no fim de uma página de cerca de 4000 px | usabilidade móvel (RNF04) | bloco de contato logo abaixo do resumo |
| 12 | Fotos de banco de imagens apresentadas como "enviadas pelo estabelecimento" e contradizendo a ficha | veracidade | legenda "ilustrativas", fotos trocadas e origem registrada em `docs/origem-das-imagens.md` |

## 5. Limitações e backlog priorizado

Os testes automáticos cobrem por volta de 30–40 % dos critérios WCAG. O restante depende de teste humano.

| Prioridade | Item | Por quê |
|---|---|---|
| Alta | Testar com NVDA + Firefox e JAWS + Chrome (RNF01) os fluxos: buscar → filtrar → ficha → avaliar → denunciar; cadastro do parceiro → onboarding → painel | o leitor de tela real não foi executado nesta rodada |
| Alta | Testar com TalkBack (Android) e VoiceOver (iOS) no celular | o público é majoritariamente mobile |
| Alta | Sessão com 3 a 5 viajantes PcD (uma pessoa por tipo de necessidade) | validar a linguagem da ficha e o "resumo por necessidade" |
| Média | `<summary>` com `<h3>` dentro: alguns leitores achatam o título dentro do botão; avaliar trocar por botão + região com `aria-expanded` se isso confundir nos testes | 1.3.1 |
| Média | Descrição em texto das fotos feita pelo parceiro no upload (campo obrigatório de texto alternativo) | 1.1.1, conteúdo real |
| Média | Vídeo em Libras para o cadastro e a ajuda | público surdo |
| Baixa | Modo de alto contraste (`forced-colors`) revisado à mão | Windows High Contrast |
| Baixa | Separar constantes de `ui.tsx` (aviso de fast-refresh do lint) | manutenção |

## 6. Rastreabilidade com os requisitos

RF01–RF26 têm tela correspondente (mapa em `src/App.tsx`). RF26 (roteiro com IA) está simulado no front e só usa lugares do catálogo, conforme a RN09. O agendamento das telas T21/T22 do Figma não foi implementado: a reserva mediada fica para depois do MVP (seção 5.2 do PI). No lugar dele, a ficha tem um botão para ligar para o estabelecimento.
