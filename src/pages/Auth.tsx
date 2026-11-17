import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, MailCheck } from 'lucide-react'
import { ErrorSummary } from '../components/ErrorSummary'
import { Button, TextField } from '../components/ui'
import { useStore } from '../state/store'

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

function AuthFrame({ title, lead, children, foot }: { title: string; lead?: string; children: ReactNode; foot?: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-10 md:py-16">
      <h1 className="text-[1.875rem] font-bold leading-tight text-ink outline-none">{title}</h1>
      {lead && <p className="mt-2 text-[1.0625rem] text-ink-2">{lead}</p>}
      <div className="mt-8">{children}</div>
      {foot && <div className="mt-8 border-t border-line pt-6 text-ink-2">{foot}</div>}
    </div>
  )
}

function PasswordField({
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

export function Cadastro() {
  const nav = useNavigate()
  const { signIn, notify } = useStore()
  const [f, setF] = useState({ nome: '', email: '', senha: '' })
  const [attempt, setAttempt] = useState(0)
  const errors = {
    nome: !f.nome.trim() ? 'Informe seu nome.' : undefined,
    email: !emailOk(f.email) ? 'Informe um e-mail válido, como nome@exemplo.com.' : undefined,
    senha: f.senha.length < 8 ? 'A senha precisa ter pelo menos 8 caracteres.' : undefined,
  }
  const show = attempt > 0
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setAttempt((a) => a + 1)
    if (Object.values(errors).some(Boolean)) return
    signIn({ nome: f.nome.trim().split(' ')[0], email: f.email, necessidades: [] })
    notify('Conta criada. Agora conte o que você precisa.')
    nav('/perfil/necessidades?primeiro=1')
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
        <TextField id="nome" label="Nome" autoComplete="name" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} error={show ? errors.nome : undefined} />
        <TextField id="email" label="E-mail" type="email" autoComplete="email" inputMode="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={show ? errors.email : undefined} />
        <PasswordField id="senha" label="Senha" hint="Mínimo de 8 caracteres." autoComplete="new-password" value={f.senha} onChange={(v) => setF({ ...f, senha: v })} error={show ? errors.senha : undefined} />
        <Button type="submit" block className="mt-2">
          Criar conta
        </Button>
      </form>
    </AuthFrame>
  )
}

export function Entrar() {
  const nav = useNavigate()
  const { signIn } = useStore()
  const [f, setF] = useState({ email: '', senha: '' })
  const [attempt, setAttempt] = useState(0)
  const errors = {
    email: !emailOk(f.email) ? 'Informe o e-mail da sua conta.' : undefined,
    senha: !f.senha ? 'Informe sua senha.' : undefined,
  }
  const show = attempt > 0
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setAttempt((a) => a + 1)
    if (Object.values(errors).some(Boolean)) return
    signIn({ nome: 'Renata', email: f.email, necessidades: ['mobilidade'] })
    nav('/inicio')
  }
  return (
    <AuthFrame
      title="Entrar"
      foot={
        <>
          Ainda não tem conta?{' '}
          <Link to="/cadastro" className="font-semibold text-brand">
            Criar conta de viajante
          </Link>
          <br />
          Estabelecimento parceiro?{' '}
          <Link to="/parceiro" className="font-semibold text-brand">
            Acessar painel do parceiro
          </Link>
        </>
      }
    >
      <form noValidate onSubmit={submit} className="flex flex-col gap-5">
        <ErrorSummary errors={show ? errors : {}} attempt={attempt} />
        <TextField id="email" label="E-mail" type="email" autoComplete="email" inputMode="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={show ? errors.email : undefined} />
        <PasswordField id="senha" label="Senha" autoComplete="current-password" value={f.senha} onChange={(v) => setF({ ...f, senha: v })} error={show ? errors.senha : undefined} />
        <Link to="/recuperar-senha" className="-mt-2 inline-flex min-h-11 items-center self-start font-semibold text-brand">
          Esqueci minha senha
        </Link>
        <Button type="submit" block>
          Entrar
        </Button>
      </form>
    </AuthFrame>
  )
}

export function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [sent, setSent] = useState(false)
  const error = !emailOk(email) ? 'Informe um e-mail válido.' : undefined
  if (sent)
    return (
      <AuthFrame title="Confira seu e-mail">
        <div role="status" className="flex gap-3 rounded-[var(--radius-card)] bg-ok-soft p-4 text-ok">
          <MailCheck aria-hidden className="size-6 shrink-0" />
          <p className="text-ink">
            Se existir uma conta com <strong>{email}</strong>, enviamos um link para criar uma nova senha. O link vale por 1
            hora.
          </p>
        </div>
        <Link to="/entrar" className="mt-6 inline-flex min-h-11 items-center font-semibold text-brand">
          Voltar para Entrar
        </Link>
      </AuthFrame>
    )
  return (
    <AuthFrame title="Recuperar senha" lead="Enviaremos um link para você criar uma nova senha.">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          setAttempt((a) => a + 1)
          if (!error) setSent(true)
        }}
        className="flex flex-col gap-5"
      >
        <ErrorSummary errors={attempt ? { email: error } : {}} attempt={attempt} />
        <TextField id="email" label="E-mail da conta" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={attempt ? error : undefined} />
        <Button type="submit" block>
          Enviar link
        </Button>
        <Link to="/entrar" className="inline-flex min-h-11 items-center justify-center font-semibold text-brand">
          Voltar para Entrar
        </Link>
      </form>
    </AuthFrame>
  )
}
