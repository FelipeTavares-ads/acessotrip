import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'
import { LOCAL_ID, LOCAL_NOME, ROTEIRO_ID, mockApi, type Perfil } from './fixtures/mockApi'

// Rotas por perfil necessário. A API é simulada (tests/fixtures), então não há back-end nos testes.
const ROUTES: { path: string; perfil?: Perfil; h1?: RegExp }[] = [
  { path: '/' },
  { path: '/cadastro' },
  { path: '/entrar' },
  { path: '/parceiro/cadastro' },
  { path: '/inicio' },
  { path: '/buscar' },
  { path: '/resultados' },
  { path: '/resultados?destino=Porto%20Seguro%2C%20BA' },
  { path: `/local/${LOCAL_ID}` },
  { path: `/local/${LOCAL_ID}/avaliar`, perfil: 'VIAJANTE' },
  { path: '/favoritos', perfil: 'VIAJANTE' },
  { path: '/minhas-avaliacoes', perfil: 'VIAJANTE' },
  { path: '/perfil', perfil: 'VIAJANTE' },
  { path: '/perfil/necessidades', perfil: 'VIAJANTE' },
  { path: '/roteiro', perfil: 'VIAJANTE' },
  { path: `/roteiro/${ROTEIRO_ID}`, perfil: 'VIAJANTE' },
  { path: '/parceiro', perfil: 'ESTABELECIMENTO' },
  { path: '/parceiro/onboarding', perfil: 'ESTABELECIMENTO' },
  { path: '/parceiro/ficha', perfil: 'ESTABELECIMENTO' },
  { path: '/parceiro/preview', perfil: 'ESTABELECIMENTO' },
  { path: '/parceiro/premium', perfil: 'ESTABELECIMENTO' },
  { path: '/parceiro/avaliacoes', perfil: 'ESTABELECIMENTO' },
  { path: '/parceiro/notificacoes', perfil: 'ESTABELECIMENTO' },
]

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']

async function scan(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  return r.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.length,
    targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
  }))
}
const graves = (v: Awaited<ReturnType<typeof scan>>) => v.filter((x) => x.impact === 'critical' || x.impact === 'serious')

/** Abre a rota e espera o conteúdo carregado (sem "Carregando…"). */
async function abrir(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('main h1').first()).toBeVisible()
  await expect(page.getByText(/^(Carregando|Verificando sua sessão|Buscando lugares)/)).toHaveCount(0)
}

for (const { path, perfil } of ROUTES) {
  test(`axe ${path}`, async ({ page }, info) => {
    await mockApi(page, perfil)
    await abrir(page, path)
    const v = await scan(page)
    await info.attach('violations', { body: JSON.stringify(v, null, 2), contentType: 'application/json' })
    expect(graves(v), JSON.stringify(v, null, 2)).toEqual([])
  })
}

/* Estados que só aparecem com interação */

test('axe: erros de formulário e diálogo de denúncia', async ({ page }) => {
  await mockApi(page, 'VIAJANTE')
  await abrir(page, '/cadastro')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page.getByRole('alert')).toBeFocused()
  expect(graves(await scan(page))).toEqual([])

  await abrir(page, `/local/${LOCAL_ID}`)
  const denunciar = page.getByRole('button', { name: /^Denunciar avaliação/ }).first()
  await denunciar.click()
  await expect(page.getByRole('dialog', { name: 'Denunciar avaliação' })).toBeVisible()
  expect(graves(await scan(page))).toEqual([])
  await page.keyboard.press('Escape')
  await expect(denunciar).toBeFocused()
})

test('axe: filtros abertos e autocomplete', async ({ page }) => {
  await mockApi(page)
  await abrir(page, '/resultados')
  await page.getByRole('button', { name: /Filtros/ }).click()
  // .click() + asserção: o filtro vai para a URL, e o React Router aplica a mudança numa transição
  await page.getByRole('checkbox', { name: 'Hotel' }).click()
  await expect(page.getByRole('checkbox', { name: 'Hotel' })).toBeChecked()
  await expect(page).toHaveURL(/tipo=HOTEL/)
  await expect(page.getByRole('status').filter({ hasText: 'encontrado' }).first()).toBeVisible()
  expect(graves(await scan(page))).toEqual([])

  await abrir(page, '/')
  const combo = page.getByRole('combobox', { name: 'Para onde você vai?' })
  await combo.fill('por')
  await expect(page.getByRole('option', { name: 'Porto Seguro, BA' })).toBeVisible()
  await combo.press('ArrowDown')
  await expect(page.getByRole('option', { name: 'Porto Seguro, BA' })).toHaveAttribute('aria-selected', 'true')
  expect(graves(await scan(page))).toEqual([])
  await combo.press('Enter')
  await expect(combo).toHaveValue('Porto Seguro, BA')
})

/* Teclado: fluxo completo sem mouse */

test('teclado: buscar → ficha → avaliar', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-1280', 'fluxo de teclado roda no desktop')
  await mockApi(page, 'VIAJANTE')
  await abrir(page, '/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused()
  await page.keyboard.press('Enter')
  // do skip link até o campo de destino
  const combo = page.getByRole('combobox', { name: 'Para onde você vai?' })
  for (let i = 0; i < 6 && !(await combo.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab')
  await expect(combo).toBeFocused()
  await page.keyboard.type('Porto')
  await expect(page.getByRole('option', { name: 'Porto Seguro, BA' })).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter') // envia o formulário
  await expect(page).toHaveURL(/resultados/)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()

  const link = page.getByRole('link', { name: LOCAL_NOME })
  await link.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1, name: LOCAL_NOME })).toBeVisible()

  await page.getByRole('link', { name: 'Avaliar', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Avaliar')
})

/* Reflow: 320px sem rolagem horizontal (WCAG 1.4.10) */

test('reflow 320px sem rolagem horizontal', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile-390')
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 320, height: 640 })
  const bad: string[] = []
  for (const perfil of [undefined, 'VIAJANTE', 'ESTABELECIMENTO'] as const) {
    const ctx = await page.context().browser()!.newContext({ viewport: { width: 320, height: 640 } })
    const p = await ctx.newPage()
    await mockApi(p, perfil)
    for (const r of ROUTES.filter((x) => x.perfil === perfil)) {
      await abrir(p, r.path)
      const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      if (over > 1) bad.push(`${r.path} (+${over}px)`)
    }
    await ctx.close()
  }
  expect(bad).toEqual([])
})

/* Texto 200% (WCAG 1.4.4): sem corte de conteúdo */

test('texto a 200% sem rolagem horizontal', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-1280')
  const bad: string[] = []
  for (const [r, perfil] of [
    ['/', undefined],
    ['/resultados', undefined],
    [`/local/${LOCAL_ID}`, undefined],
    ['/parceiro', 'ESTABELECIMENTO'],
    ['/parceiro/onboarding', 'ESTABELECIMENTO'],
  ] as const) {
    const ctx = await page.context().browser()!.newContext({ viewport: { width: 1280, height: 800 } })
    const p = await ctx.newPage()
    await mockApi(p, perfil)
    await abrir(p, r)
    await p.addStyleTag({ content: 'html{font-size:200% !important}' })
    const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    if (over > 1) bad.push(`${r} (+${over}px)`)
    await ctx.close()
  }
  expect(bad).toEqual([])
})
