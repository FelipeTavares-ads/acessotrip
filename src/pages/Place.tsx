import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Flag, Heart, MapPin, Phone, ShieldCheck, Star } from 'lucide-react'
import { Dialog } from '../components/Dialog'
import { ErrorSummary } from '../components/ErrorSummary'
import { PageHeader } from '../components/Layout'
import {
  Button,
  NeedIcon,
  Rating,
  SealBadge,
  SectionTitle,
  StatusBadge,
  StatusIcon,
  Stars,
  TextArea,
  TextField,
  ToggleChip,
  cx,
} from '../components/ui'
import { CATEGORIES, MINIMO_SELO, NEEDS, PLACE_TYPE_LABEL, STATUS_LABEL, needById, ratingFor, statusForCategory, statusForNeed } from '../data/domain'
import { placeById } from '../data/places'
import type { FichaItem, NeedId, Place, Review } from '../data/types'
import { useStore } from '../state/store'

/* ---------- Resumo por necessidade: a assinatura da ficha ---------- */

const lista = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} e ${xs[xs.length - 1]}`)
// "1:12 (8,3%)" vira "rampa (1:12, 8,3%)" para não aninhar parênteses
const comValor = (i: FichaItem) => (i.valor ? `${i.curto} (${i.valor.replace(/\s*\((.*)\)$/, ', $1')})` : i.curto)
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Assinatura da ficha: para cada necessidade, diz em frases o que atende, o que atende em parte, o que não atende e o que falta informar. */
function NeedSummary({ place, needs }: { place: Place; needs: NeedId[] }) {
  const shown: NeedId[] = needs.length ? needs : NEEDS.map((n) => n.id)
  return (
    <section aria-labelledby="resumo" className="rounded-[var(--radius-card)] border-2 border-brand-ink bg-canvas p-5 md:p-6">
      <h2 id="resumo" className="text-[1.375rem] font-bold leading-tight">
        {needs.length ? 'Para as suas necessidades' : 'Resumo por necessidade'}
      </h2>
      <ul className="mt-4 flex flex-col gap-5">
        {shown.map((n) => {
          const items = place.ficha.filter((i) => i.necessidades.includes(n))
          const by = (s: FichaItem['status']) => items.filter((i) => i.status === s)
          const sim = by('sim').map(comValor)
          const parcial = by('parcial')
          const nao = by('nao')
          const naoInf = by('nao_informado').map((i) => i.curto)
          return (
            <li key={n} className="flex gap-3">
              <span className="mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
                <NeedIcon need={n} className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="text-lg font-bold text-ink">{needById(n).label}</h3>
                  <StatusBadge status={statusForNeed(place, n)} size="sm" />
                </div>
                <div className="mt-1.5 flex flex-col gap-1 text-[1.0625rem] leading-relaxed text-ink">
                  {sim.length > 0 && (
                    <p>
                      <strong className="text-ok">Atendem:</strong> {lista(sim)}.
                    </p>
                  )}
                  {parcial.length > 0 && (
                    <p>
                      <strong className="text-partial">Em parte:</strong>{' '}
                      {parcial.map((i) => (i.observacao ? `${i.curto} (${i.observacao.replace(/\.$/, '').toLowerCase()})` : i.curto)).join('; ')}.
                    </p>
                  )}
                  {nao.length > 0 && (
                    <p>
                      <strong className="text-danger">Não atende:</strong> {lista(nao.map((i) => i.curto))}.
                    </p>
                  )}
                  {naoInf.length > 0 && (
                    <p className="text-ink-2">
                      <strong className="text-unknown">Não informado:</strong> {lista(naoInf)}.
                    </p>
                  )}
                  {items.every((i) => i.status === 'nao_informado') && <p className="text-ink-2">{cap('o local ainda não preencheu estes itens.')}</p>}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function ContactCard({ place, fav, onFav }: { place: Place; fav: boolean; onFav: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-canvas p-5">
      {place.precoMedio && (
        <p className="text-ink-2">
          A partir de <strong className="text-xl text-ink tabular">{place.precoMedio.replace(' por diária', '')}</strong> por diária
        </p>
      )}
      <p className="flex gap-2 text-ink-2">
        <MapPin aria-hidden className="mt-0.5 size-5 shrink-0" />
        {place.endereco}, {place.bairro}, {place.cidade}, {place.uf}
      </p>
      <a
        href={`tel:${place.telefone.replace(/\D/g, '')}`}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-brand px-5 font-semibold text-white no-underline hover:bg-brand-hover"
      >
        <Phone aria-hidden className="size-5" />
        Ligar para o local
      </a>
      <p className="-mt-2 text-center text-[0.9375rem] text-ink-2 tabular">{place.telefone}</p>
      <Button variant="secondary" aria-pressed={fav} onClick={onFav}>
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

/* ---------- Ficha por categoria (RF11) ---------- */

function FichaItemRow({ item, highlight }: { item: FichaItem; highlight: boolean }) {
  return (
    <li className="flex items-start gap-3 py-3">
      <StatusIcon status={item.status} className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
          <p className={cx('text-ink', highlight && 'font-semibold')}>
            {item.atributo}
            <span className="sr-only">: {STATUS_LABEL[item.status]}</span>
          </p>
          {item.valor && <p className="font-semibold text-ink tabular">{item.valor}</p>}
        </div>
        {item.observacao && <p className="mt-0.5 text-[0.9375rem] text-ink-2">{item.observacao}</p>}
        {item.status === 'nao_informado' && !item.observacao && (
          <p className="mt-0.5 text-[0.9375rem] text-ink-3">O local ainda não informou.</p>
        )}
      </div>
    </li>
  )
}

function Ficha({ place, needs }: { place: Place; needs: NeedId[] }) {
  return (
    <section aria-labelledby="ficha">
      <SectionTitle id="ficha">Ficha técnica de acessibilidade</SectionTitle>
      <div className="flex flex-col gap-3">
        {CATEGORIES.map((c) => {
          const items = place.ficha.filter((i) => i.categoria === c.id)
          const st = statusForCategory(place, c.id)
          return (
            <details key={c.id} open={st !== 'nao_informado' && st !== 'nao_se_aplica'} className="group rounded-[var(--radius-card)] border border-line bg-canvas">
              <summary className="flex min-h-14 cursor-pointer list-none flex-wrap items-center justify-between gap-x-3 gap-y-2 px-5 py-3 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1 basis-44">
                  <h3 className="text-lg font-bold">{c.label}</h3>
                  <span className="text-sm text-ink-3">{c.description}</span>
                </span>
                <span className="flex items-center gap-2">
                  <StatusBadge status={st} size="sm" />
                  <ChevronRight aria-hidden className="size-5 text-ink-3 transition-transform group-open:rotate-90" />
                </span>
              </summary>
              <ul className="divide-y divide-line border-t border-line px-5">
                {items.map((i) => (
                  <FichaItemRow key={i.id} item={i} highlight={i.necessidades.some((n) => needs.includes(n))} />
                ))}
              </ul>
            </details>
          )
        })}
      </div>
    </section>
  )
}

/* ---------- Galeria (RF12) ---------- */

function Gallery({ place }: { place: Place }) {
  const [i, setI] = useState(0)
  const photo = place.fotos[i]
  const n = place.fotos.length
  return (
    <section aria-labelledby="galeria" aria-roledescription="galeria">
      <SectionTitle id="galeria">Fotos do local</SectionTitle>
      <figure className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-canvas">
        <img src={photo.src} alt={photo.alt} className="aspect-[16/10] w-full object-cover" />
        <figcaption className="flex items-center justify-between gap-3 px-4 py-2">
          <span className="text-[0.9375rem] text-ink-2">
            {photo.categoria === 'geral' ? 'Geral' : CATEGORIES.find((c) => c.id === photo.categoria)?.label}
            {' · '}
            <span className="tabular" aria-live="polite">
              Foto {i + 1} de {n}
            </span>
          </span>
          {n > 1 && (
            <span className="flex gap-1">
              <button
                type="button"
                onClick={() => setI((i - 1 + n) % n)}
                className="inline-flex size-11 items-center justify-center rounded-full border border-line hover:bg-surface"
              >
                <ChevronLeft aria-hidden className="size-5" />
                <span className="sr-only">Foto anterior</span>
              </button>
              <button
                type="button"
                onClick={() => setI((i + 1) % n)}
                className="inline-flex size-11 items-center justify-center rounded-full border border-line hover:bg-surface"
              >
                <ChevronRight aria-hidden className="size-5" />
                <span className="sr-only">Próxima foto</span>
              </button>
            </span>
          )}
        </figcaption>
      </figure>
      <p className="mt-2 text-sm text-ink-3">Fotos ilustrativas de banco de imagens (exemplo). Na plataforma, são as fotos enviadas pelo estabelecimento.</p>
    </section>
  )
}

/* ---------- Avaliações + denúncia (RF13, RF15) ---------- */

function ReviewItem({ r, onReport, reported }: { r: Review; onReport: () => void; reported: boolean }) {
  const date = new Date(r.publicadoEm + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  const [ano, mes] = r.dataVisita.split('-')
  return (
    <li className="rounded-[var(--radius-card)] border border-line bg-canvas p-4">
      <article aria-label={`Avaliação de ${r.autor}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-bold text-ink">{r.autor}</p>
          <Stars value={r.nota} />
        </div>
        <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-ink-3">
          <span>
            Visitou em {new Date(+ano, +mes - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
          <span>
            {r.necessidades.map((n) => needById(n).short).join(', ')}
          </span>
        </p>
        <p className="mt-2 max-w-[65ch] text-ink">{r.texto}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-sm text-ink-3">Publicado em {date}</p>
          {reported ? (
            <p className="text-sm font-semibold text-ink-3">Denúncia enviada</p>
          ) : (
            <button type="button" onClick={onReport} className="inline-flex min-h-11 items-center gap-1.5 px-1 text-sm font-semibold text-ink-2 hover:text-danger">
              <Flag aria-hidden className="size-4" />
              Denunciar<span className="sr-only"> avaliação de {r.autor}</span>
            </button>
          )}
        </div>
      </article>
    </li>
  )
}

const REPORT_REASONS = ['Informação falsa ou enganosa', 'Ofensiva ou discriminatória', 'Spam ou propaganda', 'Não é sobre este lugar']

function ReportDialog({ target, onClose }: { target: Review | null; onClose: () => void }) {
  const { report, notify } = useStore()
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState(false)
  return (
    <Dialog
      open={!!target}
      onClose={() => {
        setMotivo('')
        setErro(false)
        onClose()
      }}
      title="Denunciar avaliação"
      description="A moderação analisa em até 48 horas. A avaliação continua visível até lá."
    >
      <form
        method="dialog"
        onSubmit={(e) => {
          if (!motivo) {
            e.preventDefault()
            setErro(true)
            return
          }
          if (target) report(target.id)
          notify('Denúncia enviada. Obrigado por ajudar a manter as informações confiáveis.')
        }}
        className="flex flex-col gap-4"
      >
        <fieldset aria-describedby={erro ? 'motivo-erro' : undefined}>
          <legend className="mb-2 font-semibold">Motivo</legend>
          {erro && (
            <p id="motivo-erro" className="mb-2 text-sm font-semibold text-danger">
              Escolha um motivo para enviar.
            </p>
          )}
          <div className="flex flex-col">
            {REPORT_REASONS.map((m) => (
              <label key={m} className="flex min-h-11 cursor-pointer items-center gap-3">
                <input type="radio" name="motivo" value={m} checked={motivo === m} onChange={() => setMotivo(m)} className="size-5" />
                {m}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={(e) => (e.currentTarget.closest('dialog') as HTMLDialogElement).close()}>
            Cancelar
          </Button>
          <Button type="submit" variant="danger">
            Enviar denúncia
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

/* ---------- Página da ficha ---------- */

export function Local() {
  const { id = '' } = useParams()
  const place = placeById(id)
  const { traveler, favorites, toggleFavorite, notify, reviews, reported } = useStore()
  const [reportTarget, setReportTarget] = useState<Review | null>(null)
  if (!place) return <Navigate to="/resultados" replace />

  const needs = traveler?.necessidades ?? []
  const placeReviews = reviews.filter((r) => r.placeId === place.id)
  const { media, total } = ratingFor(place, reviews)
  const fav = favorites.includes(place.id)
  const onFav = () => {
    const added = toggleFavorite(place.id)
    notify(added ? 'Salvo nos favoritos.' : 'Removido dos favoritos.')
  }

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
            {place.nome}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="flex min-w-0 flex-col gap-8">
          <div>
            <PageHeader
              title={place.nome}
              lead={
                <>
                  {PLACE_TYPE_LABEL[place.tipo]} em {place.cidade}, {place.uf}
                </>
              }
            />
            <div className="-mt-3 flex flex-wrap items-center gap-3">
              {place.seloVerificado && <SealBadge />}
              <Rating value={media} total={total} />
            </div>
            {place.seloVerificado && (
              <p className="mt-2 text-[0.9375rem] text-ink-2 tabular">
                {place.avaliacoesPositivas} avaliações positivas de viajantes confirmam esta ficha (mínimo para o selo: {MINIMO_SELO}).
              </p>
            )}
            <p className="mt-4 max-w-[65ch] text-[1.0625rem] text-ink-2">{place.resumo}</p>
          </div>

          <NeedSummary place={place} needs={needs} />
          {/* No celular, contato logo depois do resumo, sem esperar o fim da página */}
          <div className="lg:hidden">
            <ContactCard place={place} fav={fav} onFav={onFav} />
          </div>
          <Ficha place={place} needs={needs} />
          <Gallery place={place} />

          <section aria-labelledby="avaliacoes">
            <SectionTitle
              id="avaliacoes"
              action={
                <Link to={`/local/${place.id}/avaliar`} className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-brand">
                  <Star aria-hidden className="size-4" />
                  Avaliar
                </Link>
              }
            >
              Relatos recentes
            </SectionTitle>
            {placeReviews.length ? (
              <ul className="flex flex-col gap-3">
                {placeReviews.map((r) => (
                  <ReviewItem key={r.id} r={r} reported={reported.includes(r.id)} onReport={() => setReportTarget(r)} />
                ))}
              </ul>
            ) : (
              <p className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas p-5 text-ink-2">
                Ninguém relatou a visita ainda. Esteve aqui?{' '}
                <Link to={`/local/${place.id}/avaliar`} className="font-semibold text-brand">
                  Seja o primeiro a avaliar
                </Link>
                .
              </p>
            )}
          </section>
        </div>

        <aside aria-label="Contato e ações" className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <ContactCard place={place} fav={fav} onFav={onFav} />
        </aside>
      </div>
      <ReportDialog target={reportTarget} onClose={() => setReportTarget(null)} />
    </>
  )
}

/* ---------- Registrar experiência (RF14) ---------- */

export function Avaliar() {
  const { id = '' } = useParams()
  const place = placeById(id)
  const nav = useNavigate()
  const { traveler, addReview, notify } = useStore()
  const [nota, setNota] = useState(0)
  const [texto, setTexto] = useState('')
  const [visita, setVisita] = useState('')
  const [needs, setNeeds] = useState<NeedId[]>(traveler?.necessidades ?? [])
  const [attempt, setAttempt] = useState(0)
  const [thisMonth] = useState(() => new Date().toISOString().slice(0, 7))
  if (!place) return <Navigate to="/resultados" replace />

  const errors = {
    nota: nota === 0 ? 'Escolha uma nota de 1 a 5.' : undefined,
    visita: !visita ? 'Informe o mês da visita.' : undefined,
    texto: texto.trim().length < 20 ? 'Conte um pouco mais: pelo menos 20 caracteres.' : undefined,
  }
  const show = attempt > 0
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setAttempt((a) => a + 1)
    if (Object.values(errors).some(Boolean)) return
    addReview({
      id: `own-${Date.now()}`,
      placeId: place.id,
      autor: traveler ? `${traveler.nome} (você)` : 'Você',
      necessidades: needs,
      nota: nota as Review['nota'],
      texto: texto.trim(),
      dataVisita: visita,
      publicadoEm: new Date().toISOString().slice(0, 10),
    })
    notify('Obrigado! Sua avaliação foi publicada.')
    nav(`/local/${place.id}`)
  }
  const labels = ['', 'Muito ruim', 'Ruim', 'Regular', 'Boa', 'Excelente']

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Avaliar ${place.nome}`}
        lead="Seu relato ajuda outras pessoas a decidir e confirma (ou corrige) a ficha do local."
        back={
          <Link to={`/local/${place.id}`} className="mb-2 inline-flex min-h-11 items-center gap-1 font-semibold text-brand">
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

        <fieldset>
          <legend className="mb-2 font-semibold">Você visitou como pessoa com</legend>
          <div className="flex flex-wrap gap-2">
            {NEEDS.map((n) => (
              <ToggleChip
                key={n.id}
                pressed={needs.includes(n.id)}
                onToggle={() => setNeeds((s) => (s.includes(n.id) ? s.filter((x) => x !== n.id) : [...s, n.id]))}
                icon={<NeedIcon need={n.id} className="size-4" />}
              >
                {n.label}
              </ToggleChip>
            ))}
          </div>
        </fieldset>

        <TextField
          id="visita"
          label="Mês da visita"
          type="month"
          max={thisMonth}
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
        <Button type="submit" className="sm:self-start">
          Publicar avaliação
        </Button>
      </form>
    </div>
  )
}
