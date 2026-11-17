# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite + TypeScript, Tailwind CSS v4, React Router, lucide-react. Dados mockados no front (sem backend no MVP de telas). Escolhido pelo usuário.

## Users

- **Viajante (B2C):** pessoa com deficiência física/mobilidade reduzida, visual ou auditiva/sensorial — ou familiar que organiza a viagem em grupo — planejando hospedagem e alimentação antes de sair de casa. Precisa saber, com dados objetivos, se o local atende às suas necessidades. Usa leitor de tela (NVDA, JAWS, TalkBack/VoiceOver), teclado, zoom ou toque, majoritariamente no celular.
- **Estabelecimento parceiro (B2B):** hotel, pousada ou restaurante independente que investe em acessibilidade e quer visibilidade qualificada. Preenche e mantém a ficha técnica, acompanha métricas e pode contratar o Plano Premium.

## Product Purpose

Centralizar e padronizar informação técnica e verificável sobre acessibilidade de hotéis, pousadas e restaurantes no Brasil, para que o viajante PcD planeje com autonomia e segurança. Sucesso: o viajante decide a partir da ficha sem precisar ligar para o local, e o estabelecimento acessível é encontrado por quem precisa dele.

## Positioning

Transforma acessibilidade de filtro genérico autodeclarado (Booking, TripAdvisor, Airbnb) em dado técnico estruturado por categoria — acesso externo, circulação interna, sanitários, sinalização, atendimento — validado por relatos de viajantes reais. O Selo de Acessibilidade Verificada é conquistado por mérito (mínimo de avaliações positivas) antes de poder ser contratado no Plano Premium; não é comprado.

## Operating Context

- Projeto Integrador do curso de ADS, IFBA Campus Eunápolis (2026), orientador Prof. Me. Júlio Oliveira da Silva. Documento-base: `AcessoTrip_PI_IFBA - JulioV1.pdf`.
- Protótipo de referência no Figma ("Primeiras telas" › "Jornada AcessoTrip"); serve como fonte de conteúdo e fluxos, não de visual.
- Etapa de Validação do PI exige avaliação de acessibilidade WCAG com varredura automatizada e simulação de leitor de tela e teclado, gerando relatório de conformidade e backlog.

## Capabilities and Constraints

- Requisitos RF01–RF26 do PDF. B2C: cadastro/login/recuperação, configuração de necessidades no perfil, busca por destino (autocomplete) e por nome, filtros (tipo de estabelecimento: hotel, pousada, restaurante; tipo de deficiência; somente Selo Verificado; ordenação por avaliação/proximidade), card de resultado, ficha técnica completa com galeria e avaliações, registro de experiência (nota 1–5 + texto), denúncia de avaliação, favoritos, roteiro acessível gerado por agente de IA (sempre com locais do catálogo).
- B2B: cadastro empresarial (nome, CNPJ, tipo, endereço), onboarding guiado da ficha, ficha por categorias com upload de fotos e edição contínua, dashboard (visitas, favoritos, avaliações por período; progresso para o Selo), notificação de elegibilidade, contratação do Premium (Selo, destaque, perfil enriquecido), gestão de dados da empresa.
- Tipos de necessidade no MVP: mobilidade reduzida, deficiência visual, deficiência auditiva/sensorial (modelo extensível).
- Reserva/agendamento mediado é pós-MVP; não implementar fluxo de reserva.
- Moderação de denúncias com SLA de 48h (fila interna; fora das telas do MVP).
- Mobile-first, 100% responsivo.

## Brand Commitments

- Nome escrito **AcessoTrip** (uma palavra) na interface.
- Sem logo, cor ou fonte oficiais; identidade livre, subordinada à acessibilidade.
- Idioma: português do Brasil.
- Direção visual escolhida pelo usuário: o padrão da categoria (app de viagem convencional), executado com o acabamento de Airbnb, Booking.com e Wheelmap/AccessNow.

## Evidence on Hand

- Dados de mercado do PDF (IBGE 2022: 14,4 mi de PcD; ~71,8% com intenção de viajar).
- Nenhum estabelecimento parceiro, avaliação ou depoimento real existe ainda. Conteúdo de exemplo nas telas deve ser claramente fictício/ilustrativo; não inventar números de usuários, parceiros ou certificações.

## Product Principles

1. Dado objetivo antes de adjetivo: medidas, presença/ausência e "não informado" explícito, nunca "acessível" vago.
2. A própria interface é prova do posicionamento: se o AcessoTrip não for plenamente acessível, ele não tem credibilidade.
3. Mérito antes de pagamento: o Selo é consequência de avaliações reais.
4. Autonomia do viajante: ele decide com informação, sem depender de contato com o local.

## Accessibility & Inclusion

WCAG 2.1 AA obrigatório (RNF01): suporte a NVDA/JAWS, navegação completa por teclado, contraste validado, fontes escaláveis (rem, zoom 200%, reflow 320px). Status nunca comunicado só por cor. Alvos de toque ≥ 44px. Respeitar prefers-reduced-motion. Público inclui baixa visão, cegueira, surdez (sem dependência de áudio) e mobilidade reduzida (sem gestos complexos).
