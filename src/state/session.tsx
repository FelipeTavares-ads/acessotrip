import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { clearToken, decodeToken, getToken, setToken, setUnauthorizedHandler } from '../api/client'
import { auth } from '../api/endpoints'
import type { CadastroEstabelecimento, Perfil, Uuid } from '../api/types'

export interface Usuario {
  id: Uuid
  email: string
  perfil: Perfil
  /** Só conhecido logo após o cadastro: a API não devolve o nome no login (lacuna B3). */
  nome?: string
}

interface Session {
  usuario: Usuario | null
  /** false enquanto a sessão salva ainda está sendo restaurada. */
  pronto: boolean
  /** true quando a sessão caiu por token vencido (para avisar no login). */
  expirou: boolean
  entrar: (email: string, senha: string) => Promise<Usuario>
  cadastrarViajante: (nome: string, email: string, senha: string) => Promise<Usuario>
  cadastrarEstabelecimento: (dados: CadastroEstabelecimento) => Promise<Usuario>
  sair: () => void
}

const Ctx = createContext<Session | null>(null)
const NOME_KEY = 'at.nome'

function lerNome(): string | undefined {
  try {
    return sessionStorage.getItem(NOME_KEY) ?? undefined
  } catch {
    return undefined
  }
}
function gravarNome(nome?: string) {
  try {
    if (nome) sessionStorage.setItem(NOME_KEY, nome)
    else sessionStorage.removeItem(NOME_KEY)
  } catch {
    /* sem armazenamento */
  }
}

async function carregarUsuario(nome?: string): Promise<Usuario> {
  const me = await auth.me()
  return { id: me.id, email: me.email, perfil: me.tipo, nome }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  // Sem token salvo, não há o que restaurar: a sessão já está pronta
  const [pronto, setPronto] = useState(() => !getToken())
  const [expirou, setExpirou] = useState(false)

  useEffect(() => {
    setUnauthorizedHandler(() => {
      gravarNome()
      setUsuario(null)
      setExpirou(true)
    })
    const token = getToken()
    const claims = token ? decodeToken(token) : null
    if (!claims) return
    carregarUsuario(lerNome())
      .then(setUsuario, () => clearToken())
      .finally(() => setPronto(true))
  }, [])

  const entrar = useCallback(async (email: string, senha: string, nome?: string) => {
    const t = await auth.login(email, senha)
    setToken(t.accessToken)
    gravarNome(nome)
    const u = await carregarUsuario(nome)
    setUsuario(u)
    setExpirou(false)
    return u
  }, [])

  const value = useMemo<Session>(
    () => ({
      usuario,
      pronto,
      expirou,
      entrar: (email, senha) => entrar(email, senha),
      cadastrarViajante: async (nome, email, senha) => {
        const v = await auth.cadastrarViajante(nome, email, senha)
        return entrar(email, senha, v.nome.split(' ')[0])
      },
      cadastrarEstabelecimento: async (dados) => {
        await auth.cadastrarEstabelecimento(dados)
        return entrar(dados.email, dados.senha)
      },
      sair: () => {
        clearToken()
        gravarNome()
        setUsuario(null)
        setExpirou(false)
      },
    }),
    [usuario, pronto, expirou, entrar],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSession() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useSession fora do SessionProvider')
  return s
}

/** Rota inicial de cada perfil após o login. */
// eslint-disable-next-line react-refresh/only-export-components
export function rotaInicial(perfil: Perfil) {
  return perfil === 'ESTABELECIMENTO' ? '/parceiro' : perfil === 'VIAJANTE' ? '/inicio' : '/acesso-restrito'
}
