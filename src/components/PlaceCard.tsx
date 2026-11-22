import { Link } from 'react-router-dom'
import { Heart, ImageOff, Sparkles } from 'lucide-react'
import type { CardEstabelecimento } from '../api/types'
import { PLACE_TYPE_LABEL, formatKm, statusNecessidade } from '../data/domain'
import type { NeedCode } from '../data/types'
import { useDominios } from '../state/dominios'
import { useStore } from '../state/store'
import { NeedStatusPill, Rating, SealBadge, cx } from './ui'

/** Card de resultado (RF10): foto, nome, tipo, cidade, necessidades atendidas, nota, Selo e destaque Premium. */
export function PlaceCard({ place, needs, headingLevel = 3 }: { place: CardEstabelecimento; needs: NeedCode[]; headingLevel?: 2 | 3 }) {
  const { favorites, toggleFavorite } = useStore()
  const { necessidades } = useDominios()
  const fav = favorites.has(place.id)
  const H = `h${headingLevel}` as 'h2' | 'h3'
  const shown: NeedCode[] = needs.length ? needs : necessidades.map((n) => n.codigo)

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-canvas transition-shadow hover:shadow-[var(--shadow-raise)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-unknown-soft">
        {place.fotoUrl ? (
          <img src={place.fotoUrl} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <span className="flex size-full items-center justify-center text-ink-3">
            <ImageOff aria-hidden className="size-8" />
          </span>
        )}
        {(place.seloVerificado || place.destaque) && (
          <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {place.seloVerificado && <SealBadge compact />}
            {place.destaque && (
              <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 text-sm font-semibold text-brand-ink">
                <Sparkles aria-hidden className="size-4" />
                Destaque
              </span>
            )}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <H className="text-lg font-bold leading-snug text-ink">
              {/* Link cobre o card inteiro, mas só o nome é o texto do link */}
              <Link
                to={`/local/${place.id}`}
                className="no-underline text-ink after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:outline-none focus-visible:after:rounded-[var(--radius-card)] focus-visible:after:outline focus-visible:after:outline-3 focus-visible:after:outline-brand"
              >
                {place.nome}
              </Link>
            </H>
            <p className="mt-0.5 text-[0.9375rem] text-ink-2">
              {PLACE_TYPE_LABEL[place.tipo]} em {place.cidade}, {place.estado}
            </p>
          </div>
          <button
            type="button"
            aria-pressed={fav}
            onClick={() => toggleFavorite(place.id, place.nome)}
            className={cx(
              'relative z-10 -mr-1.5 -mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-surface',
              fav ? 'text-danger' : 'text-ink-2',
            )}
          >
            <Heart aria-hidden className={cx('size-6', fav && 'fill-current')} />
            <span className="sr-only">Salvar {place.nome} nos favoritos</span>
          </button>
        </div>
        <ul aria-label="Acessibilidade por necessidade" className="flex flex-wrap gap-1.5">
          {shown.map((n) => (
            <li key={n}>
              <NeedStatusPill need={n} status={statusNecessidade(place, n)} />
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between gap-3 pt-1 text-sm">
          <Rating value={place.notaMedia ?? 0} total={place.notaMedia === null ? 0 : place.totalAvaliacoes} size="sm" />
          {place.distanciaKm !== null && (
            <span className="text-ink-3 tabular">
              <span className="sr-only">Distância: </span>
              {formatKm(place.distanciaKm)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
