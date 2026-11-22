# AcessoTrip — front-end

Interface web da **AcessoTrip**, plataforma de turismo acessível. O AcessoTrip é o Projeto Integrador do curso de ADS do IFBA Campus Eunápolis (2026).

Hotéis, pousadas, restaurantes e espaços de eventos ganham uma ficha técnica de acessibilidade em cinco categorias: acesso externo, circulação interna, sanitários, sinalização e atendimento. Os dados vêm da API do back-end (repositório `AcessoTrip-backend`).

## Como rodar

Requer Node.js 20 ou mais novo e o back-end rodando (veja o README do back-end).

```bash
cp .env.example .env.local   # VITE_API_URL=http://localhost:8080/api/v1
npm install
npm run dev
```

Abra **http://localhost:5173** (não use `127.0.0.1`: essa origem não está liberada no CORS do back-end).

Para ter dados de demonstração, rode o script de seed (fora deste repositório) com a API no ar:

```bash
node ../../orchestrator/seed/seed.mjs
```

## Telas

**Viajante (B2C):** landing, cadastro, login, necessidades do perfil, busca (por destino com autocomplete ou por nome), resultados com filtros, ordenação e paginação, ficha técnica com resumo por necessidade, galeria e relatos, registro de experiência, denúncia, favoritos, minhas avaliações (editar e excluir) e roteiro acessível com IA, com roteiros salvos.

**Estabelecimento (B2B), em `/parceiro`:** cadastro com validação de CNPJ e localização opcional, onboarding guiado da ficha com fotos, painel com métricas e progresso do selo, edição da ficha, prévia, Plano Premium (contratar, renovar, cancelar), avaliações recebidas e notificações.

O login é único: a conta é levada ao painel certo conforme o perfil. O mapa entre telas e requisitos (RF01–RF26) está em `src/App.tsx`.

Fora desta versão (o back-end ainda não oferece): recuperação de senha e edição dos dados da empresa.

## Estrutura

- `src/api/` — cliente HTTP (`client.ts`: token em `sessionStorage`, erros Problem Details), tipos dos DTOs (`types.ts`) e chamadas (`endpoints.ts`).
- `src/state/` — sessão, domínios (necessidades, categorias e campos da ficha, carregados da API) e estado do viajante.
- `src/data/domain.ts` — montagem da ficha a partir de `/campos-ficha` e formatação. Domínios são resolvidos pelo `codigo`, nunca por id fixo.

## Acessibilidade (WCAG 2.1 AA)

```bash
npx playwright install chromium   # só na primeira vez
npx playwright test               # axe nas rotas, teclado, reflow 320px e texto a 200%
npm run lint                      # oxlint com regras jsx-a11y
```

Os testes não precisam do back-end: as respostas da API vêm de fixtures em `tests/fixtures/`.

- Relatório de conformidade e backlog: [docs/relatorio-acessibilidade.md](docs/relatorio-acessibilidade.md)
- Sistema visual: [DESIGN.md](DESIGN.md)
- Contexto do produto: [PRODUCT.md](PRODUCT.md)

## Stack

React 19, Vite, TypeScript, Tailwind CSS 4, React Router, lucide-react e a fonte Atkinson Hyperlegible Next.
