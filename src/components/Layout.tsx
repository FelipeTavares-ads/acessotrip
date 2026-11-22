import { useEffect, useRef, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  Bell,
  CircleUser,
  ClipboardList,
  Heart,
  House,
  LayoutDashboard,
  MessageSquareText,
  Search,
  Building2,
  type LucideIcon,
} from 'lucide-react'
import { useStore } from '../state/store'
import { cx } from './ui'

interface NavItem {
  to: string
  label: string
  Icon: LucideIcon
  end?: boolean
}

const TRAVELER_NAV: NavItem[] = [
  { to: '/inicio', label: 'Início', Icon: House },
  { to: '/buscar', label: 'Buscar', Icon: Search },
  { to: '/favoritos', label: 'Favoritos', Icon: Heart },
  { to: '/perfil', label: 'Perfil', Icon: CircleUser },
]

const PARTNER_NAV: NavItem[] = [
  { to: '/parceiro', label: 'Painel', Icon: LayoutDashboard, end: true },
  { to: '/parceiro/ficha', label: 'Ficha', Icon: ClipboardList },
  { to: '/parceiro/avaliacoes', label: 'Avaliações', Icon: MessageSquareText },
  { to: '/parceiro/empresa', label: 'Conta', Icon: Building2 },
]

export function Brand({ partner }: { partner?: boolean }) {
  return (
    <Link
      to={partner ? '/parceiro' : '/'}
      className="inline-flex items-center gap-2 no-underline text-ink font-bold text-[1.375rem] tracking-[-0.02em] min-h-11"
    >
      <img src="/logo.jpg" alt="" width={40} height={40} className="size-10 rounded-lg" />
      AcessoTrip
      {partner && (
        <span className="ml-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-sm font-semibold tracking-normal text-brand-ink">
          Parceiro
        </span>
      )}
    </Link>
  )
}

export function SkipLink() {
  return (
    <a
      href="#conteudo"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-control)] focus:bg-brand focus:px-4 focus:py-3 focus:font-semibold focus:text-white"
    >
      Pular para o conteúdo
    </a>
  )
}

/**
 * A cada troca de rota: atualiza o título da aba e leva o foco ao h1 (anunciado pelo leitor de tela).
 * Montado uma vez no roteador (fora dos layouts), para funcionar também ao trocar de layout.
 */
export function RouteFocus() {
  useRouteFocus()
  return null
}

function useRouteFocus() {
  const { pathname } = useLocation()
  // Compara com a rota anterior (e não com "primeira execução") para não roubar o foco
  // no carregamento inicial quando o StrictMode executa o efeito duas vezes.
  const last = useRef(pathname)
  useEffect(() => {
    const h1 = document.querySelector<HTMLElement>('main h1')
    if (h1) document.title = `${h1.textContent} · AcessoTrip`
    if (last.current === pathname) return
    last.current = pathname
    window.scrollTo(0, 0)
    if (h1) {
      h1.setAttribute('tabindex', '-1')
      h1.focus({ preventScroll: true })
    }
  }, [pathname])
}

function Toast() {
  const { toast } = useStore()
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 flex justify-center px-4 md:bottom-6"
    >
      {toast && (
        <p
          key={toast.id}
          className="max-w-md rounded-[var(--radius-control)] bg-ink px-4 py-3 text-[0.9375rem] font-semibold text-white shadow-[var(--shadow-raise)] [animation:toast-in_220ms_cubic-bezier(0.16,1,0.3,1)]"
        >
          {toast.text}
        </p>
      )}
    </div>
  )
}

function DesktopNav({ items, label }: { items: NavItem[]; label: string }) {
  return (
      <nav aria-label={label} className="hidden md:block">
        <ul className="flex flex-wrap items-center gap-1">
          {items.map(({ to, label, Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx(
                    'inline-flex items-center gap-2 min-h-11 px-3.5 rounded-[var(--radius-control)] font-semibold no-underline',
                    isActive ? 'bg-brand-soft text-brand-ink' : 'text-ink-2 hover:bg-surface hover:text-ink',
                  )
                }
              >
                <Icon aria-hidden className="size-5" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
  )
}

/* Mobile: barra inferior no alcance do polegar. Fica fora do <header>, cujo backdrop-filter prenderia o position:fixed. */
function MobileNav({ items, label }: { items: NavItem[]; label: string }) {
  return (
      <nav
        aria-label={label}
        className="md:hidden fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas pb-[env(safe-area-inset-bottom)] shadow-[var(--shadow-float)]"
      >
        <ul className="grid grid-cols-4">
          {items.map(({ to, label, Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cx(
                    'flex flex-col items-center justify-center gap-0.5 min-h-16 text-[0.8125rem] font-semibold no-underline',
                    isActive ? 'text-brand' : 'text-ink-2',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cx(
                        'inline-flex h-8 w-14 items-center justify-center rounded-full transition-colors',
                        isActive && 'bg-brand-soft',
                      )}
                    >
                      <Icon aria-hidden className="size-[1.375rem]" strokeWidth={isActive ? 2.4 : 2} />
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
  )
}

function Shell({ partner, children }: { partner?: boolean; children?: ReactNode }) {

  return (
    <div className="min-h-dvh bg-surface">
      <SkipLink />
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur-sm">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 md:px-6">
          <Brand partner={partner} />
          <DesktopNav items={partner ? PARTNER_NAV : TRAVELER_NAV} label={partner ? 'Menu do parceiro' : 'Menu principal'} />
          {partner && (
            <Link
              to="/parceiro/notificacoes"
              className="relative inline-flex size-11 items-center justify-center rounded-full text-ink-2 hover:bg-surface md:hidden"
            >
              <Bell aria-hidden className="size-6" />
              <span aria-hidden className="absolute right-2.5 top-2.5 size-2.5 rounded-full bg-danger ring-2 ring-canvas" />
              <span className="sr-only">Notificações, 1 nova</span>
            </Link>
          )}
        </div>
      </header>
      <main id="conteudo" className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:px-6 md:pb-16 md:pt-8">
        {children ?? <Outlet />}
        <p className="mt-14 border-t border-line pt-4 text-sm text-ink-3">
          Protótipo com dados de exemplo: estabelecimentos, preços, telefones, fotos e avaliações são fictícios.
        </p>
      </main>
      <MobileNav items={partner ? PARTNER_NAV : TRAVELER_NAV} label={partner ? 'Menu do parceiro' : 'Menu principal'} />
      <Toast />
    </div>
  )
}

export const TravelerLayout = () => <Shell />
export const PartnerLayout = () => <Shell partner />

/** Telas de autenticação e landing: sem barra inferior. */
export function BareLayout() {

  return (
    <div className="min-h-dvh bg-canvas">
      <SkipLink />
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <Brand />
          <nav aria-label="Acesso à conta">
            <ul className="flex flex-wrap items-center gap-1">
              <li>
                <Link to="/entrar" className="inline-flex min-h-11 items-center px-3 font-semibold text-brand">
                  Entrar
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main id="conteudo">
        <Outlet />
      </main>
      <Toast />
    </div>
  )
}

export function PageHeader({ title, lead, back }: { title: string; lead?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-6">
      {back}
      <h1 className="text-[1.75rem] leading-tight font-bold text-ink md:text-[2rem] outline-none">{title}</h1>
      {lead && <p className="mt-2 max-w-[60ch] text-[1.0625rem] text-ink-2">{lead}</p>}
    </div>
  )
}
