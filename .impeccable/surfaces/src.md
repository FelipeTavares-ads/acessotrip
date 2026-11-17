---
version: 1
slug: "src"
primary_target: "src"
related_targets: []
---

# Surface brief: AcessoTrip web app (B2C + B2B)

Scope: todas as rotas do app (src/). Modo: Operate (landing `/` em Persuade, mesmo mundo).
Audiência: viajante PcD (B2C) no celular, com leitor de tela/zoom/teclado; parceiro B2B gerenciando ficha.
Tarefa: buscar, filtrar, decidir pela ficha técnica; parceiro preenche ficha e acompanha selo.
Restrições: WCAG 2.1 AA, mobile-first, PT-BR, dados fictícios rotulados como exemplo.
Escolha: o usuário pegou o padrão da categoria (canon). Réguas de acabamento: Airbnb, Booking.com, Wheelmap/AccessNow.

## Direction contract

THESIS: o app de viagem que o viajante já sabe usar (busca, cartões com foto, ficha) executado com rigor; a diferença está no dado: cada local mostra as cinco categorias com status explícito e medidas, nunca "acessível" vago. Recusa o filtro genérico autodeclarado.

OWN-WORLD: no app, fundo cinza-azulado muito claro (#f4f6f9) com cartões brancos; a landing é branca; texto quase preto, um azul de marca profundo só para ação e seleção. Status com tripla codificação (ícone, texto, cor): verde "Atende", âmbar "Atende parcialmente", cinza "Não informado". Atkinson Hyperlegible Next (feita para baixa visão) em toda a UI, numerais tabulares nas medidas. Cartões de raio médio com borda de 1px, sem sombras pesadas e sem gradientes.

STORY: o viajante entende em segundos se o local serve para ele, confia porque vê medidas e relatos, e salva ou avalia. O parceiro vê o que falta na ficha e quanto falta para o selo.

FIRST VIEWPORT: na busca, um campo de destino grande com as necessidades do perfil como chips já marcados logo abaixo; resultados como cartões com foto, nome, cidade, nota e indicadores de status para as necessidades do perfil (as 3 quando o perfil não tem nenhuma). Ação primária: Buscar, em largura total.

FORM: padrão da categoria (canon), escolhido pelo usuário em vez da direção sorteada; seed: none (unavailable) — o sorteio não imprimiu SEED REFERENCE. Assinatura: o "resumo por necessidade" no topo da ficha, que cruza o perfil do viajante com as categorias e diz em uma frase o que atende e o que não.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
