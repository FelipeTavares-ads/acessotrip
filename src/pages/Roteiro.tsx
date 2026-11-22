import { useRef, useState, type FormEvent, type Ref } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BedDouble, CalendarDays, CircleAlert, LoaderCircle, PartyPopper, Sparkles, Trash2, UtensilsCrossed } from 'lucide-react'
import { ApiError, mensagemDeErro } from '../api/client'
import { viajante } from '../api/endpoints'
import type { ItemRoteiro, Roteiro as RoteiroDto, Uuid } from '../api/types'
import { useApi } from '../api/useApi'
import { DestinoCombobox, parseDestino } from '../components/Combobox'
import { ErrorSummary } from '../components/ErrorSummary'
import { PageHeader } from '../components/Layout'
import { Button, LoadError, Loading, SelectField, TextField } from '../components/ui'
import { PLACE_TYPE_LABEL, formatData, hojeIso } from '../data/domain'
import { useDominios } from '../state/dominios'
import { useStore } from '../state/store'
import { NeedChips } from './Search'

const MAX_DIAS = 7

function iconeTipo(tipo: ItemRoteiro['tipo']) {
  if (tipo === 'RESTAURANTE') return UtensilsCrossed
  if (tipo === 'ESPACO_EVENTOS') return PartyPopper
  return BedDouble
}

/** Exibe um roteiro por dia. A observação vem da IA e é sempre texto puro (RN09). */
function RoteiroView({ r, titleRef }: { r: RoteiroDto; titleRef?: Ref<HTMLHeadingElement> }) {
  const vazio = r.dias.every((d) => !d.itens.length)
  return (
    <section aria-labelledby="roteiro-resultado" className="mt-8">
      <h2 id="roteiro-resultado" ref={titleRef} tabIndex={-1} className="text-xl font-bold outline-none">
        Roteiro em {r.destino}
      </h2>
      <p className="mt-1 text-ink-2">
        De {formatData(r.dataInicio)} a {formatData(r.dataFim)}
      </p>
      {vazio ? (
        <p className="mt-3 flex gap-2 rounded-[var(--radius-card)] bg-partial-soft p-4 text-partial">
          <CircleAlert aria-hidden className="size-5 shrink-0" />
          Nenhum lugar do catálogo foi incluído neste roteiro.
        </p>
      ) : (
        <ol className="mt-4 flex flex-col gap-4">
          {r.dias.map((d) => (
            <li key={d.dia} className="rounded-[var(--radius-card)] border border-line bg-canvas p-5">
              <h3 className="text-lg font-bold">
                Dia {d.dia} <span className="font-normal text-ink-2">· {formatData(d.data, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </h3>
              {d.itens.length ? (
                <ol className="mt-3 flex flex-col gap-3">
                  {d.itens.map((i) => {
                    const Icon = iconeTipo(i.tipo)
                    return (
                      <li key={`${i.ordem}-${i.estabelecimentoId}`} className="flex items-start gap-3">
                        <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
                        <div>
                          {i.disponivel && i.nome ? (
                            <>
                              <p className="text-sm font-semibold text-ink-3">{i.tipo ? PLACE_TYPE_LABEL[i.tipo] : 'Lugar'}</p>
                              <Link to={`/local/${i.estabelecimentoId}`} className="font-bold text-brand">
                                {i.nome}
                              </Link>
                            </>
                          ) : (
                            <p className="text-ink-2">Este lugar saiu do catálogo.</p>
                          )}
                          {i.observacao && <p className="mt-1 whitespace-pre-line text-ink-2">{i.observacao}</p>}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              ) : (
                <p className="mt-2 text-ink-2">Dia livre: nenhum lugar sugerido.</p>
              )}
            </li>
          ))}
        </ol>
      )}
      <p className="mt-4 text-sm text-ink-3">
        Sugestões geradas automaticamente a partir das fichas do catálogo. Confira a ficha de cada lugar antes de reservar.
      </p>
    </section>
  )
}

function erroRoteiro(e: unknown) {
  if (!(e instanceof ApiError)) return mensagemDeErro(e)
  if (e.status === 422) return e.message || 'Ainda não há lugares no catálogo desse destino que atendam a essas necessidades.'
  if (e.status === 429) return 'Você atingiu o limite de roteiros por hoje. Tente novamente amanhã.'
  if (e.status === 502 || e.status === 503) return 'O assistente de roteiros está indisponível agora. Tente de novo em alguns minutos.'
  return e.message
}

function RoteirosSalvos({ atualizar }: { atualizar: number }) {
  const { notify } = useStore()
  const st = useApi(() => viajante.roteiros(), [atualizar])
  const excluir = async (id: Uuid, destino: string) => {
    if (!window.confirm(`Excluir o roteiro de ${destino}?`)) return
    try {
      await viajante.excluirRoteiro(id)
      st.setData((old) => (old ?? []).filter((r) => r.id !== id))
      notify('Roteiro excluído.')
    } catch (e) {
      notify(mensagemDeErro(e))
    }
  }
  return (
    <section aria-labelledby="salvos" className="mt-10">
      <h2 id="salvos" className="text-xl font-bold">
        Roteiros salvos
      </h2>
      {st.error ? (
        <LoadError error={st.error} onRetry={st.reload} />
      ) : st.loading ? (
        <Loading />
      ) : st.data?.length ? (
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-canvas">
          {st.data.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <CalendarDays aria-hidden className="size-5 shrink-0 text-brand" />
              <div className="min-w-0 flex-1">
                <Link to={`/roteiro/${r.id}`} className="font-bold text-brand">
                  {r.destino}
                </Link>
                <p className="text-[0.9375rem] text-ink-2">
                  {formatData(r.dataInicio)} a {formatData(r.dataFim)} · {r.totalItens} {r.totalItens === 1 ? 'lugar' : 'lugares'}
                </p>
              </div>
              <Button variant="ghost" onClick={() => excluir(r.id, r.destino)}>
                <Trash2 aria-hidden className="size-5" />
                Excluir<span className="sr-only"> roteiro de {r.destino}</span>
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-ink-2">Você ainda não gerou nenhum roteiro.</p>
      )}
    </section>
  )
}

export function Roteiro() {
  const { minhasNecessidades } = useStore()
  const { necessidadePorCodigo } = useDominios()
  const [destino, setDestino] = useState('')
  const [inicio, setInicio] = useState(() => hojeIso())
  const [dias, setDias] = useState('3')
  // null = ainda não mexeu: acompanha as necessidades do perfil
  const [escolha, setNeeds] = useState<string[] | null>(null)
  const needs = escolha ?? minhasNecessidades
  const [attempt, setAttempt] = useState(0)
  const [loading, setLoading] = useState(false)
  const [falha, setFalha] = useState('')
  const [plan, setPlan] = useState<RoteiroDto | null>(null)
  const [geracoes, setGeracoes] = useState(0)
  const resultRef = useRef<HTMLHeadingElement>(null)
  const hoje = hojeIso()

  const errors = {
    destino: parseDestino(destino).cidade.length < 2 ? 'Escolha o destino.' : undefined,
    inicio: !inicio || inicio < hoje ? 'A viagem deve começar hoje ou depois.' : undefined,
    geral: falha || undefined,
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setFalha('')
    setAttempt((a) => a + 1)
    if (errors.destino || errors.inicio) return
    const d = parseDestino(destino)
    const fim = new Date(inicio + 'T12:00:00')
    fim.setDate(fim.getDate() + Number(dias) - 1)
    const dataFim = `${fim.getFullYear()}-${String(fim.getMonth() + 1).padStart(2, '0')}-${String(fim.getDate()).padStart(2, '0')}`
    setLoading(true)
    setPlan(null)
    try {
      const r = await viajante.gerarRoteiro({
        destino: d.cidade,
        estado: d.estado,
        dataInicio: inicio,
        dataFim,
        // Lista explícita: vazia = nenhuma necessidade filtra (o viajante desmarcou tudo)
        necessidadeIds: needs.map((c) => necessidadePorCodigo(c)?.id).filter((x): x is number => x !== undefined),
      })
      setPlan(r)
      setGeracoes((g) => g + 1)
      window.setTimeout(() => resultRef.current?.focus(), 0)
    } catch (err) {
      setFalha(erroRoteiro(err))
      setAttempt((a) => a + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Roteiro acessível"
        lead="Diga o destino, as datas e suas necessidades. O assistente monta um roteiro só com lugares que estão no catálogo e têm ficha técnica."
      />
      <form noValidate onSubmit={submit} className="flex flex-col gap-5 rounded-[var(--radius-card)] border border-line bg-canvas p-5">
        <ErrorSummary errors={attempt ? errors : {}} attempt={attempt} />
        <div id="destino">
          <DestinoCombobox label="Destino" value={destino} onChange={setDestino} placeholder="Cidade" />
          {attempt > 0 && errors.destino && <p className="mt-1.5 text-sm font-semibold text-danger">{errors.destino}</p>}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="inicio" label="Início da viagem" type="date" min={hoje} value={inicio} onChange={(e) => setInicio(e.target.value)} error={attempt ? errors.inicio : undefined} />
          <SelectField label="Duração" value={dias} onChange={(e) => setDias(e.target.value)}>
            {Array.from({ length: MAX_DIAS }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d} {d === 1 ? 'dia' : 'dias'}
              </option>
            ))}
          </SelectField>
        </div>
        <NeedChips legend="Necessidades" value={needs} onChange={setNeeds} />
        <Button type="submit" disabled={loading} className="sm:self-start">
          {loading ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : <Sparkles aria-hidden className="size-5" />}
          {loading ? 'Montando roteiro…' : 'Gerar roteiro'}
        </Button>
        {loading && <p className="text-sm text-ink-3">Isso pode levar alguns segundos.</p>}
      </form>

      <div aria-live="polite" className="sr-only">
        {loading ? 'Montando roteiro, aguarde.' : plan ? 'Roteiro pronto.' : ''}
      </div>

      {plan && <RoteiroView r={plan} titleRef={resultRef} />}
      <RoteirosSalvos atualizar={geracoes} />
    </div>
  )
}

export function RoteiroSalvo() {
  const { id = '' } = useParams()
  const nav = useNavigate()
  const st = useApi(() => viajante.roteiro(id), [id])
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Roteiro salvo"
        back={
          <Link to="/roteiro" className="mb-2 inline-flex min-h-11 items-center font-semibold text-brand">
            Voltar para roteiros
          </Link>
        }
      />
      {st.error instanceof ApiError && st.error.status === 404 ? (
        <div>
          <p className="text-ink-2">Este roteiro não existe ou foi excluído.</p>
          <Button variant="secondary" className="mt-4" onClick={() => nav('/roteiro')}>
            Ver meus roteiros
          </Button>
        </div>
      ) : st.error ? (
        <LoadError error={st.error} onRetry={st.reload} />
      ) : st.loading || !st.data ? (
        <Loading />
      ) : (
        <RoteiroView r={st.data} />
      )}
    </div>
  )
}
