// Cliente HTTP da API do AcessoTrip: fetch nativo, token Bearer em sessionStorage e erros
// no formato Problem Details (RFC 9457) convertidos em ApiError.

const BASE = import.meta.env.VITE_API_URL as string | undefined
if (!BASE) throw new Error('VITE_API_URL não definida. Copie .env.example para .env.local.')

const TOKEN_KEY = 'at.token'

/** Erro devolvido pela API (ou de rede, com status 0). */
export class ApiError extends Error {
  readonly status: number
  readonly title: string
  /** Erros de validação por campo (400). */
  readonly erros: { campo: string; mensagem: string }[]

  constructor(status: number, title: string, detail: string, erros: { campo: string; mensagem: string }[] = []) {
    super(detail)
    this.status = status
    this.title = title
    this.erros = erros
  }

  /** Mapa campo → mensagem, no formato usado pelo ErrorSummary. */
  porCampo(): Record<string, string> {
    return Object.fromEntries(this.erros.map((e) => [e.campo, e.mensagem]))
  }
}

/* ---------- token ---------- */

interface Claims {
  sub: string
  perfil: string
  exp: number
}

export function decodeToken(token: string): Claims | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(payload)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    )
    return JSON.parse(json) as Claims
  } catch {
    return null
  }
}

/** Token válido (não expirado, com 30 s de folga) ou null. Token vencido é descartado. */
export function getToken(): string | null {
  let token: string | null = null
  try {
    token = sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
  if (!token) return null
  const claims = decodeToken(token)
  if (!claims || claims.exp * 1000 < Date.now() + 30_000) {
    clearToken()
    return null
  }
  return token
}

export function setToken(token: string) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* sem armazenamento: a sessão dura só esta página */
  }
}

export function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* nada a limpar */
  }
}

/** Chamado quando a API responde 401 a uma requisição autenticada (sessão expirou). */
let onUnauthorized: () => void = () => {}
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn
}

/* ---------- requisição ---------- */

type Query = Record<string, string | number | boolean | null | undefined | (string | number)[]>

interface Options {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  query?: Query
  body?: unknown
  form?: FormData
  signal?: AbortSignal
}

function url(path: string, query?: Query) {
  const u = new URL(BASE + path)
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v === null || v === undefined || v === '') continue
    if (Array.isArray(v)) {
      if (v.length) u.searchParams.set(k, v.join(','))
    } else u.searchParams.set(k, String(v))
  }
  return u.toString()
}

export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', 'Accept-Language': 'pt-BR' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  let body: BodyInit | undefined
  if (opts.form) body = opts.form // o navegador define o Content-Type com o boundary
  else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(opts.body)
  }

  let res: Response
  try {
    res = await fetch(url(path, opts.query), { method: opts.method ?? 'GET', headers, body, signal: opts.signal })
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e
    throw new ApiError(0, 'Sem conexão', 'Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.')
  }

  if (res.status === 204) return undefined as T
  const isJson = (res.headers.get('Content-Type') ?? '').includes('json')
  const data = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearToken()
      onUnauthorized()
    }
    throw new ApiError(
      res.status,
      data?.title ?? 'Erro',
      data?.detail ?? mensagemPadrao(res.status),
      Array.isArray(data?.erros) ? data.erros : [],
    )
  }
  return data as T
}

function mensagemPadrao(status: number) {
  if (status === 401) return 'E-mail ou senha incorretos, ou sua sessão expirou.'
  if (status === 403) return 'Você não tem permissão para esta ação.'
  if (status === 404) return 'Não encontramos o que você procura.'
  if (status === 429) return 'Limite de uso atingido. Tente novamente mais tarde.'
  if (status >= 500) return 'O serviço está indisponível no momento. Tente novamente em instantes.'
  return 'Não foi possível concluir a operação.'
}

/** Mensagem amigável para qualquer erro capturado. */
export function mensagemDeErro(e: unknown): string {
  if (e instanceof ApiError) return e.message
  return 'Algo deu errado. Tente novamente.'
}
