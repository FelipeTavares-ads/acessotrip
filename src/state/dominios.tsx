import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { dominios } from '../api/endpoints'
import type { CategoriaCampos, CategoriaFicha, TipoNecessidade } from '../api/types'
import { useApi } from '../api/useApi'

/**
 * Domínios da plataforma (tipos de necessidade, categorias e campos da ficha), carregados uma vez.
 * Ids numéricos variam entre ambientes: compare sempre pelo `codigo`.
 */
interface Dominios {
  necessidades: TipoNecessidade[]
  categorias: CategoriaFicha[]
  campos: CategoriaCampos[]
  carregando: boolean
  erro: unknown
  recarregar: () => void
  necessidadePorCodigo: (codigo: string) => TipoNecessidade | undefined
  necessidadePorId: (id: number) => TipoNecessidade | undefined
}

const Ctx = createContext<Dominios | null>(null)

export function DominiosProvider({ children }: { children: ReactNode }) {
  const st = useApi(() => Promise.all([dominios.tiposNecessidade(), dominios.categorias(), dominios.campos()]), [])
  const value = useMemo<Dominios>(() => {
    const [necessidades = [], categorias = [], campos = []] = st.data ?? []
    return {
      necessidades,
      categorias,
      campos,
      carregando: st.loading,
      erro: st.error,
      recarregar: st.reload,
      necessidadePorCodigo: (c) => necessidades.find((n) => n.codigo === c),
      necessidadePorId: (id) => necessidades.find((n) => n.id === id),
    }
  }, [st.data, st.loading, st.error, st.reload])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDominios() {
  const d = useContext(Ctx)
  if (!d) throw new Error('useDominios fora do DominiosProvider')
  return d
}
