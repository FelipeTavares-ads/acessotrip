import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Perfil } from '../api/types'
import { rotaInicial, useSession } from '../state/session'
import { PageHeader } from './Layout'
import { Loading } from './ui'

/**
 * Exige sessão com o perfil indicado. Sem sessão, leva ao login guardando a rota de volta;
 * com outro perfil, explica que a área não é para essa conta.
 */
export function RequireAuth({ perfil }: { perfil: Perfil }) {
  const { usuario, pronto } = useSession()
  const loc = useLocation()
  if (!pronto) return <Loading label="Verificando sua sessão…" />
  if (!usuario) return <Navigate to={`/entrar?volta=${encodeURIComponent(loc.pathname + loc.search)}`} replace />
  if (usuario.perfil !== perfil) return <AcessoNaoPermitido />
  return <Outlet />
}

export function AcessoNaoPermitido() {
  const { usuario } = useSession()
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <PageHeader
        title="Esta área não é para a sua conta"
        lead={
          usuario?.perfil === 'ADMINISTRADOR' || usuario?.perfil === 'MODERADOR'
            ? 'O painel administrativo ainda não existe nesta versão. A moderação é feita diretamente pela API.'
            : 'Você está conectado com um tipo de conta diferente do que esta página exige.'
        }
      />
      {usuario && (usuario.perfil === 'VIAJANTE' || usuario.perfil === 'ESTABELECIMENTO') && (
        <Link to={rotaInicial(usuario.perfil)} className="inline-flex min-h-11 items-center font-semibold text-brand">
          Ir para a minha área
        </Link>
      )}
    </div>
  )
}
