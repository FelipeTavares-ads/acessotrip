import { useSyncExternalStore } from 'react'
import { PLACES } from '../data/places'
import type { FichaItem, PlaceType } from '../data/types'

// Parceiro de exemplo: a pousada de Porto Seguro do catálogo fictício.
const seed = PLACES.find((p) => p.id === 'pousada-coroa')!

export interface PartnerState {
  empresa: {
    nome: string
    cnpj: string
    tipo: PlaceType
    endereco: string
    cidade: string
    uf: string
    telefone: string
    email: string
  }
  ficha: FichaItem[]
  fotos: { id: string; nome: string; categoria: string; src?: string }[]
  onboardingDone: boolean
  premium: boolean
  /** avaliações positivas (nota ≥ 4) já recebidas e mínimo para o Selo — ParametroPlataforma */
  positivas: number
  minimoSelo: number
}

const KEY = 'at.partner'
const initial: PartnerState = {
  empresa: {
    nome: seed.nome,
    cnpj: '12.345.678/0001-95',
    tipo: seed.tipo,
    endereco: seed.endereco,
    cidade: seed.cidade,
    uf: seed.uf,
    telefone: seed.telefone,
    email: 'contato@exemplo.com',
  },
  ficha: seed.ficha.map((i) => ({ ...i })),
  fotos: seed.fotos.map((f) => ({ id: f.id, nome: f.alt, categoria: f.categoria, src: f.src })),
  onboardingDone: true,
  premium: false,
  positivas: 8,
  minimoSelo: 10,
}

let state: PartnerState = (() => {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...initial, ...JSON.parse(raw) } : initial
  } catch {
    return initial
  }
})()
const subs = new Set<() => void>()

export function setPartner(patch: Partial<PartnerState> | ((s: PartnerState) => Partial<PartnerState>)) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* sem armazenamento */
  }
  subs.forEach((f) => f())
}

export function usePartner() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f)
      return () => subs.delete(f)
    },
    () => state,
  )
}

/** Valida CNPJ pelos dígitos verificadores (RN02). */
export function cnpjValido(v: string) {
  const d = v.replace(/\D/g, '')
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false
  const calc = (len: number) => {
    const w = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const s = w.reduce((acc, wi, i) => acc + Number(d[i]) * wi, 0)
    const r = s % 11
    return r < 2 ? 0 : 11 - r
  }
  return calc(12) === Number(d[12]) && calc(13) === Number(d[13])
}

export function maskCnpj(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 14)
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}
