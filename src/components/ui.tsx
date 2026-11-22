import {
  forwardRef,
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { Accessibility, CircleAlert, CircleCheck, CircleHelp, CircleMinus, CircleX, Ear, Eye, LoaderCircle, Star, ShieldCheck } from 'lucide-react'
import { mensagemDeErro } from '../api/client'
import { STATUS_LABEL, needMeta } from '../data/domain'
import type { AggStatus, NeedCode } from '../data/types'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

/* ---------- Buttons ---------- */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
const base =
  'inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-[var(--radius-control)] font-semibold text-base transition-colors duration-150 disabled:cursor-not-allowed select-none'
const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover disabled:bg-line disabled:text-ink-3',
  secondary: 'bg-canvas text-brand border border-brand hover:bg-brand-soft disabled:border-line disabled:text-ink-3',
  ghost: 'text-brand hover:bg-brand-soft disabled:text-ink-3',
  danger: 'bg-danger text-white hover:bg-[#8f1c13]',
}

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  block?: boolean
}
export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = 'primary', block, className, type = 'button', ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={cx(base, variants[variant], block && 'w-full', className)} {...rest} />
})

export function ButtonLink({ variant = 'primary', block, className, ...rest }: LinkProps & { variant?: Variant; block?: boolean }) {
  return <Link className={cx(base, variants[variant], block && 'w-full', 'no-underline', className)} {...rest} />
}

/* ---------- Form fields ---------- */

interface FieldShell {
  label: string
  hint?: string
  error?: string
  optional?: boolean
}

function FieldFrame({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: FieldShell & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-semibold text-ink">
        {label}
        {optional && <span className="font-normal text-ink-3"> (opcional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-ink-3 -mt-0.5">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm font-semibold text-danger">
          <CircleX aria-hidden className="size-4 mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

const control =
  'w-full min-h-12 rounded-[var(--radius-control)] border bg-canvas px-4 text-base text-ink placeholder:text-ink-3 transition-colors hover:border-ink-3'

function describedBy(id: string, hint?: string, error?: string) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
}

export const TextField = forwardRef<
  HTMLInputElement,
  FieldShell & InputHTMLAttributes<HTMLInputElement> & { trailing?: ReactNode }
>(function TextField({ label, hint, error, optional, id, className, trailing, ...rest }, ref) {
    const auto = useId()
    const fid = id ?? auto
    return (
      <FieldFrame id={fid} label={label} hint={hint} error={error} optional={optional}>
        <div className="relative">
          <input
            ref={ref}
            id={fid}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(fid, hint, error)}
            required={!optional}
            className={cx(control, error ? 'border-danger border-2' : 'border-line-strong', trailing ? 'pr-14' : undefined, className)}
            {...rest}
          />
          {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
        </div>
      </FieldFrame>
    )
})

export function TextArea({
  label,
  hint,
  error,
  optional,
  id,
  className,
  ...rest
}: FieldShell & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <FieldFrame id={fid} label={label} hint={hint} error={error} optional={optional}>
      <textarea
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fid, hint, error)}
        required={!optional}
        className={cx(control, 'py-3 min-h-32 leading-relaxed', error ? 'border-danger border-2' : 'border-line-strong', className)}
        {...rest}
      />
    </FieldFrame>
  )
}

export function SelectField({
  label,
  hint,
  error,
  optional,
  id,
  children,
  className,
  ...rest
}: FieldShell & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId()
  const fid = id ?? auto
  return (
    <FieldFrame id={fid} label={label} hint={hint} error={error} optional={optional}>
      <select
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fid, hint, error)}
        required={!optional}
        className={cx(control, 'appearance-auto pr-3', error ? 'border-danger border-2' : 'border-line-strong', className)}
        {...rest}
      >
        {children}
      </select>
    </FieldFrame>
  )
}

/* ---------- Toggle chip (aria-pressed) ---------- */

export function ToggleChip({
  pressed,
  onToggle,
  children,
  icon,
}: {
  pressed: boolean
  onToggle: () => void
  children: ReactNode
  icon?: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={cx(
        'inline-flex items-center gap-2 min-h-11 px-4 rounded-full border text-[0.9375rem] font-semibold transition-colors',
        pressed ? 'bg-brand-ink border-brand-ink text-white' : 'bg-canvas border-line-strong text-ink hover:border-ink-2',
      )}
    >
      {pressed ? <CircleCheck aria-hidden className="size-4" /> : icon}
      {children}
    </button>
  )
}

/* ---------- Need icon ---------- */

export function NeedIcon({ need, className = 'size-5' }: { need: NeedCode; className?: string }) {
  const Icon = need === 'MOBILIDADE_REDUZIDA' ? Accessibility : need === 'DEFICIENCIA_VISUAL' ? Eye : Ear
  return <Icon aria-hidden className={className} strokeWidth={2} />
}

/* ---------- Status ---------- */

const statusStyle: Record<AggStatus, { cls: string; Icon: typeof CircleCheck }> = {
  sim: { cls: 'bg-ok-soft text-ok', Icon: CircleCheck },
  parcial: { cls: 'bg-partial-soft text-partial', Icon: CircleMinus },
  nao: { cls: 'bg-danger-soft text-danger', Icon: CircleX },
  nao_informado: { cls: 'bg-unknown-soft text-unknown', Icon: CircleHelp },
}

export function StatusBadge({ status, label, size = 'md' }: { status: AggStatus; label?: string; size?: 'sm' | 'md' }) {
  const { cls, Icon } = statusStyle[status]
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
        size === 'sm' ? 'text-sm px-2.5 py-0.5' : 'text-[0.9375rem] px-3 py-1',
        cls,
      )}
    >
      <Icon aria-hidden className={size === 'sm' ? 'size-4' : 'size-[1.125rem]'} strokeWidth={2.25} />
      {label ?? STATUS_LABEL[status]}
    </span>
  )
}

export function StatusIcon({ status, className = 'size-5' }: { status: AggStatus; className?: string }) {
  const { Icon, cls } = statusStyle[status]
  return <Icon aria-hidden className={cx(className, cls.split(' ').find((c) => c.startsWith('text-')))} strokeWidth={2.25} />
}

/** Linha compacta: ícone da necessidade + status, com texto completo para leitor de tela. */
export function NeedStatusPill({ need, status }: { need: NeedCode; status: AggStatus }) {
  const { cls, Icon } = statusStyle[status]
  const n = needMeta(need)
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full pl-2 pr-2.5 py-1 text-sm font-semibold', cls)}>
      <NeedIcon need={need} className="size-4" />
      <Icon aria-hidden className="size-4" strokeWidth={2.25} />
      <span>
        {n.short}
        <span className="sr-only">: {STATUS_LABEL[status]}</span>
      </span>
    </span>
  )
}

/* ---------- Rating ---------- */

export function Rating({ value, total, size = 'md' }: { value: number; total?: number; size?: 'sm' | 'md' }) {
  if (!total) return <span className="text-ink-3 text-sm">Sem avaliações ainda</span>
  return (
    <span className={cx('inline-flex items-center gap-1 font-semibold text-ink tabular', size === 'sm' ? 'text-sm' : 'text-base')}>
      <Star aria-hidden className="size-4 fill-star text-star" />
      <span className="sr-only">Nota </span>
      {value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      <span className="sr-only"> de 5,</span>
      <span className="font-normal text-ink-3">
        ({total}
        <span className="sr-only"> avaliações</span>)
      </span>
    </span>
  )
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" role="img" aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} aria-hidden className={cx('size-4', i <= value ? 'fill-star text-star' : 'text-line-strong')} />
      ))}
    </span>
  )
}

export function SealBadge({ compact }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-ink text-white text-sm font-semibold px-2.5 py-1">
      <ShieldCheck aria-hidden className="size-4" strokeWidth={2.25} />
      {compact ? 'Verificado' : 'Selo Acessibilidade Verificada'}
    </span>
  )
}

/* ---------- Progress ---------- */

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} de ${max}`}
      className="h-3 w-full rounded-full bg-unknown-soft overflow-hidden ring-1 ring-inset ring-line-strong/50"
    >
      <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  )
}

/* ---------- Section heading ---------- */

export function SectionTitle({ id, children, action }: { id?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <h2 id={id} className="text-xl font-bold text-ink">
        {children}
      </h2>
      {action}
    </div>
  )
}

export function Notice({ tone = 'info', children }: { tone?: 'info' | 'warn'; children: ReactNode }) {
  return (
    <div
      className={cx(
        'rounded-[var(--radius-card)] px-4 py-3 text-[0.9375rem] leading-relaxed',
        tone === 'info' ? 'bg-brand-soft text-brand-ink' : 'bg-partial-soft text-partial',
      )}
    >
      {children}
    </div>
  )
}

/* ---------- Carregamento e erro (anunciados ao leitor de tela) ---------- */

export function Loading({ label = 'Carregando…' }: { label?: string }) {
  return (
    <p role="status" className="flex items-center gap-2 py-6 text-ink-2">
      <LoaderCircle aria-hidden className="size-5 animate-spin" />
      {label}
    </p>
  )
}

export function LoadError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 rounded-[var(--radius-card)] border-2 border-danger bg-danger-soft p-4 text-danger">
      <p className="flex items-start gap-2 font-semibold">
        <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
        {mensagemDeErro(error)}
      </p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Tentar de novo
        </Button>
      )}
    </div>
  )
}
