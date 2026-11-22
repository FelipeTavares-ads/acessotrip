import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Bell, Check, ChevronLeft, CircleCheck, ClipboardList, Eye, Heart, LocateFixed, MessageSquareText, ShieldCheck, Star } from 'lucide-react'
import { ApiError, mensagemDeErro } from '../../api/client'
import { avaliacoes, catalogo, notificacoes, parceiro } from '../../api/endpoints'
import type { AvaliacaoPublica, CategoriaFichaPreenchida, Foto, Notificacao, TipoEstabelecimento } from '../../api/types'
import { useApi } from '../../api/useApi'
import { ErrorSummary } from '../../components/ErrorSummary'
import { FichaCategorias, Galeria, NeedSummary } from '../../components/Ficha'
import { PageHeader } from '../../components/Layout'
import { Button, ButtonLink, LoadError, Loading, ProgressBar, SelectField, StatusBadge, Stars, TextField, cx } from '../../components/ui'
import { PLACE_TYPES, PLACE_TYPE_LABEL, UFS, categoryHelp, formatData, formatNota, hojeIso, montarFicha, resumo, resumoLabel } from '../../data/domain'
import { cnpjValido, maskCnpj } from '../../data/cnpj'
import { useDominios } from '../../state/dominios'
import { useSession } from '../../state/session'
import { useStore } from '../../state/store'
import { AuthFrame, PasswordField, emailOk, useServerErrors } from '../Auth'
import { CategoryEditor, CategoryPhotos, type CategoryEditorHandle } from './FichaForm'

/* ---------- Cadastro empresarial (RF16) ---------- */

export function CadastroParceiro() {
  const nav = useNavigate()
  const { cadastrarEstabelecimento } = useSession()
  const { notify } = useStore()
  const [f, setF] = useState({ nome: '', cnpj: '', tipo: '' as TipoEstabelecimento | '', endereco: '', cidade: '', estado: '', email: '', senha: '' })
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [geo, setGeo] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [sending, setSending] = useState(false)
  const { server, setServer, capture } = useServerErrors()
  const local = {
    nome: !f.nome.trim() ? 'Informe o nome do estabelecimento.' : undefined,
    cnpj: !cnpjValido(f.cnpj) ? 'CNPJ inválido. Confira os 14 caracteres.' : undefined,
    tipo: !f.tipo ? 'Escolha o tipo de estabelecimento.' : undefined,
    endereco: !f.endereco.trim() ? 'Informe o endereço.' : undefined,
    cidade: !f.cidade.trim() ? 'Informe a cidade.' : undefined,
    estado: !f.estado ? 'Escolha o estado.' : undefined,
    email: !emailOk(f.email) ? 'Informe um e-mail válido.' : undefined,
    senha: f.senha.length < 8 ? 'A senha precisa ter pelo menos 8 caracteres.' : undefined,
  }
  const errors = { ...local, ...server }
  const show = attempt > 0
  const e = (k: string) => (show ? (errors as Record<string, string | undefined>)[k] : undefined)

  const usarLocalizacao = () => {
    if (!('geolocation' in navigator)) return setGeo('Seu navegador não informa a localização.')
    setGeo('Obtendo localização…')
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ latitude: Number(p.coords.latitude.toFixed(6)), longitude: Number(p.coords.longitude.toFixed(6)) })
        setGeo('Localização registrada. Seu estabelecimento poderá aparecer na busca “Mais perto de mim”.')
      },
      () => setGeo('Não foi possível obter a localização. Você pode continuar sem ela.'),
      { timeout: 10_000 },
    )
  }

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    setServer({})
    setAttempt((a) => a + 1)
    if (Object.values(local).some(Boolean)) return
    setSending(true)
    try {
      await cadastrarEstabelecimento({
        nome: f.nome.trim(),
        email: f.email.trim(),
        senha: f.senha,
        cnpj: f.cnpj,
        tipo: f.tipo as TipoEstabelecimento,
        cidade: f.cidade.trim(),
        estado: f.estado,
        endereco: f.endereco.trim(),
        ...(coords ?? {}),
      })
      notify('Cadastro criado. Agora preencha a ficha de acessibilidade.')
      nav('/parceiro/onboarding')
    } catch (err) {
      capture(err, 'email')
      setAttempt((a) => a + 1)
    } finally {
      setSending(false)
    }
  }

  return (
    <AuthFrame
      title="Cadastrar meu negócio"
      lead="Depois do cadastro você preenche a ficha de acessibilidade em 5 etapas e envia ao menos uma foto. Dá para salvar e voltar depois."
      foot={
        <>
          Já tem cadastro?{' '}
          <Link to="/entrar" className="font-semibold text-brand">
            Entrar
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <ErrorSummary errors={show ? errors : {}} attempt={attempt} />
        <TextField id="nome" label="Nome do estabelecimento" autoComplete="organization" maxLength={150} value={f.nome} onChange={(x) => setF({ ...f, nome: x.target.value })} error={e('nome')} />
        <TextField id="cnpj" label="CNPJ" placeholder="00.000.000/0000-00" value={f.cnpj} onChange={(x) => setF({ ...f, cnpj: maskCnpj(x.target.value) })} error={e('cnpj')} className="tabular" />
        <SelectField id="tipo" label="Tipo de estabelecimento" value={f.tipo} onChange={(x) => setF({ ...f, tipo: x.target.value as TipoEstabelecimento })} error={e('tipo')}>
          <option value="">Escolha</option>
          {PLACE_TYPES.map((t) => (
            <option key={t} value={t}>
              {PLACE_TYPE_LABEL[t]}
            </option>
          ))}
        </SelectField>
        <TextField id="endereco" label="Endereço" autoComplete="street-address" maxLength={255} value={f.endereco} onChange={(x) => setF({ ...f, endereco: x.target.value })} error={e('endereco')} />
        <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
          <TextField id="cidade" label="Cidade" autoComplete="address-level2" maxLength={100} value={f.cidade} onChange={(x) => setF({ ...f, cidade: x.target.value })} error={e('cidade')} />
          <SelectField id="estado" label="Estado" value={f.estado} onChange={(x) => setF({ ...f, estado: x.target.value })} error={e('estado')}>
            <option value="">UF</option>
            {UFS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </SelectField>
        </div>
        <div className="flex flex-col gap-2 rounded-[var(--radius-card)] border border-line p-4">
          <p className="font-semibold">
            Localização no mapa <span className="font-normal text-ink-3">(opcional)</span>
          </p>
          <p className="text-[0.9375rem] text-ink-2">Use se você estiver no estabelecimento agora. Serve para aparecer em “Mais perto de mim”.</p>
          <Button variant="secondary" onClick={usarLocalizacao} className="self-start">
            <LocateFixed aria-hidden className="size-5" />
            Usar minha localização
          </Button>
          <p role="status" className="text-[0.9375rem] text-ink-2">
            {geo}
          </p>
        </div>
        <TextField id="email" label="E-mail de acesso" type="email" autoComplete="email" maxLength={254} value={f.email} onChange={(x) => setF({ ...f, email: x.target.value })} error={e('email')} />
        <PasswordField id="senha" label="Senha" hint="De 8 a 72 caracteres." autoComplete="new-password" value={f.senha} onChange={(v) => setF({ ...f, senha: v })} error={e('senha')} />
        <Button type="submit" block className="mt-2" disabled={sending}>
          {sending ? 'Criando cadastro…' : 'Criar conta e começar a ficha'}
        </Button>
      </form>
    </AuthFrame>
  )
}

/* ---------- Dados da ficha do parceiro (ficha + fotos) ---------- */

function useFichaParceiro() {
  const ficha = useApi(() => parceiro.ficha(), [])
  const fotos = useApi(() => parceiro.fotos(), [])
  return { ficha, fotos }
}

/* ---------- Onboarding guiado (RF17) ---------- */

export function Onboarding() {
  const nav = useNavigate()
  const { campos, carregando } = useDominios()
  const { ficha, fotos } = useFichaParceiro()
  const [step, setStep] = useState(0)
  const [pendencias, setPendencias] = useState<string[] | null>(null)
  const [concluindo, setConcluindo] = useState(false)
  const headRef = useRef<HTMLHeadingElement>(null)
  const editorRef = useRef<CategoryEditorHandle>(null)

  if (ficha.error || fotos.error) return <LoadError error={ficha.error ?? fotos.error} onRetry={() => (ficha.reload(), fotos.reload())} />
  if (carregando || ficha.loading || fotos.loading || !ficha.data || !fotos.data) return <Loading />

  const grupo = campos[step]
  const last = step === campos.length - 1
  const preenchida = (catId: number) => (ficha.data?.find((c) => c.categoria.id === catId)?.itens.length ?? 0) > 0

  const go = async (n: number, salvar: boolean) => {
    if (salvar && !(await editorRef.current?.salvar())) return
    setStep(n)
    setPendencias(null)
    window.scrollTo(0, 0)
    window.setTimeout(() => headRef.current?.focus(), 0)
  }
  const concluir = async () => {
    if (!(await editorRef.current?.salvar())) return
    setConcluindo(true)
    try {
      const o = await parceiro.onboarding()
      if (o.concluido) return nav('/parceiro/preview?novo=1')
      const faltam = o.categorias.filter((c) => !c.preenchida).map((c) => `${c.categoria.descricao}: responda ao menos um item.`)
      if (o.fotosPublicadas === 0) faltam.push('Envie ao menos uma foto do estabelecimento.')
      setPendencias(faltam)
    } catch (e) {
      setPendencias([mensagemDeErro(e)])
    } finally {
      setConcluindo(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Ficha de acessibilidade"
        lead="Responda o que existe hoje no seu estabelecimento. Para aparecer nas buscas, cada uma das 5 partes precisa de ao menos uma resposta e o local precisa de ao menos uma foto."
      />
      <nav aria-label="Etapas da ficha" className="mb-6">
        <ol className="grid grid-cols-5 gap-1.5">
          {campos.map((c, i) => {
            const done = preenchida(c.categoria.id)
            return (
              <li key={c.categoria.id}>
                <button type="button" onClick={() => go(i, true)} aria-current={i === step ? 'step' : undefined} className="flex w-full flex-col items-start gap-1.5 pt-1 text-left">
                  <span className={cx('h-1.5 w-full rounded-full', i === step ? 'bg-brand' : done ? 'bg-ok' : 'bg-line')} />
                  <span className={cx('hidden text-sm font-semibold sm:block', i === step ? 'text-brand' : 'text-ink-3')}>{c.categoria.descricao}</span>
                  <span className="sr-only">
                    {c.categoria.descricao}
                    {i === step ? ', etapa atual' : done ? ', preenchida' : ', não iniciada'}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
      <p className="text-sm font-semibold text-ink-3 tabular">
        Etapa {step + 1} de {campos.length}
      </p>
      <h2 ref={headRef} tabIndex={-1} className="text-[1.5rem] font-bold outline-none">
        {grupo.categoria.descricao}
      </h2>
      <p className="mb-5 text-ink-2">{categoryHelp(grupo.categoria.codigo)}</p>
      <div className="flex flex-col gap-4">
        <CategoryEditor ref={editorRef} grupo={grupo} preenchida={ficha.data} onSaved={(f) => ficha.setData(f)} botao={false} />
        <CategoryPhotos categoriaId={grupo.categoria.id} fotos={fotos.data} onChange={(f) => fotos.setData(f)} />
      </div>
      {pendencias && pendencias.length > 0 && (
        <div role="alert" className="mt-6 rounded-[var(--radius-card)] border-2 border-partial bg-partial-soft p-4 text-partial">
          <p className="font-bold">Falta pouco para sua ficha aparecer nas buscas:</p>
          <ul className="mt-2 list-disc pl-6 text-ink">
            {pendencias.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] mt-6 flex justify-between gap-3 border-t border-line bg-surface py-3 md:bottom-0">
        <Button variant="ghost" onClick={() => go(step - 1, true)} disabled={step === 0}>
          <ChevronLeft aria-hidden className="size-5" />
          Anterior
        </Button>
        {last ? (
          <Button onClick={concluir} disabled={concluindo}>
            <Check aria-hidden className="size-5" />
            {concluindo ? 'Verificando…' : 'Salvar e concluir'}
          </Button>
        ) : (
          <Button onClick={() => go(step + 1, true)}>
            Salvar e continuar
            <ArrowRight aria-hidden className="size-5" />
          </Button>
        )}
      </div>
    </div>
  )
}

/* ---------- Edição contínua (RF20) ---------- */

export function EditarFicha() {
  const { campos, carregando } = useDominios()
  const { ficha, fotos } = useFichaParceiro()
  if (ficha.error || fotos.error) return <LoadError error={ficha.error ?? fotos.error} onRetry={() => (ficha.reload(), fotos.reload())} />
  if (carregando || !ficha.data || !fotos.data) return <Loading />
  const completa = montarFicha(campos, ficha.data)
  return (
    <div className="max-w-3xl">
      <PageHeader title="Editar ficha técnica" lead="Abra uma parte, ajuste as respostas e toque em Salvar. As mudanças aparecem na sua página pública logo depois." />
      <div className="mb-6 flex flex-wrap gap-2">
        <ButtonLink to="/parceiro/preview" variant="secondary">
          <Eye aria-hidden className="size-5" />
          Ver como os viajantes veem
        </ButtonLink>
      </div>
      <div className="flex flex-col gap-3">
        {campos.map((g, i) => {
          const r = resumo(completa[i].linhas)
          return (
            <details key={g.categoria.id} className="group rounded-[var(--radius-card)] border border-line bg-canvas">
              <summary className="flex min-h-14 cursor-pointer list-none flex-wrap items-center justify-between gap-x-3 gap-y-2 px-5 py-3 [&::-webkit-details-marker]:hidden">
                <span className="text-lg font-bold">{g.categoria.descricao}</span>
                <StatusBadge status={r.status} label={resumoLabel(r)} size="sm" />
              </summary>
              <div className="flex flex-col gap-4 border-t border-line bg-surface p-4">
                <CategoryEditor grupo={g} preenchida={ficha.data!} onSaved={(f) => ficha.setData(f)} />
                <CategoryPhotos categoriaId={g.categoria.id} fotos={fotos.data!} onChange={(f) => fotos.setData(f)} />
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Dashboard (RF21, RF22) ---------- */

type Period = 7 | 30 | 90

function periodo(dias: number, deslocamento = 0) {
  return { inicio: hojeIso(-(dias - 1) - deslocamento), fim: hojeIso(-deslocamento) }
}

export function Dashboard() {
  const { usuario } = useSession()
  const [period, setPeriod] = useState<Period>(30)
  const onboarding = useApi(() => parceiro.onboarding(), [])
  const premium = useApi(() => parceiro.premium(), [])
  const fichaP = useApi(() => parceiro.ficha(), [])
  const { campos } = useDominios()
  const metricas = useApi(() => {
    const a = periodo(period)
    const b = periodo(period, period)
    return Promise.all([parceiro.metricas(a.inicio, a.fim), parceiro.metricas(b.inicio, b.fim)])
  }, [period])
  // O detalhe do catálogo traz nome e nota; para o próprio estabelecimento não conta visita (D15)
  const concluido = onboarding.data?.concluido
  const detalhe = useApi(concluido && usuario ? () => catalogo.detalhe(usuario.id) : null, [concluido, usuario?.id])

  const e = detalhe.data?.estabelecimento
  const [atual, anterior] = metricas.data ?? []
  const delta = atual && anterior && anterior.totais.visitasPerfil > 0 ? Math.round(((atual.totais.visitasPerfil - anterior.totais.visitasPerfil) / anterior.totais.visitasPerfil) * 100) : null
  const prog = premium.data?.progresso
  const completa = fichaP.data ? montarFicha(campos, fichaP.data) : []
  const naoInf = completa.flatMap((c) => c.linhas).filter((l) => !l.item).length
  const pendentes = completa.filter((c) => !c.linhas.some((l) => l.item))

  return (
    <>
      <PageHeader title={e?.nome ?? 'Seu estabelecimento'} lead="Desempenho da sua página e da ficha de acessibilidade." />

      {onboarding.data && !onboarding.data.concluido && (
        <div className="mb-6 flex flex-col gap-3 rounded-[var(--radius-card)] border border-brand bg-brand-soft p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-brand-ink">Sua ficha ainda não foi concluída e não aparece nas buscas.</p>
          <ButtonLink to="/parceiro/onboarding">Continuar ficha</ButtonLink>
        </div>
      )}

      <section aria-labelledby="metricas">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 id="metricas" className="text-xl font-bold">
            Métricas
          </h2>
          <div role="group" aria-label="Período" className="inline-flex rounded-full border border-line-strong bg-canvas p-1">
            {([7, 30, 90] as Period[]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={period === k}
                onClick={() => setPeriod(k)}
                className={cx('min-h-10 rounded-full px-4 text-[0.9375rem] font-semibold', period === k ? 'bg-brand-ink text-white' : 'text-ink-2 hover:text-ink')}
              >
                {k} dias
              </button>
            ))}
          </div>
        </div>
        {metricas.error ? (
          <LoadError error={metricas.error} onRetry={metricas.reload} />
        ) : !atual ? (
          <Loading />
        ) : (
          <dl className="grid grid-cols-2 divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-canvas md:grid-cols-4 md:divide-x">
            {[
              {
                Icon: Eye,
                label: 'Visitas à página',
                value: atual.totais.visitasPerfil.toLocaleString('pt-BR'),
                extra: delta === null ? 'Sem dados do período anterior' : `${delta > 0 ? '+' : ''}${delta}% vs. período anterior`,
              },
              { Icon: Heart, label: 'Salvaram nos favoritos', value: String(atual.totais.favoritos) },
              { Icon: MessageSquareText, label: 'Novas avaliações', value: String(atual.totais.novasAvaliacoes) },
              {
                Icon: Star,
                label: 'Nota média geral',
                value: e?.notaMedia != null ? formatNota(e.notaMedia) : '—',
                extra: e?.notaMedia != null ? `de 5, ${e.totalAvaliacoes} avaliações` : 'Sem avaliações ainda',
              },
            ].map(({ Icon, label, value, extra }, i) => (
              <div key={label} className={cx('p-4 md:p-5', i < 2 && 'border-b border-line md:border-b-0', i % 2 === 0 && 'border-r border-line md:border-r-0')}>
                <dt className="flex items-center gap-1.5 text-[0.9375rem] text-ink-2">
                  <Icon aria-hidden className="size-4" />
                  {label}
                </dt>
                <dd className="mt-1 text-[1.75rem] font-bold leading-tight text-ink tabular">{value}</dd>
                {extra && <dd className="text-sm text-ink-3 tabular">{extra}</dd>}
              </div>
            ))}
          </dl>
        )}
        <p className="mt-2 text-sm text-ink-3">
          Últimos {period} dias, de {atual ? formatData(atual.inicio) : '…'} a {atual ? formatData(atual.fim) : '…'}.
        </p>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="selo" className="rounded-[var(--radius-card)] border border-line bg-canvas p-5">
          <h2 id="selo" className="flex items-center gap-2 text-xl font-bold">
            <ShieldCheck aria-hidden className="size-6 text-brand" />
            Selo Acessibilidade Verificada
          </h2>
          {premium.error ? (
            <LoadError error={premium.error} onRetry={premium.reload} />
          ) : !prog ? (
            <Loading />
          ) : (
            <>
              <p className="mt-1 text-ink-2">O selo vem de avaliações positivas (nota {prog.notaMinima} ou mais) de viajantes que visitaram o local.</p>
              <div className="mt-5 flex items-baseline justify-between">
                <p className="font-semibold">Avaliações positivas</p>
                <p className="text-lg font-bold tabular">
                  {prog.avaliacoesPositivas} de {prog.minimo}
                </p>
              </div>
              <div className="mt-2">
                <ProgressBar value={Math.min(prog.avaliacoesPositivas, prog.minimo)} max={prog.minimo} label="Progresso para o Selo" />
              </div>
              <p className="mt-3 text-ink">
                {premium.data?.seloVerificado ? (
                  <strong>Selo conquistado. Você já pode contratar o Plano Premium.</strong>
                ) : (
                  <>
                    Faltam <strong>{prog.faltam}</strong> {prog.faltam === 1 ? 'avaliação positiva' : 'avaliações positivas'} para conquistar o selo e liberar o Plano
                    Premium.
                  </>
                )}
              </p>
            </>
          )}
          <Link to="/parceiro/premium" className="mt-4 inline-flex min-h-11 items-center gap-1 font-semibold text-brand">
            Plano Premium
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </section>

        <section aria-labelledby="pendencias" className="rounded-[var(--radius-card)] border border-line bg-canvas p-5">
          <h2 id="pendencias" className="flex items-center gap-2 text-xl font-bold">
            <ClipboardList aria-hidden className="size-6 text-brand" />
            Sua ficha
          </h2>
          {fichaP.loading ? (
            <Loading />
          ) : naoInf === 0 ? (
            <p className="mt-2 flex items-center gap-2 text-ok">
              <CircleCheck aria-hidden className="size-5" />
              Todos os itens respondidos.
            </p>
          ) : (
            <p className="mt-1 text-ink-2">
              <strong className="text-ink tabular">{naoInf}</strong> {naoInf === 1 ? 'item está' : 'itens estão'} sem resposta. Fichas completas ajudam o viajante a decidir.
            </p>
          )}
          {pendentes.length > 0 && (
            <ul className="mt-3 list-disc pl-6 text-ink">
              {pendentes.map((c) => (
                <li key={c.categoria.id}>{c.categoria.descricao}: nenhum item respondido</li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink to="/parceiro/ficha">Completar ficha</ButtonLink>
            <ButtonLink to="/parceiro/preview" variant="ghost">
              Ver prévia
            </ButtonLink>
          </div>
        </section>
      </div>
    </>
  )
}

/* ---------- Prévia da ficha ---------- */

export function Preview() {
  const [params] = useSearchParams()
  const novo = params.get('novo') === '1'
  const { campos, categorias } = useDominios()
  const ficha = useApi(() => parceiro.ficha(), [])
  const fotos = useApi(() => parceiro.fotos(), [])
  if (ficha.error || fotos.error) return <LoadError error={ficha.error ?? fotos.error} onRetry={() => (ficha.reload(), fotos.reload())} />
  if (!ficha.data || !fotos.data || !campos.length) return <Loading />
  const completa = montarFicha(campos, ficha.data as CategoriaFichaPreenchida[])
  const publicadas = (fotos.data as Foto[]).filter((f) => f.status === 'PUBLICADO')
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Como os viajantes veem sua ficha"
        lead={novo ? 'Ficha concluída. Ela já aparece nas buscas. Confira e ajuste o que precisar.' : 'Prévia da ficha e das fotos da sua página pública.'}
      />
      <div className="flex flex-col gap-8">
        <NeedSummary ficha={completa} needs={[]} />
        <FichaCategorias ficha={completa} needs={[]} />
        <Galeria fotos={publicadas} categorias={categorias} />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <ButtonLink to="/parceiro/ficha">Editar ficha</ButtonLink>
        <ButtonLink to="/parceiro" variant="ghost">
          Ir para o painel
        </ButtonLink>
      </div>
    </div>
  )
}

/* ---------- Plano Premium (RF22–RF24) ---------- */

export function Premium() {
  const { notify } = useStore()
  const st = useApi(() => parceiro.premium(), [])
  const [ciente, setCiente] = useState(false)
  const [erro, setErro] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const acao = async (fn: () => Promise<unknown>, ok: string) => {
    setErro('')
    setOcupado(true)
    try {
      await fn()
      notify(ok)
      st.reload()
    } catch (e) {
      setErro(e instanceof ApiError && e.status === 409 ? 'Você já tem uma assinatura ativa.' : mensagemDeErro(e))
    } finally {
      setOcupado(false)
    }
  }

  if (st.error) return <LoadError error={st.error} onRetry={st.reload} />
  if (st.loading || !st.data) return <Loading />
  const p = st.data
  const ativa = p.assinatura?.status === 'ATIVA'

  return (
    <div className="max-w-3xl">
      <PageHeader title="Plano Premium" lead="O selo não se compra: ele é conquistado com avaliações positivas de viajantes reais. Quem conquista pode contratar o Premium para ganhar destaque." />
      <section aria-labelledby="como-funciona" className="rounded-[var(--radius-card)] border border-line bg-canvas p-5">
        <h2 id="como-funciona" className="text-xl font-bold">
          Como funciona
        </h2>
        <ol className="mt-4 flex flex-col gap-4">
          {[
            { t: 'Preencha a ficha', d: 'Com medidas e fotos reais, do jeito que o local está hoje.', done: true },
            {
              t: `Receba ${p.progresso.minimo} avaliações positivas`,
              d: `Você tem ${p.progresso.avaliacoesPositivas} de ${p.progresso.minimo} (nota ${p.progresso.notaMinima} ou mais). Elas confirmam que a ficha bate com a realidade.`,
              done: p.seloVerificado,
            },
            { t: 'Selo concedido, Premium liberado', d: 'O selo aparece na sua página e você pode contratar o Premium. Avisamos por notificação.', done: p.elegivel },
          ].map((s, i) => (
            <li key={s.t} className="flex gap-3">
              <span className={cx('inline-flex size-9 shrink-0 items-center justify-center rounded-full font-bold tabular', s.done ? 'bg-ok text-white' : 'bg-surface text-ink-2 ring-1 ring-line-strong')}>
                {s.done ? <Check aria-hidden className="size-5" /> : i + 1}
                <span className="sr-only">{s.done ? 'Concluído:' : 'Pendente:'}</span>
              </span>
              <div>
                <p className="font-bold">{s.t}</p>
                <p className="text-ink-2">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="beneficios" className="mt-6 rounded-[var(--radius-card)] border border-line bg-canvas p-5">
        <h2 id="beneficios" className="text-xl font-bold">
          O que o Premium inclui
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {p.beneficios.map((b) => (
            <li key={b} className="flex gap-2">
              <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-ok" />
              {b}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.9375rem] text-ink-2">
          O Selo Acessibilidade Verificada não faz parte do pacote: ele aparece quando o critério de avaliações é atingido, com ou sem Premium. Nesta versão, a contratação
          é simulada e não envolve pagamento.
        </p>
      </section>

      <div className="mt-6">
        {erro && (
          <p role="alert" className="mb-4 font-semibold text-danger">
            {erro}
          </p>
        )}
        {ativa && p.assinatura ? (
          <div className="flex flex-col gap-4 rounded-[var(--radius-card)] bg-ok-soft p-5">
            <p role="status" className="flex items-center gap-2 font-semibold text-ok">
              <ShieldCheck aria-hidden className="size-5" />
              Plano Premium ativo até {formatData(p.assinatura.dataVencimento)}.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button disabled={ocupado} onClick={() => acao(parceiro.renovar, 'Assinatura renovada por mais 30 dias.')}>
                Renovar por mais 30 dias
              </Button>
              <Button
                variant="ghost"
                disabled={ocupado}
                onClick={() => window.confirm('Cancelar o Plano Premium agora? O destaque é desligado na hora.') && acao(parceiro.cancelar, 'Assinatura cancelada.')}
              >
                Cancelar assinatura
              </Button>
            </div>
          </div>
        ) : p.elegivel ? (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              if (!ciente) return setErro('Aceite os termos para contratar.')
              acao(parceiro.contratar, 'Plano Premium contratado por 30 dias.')
            }}
            className="flex flex-col gap-4"
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={ciente} onChange={(e) => (setCiente(e.target.checked), setErro(''))} className="mt-1 size-5" />
              Li e aceito os termos do Plano Premium (30 dias, contratação simulada).
            </label>
            <Button type="submit" className="sm:self-start" disabled={ocupado}>
              Contratar Premium
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-canvas p-5">
            <p className="font-semibold">Ainda não disponível para o seu estabelecimento</p>
            <ProgressBar value={Math.min(p.progresso.avaliacoesPositivas, p.progresso.minimo)} max={p.progresso.minimo} label="Avaliações positivas para liberar o Premium" />
            <p className="text-ink-2 tabular">
              {p.progresso.avaliacoesPositivas} de {p.progresso.minimo} avaliações positivas.
            </p>
            <Button disabled aria-describedby="premium-motivo" className="sm:self-start">
              Contratar Premium
            </Button>
            <p id="premium-motivo" className="text-sm text-ink-3">
              O botão é liberado quando o selo for conquistado.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Avaliações recebidas ---------- */

export function AvaliacoesParceiro() {
  const { usuario } = useSession()
  const premium = useApi(() => parceiro.premium(), [])
  const [pagina, setPagina] = useState(0)
  const [lista, setLista] = useState<AvaliacaoPublica[]>([])
  const st = useApi(
    usuario
      ? () =>
          avaliacoes.publicas(usuario.id, pagina, 10).then((r) => {
            setLista((old) => (pagina === 0 ? r.itens : [...old, ...r.itens]))
            return r
          })
      : null,
    [usuario?.id, pagina],
  )
  const notaMinima = premium.data?.progresso.notaMinima
  return (
    <div className="max-w-3xl">
      <PageHeader title="Avaliações recebidas" lead="Relatos de viajantes sobre a sua ficha. Avaliações não podem ser editadas ou removidas pelo estabelecimento." />
      {st.error ? (
        <LoadError error={st.error} onRetry={st.reload} />
      ) : lista.length ? (
        <>
          <ul className="flex flex-col gap-3">
            {lista.map((r) => (
              <li key={r.id} className="rounded-[var(--radius-card)] border border-line bg-canvas p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold">Viajante AcessoTrip</p>
                  <Stars value={r.nota} />
                </div>
                <p className="text-sm text-ink-3">Visita em {formatData(r.dataVisita)}</p>
                <p className="mt-2 whitespace-pre-line text-ink">{r.texto}</p>
                {notaMinima !== undefined && r.nota >= notaMinima && (
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ok-soft px-2.5 py-0.5 text-sm font-semibold text-ok">
                    <CircleCheck aria-hidden className="size-4" />
                    Conta para o selo
                  </p>
                )}
              </li>
            ))}
          </ul>
          {st.data && pagina + 1 < st.data.totalPaginas && (
            <Button variant="secondary" className="mt-4" disabled={st.loading} onClick={() => setPagina((p) => p + 1)}>
              {st.loading ? 'Carregando…' : 'Ver mais'}
            </Button>
          )}
        </>
      ) : st.loading ? (
        <Loading />
      ) : (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas p-5 text-ink-2">Seu estabelecimento ainda não recebeu avaliações.</p>
      )}
    </div>
  )
}

/* ---------- Notificações (RF23) ---------- */

const LINK_NOTIFICACAO: Record<Notificacao['tipo'], string | undefined> = {
  ELEGIBILIDADE_SELO: '/parceiro/premium',
  SISTEMA: '/parceiro/premium',
  MODERACAO: undefined,
}

export function Notificacoes() {
  const nav = useNavigate()
  const { notify } = useStore()
  const st = useApi(() => notificacoes.listar(false, 0, 50), [])

  const abrir = async (n: Notificacao) => {
    if (!n.lida) {
      try {
        await notificacoes.marcarLida(n.id)
        st.setData((old) => (old ? { ...old, naoLidas: Math.max(0, old.naoLidas - 1), itens: old.itens.map((x) => (x.id === n.id ? { ...x, lida: true } : x)) } : old!))
      } catch {
        /* segue para o destino mesmo assim */
      }
    }
    const to = LINK_NOTIFICACAO[n.tipo]
    if (to) nav(to)
  }

  if (st.error) return <LoadError error={st.error} onRetry={st.reload} />
  if (st.loading || !st.data) return <Loading />
  const { itens, naoLidas } = st.data
  return (
    <div className="max-w-2xl">
      <PageHeader title="Notificações" lead={naoLidas ? `${naoLidas} ${naoLidas === 1 ? 'não lida' : 'não lidas'}.` : 'Tudo lido.'} />
      {naoLidas > 0 && (
        <Button
          variant="secondary"
          className="mb-4"
          onClick={async () => {
            try {
              await notificacoes.marcarTodas()
              st.reload()
              notify('Todas as notificações foram marcadas como lidas.')
            } catch (e) {
              notify(mensagemDeErro(e))
            }
          }}
        >
          Marcar todas como lidas
        </Button>
      )}
      {itens.length ? (
        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-canvas">
          {itens.map((n) => (
            <li key={n.id}>
              <button type="button" onClick={() => abrir(n)} className="flex w-full gap-3 p-4 text-left hover:bg-surface">
                <Bell aria-hidden className={cx('mt-0.5 size-5 shrink-0', n.lida ? 'text-ink-3' : 'text-brand')} />
                <span>
                  <span className="block font-bold text-ink">
                    {!n.lida && <span className="mr-2 rounded-full bg-brand px-2 py-0.5 text-[0.8125rem] text-white">Nova</span>}
                    {n.mensagem}
                  </span>
                  <span className="block text-sm text-ink-3">{formatData(n.criadaEm)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-2">Você ainda não recebeu notificações.</p>
      )}
    </div>
  )
}
