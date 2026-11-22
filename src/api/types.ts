// Tipos espelhando os DTOs do backend (br.edu.ifba.acessotrip). Conferidos nos records Java;
// ao mudar um DTO lá, atualize aqui.

export type Uuid = string
/** Data ISO sem hora (LocalDate), ex.: "2026-11-22". */
export type IsoDate = string
/** Instante ISO (Instant), ex.: "2026-11-22T17:00:00Z". */
export type IsoInstant = string

export type Perfil = 'VIAJANTE' | 'ESTABELECIMENTO' | 'ADMINISTRADOR' | 'MODERADOR'
export type TipoEstabelecimento = 'HOTEL' | 'POUSADA' | 'RESTAURANTE' | 'ESPACO_EVENTOS'
export type TipoValor = 'SIM_NAO' | 'NUMERO' | 'TEXTO'
export type CriterioOrdenacao = 'AVALIACAO' | 'PROXIMIDADE'
export type MotivoDenuncia = 'OFENSIVO' | 'INFORMACAO_FALSA' | 'SPAM' | 'DADOS_PESSOAIS' | 'OUTRO'
export type StatusAvaliacao = 'PUBLICADO' | 'EM_MODERACAO' | 'REMOVIDO'
export type StatusAssinatura = 'ATIVA' | 'VENCIDA' | 'CANCELADA'
export type TipoNotificacao = 'ELEGIBILIDADE_SELO' | 'MODERACAO' | 'SISTEMA'

export interface Pagina<T> {
  itens: T[]
  pagina: number
  tamanho: number
  totalItens: number
  totalPaginas: number
}

/* ---------- identidade ---------- */

export interface TokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export interface UsuarioResumo {
  id: Uuid
  email: string
  tipo: Perfil
}

export interface ViajanteResponse {
  id: Uuid
  nome: string
}

export interface EstabelecimentoResponse {
  id: Uuid
  nome: string
  cnpj: string
  tipo: TipoEstabelecimento
  cidade: string
  estado: string
  endereco: string
  latitude: number | null
  longitude: number | null
  onboardingCompleto: boolean
  seloVerificado: boolean
  planoPremium: boolean
}

export interface CadastroEstabelecimento {
  nome: string
  email: string
  senha: string
  cnpj: string
  tipo: TipoEstabelecimento
  cidade: string
  estado: string
  endereco: string
  latitude?: number
  longitude?: number
}

/* ---------- domínios ---------- */

export interface TipoNecessidade {
  id: number
  codigo: string
  descricao: string
}

export interface CategoriaFicha {
  id: number
  codigo: string
  descricao: string
}

export interface CampoFicha {
  id: number
  codigo: string
  rotulo: string
  ajuda: string | null
  tipoValor: TipoValor
  unidade: string | null
  necessidade: TipoNecessidade
}

export interface CategoriaCampos {
  categoria: CategoriaFicha
  campos: CampoFicha[]
}

/* ---------- ficha técnica ---------- */

export interface ItemFicha {
  campoId: number
  codigo: string
  rotulo: string
  tipoValor: TipoValor
  valor: string
  unidade: string | null
  necessidade: TipoNecessidade
  atualizadoEm: IsoInstant
}

export interface CategoriaFichaPreenchida {
  categoria: CategoriaFicha
  itens: ItemFicha[]
}

export interface Foto {
  id: Uuid
  categoriaId: number
  url: string
  textoAlternativo: string
  status: string
  criadaEm: IsoInstant
}

export interface Onboarding {
  categorias: { categoria: CategoriaFicha; preenchida: boolean }[]
  fotosPublicadas: number
  requisitosAtendidos: boolean
  concluido: boolean
}

/* ---------- catálogo ---------- */

export interface CardEstabelecimento {
  id: Uuid
  nome: string
  tipo: TipoEstabelecimento
  cidade: string
  estado: string
  fotoUrl: string | null
  fotoTextoAlternativo: string | null
  necessidadesAtendidas: TipoNecessidade[]
  notaMedia: number | null
  totalAvaliacoes: number
  seloVerificado: boolean
  destaque: boolean
  distanciaKm: number | null
}

export interface DetalheEstabelecimento {
  estabelecimento: CardEstabelecimento
  ficha: CategoriaFichaPreenchida[]
  fotos: Foto[]
}

export interface Destino {
  cidade: string
  estado: string
}

/* ---------- avaliações ---------- */

export interface AvaliacaoPublica {
  id: Uuid
  nota: number
  texto: string
  dataVisita: IsoDate
  criadaEm: IsoInstant
}

export interface Avaliacao {
  id: Uuid
  estabelecimentoId: Uuid
  nota: number
  texto: string
  dataVisita: IsoDate
  status: StatusAvaliacao
  criadaEm: IsoInstant
  atualizadaEm: IsoInstant
}

export interface AvaliacaoRequest {
  nota: number
  texto: string
  dataVisita: IsoDate
}

export interface Denuncia {
  id: Uuid
  avaliacaoId: Uuid
  motivo: MotivoDenuncia
  status: string
  criadaEm: IsoInstant
  prazoLimite: IsoInstant
}

/* ---------- viajante ---------- */

export interface Favorito {
  estabelecimentoId: Uuid
  nome: string
  tipo: TipoEstabelecimento
  cidade: string
  estado: string
  favoritadoEm: IsoInstant
}

export interface ItemRoteiro {
  ordem: number
  estabelecimentoId: Uuid
  nome: string | null
  tipo: TipoEstabelecimento | null
  cidade: string | null
  estado: string | null
  disponivel: boolean
  observacao: string | null
}

export interface Roteiro {
  id: Uuid
  destino: string
  dataInicio: IsoDate
  dataFim: IsoDate
  provedor: string
  criadoEm: IsoInstant
  dias: { dia: number; data: IsoDate; itens: ItemRoteiro[] }[]
}

export interface RoteiroResumo {
  id: Uuid
  destino: string
  dataInicio: IsoDate
  dataFim: IsoDate
  totalItens: number
  criadoEm: IsoInstant
}

export interface GerarRoteiroRequest {
  destino: string
  estado?: string
  dataInicio: IsoDate
  dataFim: IsoDate
  necessidadeIds?: number[]
}

/* ---------- parceiro ---------- */

export interface PainelPremium {
  progresso: { avaliacoesPositivas: number; minimo: number; faltam: number; notaMinima: number }
  seloVerificado: boolean
  elegivel: boolean
  planoPremium: boolean
  assinatura: Assinatura | null
  beneficios: string[]
}

export interface Assinatura {
  id: Uuid
  status: StatusAssinatura
  dataContratacao: IsoInstant
  dataVencimento: IsoDate
  encerradaEm: IsoInstant | null
}

export interface Metricas {
  inicio: IsoDate
  fim: IsoDate
  totais: { visitasPerfil: number; favoritos: number; novasAvaliacoes: number }
  dias: { data: IsoDate; visitasPerfil: number; favoritos: number; novasAvaliacoes: number }[]
}

export interface Notificacao {
  id: Uuid
  tipo: TipoNotificacao
  mensagem: string
  lida: boolean
  criadaEm: IsoInstant
}

export interface PaginaNotificacoes extends Pagina<Notificacao> {
  naoLidas: number
}

/* ---------- panorama (funcionalidade extra) ---------- */

export interface PanoramaNecessidade {
  necessidade: TipoNecessidade
  lugares: number
}

export interface PanoramaDestino {
  cidade: string
  estado: string
  lugares: number
  comSelo: number
  notaMedia: number | null
  necessidades: PanoramaNecessidade[]
}

export interface Panorama {
  geral: { lugares: number; destinos: number; comSelo: number; necessidades: PanoramaNecessidade[] }
  destinos: PanoramaDestino[]
}
