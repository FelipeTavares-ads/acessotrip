import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Route, Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react'
import { Combobox } from '../components/Combobox'
import { PageHeader } from '../components/Layout'
import { PlaceCard } from '../components/PlaceCard'
import { Button, ButtonLink, NeedIcon, SectionTitle, TextField, ToggleChip, cx } from '../components/ui'
import { NEEDS, PLACE_TYPE_LABEL, needById, ratingFor, statusForNeed } from '../data/domain'
import { DESTINATIONS, PLACES } from '../data/places'
import type { NeedId, PlaceType } from '../data/types'
import { useStore } from '../state/store'

const norm = (s: string) =>
  s
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

/* ---------------- Início ---------------- */

export function Inicio() {
  const { traveler } = useStore()
  const nav = useNavigate()
  const needs = traveler?.necessidades ?? []
  const [destino, setDestino] = useState('')
  const [sel, setSel] = useState<NeedId[]>(needs)
  // Mesma regra dos resultados: quem não atende às necessidades do perfil fica de fora
  const featured = PLACES.filter((p) => p.seloVerificado && needs.every((n) => statusForNeed(p, n) !== 'nao'))

  return (
    <>
      <PageHeader
        title={traveler ? `Olá, ${traveler.nome}. Para onde vamos?` : 'Para onde vamos?'}
        lead={
          needs.length ? (
            <>
              Resultados ajustados para{' '}
              <strong className="text-ink">{needs.map((n) => needById(n).label.toLowerCase()).join(' e ')}</strong>.{' '}
              <Link to="/perfil/necessidades" className="font-semibold text-brand">
                Alterar
              </Link>
            </>
          ) : (
            <>
              <Link to="/perfil/necessidades" className="font-semibold text-brand">
                Conte suas necessidades
              </Link>{' '}
              para ver primeiro o que importa para você.
            </>
          )
        }
      />
      <form
        role="search"
        aria-label="Buscar por destino"
        onSubmit={(e) => {
          e.preventDefault()
          const q = new URLSearchParams(destino ? { destino } : {})
          q.set('nec', sel.join(',') || 'nenhuma')
          nav(`/resultados?${q}`)
        }}
        className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-canvas p-4 md:p-5"
      >
        <Combobox label="Destino" value={destino} onChange={setDestino} options={DESTINATIONS} placeholder="Cidade ou estado" />
        <fieldset>
          <legend className="mb-2 font-semibold text-ink">Mostrar o que importa para</legend>
          <div className="flex flex-wrap gap-2">
            {NEEDS.map((n) => (
              <ToggleChip
                key={n.id}
                pressed={sel.includes(n.id)}
                onToggle={() => setSel((s) => (s.includes(n.id) ? s.filter((x) => x !== n.id) : [...s, n.id]))}
                icon={<NeedIcon need={n.id} className="size-4" />}
              >
                {n.label}
              </ToggleChip>
            ))}
          </div>
        </fieldset>
        <Button type="submit" className="min-h-14 md:self-start md:px-8">
          <SearchIcon aria-hidden className="size-5" />
          Buscar
        </Button>
      </form>

      <Link
        to="/roteiro"
        className="mt-4 flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-canvas p-4 no-underline hover:border-brand"
      >
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Route aria-hidden className="size-6" />
        </span>
        <span className="flex-1">
          <span className="block font-bold text-ink">Montar roteiro acessível</span>
          <span className="block text-[0.9375rem] text-ink-2">Sugestões de hospedagem e refeições só com lugares do catálogo.</span>
        </span>
        <ArrowRight aria-hidden className="size-5 text-brand" />
      </Link>

      <section aria-labelledby="destaques" className="mt-10">
        <SectionTitle
          id="destaques"
          action={
            <Link to="/resultados?selo=1" className="inline-flex min-h-11 shrink-0 items-center whitespace-nowrap font-semibold text-brand">
              Ver todos
            </Link>
          }
        >
          Com Selo Acessibilidade Verificada
        </SectionTitle>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <li key={p.id} className="flex">
              <PlaceCard place={p} needs={needs} />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

/* ---------------- Buscar (destino ou nome) ---------------- */

export function Buscar() {
  const nav = useNavigate()
  const [destino, setDestino] = useState('')
  const [nome, setNome] = useState('')
  const go = (e: FormEvent, q: Record<string, string>) => {
    e.preventDefault()
    nav(`/resultados?${new URLSearchParams(q)}`)
  }
  return (
    <>
      <PageHeader title="Buscar" lead="Procure por cidade ou pelo nome do lugar." />
      <div className="grid gap-6 md:grid-cols-2">
        <form
          role="search"
          aria-labelledby="busca-destino"
          onSubmit={(e) => go(e, destino ? { destino } : {})}
          className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-canvas p-5"
        >
          <h2 id="busca-destino" className="text-lg font-bold">
            Por destino
          </h2>
          <Combobox label="Cidade ou estado" value={destino} onChange={setDestino} options={DESTINATIONS} hint="Ex.: Porto Seguro, BA" />
          <Button type="submit">Ver lugares no destino</Button>
        </form>
        <form
          role="search"
          aria-labelledby="busca-nome"
          onSubmit={(e) => go(e, nome ? { nome } : {})}
          className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-canvas p-5"
        >
          <h2 id="busca-nome" className="text-lg font-bold">
            Por nome
          </h2>
          <TextField label="Nome do hotel, pousada ou restaurante" type="search" value={nome} onChange={(e) => setNome(e.target.value)} hint="Ex.: Pousada Coroa Vermelha" optional />
          <Button type="submit" variant="secondary">
            Buscar pelo nome
          </Button>
        </form>
      </div>
    </>
  )
}

/* ---------------- Resultados + filtros (RF06–RF10) ---------------- */

const TYPES: PlaceType[] = ['HOTEL', 'POUSADA', 'RESTAURANTE']

export function Resultados() {
  const { traveler, reviews } = useStore()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const destino = params.get('destino') ?? ''
  const nome = params.get('nome') ?? ''
  const tipos = (params.get('tipo')?.split(',').filter(Boolean) ?? []) as PlaceType[]
  // ?nec ausente = usa o perfil; ?nec=nenhuma = o viajante desmarcou tudo nesta busca
  const necParam = params.get('nec')
  const nec: NeedId[] =
    necParam === null
      ? (traveler?.necessidades ?? [])
      : (necParam.split(',').filter((n) => NEEDS.some((x) => x.id === n)) as NeedId[])
  const selo = params.get('selo') === '1'
  const ordem = params.get('ordem') ?? 'avaliacao'

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    setParams(next, { replace: true })
  }
  const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]).join(',')

  // Catálogo pequeno e local: filtrar a cada render é barato; com a API isso vira query no servidor.
  const results = (() => {
    const city = norm(destino.split(',')[0] ?? '')
    const byName = norm(nome)
    const list = PLACES.filter(
      (p) =>
        (!city || norm(p.cidade).includes(city) || norm(p.uf) === city) &&
        (!byName || norm(p.nome).includes(byName)) &&
        (!tipos.length || tipos.includes(p.tipo)) &&
        (!selo || p.seloVerificado) &&
        nec.every((n) => statusForNeed(p, n) !== 'nao'),
    )
    const score = (id: string) => ratingFor(PLACES.find((p) => p.id === id)!, reviews).media
    return [...list].sort((a, b) =>
      ordem === 'proximidade' ? a.distanciaKm - b.distanciaKm : score(b.id) - score(a.id) || Number(b.seloVerificado) - Number(a.seloVerificado),
    )
  })()

  const activeCount = tipos.length + (selo ? 1 : 0)
  const title = destino ? `Lugares em ${destino}` : nome ? `Resultados para “${nome}”` : 'Todos os lugares'

  return (
    <>
      <PageHeader
        title={title}
        back={
          <Link to="/buscar" className="mb-2 inline-flex min-h-11 items-center gap-1 font-semibold text-brand">
            Nova busca
          </Link>
        }
      />

      <fieldset className="mb-4">
        <legend className="mb-2 font-semibold text-ink">Minhas necessidades</legend>
        <div className="flex flex-wrap gap-2">
          {NEEDS.map((n) => (
            <ToggleChip
              key={n.id}
              pressed={nec.includes(n.id)}
              onToggle={() => update({ nec: toggleIn(nec, n.id) || 'nenhuma' })}
              icon={<NeedIcon need={n.id} className="size-4" />}
            >
              {n.label}
            </ToggleChip>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
        <p role="status" aria-live="polite" className="font-semibold text-ink tabular">
          {results.length === 1 ? '1 lugar encontrado' : `${results.length} lugares encontrados`}
        </p>
        <div className="flex w-full items-end gap-2 sm:w-auto">
          <label htmlFor="ordem" className="sr-only">
            Ordenar por
          </label>
          <select
            id="ordem"
            value={ordem}
            onChange={(e) => update({ ordem: e.target.value })}
            className="min-h-11 flex-1 rounded-[var(--radius-control)] border border-line-strong bg-canvas px-3 font-semibold sm:flex-none"
          >
            <option value="avaliacao">Melhor avaliação</option>
            <option value="proximidade">Mais perto</option>
          </select>
          <Button
            variant="secondary"
            aria-expanded={filtersOpen}
            aria-controls="painel-filtros"
            onClick={() => setFiltersOpen((o) => !o)}
            className="min-h-11 px-4"
          >
            <SlidersHorizontal aria-hidden className="size-5" />
            Filtros
            {activeCount > 0 && (
              <span className="rounded-full bg-brand px-2 text-sm text-white tabular">
                {activeCount}
                <span className="sr-only"> ativos</span>
              </span>
            )}
          </Button>
        </div>
      </div>

      <section
        id="painel-filtros"
        aria-label="Filtros"
        hidden={!filtersOpen}
        className="mt-4 grid gap-6 rounded-[var(--radius-card)] border border-line bg-canvas p-5 md:grid-cols-[1fr_1fr_auto]"
      >
        <fieldset>
          <legend className="mb-2 font-semibold">Tipo de lugar</legend>
          <div className="flex flex-col gap-1">
            {TYPES.map((t) => (
              <label key={t} className="flex min-h-11 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={tipos.includes(t)}
                  onChange={() => update({ tipo: toggleIn(tipos, t) })}
                  className="size-5"
                />
                {PLACE_TYPE_LABEL[t]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 font-semibold">Confiabilidade</legend>
          <label className="flex min-h-11 cursor-pointer items-center gap-3">
            <input type="checkbox" checked={selo} onChange={() => update({ selo: selo ? null : '1' })} className="size-5" />
            Só com Selo Acessibilidade Verificada
          </label>
        </fieldset>
        <div className="flex items-end gap-2">
          <Button variant="ghost" onClick={() => update({ tipo: null, selo: null })} disabled={!activeCount}>
            <X aria-hidden className="size-5" />
            Limpar filtros
          </Button>
        </div>
      </section>

      {nec.length > 0 && (
        <p className="mt-4 text-[0.9375rem] text-ink-2">
          Lugares que <strong>não atendem</strong> às necessidades marcadas ficam fora da lista. Itens “não informados” continuam
          aparecendo, sinalizados.
        </p>
      )}

      {results.length ? (
        <ul className={cx('mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3')}>
          {results.map((p) => (
            <li key={p.id} className="flex">
              <PlaceCard place={p} needs={nec} headingLevel={2} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas p-8 text-center">
          <h2 className="text-lg font-bold">Nenhum lugar com esses critérios</h2>
          <p className="mx-auto mt-2 max-w-[44ch] text-ink-2">
            Tente outro destino, desmarque algum filtro ou veja todos os lugares do catálogo.
          </p>
          <ButtonLink to="/resultados" variant="secondary" className="mt-5">
            Ver todos os lugares
          </ButtonLink>
        </div>
      )}
    </>
  )
}
