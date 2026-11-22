import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, ChartColumn, Route, Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react'
import { MODO_NECESSIDADES, catalogo, type Busca } from '../api/endpoints'
import type { CardEstabelecimento, TipoEstabelecimento } from '../api/types'
import { useApi } from '../api/useApi'
import { DestinoCombobox, parseDestino } from '../components/Combobox'
import { PageHeader } from '../components/Layout'
import { PlaceCard } from '../components/PlaceCard'
import { Button, ButtonLink, LoadError, Loading, NeedIcon, SectionTitle, TextField, ToggleChip, cx } from '../components/ui'
import { PLACE_TYPES, PLACE_TYPE_LABEL, needMeta } from '../data/domain'
import { useDominios } from '../state/dominios'
import { useSession } from '../state/session'
import { useStore } from '../state/store'

/** Texto que explica o filtro de necessidades, coerente com o modo em uso na API (D8). */
// eslint-disable-next-line react-refresh/only-export-components
export const TEXTO_FILTRO_NECESSIDADES =
  MODO_NECESSIDADES === 'TODAS'
    ? 'Só aparecem lugares que atendem a todas as necessidades marcadas.'
    : 'Aparecem lugares que atendem a pelo menos uma das necessidades marcadas. Confira no card quais delas cada lugar atende.'

/** Seletor de necessidades em chips (usado em várias telas). */
export function NeedChips({ value, onChange, legend }: { value: string[]; onChange: (v: string[]) => void; legend: string }) {
  const { necessidades } = useDominios()
  return (
    <fieldset>
      <legend className="mb-2 font-semibold text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {necessidades.map((n) => (
          <ToggleChip
            key={n.codigo}
            pressed={value.includes(n.codigo)}
            onToggle={() => onChange(value.includes(n.codigo) ? value.filter((x) => x !== n.codigo) : [...value, n.codigo])}
            icon={<NeedIcon need={n.codigo} className="size-4" />}
          >
            {needMeta(n).label}
          </ToggleChip>
        ))}
      </div>
    </fieldset>
  )
}

/* ---------------- Início ---------------- */

export function Inicio() {
  const { usuario } = useSession()
  const { minhasNecessidades: needs, perfilPronto } = useStore()
  const { necessidadePorCodigo } = useDominios()
  const nav = useNavigate()
  const [destino, setDestino] = useState('')
  // null = ainda não mexeu: acompanha as necessidades do perfil (que chegam da API depois)
  const [escolha, setSel] = useState<string[] | null>(null)
  const sel = escolha ?? needs

  const ids = needs.map((c) => necessidadePorCodigo(c)?.id).filter((x): x is number => x !== undefined)
  const destaques = useApi(
    !perfilPronto
      ? null
      : () => catalogo.buscar({ selo: true, necessidades: ids, modoNecessidades: ids.length ? MODO_NECESSIDADES : undefined, tamanho: 6 }),
    [ids.join(','), perfilPronto],
  )
  const viajante = usuario?.perfil === 'VIAJANTE'

  return (
    <>
      <PageHeader
        title={usuario?.nome ? `Olá, ${usuario.nome}. Para onde vamos?` : 'Para onde vamos?'}
        lead={
          !viajante ? (
            <>
              <Link to="/entrar" className="font-semibold text-brand">
                Entre
              </Link>{' '}
              para salvar favoritos e ver primeiro o que importa para você.
            </>
          ) : needs.length ? (
            <>
              Resultados ajustados para{' '}
              <strong className="text-ink">{needs.map((n) => needMeta(n).label.toLowerCase()).join(' e ')}</strong>.{' '}
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
        <DestinoCombobox label="Destino" value={destino} onChange={setDestino} placeholder="Cidade" />
        <NeedChips legend="Mostrar o que importa para" value={sel} onChange={setSel} />
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
          <span className="block text-[0.9375rem] text-ink-2">Sugestões geradas só com lugares do catálogo.</span>
        </span>
        <ArrowRight aria-hidden className="size-5 text-brand" />
      </Link>

      <Link
        to="/panorama"
        className="mt-3 flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-canvas p-4 no-underline hover:border-brand"
      >
        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
          <ChartColumn aria-hidden className="size-6" />
        </span>
        <span className="flex-1">
          <span className="block font-bold text-ink">Panorama da acessibilidade</span>
          <span className="block text-[0.9375rem] text-ink-2">Quantos lugares atendem a cada necessidade em cada destino.</span>
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
        {destaques.loading || !perfilPronto ? (
          <Loading />
        ) : destaques.error ? (
          <LoadError error={destaques.error} onRetry={destaques.reload} />
        ) : destaques.data?.itens.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.data.itens.map((p) => (
              <li key={p.id} className="flex">
                <PlaceCard place={p} needs={needs} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas p-5 text-ink-2">
            Ainda não há lugares com o selo{needs.length ? ' que atendam às suas necessidades' : ''}.
          </p>
        )}
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
          <DestinoCombobox label="Cidade" value={destino} onChange={setDestino} hint="Digite ao menos 2 letras. Ex.: Porto Seguro" />
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
          <TextField label="Nome do lugar" type="search" maxLength={150} value={nome} onChange={(e) => setNome(e.target.value)} hint="Hotel, pousada, restaurante ou espaço de eventos" optional />
          <Button type="submit" variant="secondary">
            Buscar pelo nome
          </Button>
        </form>
      </div>
    </>
  )
}

/* ---------------- Resultados + filtros (RF04–RF10) ---------------- */

type Ordem = 'relevancia' | 'avaliacao' | 'proximidade'
const TAMANHO = 12

export function Resultados() {
  const { minhasNecessidades, perfilPronto } = useStore()
  const { necessidades, necessidadePorCodigo } = useDominios()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [geoMsg, setGeoMsg] = useState('')

  const destino = params.get('destino') ?? ''
  const nome = params.get('nome') ?? ''
  const tipos = (params.get('tipo')?.split(',').filter((t) => PLACE_TYPES.includes(t as TipoEstabelecimento)) ?? []) as TipoEstabelecimento[]
  // ?nec ausente = usa o perfil; ?nec=nenhuma = o viajante desmarcou tudo nesta busca
  const necParam = params.get('nec')
  const nec: string[] =
    necParam === null ? minhasNecessidades : necParam.split(',').filter((c) => necessidades.some((n) => n.codigo === c))
  const selo = params.get('selo') === '1'
  const ordem = (params.get('ordem') ?? 'relevancia') as Ordem

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '') next.delete(k)
      else next.set(k, v)
    }
    setParams(next, { replace: true })
  }
  const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]).join(',')

  // Proximidade exige a posição do viajante (RF09)
  useEffect(() => {
    if (ordem !== 'proximidade' || coords) return
    if (!('geolocation' in navigator)) {
      setGeoMsg('Seu navegador não informa a localização. Mostrando por relevância.')
      update({ ordem: null })
      return
    }
    setGeoMsg('Obtendo sua localização…')
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: Number(p.coords.latitude.toFixed(6)), lon: Number(p.coords.longitude.toFixed(6)) })
        setGeoMsg('')
      },
      () => {
        setGeoMsg('Não foi possível usar sua localização. Mostrando por relevância.')
        update({ ordem: null })
      },
      { timeout: 10_000 },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordem, coords])

  const busca: Busca | null = useMemo(() => {
    if (ordem === 'proximidade' && !coords) return null
    // Sem ?nec, a busca usa o perfil: espera as necessidades chegarem para não mostrar resultado errado
    if (necParam === null && !perfilPronto) return null
    const d = destino ? parseDestino(destino) : null
    const ids = nec.map((c) => necessidadePorCodigo(c)?.id).filter((x): x is number => x !== undefined)
    return {
      destino: d?.cidade,
      estado: d?.estado,
      nome: nome || undefined,
      tipos,
      necessidades: ids,
      modoNecessidades: ids.length ? MODO_NECESSIDADES : undefined,
      selo,
      ordenacao: ordem === 'avaliacao' ? 'AVALIACAO' : ordem === 'proximidade' ? 'PROXIMIDADE' : undefined,
      lat: coords?.lat,
      lon: coords?.lon,
      tamanho: TAMANHO,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destino, nome, tipos.join(','), nec.join(','), selo, ordem, coords, necessidades, perfilPronto])

  // Lista acumulada com "Carregar mais"; recomeça quando os filtros mudam
  const [itens, setItens] = useState<CardEstabelecimento[]>([])
  const [pagina, setPagina] = useState(0)
  const [total, setTotal] = useState<{ itens: number; paginas: number } | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<unknown>()
  const [tick, setTick] = useState(0)
  const chave = JSON.stringify(busca)
  const primeiroNovo = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    setItens([])
    setPagina(0)
    setTotal(null)
  }, [chave])

  useEffect(() => {
    if (!busca) return
    const ctrl = new AbortController()
    setCarregando(true)
    setErro(undefined)
    catalogo.buscar({ ...busca, pagina }, ctrl.signal).then(
      (r) => {
        setItens((old) => (pagina === 0 ? r.itens : [...old, ...r.itens]))
        setTotal({ itens: r.totalItens, paginas: r.totalPaginas })
        setCarregando(false)
      },
      (e) => {
        if ((e as Error).name === 'AbortError') return
        setErro(e)
        setCarregando(false)
      },
    )
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, pagina, tick])

  // Ao carregar mais, o foco vai para o primeiro item novo
  const novoIndice = useRef(-1)
  useEffect(() => {
    if (novoIndice.current > 0 && !carregando) {
      primeiroNovo.current?.focus()
      novoIndice.current = -1
    }
  }, [itens, carregando])

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

      <div className="mb-4">
        <NeedChips legend="Minhas necessidades" value={nec} onChange={(v) => update({ nec: v.join(',') || 'nenhuma' })} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
        <p role="status" aria-live="polite" className="font-semibold text-ink tabular">
          {total === null
            ? carregando
              ? 'Buscando lugares…'
              : ''
            : total.itens === 1
              ? '1 lugar encontrado'
              : `${total.itens} lugares encontrados`}
        </p>
        <div className="flex w-full items-end gap-2 sm:w-auto">
          <label htmlFor="ordem" className="sr-only">
            Ordenar por
          </label>
          <select
            id="ordem"
            value={ordem}
            onChange={(e) => {
              setGeoMsg('')
              update({ ordem: e.target.value === 'relevancia' ? null : e.target.value })
            }}
            className="min-h-11 min-w-0 flex-1 rounded-[var(--radius-control)] border border-line-strong bg-canvas px-3 font-semibold sm:flex-none"
          >
            <option value="relevancia">Relevância</option>
            <option value="avaliacao">Melhor avaliação</option>
            <option value="proximidade">Mais perto de mim</option>
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
      {geoMsg && (
        <p role="status" className="mt-3 text-[0.9375rem] text-ink-2">
          {geoMsg}
        </p>
      )}

      <section
        id="painel-filtros"
        aria-label="Filtros"
        hidden={!filtersOpen}
        className="mt-4 grid gap-6 rounded-[var(--radius-card)] border border-line bg-canvas p-5 md:grid-cols-[1fr_1fr_auto]"
      >
        <fieldset>
          <legend className="mb-2 font-semibold">Tipo de lugar</legend>
          <div className="flex flex-col gap-1">
            {PLACE_TYPES.map((t) => (
              <label key={t} className="flex min-h-11 cursor-pointer items-center gap-3">
                <input type="checkbox" checked={tipos.includes(t)} onChange={() => update({ tipo: toggleIn(tipos, t) })} className="size-5" />
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

      {nec.length > 0 && <p className="mt-4 text-[0.9375rem] text-ink-2">{TEXTO_FILTRO_NECESSIDADES}</p>}

      {erro ? (
        <div className="mt-6">
          <LoadError error={erro} onRetry={() => setTick((t) => t + 1)} />
        </div>
      ) : itens.length ? (
        <>
          <ul className={cx('mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3')}>
            {itens.map((p, i) => (
              <li
                key={p.id}
                className="flex"
                ref={(el) => {
                  if (i === novoIndice.current) primeiroNovo.current = el?.querySelector('a') ?? null
                }}
              >
                <PlaceCard place={p} needs={nec} headingLevel={2} />
              </li>
            ))}
          </ul>
          {total && pagina + 1 < total.paginas && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="secondary"
                disabled={carregando}
                onClick={() => {
                  novoIndice.current = itens.length
                  setPagina((p) => p + 1)
                }}
              >
                {carregando ? 'Carregando…' : `Carregar mais (${itens.length} de ${total.itens})`}
              </Button>
            </div>
          )}
        </>
      ) : carregando || !busca ? (
        <Loading label={ordem === 'proximidade' && !coords ? 'Aguardando sua localização…' : 'Buscando lugares…'} />
      ) : (
        <div className="mt-8 rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas p-8 text-center">
          <h2 className="text-lg font-bold">Nenhum lugar com esses critérios</h2>
          <p className="mx-auto mt-2 max-w-[44ch] text-ink-2">Tente outro destino, desmarque algum filtro ou veja todos os lugares do catálogo.</p>
          <ButtonLink to="/resultados?nec=nenhuma" variant="secondary" className="mt-5">
            Ver todos os lugares
          </ButtonLink>
        </div>
      )}
    </>
  )
}
