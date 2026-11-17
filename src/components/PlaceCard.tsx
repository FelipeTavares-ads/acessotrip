import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { PLACE_TYPE_LABEL, formatKm, ratingFor, statusForNeed } from '../data/domain'
import type { NeedId, Place } from '../data/types'
import { useStore } from '../state/store'
import { NeedStatusPill, Rating, SealBadge, cx } from './ui'

/** Card de resultado (RF10): foto, nome, tipo, cidade, ícones de acessibilidade, nota e Selo. */
export function PlaceCard({ place, needs, headingLevel = 3 }: { place: Place; needs: NeedId[]; headingLevel?: 2 | 3 }) {
  const { favorites, toggleFavorite, notify, reviews } = useStore()
  const fav = favorites.includes(place.id)
  const { media, total } = ratingFor(place, reviews)
  const H = `h${headingLevel}` as 'h2' | 'h3'
  const shown: NeedId[] = needs.length ? needs : ['mobilidade', 'visual', 'auditiva']

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-canvas transition-shadow hover:shadow-[var(--shadow-raise)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-unknown-soft">
        <img
          src={place.fotos[0]?.src}
          alt=""
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {place.seloVerificado && (
          <span className="absolute left-3 top-3">
            <SealBadge compact />
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
              {PLACE_TYPE_LABEL[place.tipo]} em {place.cidade}, {place.uf}
            </p>
          </div>
          <button
            type="button"
            aria-pressed={fav}
            onClick={() => {
              const added = toggleFavorite(place.id)
              notify(added ? `${place.nome} salvo nos favoritos.` : `${place.nome} removido dos favoritos.`)
            }}
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
              <NeedStatusPill need={n} status={statusForNeed(place, n)} />
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between gap-3 pt-1 text-sm">
          <Rating value={media} total={total} size="sm" />
          <span className="text-ink-3 tabular">
            <span className="sr-only">Distância: </span>
            {formatKm(place.distanciaKm)}
          </span>
        </div>
      </div>
    </article>
  )
}
