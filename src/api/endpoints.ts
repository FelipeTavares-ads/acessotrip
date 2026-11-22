// Chamadas da API, agrupadas por módulo do backend. Rotas conferidas nos controllers.
import { api } from './client'
import type {
  Avaliacao,
  AvaliacaoPublica,
  AvaliacaoRequest,
  CadastroEstabelecimento,
  CardEstabelecimento,
  CategoriaCampos,
  CategoriaFicha,
  CategoriaFichaPreenchida,
  CriterioOrdenacao,
  Denuncia,
  Destino,
  DetalheEstabelecimento,
  EstabelecimentoResponse,
  Favorito,
  Foto,
  GerarRoteiroRequest,
  Metricas,
  MotivoDenuncia,
  Onboarding,
  Pagina,
  PaginaNotificacoes,
  PainelPremium,
  Assinatura,
  Roteiro,
  RoteiroResumo,
  TipoEstabelecimento,
  TipoNecessidade,
  TokenResponse,
  UsuarioResumo,
  Uuid,
  ViajanteResponse,
} from './types'

/* ---------- identidade ---------- */

export const auth = {
  login: (email: string, senha: string) => api<TokenResponse>('/auth/login', { method: 'POST', body: { email, senha } }),
  me: () => api<UsuarioResumo>('/usuarios/me'),
  cadastrarViajante: (nome: string, email: string, senha: string) =>
    api<ViajanteResponse>('/viajantes', { method: 'POST', body: { nome, email, senha } }),
  cadastrarEstabelecimento: (dados: CadastroEstabelecimento) =>
    api<EstabelecimentoResponse>('/estabelecimentos', { method: 'POST', body: dados }),
}

/* ---------- domínios ---------- */

export const dominios = {
  tiposNecessidade: () => api<TipoNecessidade[]>('/tipos-necessidade'),
  categorias: () => api<CategoriaFicha[]>('/categorias-ficha'),
  campos: () => api<CategoriaCampos[]>('/campos-ficha'),
}

/* ---------- catálogo ---------- */

/**
 * Como combinar as necessidades na busca (decisão D8): 'TODAS' = só lugares que atendem a todas as
 * necessidades marcadas (parâmetro `modoNecessidades` do backend). 'ALGUMA' = pelo menos uma.
 */
export const MODO_NECESSIDADES = 'TODAS' as 'ALGUMA' | 'TODAS'

export interface Busca {
  modoNecessidades?: 'ALGUMA' | 'TODAS'
  destino?: string
  estado?: string
  nome?: string
  tipos?: TipoEstabelecimento[]
  necessidades?: number[]
  selo?: boolean
  ordenacao?: CriterioOrdenacao
  lat?: number
  lon?: number
  pagina?: number
  tamanho?: number
}

export const catalogo = {
  buscar: (b: Busca, signal?: AbortSignal) =>
    api<Pagina<CardEstabelecimento>>('/catalogo/estabelecimentos', {
      query: { ...b, selo: b.selo || undefined, modoNecessidades: b.modoNecessidades === 'TODAS' ? 'TODAS' : undefined } as Record<string, string | number | boolean | (string | number)[] | undefined>,
      signal,
    }),
  destinos: (q: string, signal?: AbortSignal) => api<Destino[]>('/catalogo/destinos', { query: { q }, signal }),
  /** Atenção: cada chamada conta como visita ao perfil (RF21). Só usar quando a pessoa abre a página. */
  detalhe: (id: Uuid) => api<DetalheEstabelecimento>(`/catalogo/estabelecimentos/${id}`),
}

/* ---------- avaliações ---------- */

export const avaliacoes = {
  publicas: (estabelecimentoId: Uuid, pagina = 0, tamanho = 10) =>
    api<Pagina<AvaliacaoPublica>>(`/estabelecimentos/${estabelecimentoId}/avaliacoes`, { query: { pagina, tamanho } }),
  criar: (estabelecimentoId: Uuid, r: AvaliacaoRequest) =>
    api<Avaliacao>(`/estabelecimentos/${estabelecimentoId}/avaliacoes`, { method: 'POST', body: r }),
  minhas: () => api<Avaliacao[]>('/viajantes/me/avaliacoes'),
  editar: (id: Uuid, r: AvaliacaoRequest) => api<Avaliacao>(`/viajantes/me/avaliacoes/${id}`, { method: 'PUT', body: r }),
  remover: (id: Uuid) => api<void>(`/viajantes/me/avaliacoes/${id}`, { method: 'DELETE' }),
  denunciar: (avaliacaoId: Uuid, motivo: MotivoDenuncia, descricao?: string) =>
    api<Denuncia>(`/avaliacoes/${avaliacaoId}/denuncias`, { method: 'POST', body: { motivo, descricao: descricao || undefined } }),
}

/* ---------- viajante ---------- */

export const viajante = {
  necessidades: () => api<TipoNecessidade[]>('/viajantes/me/necessidades'),
  salvarNecessidades: (necessidadeIds: number[]) =>
    api<TipoNecessidade[]>('/viajantes/me/necessidades', { method: 'PUT', body: { necessidadeIds } }),
  favoritos: () => api<Favorito[]>('/viajantes/me/favoritos'),
  favoritar: (id: Uuid) => api<Favorito>(`/viajantes/me/favoritos/${id}`, { method: 'POST' }),
  desfavoritar: (id: Uuid) => api<void>(`/viajantes/me/favoritos/${id}`, { method: 'DELETE' }),
  gerarRoteiro: (r: GerarRoteiroRequest) => api<Roteiro>('/viajantes/me/roteiros', { method: 'POST', body: r }),
  roteiros: () => api<RoteiroResumo[]>('/viajantes/me/roteiros'),
  roteiro: (id: Uuid) => api<Roteiro>(`/viajantes/me/roteiros/${id}`),
  excluirRoteiro: (id: Uuid) => api<void>(`/viajantes/me/roteiros/${id}`, { method: 'DELETE' }),
}

/* ---------- estabelecimento (parceiro) ---------- */

export const parceiro = {
  ficha: () => api<CategoriaFichaPreenchida[]>('/estabelecimentos/me/ficha'),
  salvarCategoria: (categoriaId: number, itens: { campoId: number; valor: string }[]) =>
    api<CategoriaFichaPreenchida[]>(`/estabelecimentos/me/ficha/categorias/${categoriaId}`, { method: 'PUT', body: { itens } }),
  onboarding: () => api<Onboarding>('/estabelecimentos/me/onboarding'),
  fotos: () => api<Foto[]>('/estabelecimentos/me/fotos'),
  enviarFoto: (arquivo: File, categoriaId: number, textoAlternativo: string) => {
    const form = new FormData()
    form.append('arquivo', arquivo)
    form.append('categoriaId', String(categoriaId))
    form.append('textoAlternativo', textoAlternativo)
    return api<Foto>('/estabelecimentos/me/fotos', { method: 'POST', form })
  },
  alterarFoto: (id: Uuid, dados: { textoAlternativo?: string; categoriaId?: number }) =>
    api<Foto>(`/estabelecimentos/me/fotos/${id}`, { method: 'PATCH', body: dados }),
  removerFoto: (id: Uuid) => api<void>(`/estabelecimentos/me/fotos/${id}`, { method: 'DELETE' }),
  premium: () => api<PainelPremium>('/estabelecimentos/me/premium'),
  contratar: () => api<Assinatura>('/estabelecimentos/me/premium/assinatura', { method: 'POST' }),
  renovar: () => api<Assinatura>('/estabelecimentos/me/premium/assinatura/renovacao', { method: 'POST' }),
  cancelar: () => api<void>('/estabelecimentos/me/premium/assinatura', { method: 'DELETE' }),
  metricas: (inicio: string, fim: string) => api<Metricas>('/estabelecimentos/me/metricas', { query: { inicio, fim } }),
}

/* ---------- notificações (qualquer perfil) ---------- */

export const notificacoes = {
  listar: (naoLidas = false, pagina = 0, tamanho = 20) =>
    api<PaginaNotificacoes>('/notificacoes/me', { query: { naoLidas: naoLidas || undefined, pagina, tamanho } }),
  marcarLida: (id: Uuid) => api<void>(`/notificacoes/me/${id}/lida`, { method: 'PATCH' }),
  marcarTodas: () => api<{ marcadas: number }>('/notificacoes/me/lidas', { method: 'POST' }),
}
