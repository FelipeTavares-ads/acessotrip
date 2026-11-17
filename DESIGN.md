---
name: AcessoTrip
description: App de viagem com ficha técnica de acessibilidade por categoria, status explícito e medidas reais.
colors:
  ink: "#10151c"
  ink-2: "#3c4654"
  ink-3: "#56606e"
  line: "#d5dbe3"
  line-strong: "#8a95a3"
  surface: "#f4f6f9"
  canvas: "#ffffff"
  brand: "#0b4fc4"
  brand-hover: "#093f9d"
  brand-soft: "#e8effc"
  brand-ink: "#062f75"
  ok: "#0a6b45"
  ok-soft: "#e3f4ec"
  partial: "#8a4b00"
  partial-soft: "#fff1d6"
  unknown: "#4a5361"
  unknown-soft: "#eceff3"
  danger: "#b42318"
  danger-soft: "#fdecea"
  star: "#9a5b00"
typography:
  display:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.25rem"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.012em"
  headline:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "-0.012em"
  body:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-lead:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
rounded:
  control: "0.625rem"
  card: "0.875rem"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.25rem"
  2xl: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.canvas}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.brand}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "3rem"
  button-secondary-hover:
    backgroundColor: "{colors.brand-soft}"
  button-ghost:
    textColor: "{colors.brand}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "3rem"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.control}"
    padding: "0 1.25rem"
    height: "3rem"
  input-text:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 1rem"
    height: "3rem"
  chip-toggle:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0 1rem"
    height: "2.75rem"
  chip-toggle-pressed:
    backgroundColor: "{colors.brand-ink}"
    textColor: "{colors.canvas}"
  status-ok:
    backgroundColor: "{colors.ok-soft}"
    textColor: "{colors.ok}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.75rem"
  status-partial:
    backgroundColor: "{colors.partial-soft}"
    textColor: "{colors.partial}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.75rem"
  status-no:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.75rem"
  status-unknown:
    backgroundColor: "{colors.unknown-soft}"
    textColor: "{colors.unknown}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.75rem"
  seal-badge:
    backgroundColor: "{colors.brand-ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: "0.25rem 0.625rem"
  card-place:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.card}"
    padding: "1rem"
  nav-item-active:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.control}"
    height: "2.75rem"
---

# Design System: AcessoTrip

## Overview

**Creative North Star: "A Ficha Técnica"**

O AcessoTrip é o app de viagem que o viajante já sabe usar (busca grande, cartões com foto, ficha do local) executado com rigor, e a diferença está toda no dado. O sistema visual existe para tornar uma resposta legível em segundos: este lugar serve para mim? Por isso a superfície é calma e convencional (fundo cinza-azulado claro, cartões brancos, texto quase preto, um único azul de ação) e toda a carga expressiva vai para o status: cada necessidade e cada categoria aparece com ícone, palavra e cor, nunca com um "acessível" vago.

A acessibilidade não é um recurso do sistema, é a sua prova. A fonte é a Atkinson Hyperlegible Next, desenhada para baixa visão; todos os tamanhos são em rem e acompanham o zoom do navegador; todo alvo de toque tem pelo menos 44px; o anel de foco é largo e sempre visível. Densidade média, voltada ao celular: uma coluna no telefone, grade de cartões a partir de 768px.

A direção foi escolhida pelo usuário como o padrão da categoria, com o acabamento de Airbnb, Booking.com e Wheelmap/AccessNow como régua. Nada de gradientes, de sombras pesadas ou de ornamento que não carregue informação.

**Key Characteristics:**
- Status com tripla codificação: ícone + texto + cor, sempre os três.
- Um azul de marca profundo só para ação, seleção e foco.
- Cartões brancos de raio médio com borda de 1px sobre fundo cinza-azulado.
- Atkinson Hyperlegible Next em toda a UI; numerais tabulares em medidas, notas e distâncias.
- Alvos de 44px no mínimo (48px nos botões e campos), anel de foco de 3px.

## Colors

Paleta fria e sóbria de neutros azulados, um azul de ação e quatro pares de status (tinta forte sobre fundo suave), todos medidos para AA ou melhor.

### Primary
- **Azul Ficha** (brand): a única cor de ação. Botão primário, links, chip de navegação ativo no celular, barra de progresso, anel de foco, `accent-color` e `caret-color` nativos. Contraste 7,2:1 sobre branco.
- **Azul Ficha Escuro** (brand-hover): hover do botão primário.
- **Azul Nanquim** (brand-ink): estado selecionado forte. Chip pressionado, Selo Acessibilidade Verificada, borda de 2px do resumo por necessidade, texto sobre brand-soft.
- **Azul Névoa** (brand-soft): fundo de seleção suave. Item de navegação ativo, hover de botões secundário e fantasma, avisos informativos, disco do ícone de necessidade.

### Neutral
- **Tinta** (ink): texto principal e títulos. 18,3:1 sobre branco. Também o fundo do toast.
- **Tinta Média** (ink-2): texto de apoio, leads, cidade do cartão, itens de navegação inativos. 9,6:1 sobre branco.
- **Tinta Clara** (ink-3): dicas de campo, legendas, distância, placeholder. 6,4:1 sobre branco, 5,9:1 sobre surface. É o tom mais claro permitido para texto.
- **Linha** (line): bordas de cartões, divisores, borda do cabeçalho e da barra inferior. Decorativa.
- **Linha Forte** (line-strong): borda de campos, chips não pressionados, estrelas vazias. 3,04:1 sobre branco, o mínimo para componente não textual.
- **Superfície** (surface): fundo do app (rotas do viajante e do parceiro) e hover de botões de ícone.
- **Tela** (canvas): branco. Cartões, campos, cabeçalho, landing e telas de autenticação.

### Status
- **Atende** (ok sobre ok-soft): 5,75:1.
- **Atende parcialmente** (partial sobre partial-soft): 6,1:1.
- **Não atende** (danger sobre danger-soft): 5,75:1. danger também marca erros de formulário e o coração de favorito salvo.
- **Não informado / Não se aplica** (unknown sobre unknown-soft): 6,7:1.
- **Âmbar Estrela** (star): só o preenchimento e o traço das estrelas de nota.

### Named Rules
**The Triple-Code Rule.** Status nunca é só cor. Todo status carrega um ícone próprio (círculo com check, com traço, com X, com interrogação, com barra) e a palavra do status, visível ou em `sr-only` quando o espaço é compacto. A cor é o terceiro canal, não o primeiro.

**The One Blue Rule.** O azul de marca significa "dá para agir aqui" ou "isto está selecionado". Não é usado como decoração, fundo de seção ou cor de título.

**The Measured Contrast Rule.** Texto usa apenas ink, ink-2 ou ink-3 sobre branco e surface, ou a tinta de status sobre o seu próprio fundo suave. Uma cor nova entra no sistema só com o contraste medido e anotado no comentário de tokens de `src/index.css`.

## Typography

**Display Font:** Atkinson Hyperlegible Next Variable (com ui-sans-serif, system-ui)
**Body Font:** a mesma família
**Label/Mono Font:** a mesma família, com `font-variant-numeric: tabular-nums` para números

**Character:** uma única família humanista feita para baixa visão, com letras desambiguadas (I/l/1, O/0). A hierarquia vem de tamanho e peso (400, 600, 700), não de troca de fonte.

### Hierarchy
- **Display** (700, 2.125rem no celular / 3.25rem a partir de 768px, line-height 1.08): só o h1 da landing.
- **Headline** (700, 1.75rem / 2rem a partir de 768px, line-height 1.25): h1 das páginas do app (PageHeader). Auth usa 1.875rem.
- **Title** (700, 1.25rem a 1.375rem): h2 de seção (SectionTitle, Dialog) e o título do resumo por necessidade. Subtítulos de cartão e categoria em 1.125rem.
- **Body** (400, 1rem, line-height 1.5): texto corrente. Leads e o texto do resumo em 1.0625rem com entrelinha 1.625, limitados a 60-65ch.
- **Label** (600, 0.9375rem): chips, status, botões (estes em 1rem), rótulos de campo em 1rem semibold.
- **Caption** (400, 0.875rem): dicas, legendas, distância, aviso de dados fictícios. O rótulo da barra inferior móvel, a 0.8125rem semibold, é o menor tamanho do sistema.

### Named Rules
**The Rem-Only Rule.** Todo tamanho de texto é em rem sobre `font-size: 100%` na raiz, para respeitar o tamanho de fonte do usuário e o zoom. Nenhum tamanho de texto em px.

**The Tabular Measure Rule.** Medidas, notas, contagens e distâncias usam numerais tabulares (classe `tabular`).

Títulos h1 a h3 usam `text-wrap: balance` e tracking de -0.012em; parágrafos usam `text-wrap: pretty`. Nada de caixa-alta espaçada.

## Layout

Mobile-first em uma coluna. Contêiner central de 72rem (max-w-6xl) com calha de 16px no celular e 24px a partir de 768px, o único breakpoint estrutural. O conteúdo principal reserva 7rem embaixo no celular para a barra de navegação fixa.

O ritmo segue a escala de 4px do Tailwind: 8px e 12px entre elementos irmãos, 16px dentro de cartões, 20-24px em blocos de destaque, 24-32px entre seções e 56px antes do rodapé de aviso. O app (viajante e parceiro) roda sobre surface com cabeçalho branco fixo; landing e autenticação rodam sobre branco, sem barra inferior. A landing usa duas colunas assimétricas (1.05fr / 1fr) a partir de 768px.

Toda tela do app termina com o aviso de protótipo ("dados de exemplo... fictícios") separado por uma linha.

## Elevation & Depth

Plano por padrão. A profundidade vem de camadas tonais (cartão branco sobre surface) e de bordas de 1px. Sombras aparecem só em resposta a estado ou em elementos que flutuam sobre o conteúdo.

### Shadow Vocabulary
- **Raise** (`box-shadow: 0 1px 2px rgb(16 21 28 / 0.06), 0 4px 12px rgb(16 21 28 / 0.06)`): hover do cartão de local e o toast.
- **Float** (`box-shadow: 0 -1px 0 rgb(16 21 28 / 0.06), 0 -6px 18px rgb(16 21 28 / 0.06)`): barra de navegação inferior, projetando para cima.
- **Popover** (`box-shadow: 0 8px 24px rgb(16 21 28 / 0.14)`): lista do autocomplete de destino.
- **Modal** (`box-shadow: 0 12px 40px rgb(16 21 28 / 0.25)`, backdrop `rgb(16 21 28 / 0.55)`): diálogo nativo.

### Named Rules
**The Flat-At-Rest Rule.** Cartões e blocos ficam planos em repouso, com borda line. Sombra só no hover, em sobreposições (popover, diálogo, toast) e na barra fixa.

## Shapes

Dois raios e o pílula. Controles (botões, campos, itens de navegação, toast, lista do autocomplete) usam raio suave de 10px (0.625rem). Contêineres (cartões, acordeões da ficha, avisos, diálogo, resumo de erros) usam 14px (0.875rem). Chips, status, selo e botões só de ícone são pílula ou círculo. Bordas de 1px são a regra; bordas de 2px marcam ênfase: o resumo por necessidade (brand-ink), o resumo de erros e campos com erro (danger). Fotos são cortadas em 16:10 dentro do cartão. A marca é um quadrado de raio 8px em brand com um "A" traçado em branco.

## Components

### Buttons
Diretos e grandes, nunca tímidos.
- **Shape:** raio de controle (0.625rem), altura mínima de 48px, 20px de padding lateral, 1rem semibold, ícone opcional com gap de 8px.
- **Primary:** brand com texto branco; hover brand-hover. Ação principal em largura total no celular (Buscar).
- **Secondary:** branco com borda e texto brand; hover brand-soft.
- **Ghost:** só texto brand; hover brand-soft.
- **Danger:** danger com texto branco; hover #8f1c13.
- **Disabled:** fundo line com texto ink-3 (primário) ou borda line (secundário), cursor not-allowed.
- **Focus:** o anel global (ver Do's).
- **Botões de ícone** (fechar, favoritar, notificações): círculo de 44px, hover surface, rótulo em `sr-only`.

### Chips
- **Toggle chip** (`aria-pressed`): pílula de 44px, borda line-strong, texto ink 0.9375rem semibold com o ícone da necessidade. Pressionado: fundo e borda brand-ink, texto branco, e o ícone troca para o círculo com check, para que o estado não dependa só da cor.

### Status badges
- **StatusBadge:** pílula na cor suave do status com tinta forte, ícone de status de 18px (16px no tamanho sm) com traço 2.25 e a palavra do status.
- **NeedStatusPill:** versão compacta do cartão: ícone da necessidade + ícone de status + nome curto da necessidade, com o status completo em `sr-only`.
- **SealBadge:** pílula brand-ink com escudo e "Selo Acessibilidade Verificada" (ou "Verificado" compacto sobre a foto).

### Cards / Containers
- **Corner Style:** raio de cartão (0.875rem).
- **Background:** canvas sobre surface.
- **Shadow Strategy:** plano; Raise no hover (ver Elevation).
- **Border:** 1px line.
- **Internal Padding:** 16px no cartão de local, 20-24px em blocos de destaque.
- **Cartão de local:** foto 16:10 com zoom de 1.03 no hover (500ms), selo sobre a foto, nome como link que cobre o cartão inteiro (o anel de foco desenha o contorno do cartão), cidade, pills de status por necessidade, nota e distância tabulares, botão de favoritar acima do link.
- **Acordeão da ficha:** `details`/`summary` com cabeçalho de 56px, título da categoria, descrição, StatusBadge e chevron que gira 90 graus; abre por padrão quando a categoria tem informação.

### Inputs / Fields
- **Style:** branco, borda 1px line-strong, raio de controle, altura mínima de 48px (56px e texto 1.0625rem no campo de destino, com ícone de pino à esquerda). Hover escurece a borda para ink-3.
- **Label:** sempre visível acima, 1rem semibold; "(opcional)" em ink-3; dica em 0.875rem ink-3 ligada por `aria-describedby`.
- **Focus:** o anel global de 3px.
- **Error:** borda de 2px danger, mensagem em 0.875rem semibold danger com ícone de X, `aria-invalid`. No envio, o resumo de erros (borda 2px danger sobre danger-soft) recebe o foco e liga para cada campo.

### Navigation
- **Desktop (768px+):** links no cabeçalho branco fixo, 44px de altura, ícone de 20px + rótulo semibold; ativo brand-soft com texto brand-ink, inativo ink-2 com hover surface.
- **Mobile:** barra inferior fixa de 4 itens, 64px de altura, ícone de 22px sobre rótulo de 0.8125rem; o ativo ganha a cor brand, traço 2.4 e uma pílula brand-soft atrás do ícone. Respeita `safe-area-inset-bottom`.
- **Link de pular** para o conteúdo como primeiro foco; a cada troca de rota o foco vai para o h1 e o título da aba é atualizado.

### Resumo por necessidade (assinatura)
O bloco no topo da ficha que cruza o perfil do viajante com as categorias. Borda de 2px brand-ink, raio de cartão, padding de 20-24px. Para cada necessidade: disco de 44px brand-soft com o ícone da necessidade, título, StatusBadge, e frases em 1.0625rem que começam com um rótulo forte na tinta do status ("Atendem:", "Em parte:", "Não atende:", "Não informado:") seguido das medidas reais.

### Feedback
- **Notice:** bloco de raio de cartão, informativo em brand-soft/brand-ink, alerta em partial-soft/partial.
- **Toast:** pílula de controle em ink com texto branco semibold, sombra Raise, entra de baixo em 220ms com `cubic-bezier(0.16, 1, 0.3, 1)`, anunciado por `role="status"`.
- **ProgressBar:** trilho de 12px unknown-soft com anel interno line-strong, preenchimento brand, `role="progressbar"` com valor textual.

## Do's and Don'ts

### Do:
- **Do** codificar todo status com ícone + texto + cor; em espaço compacto, o texto vai em `sr-only`, mas o ícone fica.
- **Do** manter alvos de toque com no mínimo 44px (botões e campos em 48px).
- **Do** usar o anel de foco global: outline de 3px brand com offset de 2px (branco em `.on-dark`); em cartões com link expandido, desenhar o anel no contorno do cartão.
- **Do** escrever todo tamanho de texto em rem e usar Atkinson Hyperlegible Next em toda a UI.
- **Do** usar numerais tabulares em medidas, notas e distâncias.
- **Do** mostrar "Não informado" explicitamente, com o seu próprio ícone e cor cinza, em vez de esconder o item.
- **Do** respeitar `prefers-reduced-motion`: transições e animações caem para 0.01ms.
- **Do** anotar o contraste medido de toda cor nova no comentário de tokens.

### Don't:
- **Don't** usar cor como único canal de status, seleção ou erro.
- **Don't** usar o azul de marca como decoração ou fundo de seção.
- **Don't** usar texto mais claro que ink-3, nem line-strong como cor de texto.
- **Don't** usar gradientes ou sombras pesadas; superfícies ficam planas em repouso.
- **Don't** usar tamanhos de texto em px nem caixa-alta espaçada como rótulo.
- **Don't** criar alvos interativos menores que 44px.
- **Don't** escrever "acessível" sem o dado; mostre a categoria, o status e a medida.
