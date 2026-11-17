import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const ROUTES = [
  '/',
  '/cadastro',
  '/entrar',
  '/recuperar-senha',
  '/inicio',
  '/buscar',
  '/resultados',
  '/resultados?destino=Porto%20Seguro%2C%20BA',
  '/local/fazenda-solar',
  '/local/bistro-arraial',
  '/local/fazenda-solar/avaliar',
  '/favoritos',
  '/minhas-avaliacoes',
  '/perfil',
  '/perfil/necessidades',
  '/roteiro',
  '/parceiro/cadastro',
  '/parceiro',
  '/parceiro/onboarding',
  '/parceiro/ficha',
  '/parceiro/preview',
  '/parceiro/premium',
  '/parceiro/empresa',
  '/parceiro/avaliacoes',
  '/parceiro/notificacoes',
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

for (const route of ROUTES) {
  test(`axe ${route}`, async ({ page }, info) => {
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    const v = await scan(page)
    await info.attach('violations', { body: JSON.stringify(v, null, 2), contentType: 'application/json' })
    expect(v.filter((x) => x.impact === 'critical' || x.impact === 'serious'), JSON.stringify(v, null, 2)).toEqual([])
  })
}

/* Estados que só aparecem com interação */

test('axe: erros de formulário e diálogo de denúncia', async ({ page }) => {
  await page.goto('/cadastro')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await expect(page.getByRole('alert')).toBeFocused()
  expect((await scan(page)).filter((x) => x.impact === 'critical' || x.impact === 'serious')).toEqual([])

  await page.goto('/local/fazenda-solar')
  await page.getByRole('button', { name: /Denunciar avaliação de Carlos/ }).click()
  await expect(page.getByRole('dialog', { name: 'Denunciar avaliação' })).toBeVisible()
  expect((await scan(page)).filter((x) => x.impact === 'critical' || x.impact === 'serious')).toEqual([])
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: /Denunciar avaliação de Carlos/ })).toBeFocused()
})

test('axe: filtros abertos e autocomplete', async ({ page }) => {
  await page.goto('/resultados')
  await page.getByRole('button', { name: /Filtros/ }).click()
  // .click() + asserção: o filtro vai para a URL, e o React Router aplica a mudança numa transição
  await page.getByRole('checkbox', { name: 'Hotel' }).click()
  await expect(page.getByRole('checkbox', { name: 'Hotel' })).toBeChecked()
  await expect(page).toHaveURL(/tipo=HOTEL/)
  await expect(page.getByRole('status').first()).toContainText('encontrado')
  expect((await scan(page)).filter((x) => x.impact === 'critical' || x.impact === 'serious')).toEqual([])

  await page.goto('/')
  const combo = page.getByRole('combobox', { name: 'Para onde você vai?' })
  await combo.fill('por')
  await combo.press('ArrowDown')
  await expect(page.getByRole('option', { name: 'Porto Seguro, BA' })).toHaveAttribute('aria-selected', 'true')
  expect((await scan(page)).filter((x) => x.impact === 'critical' || x.impact === 'serious')).toEqual([])
  await combo.press('Enter')
  await expect(combo).toHaveValue('Porto Seguro, BA')
})

/* Teclado: fluxo completo sem mouse */

test('teclado: buscar → ficha → avaliar', async ({ page, browserName }, info) => {
  test.skip(info.project.name !== 'desktop-1280', 'fluxo de teclado roda no desktop')
  void browserName
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused()
  await page.keyboard.press('Enter')
  // do skip link até o campo de destino
  const combo = page.getByRole('combobox', { name: 'Para onde você vai?' })
  for (let i = 0; i < 6 && !(await combo.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab')
  await expect(combo).toBeFocused()
  await page.keyboard.type('Socorro')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await page.keyboard.press('Enter') // envia o formulário
  await expect(page).toHaveURL(/resultados/)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()

  const link = page.getByRole('link', { name: 'Hotel Fazenda Solar' })
  await link.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1, name: 'Hotel Fazenda Solar' })).toBeFocused()

  await page.getByRole('link', { name: 'Avaliar' }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Avaliar')
})

/* Reflow: 320px sem rolagem horizontal (WCAG 1.4.10) */

test('reflow 320px sem rolagem horizontal', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile-390')
  await page.setViewportSize({ width: 320, height: 640 })
  const bad: string[] = []
  for (const r of ROUTES) {
    await page.goto(r)
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    if (over > 1) bad.push(`${r} (+${over}px)`)
  }
  expect(bad).toEqual([])
})

/* Texto 200% (WCAG 1.4.4): sem corte de conteúdo */

test('texto a 200% sem rolagem horizontal', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop-1280')
  const bad: string[] = []
  for (const r of ['/', '/resultados', '/local/fazenda-solar', '/parceiro', '/parceiro/onboarding']) {
    await page.goto(r)
    await page.addStyleTag({ content: 'html{font-size:200% !important}' })
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    if (over > 1) bad.push(`${r} (+${over}px)`)
  }
  expect(bad).toEqual([])
})
