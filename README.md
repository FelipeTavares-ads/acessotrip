# AcessoTrip — telas do MVP

Protótipo navegável em código da **AcessoTrip**, plataforma de turismo acessível. O AcessoTrip é o Projeto Integrador do curso de ADS do IFBA Campus Eunápolis (2026).

Hotéis, pousadas e restaurantes ganham uma ficha técnica de acessibilidade em cinco categorias: acesso externo, circulação interna, sanitários, sinalização e atendimento. A ficha traz status explícito e medidas reais, validados por relatos de viajantes com deficiência.

> Todos os estabelecimentos, preços, telefones, fotos e avaliações são **fictícios**, só para demonstração.

## Como rodar

Requer Node.js 20 ou mais novo.

```bash
npm install
npm run dev
```

Depois abra http://localhost:5173.

## Telas

**Viajante (B2C):** landing, cadastro, login, recuperação de senha, necessidades do perfil, busca (por destino com autocomplete ou por nome), resultados com filtros, ficha técnica com resumo por necessidade, galeria e relatos, registro de experiência, denúncia, favoritos, minhas avaliações e roteiro acessível (IA simulada).

**Estabelecimento (B2B), em `/parceiro`:** cadastro com validação de CNPJ, onboarding guiado da ficha, painel com métricas e progresso do selo, edição da ficha, prévia, Plano Premium, dados da empresa, avaliações recebidas e notificações.

O mapa entre telas e requisitos (RF01–RF26) está em `src/App.tsx`.

## Acessibilidade (WCAG 2.1 AA)

```bash
npx playwright install chromium   # só na primeira vez
npx playwright test               # axe nas 25 rotas, teclado, reflow 320px e texto a 200%
npm run lint                      # oxlint com regras jsx-a11y
```

- Relatório de conformidade e backlog: [docs/relatorio-acessibilidade.md](docs/relatorio-acessibilidade.md)
- Sistema visual: [DESIGN.md](DESIGN.md)
- Contexto do produto: [PRODUCT.md](PRODUCT.md)
- Origem das fotos ilustrativas: [docs/origem-das-imagens.md](docs/origem-das-imagens.md)

## Stack

React 19, Vite, TypeScript, Tailwind CSS 4, React Router, lucide-react e a fonte Atkinson Hyperlegible Next. Os dados estão mockados em `src/data/`, no formato do modelo de dados do PI.
