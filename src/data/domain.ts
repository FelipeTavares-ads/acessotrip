import type {
  CardEstabelecimento,
  CategoriaCampos,
  CategoriaFichaPreenchida,
  ItemFicha,
  TipoEstabelecimento,
  TipoNecessidade,
} from '../api/types'
import type { AggStatus, FichaCategoria, FichaLinha, ItemStatus, NeedCode } from './types'

/* ---------- Necessidades (rótulos de apoio por código; a descrição oficial vem da API) ---------- */

interface NeedMeta {
  label: string
  short: string
  description: string
}

const NEED_META: Record<string, NeedMeta> = {
  MOBILIDADE_REDUZIDA: {
    label: 'Mobilidade reduzida',
    short: 'Mobilidade',
    description: 'Cadeira de rodas, muletas, andador ou dificuldade para subir degraus.',
  },
  DEFICIENCIA_VISUAL: {
    label: 'Deficiência visual',
    short: 'Visual',
    description: 'Cegueira ou baixa visão. Piso tátil, braille, contraste e cão-guia.',
  },
  DEFICIENCIA_AUDITIVA_SENSORIAL: {
    label: 'Deficiência auditiva ou sensorial',
    short: 'Auditiva',
    description: 'Surdez, baixa audição ou sensibilidade sensorial. Libras, avisos visuais, alarmes luminosos.',
  },
}

/** Rótulos de uma necessidade. Códigos novos (criados por migração) caem na descrição da API. */
export function needMeta(n: TipoNecessidade | NeedCode, descricao?: string): NeedMeta {
  const codigo = typeof n === 'string' ? n : n.codigo
  const desc = typeof n === 'string' ? descricao : n.descricao
  return NEED_META[codigo] ?? { label: desc ?? codigo, short: desc ?? codigo, description: '' }
}

/* ---------- Categorias ---------- */

const CATEGORY_HELP: Record<string, string> = {
  ACESSO_EXTERNO: 'Estacionamento, calçada, rampas e entrada.',
  CIRCULACAO_INTERNA: 'Portas, corredores, elevadores e quartos.',
  SANITARIOS: 'Banheiro acessível, barras de apoio e banho.',
  SINALIZACAO: 'Piso tátil, braille, contraste e alarmes.',
  ATENDIMENTO: 'Libras, cardápio acessível, cão-guia e atendimento por texto.',
}
export const categoryHelp = (codigo: string) => CATEGORY_HELP[codigo] ?? ''

/* ---------- Tipos de estabelecimento ---------- */

export const PLACE_TYPES: TipoEstabelecimento[] = ['HOTEL', 'POUSADA', 'RESTAURANTE', 'ESPACO_EVENTOS']

export const PLACE_TYPE_LABEL: Record<TipoEstabelecimento, string> = {
  HOTEL: 'Hotel',
  POUSADA: 'Pousada',
  RESTAURANTE: 'Restaurante',
  ESPACO_EVENTOS: 'Espaço de eventos',
}

/* ---------- Status ---------- */

export const STATUS_LABEL: Record<AggStatus, string> = {
  sim: 'Atende',
  parcial: 'Atende em parte',
  nao: 'Não atende',
  nao_informado: 'Não informado',
}

/** Monta a ficha completa: todos os campos ativos do catálogo, com o item preenchido quando existir. */
export function montarFicha(campos: CategoriaCampos[], preenchida: CategoriaFichaPreenchida[]): FichaCategoria[] {
  const itens = new Map<number, ItemFicha>()
  for (const c of preenchida) for (const i of c.itens) itens.set(i.campoId, i)
  return campos.map(({ categoria, campos }) => ({
    categoria,
    linhas: campos.map((campo): FichaLinha => {
      const item = itens.get(campo.id)
      if (!item) return { campo, status: 'nao_informado' }
      if (campo.tipoValor === 'SIM_NAO') return { campo, item, status: item.valor === 'SIM' ? 'sim' : 'nao' }
      return { campo, item }
    }),
  }))
}

/** Resumo de um conjunto de linhas, considerando só os itens SIM/NÃO informados. */
export function resumo(linhas: FichaLinha[]): { status: AggStatus; atendem: number; informados: number } {
  const sn = linhas.filter((l) => l.status === 'sim' || l.status === 'nao')
  const atendem = sn.filter((l) => l.status === 'sim').length
  const status: AggStatus = !sn.length ? 'nao_informado' : atendem === sn.length ? 'sim' : atendem === 0 ? 'nao' : 'parcial'
  return { status, atendem, informados: sn.length }
}

/** Rótulo do resumo, ex.: "3 de 4 itens atendem". */
export function resumoLabel(r: ReturnType<typeof resumo>): string {
  if (r.status === 'nao_informado') return STATUS_LABEL.nao_informado
  if (r.status === 'sim') return STATUS_LABEL.sim
  if (r.status === 'nao') return STATUS_LABEL.nao
  return `${r.atendem} de ${r.informados} atendem`
}

/**
 * Status de uma necessidade para um estabelecimento. A fonte é `necessidadesAtendidas` da API
 * (regra do backend: mais da metade dos campos SIM_NAO da necessidade marcados SIM), para que
 * filtro e ficha nunca se contradigam (RN07).
 */
export function statusNecessidade(card: CardEstabelecimento, codigo: NeedCode, ficha?: FichaCategoria[]): ItemStatus {
  if (card.necessidadesAtendidas.some((n) => n.codigo === codigo)) return 'sim'
  if (ficha) {
    const informado = ficha.some((c) =>
      c.linhas.some((l) => l.campo.necessidade.codigo === codigo && (l.status === 'sim' || l.status === 'nao')),
    )
    if (!informado) return 'nao_informado'
  }
  return 'nao'
}

/* ---------- Formatação ---------- */

export function formatValor(l: FichaLinha): string {
  if (!l.item) return STATUS_LABEL.nao_informado
  if (l.campo.tipoValor === 'SIM_NAO') return l.item.valor === 'SIM' ? 'Sim' : 'Não'
  if (l.campo.tipoValor === 'NUMERO') {
    const n = Number(l.item.valor.replace(',', '.'))
    const txt = Number.isFinite(n) ? n.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : l.item.valor
    return l.campo.unidade ? `${txt} ${l.campo.unidade}` : txt
  }
  return l.item.valor
}

export const formatNota = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
export const formatKm = (n: number) =>
  n < 1 ? `${Math.round(n * 1000)} m` : `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`

/** "2026-11-10" → "10 de novembro de 2026" (sem deslocamento de fuso). */
export function formatData(iso: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(a, m - 1, d).toLocaleDateString('pt-BR', opts)
}

/** Data local de hoje no formato ISO (YYYY-MM-DD). */
export function hojeIso(desloc = 0) {
  const d = new Date()
  d.setDate(d.getDate() + desloc)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')
