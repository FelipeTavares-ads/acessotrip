import type { Category, CategoryId, FichaItem, ItemStatus, Need, NeedId, Place, PlaceType, Review } from './types'

export const NEEDS: Need[] = [
  {
    id: 'mobilidade',
    label: 'Mobilidade reduzida',
    short: 'Mobilidade',
    description: 'Cadeira de rodas, muletas, andador ou dificuldade para subir degraus.',
  },
  {
    id: 'visual',
    label: 'Deficiência visual',
    short: 'Visual',
    description: 'Cegueira ou baixa visão. Piso tátil, braille, contraste e cão-guia.',
  },
  {
    id: 'auditiva',
    label: 'Deficiência auditiva ou sensorial',
    short: 'Auditiva',
    description: 'Surdez, baixa audição ou sensibilidade sensorial. Libras, avisos visuais, ambientes calmos.',
  },
]

export const needById = (id: NeedId) => NEEDS.find((n) => n.id === id)!

export const CATEGORIES: Category[] = [
  { id: 'acesso_externo', label: 'Acesso externo', description: 'Estacionamento, calçada, rampas e entrada.' },
  { id: 'circulacao_interna', label: 'Circulação interna', description: 'Portas, corredores, elevadores e quartos.' },
  { id: 'sanitarios', label: 'Sanitários', description: 'Banheiro adaptado, barras de apoio e chuveiro.' },
  { id: 'sinalizacao', label: 'Sinalização', description: 'Piso tátil, braille, contraste e avisos visuais.' },
  { id: 'atendimento', label: 'Atendimento', description: 'Equipe treinada, Libras, cardápio acessível e cão-guia.' },
]

export const categoryById = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!

export const PLACE_TYPE_LABEL: Record<PlaceType, string> = {
  HOTEL: 'Hotel',
  POUSADA: 'Pousada',
  RESTAURANTE: 'Restaurante',
}

export const STATUS_LABEL: Record<ItemStatus, string> = {
  sim: 'Atende',
  parcial: 'Atende parcialmente',
  nao: 'Não atende',
  nao_informado: 'Não informado',
  nao_se_aplica: 'Não se aplica',
}

/** ParametroPlataforma: mínimo de avaliações positivas (nota 4 ou 5) para o Selo. */
export const MINIMO_SELO = 10

/**
 * Resume o status de um conjunto de itens a partir do que foi informado: o pior caso vence.
 * "Não informado" não rebaixa o resumo (é mostrado à parte) e "não se aplica" é ignorado.
 */
export function summarize(items: FichaItem[]): ItemStatus {
  const relevant = items.filter((i) => i.status !== 'nao_se_aplica')
  if (relevant.length === 0) return items.length ? 'nao_se_aplica' : 'nao_informado'
  const known = relevant.filter((i) => i.status !== 'nao_informado')
  if (known.length === 0) return 'nao_informado'
  if (known.some((i) => i.status === 'nao')) return 'nao'
  if (known.some((i) => i.status === 'parcial')) return 'parcial'
  return 'sim'
}

export const unknownCount = (items: FichaItem[]) => items.filter((i) => i.status === 'nao_informado').length

export function statusForNeed(place: Place, need: NeedId): ItemStatus {
  return summarize(place.ficha.filter((i) => i.necessidades.includes(need)))
}

export function statusForCategory(place: Place, cat: CategoryId): ItemStatus {
  return summarize(place.ficha.filter((i) => i.categoria === cat))
}

/** Nota agregada da plataforma + avaliações novas do próprio viajante nesta sessão. */
export function ratingFor(place: Place, reviews: Review[]): { media: number; total: number } {
  const own = reviews.filter((r) => r.placeId === place.id && r.id.startsWith('own-'))
  const total = place.totalAvaliacoes + own.length
  if (total === 0) return { media: 0, total: 0 }
  const soma = place.notaMedia * place.totalAvaliacoes + own.reduce((s, r) => s + r.nota, 0)
  return { media: Math.round((soma / total) * 10) / 10, total }
}

export const formatNota = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
export const formatKm = (n: number) =>
  n < 1 ? `${Math.round(n * 1000)} m` : `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`
