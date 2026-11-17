import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, Heart, LogOut, MessageSquareText, Route, SlidersHorizontal } from 'lucide-react'
import { PageHeader } from '../components/Layout'
import { PlaceCard } from '../components/PlaceCard'
import { Button, ButtonLink, NeedIcon, Stars, cx } from '../components/ui'
import { NEEDS, needById } from '../data/domain'
import { PLACES, placeById } from '../data/places'
import type { NeedId } from '../data/types'
import { useStore } from '../state/store'

/* ---------- Necessidades (RF03) ---------- */

export function Necessidades() {
  const { traveler, setNeeds, notify } = useStore()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const first = params.get('primeiro') === '1'
  const [sel, setSel] = useState<NeedId[]>(traveler?.necessidades ?? [])

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Suas necessidades"
        lead="Usamos isso para mostrar primeiro o que importa nas fichas e nos resultados. Você pode mudar quando quiser, e pode marcar mais de uma."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setNeeds(sel)
          notify('Necessidades salvas.')
          nav(first ? '/inicio' : '/perfil')
        }}
      >
        <fieldset>
          <legend className="sr-only">Marque suas necessidades</legend>
          <div className="flex flex-col gap-3">
            {NEEDS.map((n) => {
              const on = sel.includes(n.id)
              return (
                <label
                  key={n.id}
                  className={cx(
                    'flex cursor-pointer items-start gap-4 rounded-[var(--radius-card)] border-2 bg-canvas p-4 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand',
                    on ? 'border-brand' : 'border-line',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setSel((s) => (on ? s.filter((x) => x !== n.id) : [...s, n.id]))}
                    className="mt-1 size-6 shrink-0"
                  />
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-ink">
                    <NeedIcon need={n.id} className="size-6" />
                  </span>
                  <span>
                    <span className="block text-lg font-bold text-ink">{n.label}</span>
                    <span className="block text-ink-2">{n.description}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
        <p className="mt-4 text-[0.9375rem] text-ink-3">
          Essa informação fica só no seu perfil e não aparece para os estabelecimentos.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button type="submit">Salvar necessidades</Button>
          {first && (
            <ButtonLink to="/inicio" variant="ghost">
              Pular por enquanto
            </ButtonLink>
          )}
        </div>
      </form>
    </div>
  )
}

/* ---------- Perfil ---------- */

export function Perfil() {
  const { traveler, signOut, favorites, reviews } = useStore()
  const nav = useNavigate()
  const own = reviews.filter((r) => r.id.startsWith('own-')).length
  const rows = [
    {
      to: '/perfil/necessidades',
      Icon: SlidersHorizontal,
      title: 'Minhas necessidades',
      sub: traveler?.necessidades.length ? traveler.necessidades.map((n) => needById(n).label).join(', ') : 'Nenhuma marcada',
    },
    { to: '/favoritos', Icon: Heart, title: 'Favoritos', sub: `${favorites.length} ${favorites.length === 1 ? 'lugar salvo' : 'lugares salvos'}` },
    { to: '/minhas-avaliacoes', Icon: MessageSquareText, title: 'Minhas avaliações', sub: own ? `${own} publicadas` : 'Nenhuma ainda' },
    { to: '/roteiro', Icon: Route, title: 'Roteiro acessível', sub: 'Monte um roteiro com lugares do catálogo' },
  ]
  return (
    <div className="max-w-2xl">
      <PageHeader title={traveler ? traveler.nome : 'Perfil'} lead={traveler?.email} />
      <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-canvas">
        {rows.map(({ to, Icon, title, sub }) => (
          <li key={to}>
            <Link to={to} className="flex min-h-16 items-center gap-4 px-4 py-3 no-underline hover:bg-surface">
              <Icon aria-hidden className="size-6 shrink-0 text-brand" />
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-ink">{title}</span>
                <span className="block truncate text-[0.9375rem] text-ink-2">{sub}</span>
              </span>
              <ChevronRight aria-hidden className="size-5 text-ink-3" />
            </Link>
          </li>
        ))}
      </ul>
      <Button
        variant="ghost"
        className="mt-6"
        onClick={() => {
          signOut()
          nav('/')
        }}
      >
        <LogOut aria-hidden className="size-5" />
        Sair da conta
      </Button>
    </div>
  )
}

/* ---------- Favoritos ---------- */

export function Favoritos() {
  const { favorites, traveler } = useStore()
  const list = PLACES.filter((p) => favorites.includes(p.id))
  return (
    <>
      <PageHeader title="Favoritos" lead={list.length ? `${list.length} ${list.length === 1 ? 'lugar salvo' : 'lugares salvos'}.` : undefined} />
      {list.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <li key={p.id} className="flex">
              <PlaceCard place={p} needs={traveler?.necessidades ?? []} headingLevel={2} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas p-8 text-center">
          <Heart aria-hidden className="mx-auto size-8 text-ink-3" />
          <h2 className="mt-3 text-lg font-bold">Nenhum lugar salvo</h2>
          <p className="mx-auto mt-1 max-w-[40ch] text-ink-2">Toque no coração de um lugar para guardar e comparar depois.</p>
          <ButtonLink to="/buscar" className="mt-5">
            Buscar lugares
          </ButtonLink>
        </div>
      )}
    </>
  )
}

/* ---------- Minhas avaliações ---------- */

export function MinhasAvaliacoes() {
  const { reviews } = useStore()
  const own = reviews.filter((r) => r.id.startsWith('own-'))
  return (
    <div className="max-w-2xl">
      <PageHeader title="Minhas avaliações" />
      {own.length ? (
        <ul className="flex flex-col gap-3">
          {own.map((r) => {
            const p = placeById(r.placeId)!
            return (
              <li key={r.id} className="rounded-[var(--radius-card)] border border-line bg-canvas p-4">
                <h2 className="font-bold">
                  <Link to={`/local/${p.id}`} className="text-brand">
                    {p.nome}
                  </Link>
                </h2>
                <div className="mt-1">
                  <Stars value={r.nota} />
                </div>
                <p className="mt-2 text-ink">{r.texto}</p>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas p-8 text-center">
          <h2 className="text-lg font-bold">Você ainda não avaliou nenhum lugar</h2>
          <p className="mx-auto mt-1 max-w-[44ch] text-ink-2">
            Depois de uma visita, abra a ficha do lugar e toque em Avaliar. Seu relato confirma ou corrige o que o local informou.
          </p>
          <ButtonLink to="/favoritos" variant="secondary" className="mt-5">
            Ver meus favoritos
          </ButtonLink>
        </div>
      )}
    </div>
  )
}
