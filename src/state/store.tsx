import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { REVIEWS } from '../data/places'
import type { NeedId, Review } from '../data/types'

interface Traveler {
  nome: string
  email: string
  necessidades: NeedId[]
}

interface Toast {
  id: number
  text: string
}

interface Store {
  traveler: Traveler | null
  signIn: (t: Traveler) => void
  signOut: () => void
  setNeeds: (n: NeedId[]) => void
  favorites: string[]
  toggleFavorite: (placeId: string) => boolean
  reviews: Review[]
  addReview: (r: Review) => void
  reported: string[]
  report: (reviewId: string) => void
  toast: Toast | null
  notify: (text: string) => void
}

const Ctx = createContext<Store | null>(null)

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* armazenamento indisponível: segue em memória */
  }
}

const DEMO_TRAVELER: Traveler = { nome: 'Renata', email: 'viajante@exemplo.com', necessidades: ['mobilidade'] }

export function StoreProvider({ children }: { children: ReactNode }) {
  const [traveler, setTraveler] = useState<Traveler | null>(() => load('at.traveler', DEMO_TRAVELER))
  const [favorites, setFavorites] = useState<string[]>(() => load('at.favorites', ['fazenda-solar']))
  const [ownReviews, setOwnReviews] = useState<Review[]>(() => load('at.reviews', []))
  const [reported, setReported] = useState<string[]>(() => load('at.reported', []))
  const [toast, setToast] = useState<Toast | null>(null)

  useEffect(() => save('at.traveler', traveler), [traveler])
  useEffect(() => save('at.favorites', favorites), [favorites])
  useEffect(() => save('at.reviews', ownReviews), [ownReviews])
  useEffect(() => save('at.reported', reported), [reported])

  const notify = useCallback((text: string) => {
    const id = Date.now()
    setToast({ id, text })
    window.setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 5000)
  }, [])

  const value = useMemo<Store>(
    () => ({
      traveler,
      signIn: setTraveler,
      signOut: () => setTraveler(null),
      setNeeds: (n) => setTraveler((t) => (t ? { ...t, necessidades: n } : { ...DEMO_TRAVELER, necessidades: n })),
      favorites,
      toggleFavorite: (id) => {
        const willAdd = !favorites.includes(id)
        setFavorites((f) => (willAdd ? [...f, id] : f.filter((x) => x !== id)))
        return willAdd
      },
      reviews: [...ownReviews, ...REVIEWS],
      addReview: (r) => setOwnReviews((rs) => [r, ...rs]),
      reported,
      report: (id) => setReported((r) => (r.includes(id) ? r : [...r, id])),
      toast,
      notify,
    }),
    [traveler, favorites, ownReviews, reported, toast, notify],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore fora do StoreProvider')
  return s
}
