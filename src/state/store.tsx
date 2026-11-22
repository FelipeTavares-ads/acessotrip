import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { mensagemDeErro } from '../api/client'
import { viajante } from '../api/endpoints'
import type { Uuid } from '../api/types'
import { useSession } from './session'

interface Toast {
  id: number
  text: string
}

interface Store {
  /** Ids dos estabelecimentos favoritos do viajante logado (vazio para os demais). */
  favorites: Set<Uuid>
  /** Alterna o favorito; pede login se necessário. Devolve o novo estado, ou null se não mudou. */
  toggleFavorite: (id: Uuid, nome: string) => Promise<boolean | null>
  /** Códigos das necessidades do perfil do viajante logado (vazio para os demais). */
  minhasNecessidades: string[]
  /** false enquanto favoritos e necessidades do viajante logado ainda estão chegando da API. */
  perfilPronto: boolean
  setMinhasNecessidades: (codigos: string[]) => void
  toast: Toast | null
  notify: (text: string) => void
}

const Ctx = createContext<Store | null>(null)

/** Precisa estar dentro do BrowserRouter (usa navegação para pedir login). */
export function StoreProvider({ children }: { children: ReactNode }) {
  const { usuario } = useSession()
  const nav = useNavigate()
  const [toast, setToast] = useState<Toast | null>(null)
  // Dados do viajante, marcados com o id do dono: ao trocar de conta, o que é de outra conta é ignorado
  const [dados, setDados] = useState<{ uid: Uuid; fav: Set<Uuid>; nec: string[] } | null>(null)

  const notify = useCallback((text: string) => {
    const id = Date.now()
    setToast({ id, text })
    window.setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 5000)
  }, [])

  const isViajante = usuario?.perfil === 'VIAJANTE'
  const uid = isViajante ? usuario.id : null
  useEffect(() => {
    if (!uid) return
    Promise.all([viajante.favoritos().catch(() => []), viajante.necessidades().catch(() => [])]).then(([fs, ns]) =>
      setDados({ uid, fav: new Set(fs.map((f) => f.estabelecimentoId)), nec: ns.map((n) => n.codigo) }),
    )
  }, [uid])
  const meus = uid && dados?.uid === uid ? dados : null
  const favorites = useMemo(() => meus?.fav ?? new Set<Uuid>(), [meus])
  const minhasNecessidades = useMemo(() => meus?.nec ?? [], [meus])
  const perfilPronto = !uid || !!meus
  const setFavorites = useCallback(
    (fn: (f: Set<Uuid>) => Set<Uuid>) => setDados((d) => (d && d.uid === uid ? { ...d, fav: fn(d.fav) } : d)),
    [uid],
  )
  const setMinhasNecessidades = useCallback(
    (nec: string[]) => setDados((d) => (d && d.uid === uid ? { ...d, nec } : d)),
    [uid],
  )

  const toggleFavorite = useCallback(
    async (id: Uuid, nome: string) => {
      if (!isViajante) {
        notify('Entre com sua conta de viajante para salvar favoritos.')
        nav(`/entrar?volta=${encodeURIComponent(location.pathname + location.search)}`)
        return null
      }
      const add = !favorites.has(id)
      try {
        if (add) await viajante.favoritar(id)
        else await viajante.desfavoritar(id)
        setFavorites((f) => {
          const n = new Set(f)
          if (add) n.add(id)
          else n.delete(id)
          return n
        })
        notify(add ? `${nome} salvo nos favoritos.` : `${nome} removido dos favoritos.`)
        return add
      } catch (e) {
        notify(mensagemDeErro(e))
        return null
      }
    },
    [isViajante, favorites, notify, nav, setFavorites],
  )

  const value = useMemo<Store>(
    () => ({ favorites, toggleFavorite, minhasNecessidades, perfilPronto, setMinhasNecessidades, toast, notify }),
    [favorites, toggleFavorite, minhasNecessidades, perfilPronto, setMinhasNecessidades, toast, notify],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore fora do StoreProvider')
  return s
}
