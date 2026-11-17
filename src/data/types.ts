// Formato espelha o modelo de dados do PI (seção 4.4): usuario, estabelecimento,
// categoria_ficha / ficha_tecnica_item (EAV), foto_estabelecimento, avaliacao,
// denuncia_avaliacao, metrica_estabelecimento_diaria.

export type NeedId = 'mobilidade' | 'visual' | 'auditiva'

export interface Need {
  id: NeedId
  label: string
  short: string
  description: string
}

export type PlaceType = 'HOTEL' | 'POUSADA' | 'RESTAURANTE'

export type CategoryId = 'acesso_externo' | 'circulacao_interna' | 'sanitarios' | 'sinalizacao' | 'atendimento'

export interface Category {
  id: CategoryId
  label: string
  description: string
}

/** Status de um item: atende, atende parcialmente, não atende, não informado. */
export type ItemStatus = 'sim' | 'parcial' | 'nao' | 'nao_informado' | 'nao_se_aplica'

export interface FichaItem {
  id: string
  categoria: CategoryId
  atributo: string
  /** nome curto para frases-resumo, ex. "rampa" */
  curto: string
  /** valor medido, ex. "90 cm" ou "1:12" */
  valor?: string
  status: ItemStatus
  /** necessidades que este item atende (RN07 — consistência filtro x ficha) */
  necessidades: NeedId[]
  observacao?: string
}

export interface Photo {
  id: string
  src: string
  alt: string
  categoria: CategoryId | 'geral'
}

export interface Review {
  id: string
  placeId: string
  autor: string
  necessidades: NeedId[]
  nota: 1 | 2 | 3 | 4 | 5
  texto: string
  dataVisita: string
  publicadoEm: string
}

export interface Place {
  id: string
  nome: string
  tipo: PlaceType
  cidade: string
  uf: string
  bairro: string
  endereco: string
  distanciaKm: number
  precoMedio?: string
  telefone: string
  /** concedido por mérito: avaliacoesPositivas >= MINIMO_SELO (RN03) */
  seloVerificado: boolean
  avaliacoesPositivas: number
  totalAvaliacoes: number
  notaMedia: number
  planoPremium: boolean
  resumo: string
  fotos: Photo[]
  ficha: FichaItem[]
}
