// Tipos da interface. Os dados vêm da API (src/api/types.ts); aqui ficam só as visões derivadas.
import type { CampoFicha, CategoriaFicha, ItemFicha } from '../api/types'

/** Código estável do tipo de necessidade (ex.: MOBILIDADE_REDUZIDA). Ids numéricos variam por ambiente. */
export type NeedCode = string

/** Situação de um item SIM_NAO da ficha. Campo sem item preenchido = não informado. */
export type ItemStatus = 'sim' | 'nao' | 'nao_informado'

/** Situação agregada (categoria): "parcial" = parte dos itens atende e parte não. */
export type AggStatus = ItemStatus | 'parcial'

/** Uma linha da ficha: o campo do catálogo e, se houver, o item preenchido pelo estabelecimento. */
export interface FichaLinha {
  campo: CampoFicha
  item?: ItemFicha
  /** Só para campos SIM_NAO (ou não preenchidos). Campos NUMERO/TEXTO preenchidos não têm status. */
  status?: ItemStatus
}

export interface FichaCategoria {
  categoria: CategoriaFicha
  linhas: FichaLinha[]
}
