import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { ApiError, mensagemDeErro } from '../api/client'
import { ErrorSummary } from '../components/ErrorSummary'
import { Button, Notice, TextField } from '../components/ui'
import { rotaInicial, useSession } from '../state/session'
import { useStore } from '../state/store'

// eslint-disable-next-line react-refresh/only-export-components
export const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

export function AuthFrame({ title, lead, children, foot }: { title: string; lead?: string; children: ReactNode; foot?: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-10 md:py-16">
      <h1 className="text-[1.875rem] font-bold leading-tight text-ink outline-none">{title}</h1>
      {lead && <p className="mt-2 text-[1.0625rem] text-ink-2">{lead}</p>}
      <div className="mt-8">{children}</div>
      {foot && <div className="mt-8 border-t border-line pt-6 text-ink-2">{foot}</div>}
    </div>
  )
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  hint?: string
  autoComplete: string
}) {
  const [show, setShow] = useState(false)
  return (
    <TextField
      id={id}
      label={label}
      hint={hint}
      type={show ? 'text' : 'password'}
      autoComplete={autoComplete}
      maxLength={72}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      trailing={
        <button
          type="button"
          aria-pressed={show}
          onClick={() => setShow((s) => !s)}
          className="inline-flex size-11 items-center justify-center rounded-[var(--radius-control)] text-ink-2 hover:bg-surface"
        >
          {show ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
          <span className="sr-only">Mostrar senha</span>
        </button>
      }
    />
  )
}

/** Junta erros locais com os erros devolvidos pela API (por campo ou geral). */
// eslint-disable-next-line react-refresh/only-export-components
export function useServerErrors() {
  const [server, setServer] = useState<Record<string, string>>({})
  const capture = (e: unknown, campoConflito?: string) => {
    if (e instanceof ApiError && e.erros.length) setServer(e.porCampo())
    else if (e instanceof ApiError && e.status === 409 && campoConflito) setServer({ [campoConflito]: e.message })
    else setServer({ geral: mensagemDeErro(e) })
  }
  return { server, setServer, capture }
}

export function Cadastro() {
  const nav = useNavigate()
  const { cadastrarViajante } = useSession()
  const { notify } = useStore()
  const [f, setF] = useState({ nome: '', email: '', senha: '' })
  const [attempt, setAttempt] = useState(0)
  const [sending, setSending] = useState(false)
  const { server, setServer, capture } = useServerErrors()
  const local = {
    nome: !f.nome.trim() ? 'Informe seu nome.' : undefined,
    email: !emailOk(f.email) ? 'Informe um e-mail válido, como nome@exemplo.com.' : undefined,
    senha: f.senha.length < 8 ? 'A senha precisa ter pelo menos 8 caracteres.' : undefined,
  }
  const errors = { ...local, ...server }
  const show = attempt > 0
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setServer({})
    setAttempt((a) => a + 1)
    if (Object.values(local).some(Boolean)) return
    setSending(true)
    try {
      await cadastrarViajante(f.nome.trim(), f.email.trim(), f.senha)
      notify('Conta criada. Agora conte o que você precisa.')
      nav('/perfil/necessidades?primeiro=1')
    } catch (err) {
      capture(err, 'email')
      setAttempt((a) => a + 1)
    } finally {
      setSending(false)
    }
  }
  return (
    <AuthFrame
      title="Criar conta de viajante"
      lead="Com uma conta você salva favoritos, registra suas experiências e recebe resultados de acordo com suas necessidades."
      foot={
        <>
          Já tem conta?{' '}
          <Link to="/entrar" className="font-semibold text-brand">
            Entrar
          </Link>
          <br />
          É um estabelecimento?{' '}
          <Link to="/parceiro/cadastro" className="font-semibold text-brand">
            Cadastre seu negócio
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <ErrorSummary errors={show ? errors : {}} attempt={attempt} />
        <TextField id="nome" label="Nome" autoComplete="name" maxLength={120} value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} error={show ? errors.nome : undefined} />
        <TextField id="email" label="E-mail" type="email" autoComplete="email" inputMode="email" maxLength={254} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={show ? errors.email : undefined} />
        <PasswordField id="senha" label="Senha" hint="De 8 a 72 caracteres." autoComplete="new-password" value={f.senha} onChange={(v) => setF({ ...f, senha: v })} error={show ? errors.senha : undefined} />
        <Button type="submit" block className="mt-2" disabled={sending}>
          {sending ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>
    </AuthFrame>
  )
}

export function Entrar() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const { entrar, expirou } = useSession()
  const [f, setF] = useState({ email: '', senha: '' })
  const [attempt, setAttempt] = useState(0)
  const [sending, setSending] = useState(false)
  const { server, setServer, capture } = useServerErrors()
  const local = {
    email: !emailOk(f.email) ? 'Informe o e-mail da sua conta.' : undefined,
    senha: !f.senha ? 'Informe sua senha.' : undefined,
  }
  const errors = { ...local, ...server }
  const show = attempt > 0
  const volta = params.get('volta')
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setServer({})
    setAttempt((a) => a + 1)
    if (Object.values(local).some(Boolean)) return
    setSending(true)
    try {
      const u = await entrar(f.email.trim(), f.senha)
      // Só volta para rotas internas (evita redirecionamento aberto)
      const destino = volta && volta.startsWith('/') && !volta.startsWith('//') ? volta : rotaInicial(u.perfil)
      nav(destino, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setServer({ senha: 'E-mail ou senha incorretos.' })
      else capture(err)
      setAttempt((a) => a + 1)
    } finally {
      setSending(false)
    }
  }
  return (
    <AuthFrame
      title="Entrar"
      lead="Viajantes e estabelecimentos parceiros entram por aqui."
      foot={
        <>
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-semibold text-brand">
            Criar conta de viajante
          </Link>
          <br />
          Tem um estabelecimento?{' '}
          <Link to="/parceiro/cadastro" className="font-semibold text-brand">
            Cadastre seu negócio
          </Link>
        </>
      }
    >
      {expirou && (
        <div className="mb-5">
          <Notice>Sua sessão expirou. Entre novamente para continuar.</Notice>
        </div>
      )}
      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <ErrorSummary errors={show ? errors : {}} attempt={attempt} />
        <TextField id="email" label="E-mail" type="email" autoComplete="email" inputMode="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={show ? errors.email : undefined} />
        <PasswordField id="senha" label="Senha" autoComplete="current-password" value={f.senha} onChange={(v) => setF({ ...f, senha: v })} error={show ? errors.senha : undefined} />
        <Button type="submit" block disabled={sending}>
          {sending ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </AuthFrame>
  )
}
