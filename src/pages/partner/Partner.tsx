import { useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Check,
  ChevronLeft,
  CircleCheck,
  ClipboardList,
  Eye,
  Heart,
  MessageSquareText,
  ShieldCheck,
  Star,
  TrendingUp,
} from 'lucide-react'
import { ErrorSummary } from '../../components/ErrorSummary'
import { PageHeader } from '../../components/Layout'
import { Button, ButtonLink, ProgressBar, SelectField, StatusBadge, Stars, TextField, cx } from '../../components/ui'
import { CATEGORIES, PLACE_TYPE_LABEL, STATUS_LABEL, needById, summarize } from '../../data/domain'
import { REVIEWS } from '../../data/places'
import type { PlaceType } from '../../data/types'
import { cnpjValido, maskCnpj, setPartner, usePartner } from '../../state/partner'
import { useStore } from '../../state/store'
import { CategoryFields } from './FichaForm'

const UFS = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')

/* ---------- Cadastro empresarial (RF16) ---------- */

export function CadastroParceiro() {
  const nav = useNavigate()
  const [f, setF] = useState({ nome: '', cnpj: '', tipo: '' as PlaceType | '', endereco: '', cidade: '', uf: '', email: '', senha: '' })
  const [attempt, setAttempt] = useState(0)
  const errors = {
    nome: !f.nome.trim() ? 'Informe o nome do estabelecimento.' : undefined,
    cnpj: !cnpjValido(f.cnpj) ? 'CNPJ inválido. Confira os 14 números.' : undefined,
    tipo: !f.tipo ? 'Escolha o tipo de estabelecimento.' : undefined,
    endereco: !f.endereco.trim() ? 'Informe o endereço.' : undefined,
    cidade: !f.cidade.trim() ? 'Informe a cidade.' : undefined,
    uf: !f.uf ? 'Escolha o estado.' : undefined,
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) ? 'Informe um e-mail válido.' : undefined,
    senha: f.senha.length < 8 ? 'A senha precisa ter pelo menos 8 caracteres.' : undefined,
  }
  const show = attempt > 0
  const e = (k: keyof typeof errors) => (show ? errors[k] : undefined)
  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    setAttempt((a) => a + 1)
    if (Object.values(errors).some(Boolean)) return
    setPartner((s) => ({
      empresa: { ...s.empresa, nome: f.nome, cnpj: f.cnpj, tipo: f.tipo as PlaceType, endereco: f.endereco, cidade: f.cidade, uf: f.uf, email: f.email },
      onboardingDone: false,
      ficha: s.ficha.map((i) => ({ ...i, status: 'nao_informado', valor: undefined, observacao: undefined })),
      fotos: [],
      positivas: 0,
    }))
    nav('/parceiro/onboarding')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:py-14">
      <PageHeader
        title="Cadastrar meu negócio"
        lead="Depois do cadastro você preenche a ficha de acessibilidade em 5 etapas. Leva cerca de 15 minutos e dá para salvar e voltar depois."
      />
      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <ErrorSummary errors={show ? errors : {}} attempt={attempt} />
        <TextField id="nome" label="Nome do estabelecimento" autoComplete="organization" value={f.nome} onChange={(x) => setF({ ...f, nome: x.target.value })} error={e('nome')} />
        <TextField
          id="cnpj"
          label="CNPJ"
          inputMode="numeric"
          placeholder="00.000.000/0000-00"
          value={f.cnpj}
          onChange={(x) => setF({ ...f, cnpj: maskCnpj(x.target.value) })}
          error={e('cnpj')}
          className="tabular"
        />
        <SelectField id="tipo" label="Tipo de estabelecimento" value={f.tipo} onChange={(x) => setF({ ...f, tipo: x.target.value as PlaceType })} error={e('tipo')}>
          <option value="">Escolha</option>
          {(['HOTEL', 'POUSADA', 'RESTAURANTE'] as PlaceType[]).map((t) => (
            <option key={t} value={t}>
              {PLACE_TYPE_LABEL[t]}
            </option>
          ))}
        </SelectField>
        <TextField id="endereco" label="Endereço" autoComplete="street-address" value={f.endereco} onChange={(x) => setF({ ...f, endereco: x.target.value })} error={e('endereco')} />
        <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
          <TextField id="cidade" label="Cidade" autoComplete="address-level2" value={f.cidade} onChange={(x) => setF({ ...f, cidade: x.target.value })} error={e('cidade')} />
          <SelectField id="uf" label="Estado" value={f.uf} onChange={(x) => setF({ ...f, uf: x.target.value })} error={e('uf')}>
            <option value="">UF</option>
            {UFS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </SelectField>
        </div>
        <TextField id="email" label="E-mail de acesso" type="email" autoComplete="email" value={f.email} onChange={(x) => setF({ ...f, email: x.target.value })} error={e('email')} />
        <TextField id="senha" label="Senha" type="password" hint="Mínimo de 8 caracteres." autoComplete="new-password" value={f.senha} onChange={(x) => setF({ ...f, senha: x.target.value })} error={e('senha')} />
        <Button type="submit" block className="mt-2">
          Criar conta e começar a ficha
        </Button>
        <p className="text-ink-2">
          Já tem cadastro?{' '}
          <Link to="/parceiro" className="font-semibold text-brand">
            Entrar no painel
          </Link>
        </p>
      </form>
    </div>
  )
}

/* ---------- Onboarding guiado (RF17) ---------- */

export function Onboarding() {
  const nav = useNavigate()
  const { ficha } = usePartner()
  const [step, setStep] = useState(0)
  const headRef = useRef<HTMLHeadingElement>(null)
  const cat = CATEGORIES[step]
  const last = step === CATEGORIES.length - 1

  const go = (n: number) => {
    setStep(n)
    window.scrollTo(0, 0)
    window.setTimeout(() => headRef.current?.focus(), 0)
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Ficha de acessibilidade" lead="Responda o que existe hoje no seu estabelecimento. “Não informado” também é uma resposta válida, e você pode completar depois." />
      <nav aria-label="Etapas da ficha" className="mb-6">
        <ol className="grid grid-cols-5 gap-1.5">
          {CATEGORIES.map((c, i) => {
            const done = summarize(ficha.filter((x) => x.categoria === c.id)) !== 'nao_informado'
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === step ? 'step' : undefined}
                  className="flex w-full flex-col items-start gap-1.5 pt-1 text-left"
                >
                  <span className={cx('h-1.5 w-full rounded-full', i === step ? 'bg-brand' : done ? 'bg-ok' : 'bg-line')} />
                  <span className={cx('hidden text-sm font-semibold sm:block', i === step ? 'text-brand' : 'text-ink-3')}>
                    {c.label}
                  </span>
                  <span className="sr-only">
                    {i === step ? ', etapa atual' : done ? ', preenchida' : ', não iniciada'}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>
      <p className="text-sm font-semibold text-ink-3 tabular">
        Etapa {step + 1} de {CATEGORIES.length}
      </p>
      <h2 ref={headRef} tabIndex={-1} className="text-[1.5rem] font-bold outline-none">
        {cat.label}
      </h2>
      <p className="mb-5 text-ink-2">{cat.description}</p>
      <CategoryFields categoria={cat.id} />
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] mt-6 flex justify-between gap-3 border-t border-line bg-surface py-3 md:bottom-0">
        <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>
          <ChevronLeft aria-hidden className="size-5" />
          Anterior
        </Button>
        {last ? (
          <Button
            onClick={() => {
              setPartner({ onboardingDone: true })
              nav('/parceiro/preview?novo=1')
            }}
          >
            <Check aria-hidden className="size-5" />
            Concluir e ver a ficha
          </Button>
        ) : (
          <Button onClick={() => go(step + 1)}>
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
  const { ficha } = usePartner()
  const { notify } = useStore()
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Editar ficha técnica"
        lead="As mudanças são salvas automaticamente e aparecem na sua página pública na hora."
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <ButtonLink to="/parceiro/preview" variant="secondary">
          <Eye aria-hidden className="size-5" />
          Ver como os viajantes veem
        </ButtonLink>
      </div>
      <div className="flex flex-col gap-3">
        {CATEGORIES.map((c) => {
          const st = summarize(ficha.filter((x) => x.categoria === c.id))
          return (
            <details key={c.id} className="group rounded-[var(--radius-card)] border border-line bg-canvas" onToggle={(e) => (e.currentTarget.open ? undefined : notify(`${c.label}: alterações salvas.`))}>
              <summary className="flex min-h-14 cursor-pointer list-none flex-wrap items-center justify-between gap-x-3 gap-y-2 px-5 py-3 [&::-webkit-details-marker]:hidden">
                <span className="text-lg font-bold">{c.label}</span>
                <StatusBadge status={st} size="sm" />
              </summary>
              <div className="border-t border-line bg-surface p-4">
                <CategoryFields categoria={c.id} />
              </div>
            </details>
          )
        })}
      </div>
    </div>
  )
}

/* ---------- Dashboard (RF21, RF22) ---------- */

const METRICS = {
  '7': { visitas: 312, visitasAnt: 278, favoritos: 21, avaliacoes: 3, nota: 4.3 },
  '30': { visitas: 1248, visitasAnt: 1114, favoritos: 86, avaliacoes: 8, nota: 4.4 },
  '90': { visitas: 3410, visitasAnt: 2980, favoritos: 203, avaliacoes: 19, nota: 4.4 },
} as const
type Period = keyof typeof METRICS

export function Dashboard() {
  const p = usePartner()
  const [period, setPeriod] = useState<Period>('30')
  const m = METRICS[period]
  const delta = Math.round(((m.visitas - m.visitasAnt) / m.visitasAnt) * 100)
  const falta = Math.max(0, p.minimoSelo - p.positivas)
  const pendentes = CATEGORIES.filter((c) => summarize(p.ficha.filter((x) => x.categoria === c.id)) === 'nao_informado')
  const naoInf = p.ficha.filter((i) => i.status === 'nao_informado').length

  return (
    <>
      <PageHeader title={p.empresa.nome} lead="Desempenho da sua página e da ficha de acessibilidade." />

      {!p.onboardingDone && (
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
            {(
              [
                ['7', '7 dias'],
                ['30', '30 dias'],
                ['90', '90 dias'],
              ] as [Period, string][]
            ).map(([k, l]) => (
              <button
                key={k}
                type="button"
                aria-pressed={period === k}
                onClick={() => setPeriod(k)}
                className={cx('min-h-10 rounded-full px-4 text-[0.9375rem] font-semibold', period === k ? 'bg-brand-ink text-white' : 'text-ink-2 hover:text-ink')}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <dl className="grid grid-cols-2 divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-canvas md:grid-cols-4 md:divide-x">
          {[
            { Icon: Eye, label: 'Visitas à página', value: m.visitas.toLocaleString('pt-BR'), extra: `${delta > 0 ? '+' : ''}${delta}% vs. período anterior` },
            { Icon: Heart, label: 'Salvaram nos favoritos', value: String(m.favoritos) },
            { Icon: MessageSquareText, label: 'Novas avaliações', value: String(m.avaliacoes) },
            { Icon: Star, label: 'Nota média', value: m.nota.toLocaleString('pt-BR', { minimumFractionDigits: 1 }), extra: 'de 5' },
          ].map(({ Icon, label, value, extra }, i) => (
            <div key={label} className={cx('p-4 md:p-5', i < 2 && 'border-b border-line md:border-b-0', i % 2 === 0 && 'border-r border-line md:border-r-0')}>
              <dt className="flex items-center gap-1.5 text-[0.9375rem] text-ink-2">
                <Icon aria-hidden className="size-4" />
                {label}
              </dt>
              <dd className="mt-1 text-[1.75rem] font-bold leading-tight text-ink tabular">{value}</dd>
              {extra && (
                <dd className={cx('text-sm tabular', delta > 0 && i === 0 ? 'flex items-center gap-1 font-semibold text-ok' : 'text-ink-3')}>
                  {delta > 0 && i === 0 && <TrendingUp aria-hidden className="size-4" />}
                  {extra}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="selo" className="rounded-[var(--radius-card)] border border-line bg-canvas p-5">
          <h2 id="selo" className="flex items-center gap-2 text-xl font-bold">
            <ShieldCheck aria-hidden className="size-6 text-brand" />
            Selo Acessibilidade Verificada
          </h2>
          <p className="mt-1 text-ink-2">O selo vem de avaliações positivas (nota 4 ou 5) de viajantes que visitaram o local.</p>
          <div className="mt-5 flex items-baseline justify-between">
            <p id="selo-prog" className="font-semibold">
              Avaliações positivas
            </p>
            <p className="text-lg font-bold tabular">
              {p.positivas} de {p.minimoSelo}
            </p>
          </div>
          <div className="mt-2">
            <ProgressBar value={p.positivas} max={p.minimoSelo} label="Progresso para o Selo" />
          </div>
          <p className="mt-3 text-ink">
            {falta > 0 ? (
              <>
                Faltam <strong>{falta}</strong> {falta === 1 ? 'avaliação positiva' : 'avaliações positivas'} para liberar o selo e o Plano Premium.
              </>
            ) : (
              <strong>Critério atingido. Você já pode contratar o Plano Premium.</strong>
            )}
          </p>
          <Link to="/parceiro/premium" className="mt-4 inline-flex min-h-11 items-center gap-1 font-semibold text-brand">
            Como funciona o selo e o Premium
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </section>

        <section aria-labelledby="pendencias" className="rounded-[var(--radius-card)] border border-line bg-canvas p-5">
          <h2 id="pendencias" className="flex items-center gap-2 text-xl font-bold">
            <ClipboardList aria-hidden className="size-6 text-brand" />
            Sua ficha
          </h2>
          {naoInf === 0 ? (
            <p className="mt-2 flex items-center gap-2 text-ok">
              <CircleCheck aria-hidden className="size-5" />
              Todos os itens respondidos.
            </p>
          ) : (
            <p className="mt-1 text-ink-2">
              <strong className="text-ink tabular">{naoInf}</strong> {naoInf === 1 ? 'item está' : 'itens estão'} como “não informado”. Fichas completas aparecem melhor nas buscas filtradas.
            </p>
          )}
          {pendentes.length > 0 && (
            <ul className="mt-3 list-disc pl-6 text-ink">
              {pendentes.map((c) => (
                <li key={c.id}>{c.label}: nenhum item respondido</li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink to="/parceiro/ficha">Completar ficha</ButtonLink>
            <ButtonLink to="/parceiro/preview" variant="ghost">
              Ver página pública
            </ButtonLink>
          </div>
        </section>
      </div>
    </>
  )
}

/* ---------- Preview da ficha ---------- */

export function Preview() {
  const p = usePartner()
  const novo = new URLSearchParams(location.search).get('novo') === '1'
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Como os viajantes veem sua ficha"
        lead={novo ? 'Ficha concluída. Ela já pode aparecer nas buscas. Confira e ajuste o que precisar.' : 'Prévia da sua página pública.'}
      />
      <div className="rounded-[var(--radius-card)] border border-line bg-canvas p-5">
        <p className="font-semibold text-ink-3">
          {PLACE_TYPE_LABEL[p.empresa.tipo]} · {p.empresa.cidade}, {p.empresa.uf}
        </p>
        <p className="text-[1.5rem] font-bold">{p.empresa.nome}</p>
        <dl className="mt-4 divide-y divide-line border-y border-line">
          {CATEGORIES.map((c) => {
            const items = p.ficha.filter((x) => x.categoria === c.id)
            return (
              <div key={c.id} className="py-3">
                <dt className="flex items-center justify-between gap-2">
                  <span className="font-bold">{c.label}</span>
                  <StatusBadge status={summarize(items)} size="sm" />
                </dt>
                <dd>
                  <ul className="mt-2 flex flex-col gap-1 text-[0.9375rem]">
                    {items.map((i) => (
                      <li key={i.id} className="flex justify-between gap-3">
                        <span className="text-ink-2">{i.atributo}</span>
                        <span className="shrink-0 font-semibold tabular">{i.valor ?? STATUS_LABEL[i.status]}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )
          })}
        </dl>
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

/* ---------- Plano Premium (RF23, RF24) ---------- */

export function Premium() {
  const p = usePartner()
  const { notify } = useStore()
  const elegivel = p.positivas >= p.minimoSelo
  const [ciente, setCiente] = useState(false)
  const [erro, setErro] = useState(false)
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Plano Premium"
        lead="O selo não se compra: ele é conquistado com avaliações positivas de viajantes reais. Quem conquista pode contratar o Premium para ganhar destaque."
      />
      <section aria-labelledby="como-funciona" className="rounded-[var(--radius-card)] border border-line bg-canvas p-5">
        <h2 id="como-funciona" className="text-xl font-bold">
          Como funciona
        </h2>
        <ol className="mt-4 flex flex-col gap-4">
          {[
            { t: 'Preencha a ficha', d: 'Com medidas e fotos reais, do jeito que o local está hoje.', done: p.onboardingDone },
            { t: `Receba ${p.minimoSelo} avaliações positivas`, d: `Você tem ${p.positivas} de ${p.minimoSelo}. Elas confirmam que a ficha bate com a realidade.`, done: elegivel },
            { t: 'Selo concedido, Premium liberado', d: 'O selo aparece na sua página e você pode contratar o Premium para ganhar destaque. Avisamos por notificação.', done: p.premium },
          ].map((s, i) => (
            <li key={s.t} className="flex gap-3">
              <span
                className={cx(
                  'inline-flex size-9 shrink-0 items-center justify-center rounded-full font-bold tabular',
                  s.done ? 'bg-ok text-white' : 'bg-surface text-ink-2 ring-1 ring-line-strong',
                )}
              >
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
          {['Destaque nos resultados do seu destino', 'Perfil enriquecido: mais fotos e descrição longa', 'Relatório mensal de visitas e avaliações'].map((b) => (
            <li key={b} className="flex gap-2">
              <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-ok" />
              {b}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.9375rem] text-ink-2">O Selo Acessibilidade Verificada não faz parte do pacote: ele aparece automaticamente quando o critério de avaliações é atingido, com ou sem Premium.</p>
        <p className="mt-2 text-[0.9375rem] text-ink-3">Valores definidos pela equipe AcessoTrip na fase de lançamento.</p>
      </section>

      <div className="mt-6">
        {p.premium ? (
          <p role="status" className="flex items-center gap-2 rounded-[var(--radius-card)] bg-ok-soft p-4 font-semibold text-ok">
            <ShieldCheck aria-hidden className="size-5" />
            Plano Premium ativo.
          </p>
        ) : elegivel ? (
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              if (!ciente) return setErro(true)
              setPartner({ premium: true })
              notify('Plano Premium contratado.')
            }}
            className="flex flex-col gap-4"
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={ciente} onChange={(e) => (setCiente(e.target.checked), setErro(false))} aria-describedby={erro ? 'ciente-erro' : undefined} aria-invalid={erro || undefined} className="mt-1 size-5" />
              Li e aceito os termos do Plano Premium.
            </label>
            {erro && (
              <p id="ciente-erro" className="-mt-2 text-sm font-semibold text-danger">
                Aceite os termos para contratar.
              </p>
            )}
            <Button type="submit" className="sm:self-start">
              Contratar Premium
            </Button>
          </form>
        ) : (
          <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-canvas p-5">
            <p className="font-semibold">Ainda não disponível para o seu estabelecimento</p>
            <ProgressBar value={p.positivas} max={p.minimoSelo} label="Avaliações positivas para liberar o Premium" />
            <p className="text-ink-2 tabular">
              {p.positivas} de {p.minimoSelo} avaliações positivas.
            </p>
            <Button disabled aria-describedby="premium-motivo" className="sm:self-start">
              Contratar Premium
            </Button>
            <p id="premium-motivo" className="text-sm text-ink-3">
              O botão é liberado quando o critério de avaliações for atingido.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- Dados da empresa (RF25) ---------- */

export function Empresa() {
  const p = usePartner()
  const { notify } = useStore()
  const [f, setF] = useState(p.empresa)
  const [attempt, setAttempt] = useState(0)
  const errors = {
    nome: !f.nome.trim() ? 'Informe o nome.' : undefined,
    telefone: f.telefone.replace(/\D/g, '').length < 10 ? 'Informe o telefone com DDD.' : undefined,
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email) ? 'Informe um e-mail válido.' : undefined,
  }
  const show = attempt > 0
  return (
    <div className="max-w-2xl">
      <PageHeader title="Dados da empresa" />
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          setAttempt((a) => a + 1)
          if (Object.values(errors).some(Boolean)) return
          setPartner({ empresa: f })
          notify('Dados atualizados.')
        }}
        className="flex flex-col gap-5"
      >
        <ErrorSummary errors={show ? errors : {}} attempt={attempt} />
        <TextField id="nome" label="Nome do estabelecimento" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} error={show ? errors.nome : undefined} />
        <TextField id="cnpj" label="CNPJ" value={f.cnpj} readOnly hint="Para mudar o CNPJ, fale com o suporte." className="bg-surface tabular" />
        <TextField id="endereco" label="Endereço" value={f.endereco} onChange={(e) => setF({ ...f, endereco: e.target.value })} />
        <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
          <TextField id="cidade" label="Cidade" value={f.cidade} onChange={(e) => setF({ ...f, cidade: e.target.value })} />
          <SelectField id="uf" label="Estado" value={f.uf} onChange={(e) => setF({ ...f, uf: e.target.value })}>
            {UFS.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </SelectField>
        </div>
        <TextField id="telefone" label="Telefone para viajantes" type="tel" autoComplete="tel" value={f.telefone} onChange={(e) => setF({ ...f, telefone: e.target.value })} error={show ? errors.telefone : undefined} className="tabular" />
        <TextField id="email" label="E-mail de acesso" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={show ? errors.email : undefined} />
        <Button type="submit" className="sm:self-start">
          Salvar alterações
        </Button>
      </form>
    </div>
  )
}

/* ---------- Avaliações recebidas ---------- */

export function AvaliacoesParceiro() {
  const reviews = useMemo(() => REVIEWS.filter((r) => r.placeId === 'pousada-coroa'), [])
  return (
    <div className="max-w-3xl">
      <PageHeader title="Avaliações recebidas" lead="Relatos de viajantes sobre a sua ficha. Avaliações não podem ser editadas ou removidas pelo estabelecimento." />
      <ul className="flex flex-col gap-3">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-[var(--radius-card)] border border-line bg-canvas p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold">{r.autor}</p>
              <Stars value={r.nota} />
            </div>
            <p className="text-sm text-ink-3">{r.necessidades.map((n) => needById(n).label).join(', ')}</p>
            <p className="mt-2 text-ink">{r.texto}</p>
            {r.nota >= 4 && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ok-soft px-2.5 py-0.5 text-sm font-semibold text-ok">
                <CircleCheck aria-hidden className="size-4" />
                Conta para o selo
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- Notificações (RF23) ---------- */

export function Notificacoes() {
  const p = usePartner()
  const falta = p.minimoSelo - p.positivas
  const items = [
    {
      id: 'n1',
      title: falta <= 2 && falta > 0 ? `Faltam ${falta} avaliações para o Selo` : falta <= 0 ? 'Você atingiu o critério do Selo' : 'Nova avaliação recebida',
      body: falta <= 0 ? 'O Plano Premium já está liberado para contratação.' : 'Ana M. avaliou sua pousada com nota 5.',
      to: falta <= 0 ? '/parceiro/premium' : '/parceiro/avaliacoes',
      novo: true,
    },
    { id: 'n2', title: 'Ficha atualizada', body: 'Suas alterações em Sanitários foram publicadas.', to: '/parceiro/preview', novo: false },
  ]
  return (
    <div className="max-w-2xl">
      <PageHeader title="Notificações" />
      <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-canvas">
        {items.map((n) => (
          <li key={n.id}>
            <Link to={n.to} className="flex gap-3 p-4 no-underline hover:bg-surface">
              <Bell aria-hidden className={cx('mt-0.5 size-5 shrink-0', n.novo ? 'text-brand' : 'text-ink-3')} />
              <span>
                <span className="block font-bold text-ink">
                  {n.novo && <span className="mr-2 rounded-full bg-brand px-2 py-0.5 text-[0.8125rem] text-white">Nova</span>}
                  {n.title}
                </span>
                <span className="block text-ink-2">{n.body}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
