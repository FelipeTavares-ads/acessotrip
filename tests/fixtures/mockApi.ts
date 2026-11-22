// API simulada para os testes de acessibilidade: as telas rodam sem o back-end (decisão D16).
// api.json foi capturado da API real com os dados fictícios do seed; mantenha o formato dos DTOs.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Page, Route } from '@playwright/test'

const DIR = dirname(fileURLToPath(import.meta.url))
export const F = JSON.parse(readFileSync(join(DIR, 'api.json'), 'utf8'))
const FOTO = readFileSync(join(DIR, 'foto.png'))

export const LOCAL_ID: string = F.detalhe.estabelecimento.id
export const LOCAL_NOME: string = F.detalhe.estabelecimento.nome
export const ROTEIRO_ID: string = F.roteiro.id
const VIAJANTE_ID = '00000000-0000-4000-8000-000000000001'

export type Perfil = 'VIAJANTE' | 'ESTABELECIMENTO'

/** Token falso (o front só lê as claims; a API simulada não valida assinatura). */
function token(perfil: Perfil) {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const sub = perfil === 'ESTABELECIMENTO' ? LOCAL_ID : VIAJANTE_ID
  return `${b64({ alg: 'HS256' })}.${b64({ sub, perfil, iss: 'acessotrip', exp: Math.floor(Date.now() / 1000) + 3600 })}.assinatura`
}

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: status >= 400 ? 'application/problem+json' : 'application/json', body: JSON.stringify(body) })

/** Liga a API simulada e, se pedido, entra com um perfil (token no sessionStorage). */
export async function mockApi(page: Page, perfil?: Perfil) {
  if (perfil) await page.addInitScript((t) => sessionStorage.setItem('at.token', t), token(perfil))

  await page.route('**/arquivos/**', (r) => r.fulfill({ status: 200, contentType: 'image/png', body: FOTO }))
  await page.route('**/api/v1/**', (route) => {
    const req = route.request()
    const path = new URL(req.url()).pathname.replace(/^.*\/api\/v1/, '')
    const m = req.method()
    if (m !== 'GET') return m === 'DELETE' || m === 'PATCH' ? route.fulfill({ status: 204 }) : json(route, {}, 201)

    if (path === '/tipos-necessidade') return json(route, F.tiposNecessidade)
    if (path === '/categorias-ficha') return json(route, F.categorias)
    if (path === '/campos-ficha') return json(route, F.campos)
    if (path === '/catalogo/estabelecimentos') return json(route, F.busca)
    if (path === '/catalogo/destinos') return json(route, F.destinos)
    if (path.startsWith('/catalogo/estabelecimentos/'))
      return path.endsWith(LOCAL_ID) ? json(route, F.detalhe) : json(route, { status: 404, title: 'Recurso não encontrado', detail: 'Estabelecimento não encontrado no catálogo.' }, 404)
    if (/^\/estabelecimentos\/[0-9a-f-]{36}\/avaliacoes$/.test(path)) return json(route, F.avaliacoesPublicas)
    if (path === '/usuarios/me')
      return json(route, perfil === 'ESTABELECIMENTO' ? { id: LOCAL_ID, email: 'parceiro@acessotrip.test', tipo: perfil } : { id: VIAJANTE_ID, email: 'viajante@acessotrip.test', tipo: 'VIAJANTE' })
    if (path === '/viajantes/me/necessidades') return json(route, F.viajanteNecessidades)
    if (path === '/viajantes/me/favoritos') return json(route, F.favoritos)
    if (path === '/viajantes/me/avaliacoes') return json(route, F.minhasAvaliacoes)
    if (path === '/viajantes/me/roteiros') return json(route, F.roteiros)
    if (path.startsWith('/viajantes/me/roteiros/')) return json(route, F.roteiro)
    if (path === '/estabelecimentos/me/ficha') return json(route, F.parceiroFicha)
    if (path === '/estabelecimentos/me/fotos') return json(route, F.parceiroFotos)
    if (path === '/estabelecimentos/me/onboarding') return json(route, F.onboarding)
    if (path === '/estabelecimentos/me/premium') return json(route, F.premium)
    if (path === '/estabelecimentos/me/metricas') return json(route, F.metricas)
    if (path === '/notificacoes/me') return json(route, F.notificacoes)
    return json(route, { status: 404, title: 'Recurso não encontrado', detail: `Sem fixture para ${path}` }, 404)
  })
}
