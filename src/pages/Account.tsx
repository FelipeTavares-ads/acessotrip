import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, Heart, LogOut, MessageSquareText, Route, SlidersHorizontal, Trash2 } from 'lucide-react'
import { mensagemDeErro } from '../api/client'
import { avaliacoes, viajante } from '../api/endpoints'
import type { Avaliacao, StatusAvaliacao, Uuid } from '../api/types'
import { useApi } from '../api/useApi'
import { Dialog } from '../components/Dialog'
import { PageHeader } from '../components/Layout'
import { Button, ButtonLink, LoadError, Loading, NeedIcon, Stars, TextArea, TextField, cx } from '../components/ui'
import { PLACE_TYPE_LABEL, formatData, hojeIso, needMeta } from '../data/domain'
import { useDominios } from '../state/dominios'
import { useSession } from '../state/session'
import { useStore } from '../state/store'

/* ---------- Necessidades (RF03) ---------- */

export function Necessidades() {
  const { minhasNecessidades, setMinhasNecessidades, notify } = useStore()
  const { necessidades, carregando, erro, recarregar } = useDominios()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const first = params.get('primeiro') === '1'
  // null = ainda não mexeu: acompanha o que está salvo no perfil
  const [escolha, setEscolha] = useState<string[] | null>(null)
  const sel = escolha ?? minhasNecessidades
  const setSel = (fn: (s: string[]) => string[]) => setEscolha(fn(sel))
  const [sending, setSending] = useState(false)
  const [falha, setFalha] = useState('')

  if (erro) return <LoadError error={erro} onRetry={recarregar} />
  if (carregando) return <Loading />

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Suas necessidades"
        lead="Usamos isso para mostrar primeiro o que importa nas fichas e nos resultados. Você pode mudar quando quiser, e pode marcar mais de uma."
      />
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setSending(true)
          setFalha('')
          try {
            const ids = necessidades.filter((n) => sel.includes(n.codigo)).map((n) => n.id)
            const salvas = await viajante.salvarNecessidades(ids)
            setMinhasNecessidades(salvas.map((n) => n.codigo))
            notify('Necessidades salvas.')
            nav(first ? '/inicio' : '/perfil')
          } catch (err) {
            setFalha(mensagemDeErro(err))
          } finally {
            setSending(false)
          }
        }}
      >
        {falha && (
          <p role="alert" className="mb-4 font-semibold text-danger">
            {falha}
          </p>
        )}
        <fieldset>
          <legend className="sr-only">Marque suas necessidades</legend>
          <div className="flex flex-col gap-3">
            {necessidades.map((n) => {
              const on = sel.includes(n.codigo)
              const meta = needMeta(n)
              return (
                <label
                  key={n.codigo}
                  className={cx(
                    'flex cursor-pointer items-start gap-4 rounded-[var(--radius-card)] border-2 bg-canvas p-4 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand',
                    on ? 'border-brand' : 'border-line',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setSel((s) => (on ? s.filter((x) => x !== n.codigo) : [...s, n.codigo]))}
                    className="mt-1 size-6 shrink-0"
                  />
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-ink">
                    <NeedIcon need={n.codigo} className="size-6" />
                  </span>
                  <span>
                    <span className="block text-lg font-bold text-ink">{meta.label}</span>
                    {meta.description && <span className="block text-ink-2">{meta.description}</span>}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
        <p className="mt-4 text-[0.9375rem] text-ink-3">Essa informação fica só no seu perfil e não aparece para os estabelecimentos.</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button type="submit" disabled={sending}>
            {sending ? 'Salvando…' : 'Salvar necessidades'}
          </Button>
          {first && (
            <ButtonLink to="/inicio" variant="ghost">
              Pular por enquanto
            </ButtonLink>
          )}
        </div>
      </form>
    </div>
  )
}

/* ---------- Perfil ---------- */

export function Perfil() {
  const { usuario, sair } = useSession()
  const { favorites, minhasNecessidades } = useStore()
  const nav = useNavigate()
  const minhas = useApi(() => avaliacoes.minhas(), [])
  const own = minhas.data?.filter((a) => a.status !== 'REMOVIDO').length ?? 0
  const rows = [
    {
      to: '/perfil/necessidades',
      Icon: SlidersHorizontal,
      title: 'Minhas necessidades',
      sub: minhasNecessidades.length ? minhasNecessidades.map((n) => needMeta(n).label).join(', ') : 'Nenhuma marcada',
    },
    { to: '/favoritos', Icon: Heart, title: 'Favoritos', sub: `${favorites.size} ${favorites.size === 1 ? 'lugar salvo' : 'lugares salvos'}` },
    { to: '/minhas-avaliacoes', Icon: MessageSquareText, title: 'Minhas avaliações', sub: minhas.loading ? 'Carregando…' : own ? `${own} publicadas` : 'Nenhuma ainda' },
    { to: '/roteiro', Icon: Route, title: 'Roteiros acessíveis', sub: 'Gere e consulte roteiros com lugares do catálogo' },
  ]
  return (
    <div className="max-w-2xl">
      <PageHeader title={usuario?.nome ?? 'Minha conta'} lead={usuario?.email} />
      <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-canvas">
        {rows.map(({ to, Icon, title, sub }) => (
          <li key={to}>
            <Link to={to} className="flex min-h-16 items-center gap-4 px-4 py-3 no-underline hover:bg-surface">
              <Icon aria-hidden className="size-6 shrink-0 text-brand" />
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-ink">{title}</span>
                <span className="block truncate text-[0.9375rem] text-ink-2">{sub}</span>
              </span>
              <ChevronRight aria-hidden className="size-5 text-ink-3" />
            </Link>
          </li>
        ))}
      </ul>
      <Button
        variant="ghost"
        className="mt-6"
        onClick={() => {
          sair()
          nav('/')
        }}
      >
        <LogOut aria-hidden className="size-5" />
        Sair da conta
      </Button>
    </div>
  )
}

/* ---------- Favoritos ---------- */

export function Favoritos() {
  const { favorites, toggleFavorite } = useStore()
  const st = useApi(() => viajante.favoritos(), [])
  // Mantém a lista coerente quando o viajante remove um favorito aqui mesmo
  const list = st.data?.filter((f) => favorites.has(f.estabelecimentoId)) ?? []

  if (st.error) return <LoadError error={st.error} onRetry={st.reload} />
  if (st.loading) return <Loading />
  return (
    <>
      <PageHeader title="Favoritos" lead={list.length ? `${list.length} ${list.length === 1 ? 'lugar salvo' : 'lugares salvos'}.` : undefined} />
      {list.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((f) => (
            <li key={f.estabelecimentoId} className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-canvas p-4">
              <div>
                <h2 className="text-lg font-bold">
                  <Link to={`/local/${f.estabelecimentoId}`} className="text-ink">
                    {f.nome}
                  </Link>
                </h2>
                <p className="text-[0.9375rem] text-ink-2">
                  {PLACE_TYPE_LABEL[f.tipo]} em {f.cidade}, {f.estado}
                </p>
                <p className="mt-1 text-sm text-ink-3">Salvo em {formatData(f.favoritadoEm)}</p>
              </div>
              <Button variant="ghost" className="self-start" onClick={() => toggleFavorite(f.estabelecimentoId, f.nome)}>
                <Heart aria-hidden className="size-5 fill-current" />
                Remover<span className="sr-only"> {f.nome}</span> dos favoritos
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas p-8 text-center">
          <Heart aria-hidden className="mx-auto size-8 text-ink-3" />
          <h2 className="mt-3 text-lg font-bold">Nenhum lugar salvo</h2>
          <p className="mx-auto mt-1 max-w-[40ch] text-ink-2">Toque no coração de um lugar para guardar e comparar depois.</p>
          <ButtonLink to="/buscar" className="mt-5">
            Buscar lugares
          </ButtonLink>
        </div>
      )}
    </>
  )
}

/* ---------- Minhas avaliações ---------- */

const STATUS_AVALIACAO: Record<StatusAvaliacao, string> = {
  PUBLICADO: 'Publicada',
  EM_MODERACAO: 'Em moderação',
  REMOVIDO: 'Removida pela moderação ou por você',
}

function EditarAvaliacao({ alvo, onClose, onSaved }: { alvo: Avaliacao | null; onClose: () => void; onSaved: (a: Avaliacao) => void }) {
  // O componente é recriado (key) a cada avaliação aberta, então o estado nasce com os dados dela
  const [nota, setNota] = useState(alvo?.nota ?? 0)
  const [texto, setTexto] = useState(alvo?.texto ?? '')
  const [visita, setVisita] = useState(alvo?.dataVisita ?? '')
  const [erro, setErro] = useState('')
  const [sending, setSending] = useState(false)
  return (
    <Dialog open={!!alvo} onClose={onClose} title="Editar avaliação">
      <form
        noValidate
        onSubmit={async (e) => {
          e.preventDefault()
          const dialog = e.currentTarget.closest('dialog')
          if (texto.trim().length < 20) return setErro('Conte um pouco mais: pelo menos 20 caracteres.')
          if (!visita || visita > hojeIso()) return setErro('Informe uma data de visita que não seja no futuro.')
          if (!alvo) return
          setSending(true)
          try {
            onSaved(await avaliacoes.editar(alvo.id, { nota, texto: texto.trim(), dataVisita: visita }))
            dialog?.close()
          } catch (err) {
            setErro(mensagemDeErro(err))
          } finally {
            setSending(false)
          }
        }}
        className="flex flex-col gap-4"
      >
        {erro && (
          <p role="alert" className="text-sm font-semibold text-danger">
            {erro}
          </p>
        )}
        <fieldset>
          <legend className="mb-2 font-semibold">Nota</legend>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5].map((v) => (
              <label key={v} className="flex min-h-11 cursor-pointer items-center gap-2">
                <input type="radio" name="nota-edit" checked={nota === v} onChange={() => setNota(v)} className="size-5" />
                {v}
              </label>
            ))}
          </div>
        </fieldset>
        <TextField label="Data da visita" type="date" max={hojeIso()} value={visita} onChange={(e) => setVisita(e.target.value)} />
        <TextArea label="Seu relato" maxLength={1000} value={texto} onChange={(e) => setTexto(e.target.value)} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={(e) => (e.currentTarget.closest('dialog') as HTMLDialogElement).close()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={sending}>
            {sending ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export function MinhasAvaliacoes() {
  const { notify } = useStore()
  const st = useApi(() => avaliacoes.minhas(), [])
  const [editar, setEditar] = useState<Avaliacao | null>(null)

  const remover = async (id: Uuid) => {
    if (!window.confirm('Excluir esta avaliação? Ela deixa de aparecer na página do lugar.')) return
    try {
      await avaliacoes.remover(id)
      notify('Avaliação excluída.')
      st.reload()
    } catch (e) {
      notify(mensagemDeErro(e))
    }
  }

  if (st.error) return <LoadError error={st.error} onRetry={st.reload} />
  if (st.loading) return <Loading />
  const own = st.data ?? []
  return (
    <div className="max-w-2xl">
      <PageHeader title="Minhas avaliações" />
      {own.length ? (
        <ul className="flex flex-col gap-3">
          {own.map((r) => (
            <li key={r.id} className="rounded-[var(--radius-card)] border border-line bg-canvas p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold">
                  <Link to={`/local/${r.estabelecimentoId}`} className="text-brand">
                    Ver lugar avaliado
                  </Link>
                </h2>
                <Stars value={r.nota} />
              </div>
              <p className="mt-1 text-sm text-ink-3">
                Visita em {formatData(r.dataVisita)} · <span className="font-semibold">{STATUS_AVALIACAO[r.status] ?? r.status}</span>
              </p>
              <p className="mt-2 whitespace-pre-line text-ink">{r.texto}</p>
              {r.status !== 'REMOVIDO' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => setEditar(r)}>
                    Editar
                  </Button>
                  <Button variant="ghost" onClick={() => remover(r.id)}>
                    <Trash2 aria-hidden className="size-5" />
                    Excluir
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas p-8 text-center">
          <h2 className="text-lg font-bold">Você ainda não avaliou nenhum lugar</h2>
          <p className="mx-auto mt-1 max-w-[44ch] text-ink-2">
            Depois de uma visita, abra a ficha do lugar e toque em Avaliar. Seu relato confirma ou corrige o que o local informou.
          </p>
          <ButtonLink to="/buscar" variant="secondary" className="mt-5">
            Buscar lugares
          </ButtonLink>
        </div>
      )}
      <EditarAvaliacao
        key={editar?.id ?? 'fechado'}
        alvo={editar}
        onClose={() => setEditar(null)}
        onSaved={(a) => {
          st.setData((old) => (old ?? []).map((x) => (x.id === a.id ? a : x)))
          notify('Avaliação atualizada.')
        }}
      />
    </div>
  )
}
