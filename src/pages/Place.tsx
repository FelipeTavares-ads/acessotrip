import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Flag, Heart, MapPin, ShieldCheck, Sparkles, Star } from 'lucide-react'
import { ApiError, mensagemDeErro } from '../api/client'
import { avaliacoes, catalogo } from '../api/endpoints'
import type { AvaliacaoPublica, DetalheEstabelecimento, MotivoDenuncia, Uuid } from '../api/types'
import { useApi } from '../api/useApi'
import { Dialog } from '../components/Dialog'
import { ErrorSummary } from '../components/ErrorSummary'
import { FichaCategorias, Galeria, NeedSummary } from '../components/Ficha'
import { PageHeader } from '../components/Layout'
import { Button, LoadError, Loading, Rating, SealBadge, SectionTitle, Stars, TextArea, TextField, cx } from '../components/ui'
import { PLACE_TYPE_LABEL, formatData, hojeIso, montarFicha } from '../data/domain'
import { useDominios } from '../state/dominios'
import { useSession } from '../state/session'
import { useStore } from '../state/store'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Cada abertura do detalhe conta uma visita (RF21). Em desenvolvimento o StrictMode executa o
 * efeito duas vezes; reaproveitar a mesma requisição por alguns segundos evita contar em dobro.
 */
const emVoo = new Map<string, { p: Promise<DetalheEstabelecimento>; t: number }>()
function detalheUnico(id: Uuid) {
  const atual = emVoo.get(id)
  if (atual && Date.now() - atual.t < 3000) return atual.p
  const p = catalogo.detalhe(id)
  emVoo.set(id, { p, t: Date.now() })
  return p
}

function NaoEncontrado() {
  return (
    <>
      <PageHeader title="Lugar não encontrado" lead="Ele pode ter saído do catálogo ou o endereço está incorreto." />
      <Link to="/resultados" className="inline-flex min-h-11 items-center font-semibold text-brand">
        Ver lugares do catálogo
      </Link>
    </>
  )
}

/* ---------- Avaliações + denúncia (RF13, RF15) ---------- */

function ReviewItem({ r, onReport, reported, propria }: { r: AvaliacaoPublica; onReport: () => void; reported: boolean; propria: boolean }) {
  return (
    <li className="rounded-[var(--radius-card)] border border-line bg-canvas p-4">
      <article aria-label={`Avaliação publicada em ${formatData(r.criadaEm)}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-bold text-ink">{propria ? 'Sua avaliação' : 'Viajante AcessoTrip'}</p>
          <Stars value={r.nota} />
        </div>
        <p className="mt-1 text-sm text-ink-3">Visitou em {formatData(r.dataVisita)}</p>
        <p className="mt-2 max-w-[65ch] whitespace-pre-line text-ink">{r.texto}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-sm text-ink-3">Publicado em {formatData(r.criadaEm)}</p>
          {propria ? null : reported ? (
            <p className="text-sm font-semibold text-ink-3">Denúncia enviada</p>
          ) : (
            <button type="button" onClick={onReport} className="inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-semibold text-ink-2 hover:text-danger">
              <Flag aria-hidden className="size-4" />
              Denunciar<span className="sr-only"> avaliação publicada em {formatData(r.criadaEm)}</span>
            </button>
          )}
        </div>
      </article>
    </li>
  )
}

const MOTIVOS: { v: MotivoDenuncia; l: string }[] = [
  { v: 'INFORMACAO_FALSA', l: 'Informação falsa ou enganosa' },
  { v: 'OFENSIVO', l: 'Ofensiva ou discriminatória' },
  { v: 'SPAM', l: 'Spam ou propaganda' },
  { v: 'DADOS_PESSOAIS', l: 'Expõe dados pessoais' },
  { v: 'OUTRO', l: 'Outro motivo' },
]

function ReportDialog({ target, onClose, onSent }: { target: AvaliacaoPublica | null; onClose: () => void; onSent: (id: Uuid) => void }) {
  const { notify } = useStore()
  const [motivo, setMotivo] = useState<MotivoDenuncia | ''>('')
  const [descricao, setDescricao] = useState('')
  const [erro, setErro] = useState('')
  const [sending, setSending] = useState(false)
  const reset = () => {
    setMotivo('')
    setDescricao('')
    setErro('')
  }
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const dialog = e.currentTarget.closest('dialog')
    if (!motivo) return setErro('Escolha um motivo para enviar.')
    if (motivo === 'OUTRO' && !descricao.trim()) return setErro('Descreva o motivo da denúncia.')
    if (!target) return
    setSending(true)
    try {
      await avaliacoes.denunciar(target.id, motivo, descricao.trim())
      onSent(target.id)
      notify('Denúncia enviada. A moderação analisa em até 48 horas.')
      dialog?.close()
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        onSent(target.id)
        setErro('Você já denunciou esta avaliação.')
      } else setErro(mensagemDeErro(err))
    } finally {
      setSending(false)
    }
  }
  return (
    <Dialog
      open={!!target}
      onClose={() => {
        reset()
        onClose()
      }}
      title="Denunciar avaliação"
      description="A moderação analisa em até 48 horas. A avaliação continua visível até lá."
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        {erro && (
          <p id="denuncia-erro" role="alert" className="text-sm font-semibold text-danger">
            {erro}
          </p>
        )}
        <fieldset aria-describedby={erro ? 'denuncia-erro' : undefined}>
          <legend className="mb-2 font-semibold">Motivo</legend>
          <div className="flex flex-col">
            {MOTIVOS.map((m) => (
              <label key={m.v} className="flex min-h-11 cursor-pointer items-center gap-3">
                <input type="radio" name="motivo" value={m.v} checked={motivo === m.v} onChange={() => setMotivo(m.v)} className="size-5" />
                {m.l}
              </label>
            ))}
          </div>
        </fieldset>
        <TextArea
          label="Descreva o problema"
          hint={motivo === 'OUTRO' ? 'Obrigatório para “Outro motivo”.' : undefined}
          optional={motivo !== 'OUTRO'}
          maxLength={1000}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={(e) => (e.currentTarget.closest('dialog') as HTMLDialogElement).close()}>
            Cancelar
          </Button>
          <Button type="submit" variant="danger" disabled={sending}>
            {sending ? 'Enviando…' : 'Enviar denúncia'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

function Avaliacoes({ id, nome }: { id: Uuid; nome: string }) {
  const { usuario } = useSession()
  const nav = useNavigate()
  const [pagina, setPagina] = useState(0)
  const [lista, setLista] = useState<AvaliacaoPublica[]>([])
  const st = useApi(
    () =>
      avaliacoes.publicas(id, pagina, 10).then((r) => {
        setLista((old) => (pagina === 0 ? r.itens : [...old, ...r.itens]))
        return r
      }),
    [id, pagina],
  )
  const [reported, setReported] = useState<Set<Uuid>>(new Set())
  // As avaliações públicas são anônimas: para não oferecer "Denunciar" na própria, cruza com as do viajante
  const minhas = useApi(usuario?.perfil === 'VIAJANTE' ? () => avaliacoes.minhas() : null, [usuario?.id])
  const proprias = new Set(minhas.data?.map((a) => a.id) ?? [])
  const [target, setTarget] = useState<AvaliacaoPublica | null>(null)
  const pedirDenuncia = (r: AvaliacaoPublica) => {
    if (usuario?.perfil !== 'VIAJANTE') return nav(`/entrar?volta=${encodeURIComponent(`/local/${id}`)}`)
    setTarget(r)
  }

  return (
    <section aria-labelledby="avaliacoes">
      <SectionTitle
        id="avaliacoes"
        action={
          <Link to={`/local/${id}/avaliar`} state={{ nome }} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-brand">
            <Star aria-hidden className="size-4" />
            Avaliar
          </Link>
        }
      >
        Relatos de viajantes
      </SectionTitle>
      {st.error ? (
        <LoadError error={st.error} onRetry={st.reload} />
      ) : lista.length ? (
        <>
          <ul className="flex flex-col gap-3">
            {lista.map((r) => (
              <ReviewItem key={r.id} r={r} propria={proprias.has(r.id)} reported={reported.has(r.id)} onReport={() => pedirDenuncia(r)} />
            ))}
          </ul>
          {st.data && pagina + 1 < st.data.totalPaginas && (
            <Button variant="secondary" className="mt-4" disabled={st.loading} onClick={() => setPagina((p) => p + 1)}>
              {st.loading ? 'Carregando…' : 'Ver mais relatos'}
            </Button>
          )}
        </>
      ) : st.loading ? (
        <Loading />
      ) : (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas p-5 text-ink-2">
          Ninguém relatou a visita ainda. Esteve aqui?{' '}
          <Link to={`/local/${id}/avaliar`} state={{ nome }} className="font-semibold text-brand">
            Seja o primeiro a avaliar
          </Link>
          .
        </p>
      )}
      <ReportDialog target={target} onClose={() => setTarget(null)} onSent={(rid) => setReported((s) => new Set(s).add(rid))} />
    </section>
  )
}

/* ---------- Página do local ---------- */

function ActionsCard({ d }: { d: DetalheEstabelecimento }) {
  const { favorites, toggleFavorite } = useStore()
  const e = d.estabelecimento
  const fav = favorites.has(e.id)
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-canvas p-5">
      <p className="flex gap-2 text-ink-2">
        <MapPin aria-hidden className="mt-0.5 size-5 shrink-0" />
        {e.cidade}, {e.estado}
      </p>
      <Button variant="secondary" aria-pressed={fav} onClick={() => toggleFavorite(e.id, e.nome)}>
        <Heart aria-hidden className={cx('size-5', fav && 'fill-current')} />
        {fav ? 'Salvo nos favoritos' : 'Salvar nos favoritos'}
      </Button>
      <p className="flex gap-2 text-sm text-ink-3">
        <ShieldCheck aria-hidden className="size-4 shrink-0 translate-y-0.5" />
        Reservas são feitas direto com o estabelecimento.
      </p>
    </div>
  )
}

export function Local() {
  const { id = '' } = useParams()
  const valido = UUID.test(id)
  const { campos, categorias } = useDominios()
  const { minhasNecessidades: needs } = useStore()
  const st = useApi(valido ? () => detalheUnico(id) : null, [id])

  if (!valido || (st.error instanceof ApiError && st.error.status === 404)) return <NaoEncontrado />
  if (st.error) return <LoadError error={st.error} onRetry={st.reload} />
  if (st.loading || !st.data || !campos.length) return <Loading label="Carregando a ficha do lugar…" />

  const d = st.data
  const e = d.estabelecimento
  const ficha = montarFicha(campos, d.ficha)

  return (
    <>
      <nav aria-label="Caminho" className="mb-3 text-[0.9375rem]">
        <ol className="flex flex-wrap items-center gap-1 text-ink-3">
          <li>
            <Link to="/resultados" className="font-semibold text-brand">
              Resultados
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink-2">
            {e.nome}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <div>
            <PageHeader title={e.nome} lead={`${PLACE_TYPE_LABEL[e.tipo]} em ${e.cidade}, ${e.estado}`} />
            <div className="-mt-3 flex flex-wrap items-center gap-3">
              {e.seloVerificado && <SealBadge />}
              {e.destaque && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-sm font-semibold text-brand-ink">
                  <Sparkles aria-hidden className="size-4" />
                  Destaque
                </span>
              )}
              <Rating value={e.notaMedia ?? 0} total={e.notaMedia === null ? 0 : e.totalAvaliacoes} />
            </div>
            {e.seloVerificado && (
              <p className="mt-2 text-[0.9375rem] text-ink-2">Avaliações positivas de viajantes confirmaram esta ficha.</p>
            )}
          </div>

          <NeedSummary ficha={ficha} needs={needs} card={e} />
          {/* No celular, ações logo depois do resumo, sem esperar o fim da página */}
          <div className="lg:hidden">
            <ActionsCard d={d} />
          </div>
          <FichaCategorias ficha={ficha} needs={needs} />
          <Galeria fotos={d.fotos} categorias={categorias} />
          <Avaliacoes id={e.id} nome={e.nome} />
        </div>

        <aside aria-label="Ações" className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <ActionsCard d={d} />
        </aside>
      </div>
    </>
  )
}

/* ---------- Registrar experiência (RF14) ---------- */

export function Avaliar() {
  const { id = '' } = useParams()
  const nome = (useLocation().state as { nome?: string } | null)?.nome
  const nav = useNavigate()
  const { notify } = useStore()
  const [nota, setNota] = useState(0)
  const [texto, setTexto] = useState('')
  const [visita, setVisita] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [sending, setSending] = useState(false)
  const [server, setServer] = useState<Record<string, string>>({})
  const [hoje] = useState(() => hojeIso())
  if (!UUID.test(id)) return <NaoEncontrado />

  const local = {
    nota: nota === 0 ? 'Escolha uma nota de 1 a 5.' : undefined,
    visita: !visita ? 'Informe a data da visita.' : visita > hoje ? 'A data da visita não pode ser no futuro.' : undefined,
    texto: texto.trim().length < 20 ? 'Conte um pouco mais: pelo menos 20 caracteres.' : undefined,
  }
  // Erro de validação do back no campo dataVisita aparece no campo de data
  const errors: Record<string, string | undefined> = { ...local, ...server }
  if (errors.dataVisita) {
    errors.visita = errors.dataVisita
    delete errors.dataVisita
  }
  const show = attempt > 0
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setServer({})
    setAttempt((a) => a + 1)
    if (Object.values(local).some(Boolean)) return
    setSending(true)
    try {
      await avaliacoes.criar(id, { nota, texto: texto.trim(), dataVisita: visita })
      notify('Obrigado! Sua avaliação foi publicada.')
      nav(`/local/${id}`)
    } catch (err) {
      if (err instanceof ApiError && err.erros.length) setServer(err.porCampo())
      else if (err instanceof ApiError && err.status === 409) setServer({ visita: 'Você já avaliou este lugar com essa data de visita.' })
      else setServer({ geral: mensagemDeErro(err) })
      setAttempt((a) => a + 1)
    } finally {
      setSending(false)
    }
  }
  const labels = ['', 'Muito ruim', 'Ruim', 'Regular', 'Boa', 'Excelente']

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={nome ? `Avaliar ${nome}` : 'Avaliar este lugar'}
        lead="Seu relato ajuda outras pessoas a decidir e confirma (ou corrige) a ficha do local. Ele é publicado sem o seu nome."
        back={
          <Link to={`/local/${id}`} className="mb-2 inline-flex min-h-11 items-center gap-1 font-semibold text-brand">
            <ChevronLeft aria-hidden className="size-5" />
            Voltar para a ficha
          </Link>
        }
      />
      <form noValidate onSubmit={submit} className="flex flex-col gap-6">
        <ErrorSummary errors={show ? errors : {}} attempt={attempt} />

        <fieldset id="nota" aria-describedby={show && errors.nota ? 'nota-erro' : undefined}>
          <legend className="mb-2 font-semibold">Nota geral de acessibilidade</legend>
          {show && errors.nota && (
            <p id="nota-erro" className="mb-2 text-sm font-semibold text-danger">
              {errors.nota}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <label
                key={v}
                className={cx(
                  'flex min-h-12 cursor-pointer items-center gap-2 rounded-[var(--radius-control)] border px-3.5 font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand',
                  nota === v ? 'border-brand-ink bg-brand-ink text-white' : 'border-line-strong bg-canvas text-ink',
                )}
              >
                <input type="radio" name="nota" value={v} checked={nota === v} onChange={() => setNota(v)} className="sr-only" />
                <Star aria-hidden className={cx('size-5', nota >= v ? 'fill-current' : '')} />
                <span>
                  {v}
                  <span className="sr-only"> – {labels[v]}</span>
                </span>
              </label>
            ))}
          </div>
          {nota > 0 && <p className="mt-2 text-ink-2">{labels[nota]}</p>}
        </fieldset>

        <TextField
          id="visita"
          label="Data da visita"
          type="date"
          max={hoje}
          value={visita}
          onChange={(e) => setVisita(e.target.value)}
          error={show ? errors.visita : undefined}
        />
        <TextArea
          id="texto"
          label="Como foi a experiência?"
          hint="O que funcionou e o que não funcionou. Ex.: a rampa, o banheiro, o atendimento."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          error={show ? errors.texto : undefined}
          maxLength={1000}
        />
        <p className="-mt-4 text-right text-sm text-ink-3 tabular" aria-live="polite">
          {texto.length} de 1000 caracteres
        </p>
        <Button type="submit" className="sm:self-start" disabled={sending}>
          {sending ? 'Publicando…' : 'Publicar avaliação'}
        </Button>
      </form>
    </div>
  )
}
