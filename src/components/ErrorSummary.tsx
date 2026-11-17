import { useEffect, useRef } from 'react'
import { CircleAlert } from 'lucide-react'

/** Resumo de erros no topo do formulário: recebe o foco ao enviar e liga para cada campo. */
export function ErrorSummary({ errors, attempt }: { errors: Record<string, string | undefined>; attempt: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const list = Object.entries(errors).filter(([, v]) => v) as [string, string][]
  useEffect(() => {
    if (attempt > 0 && list.length) ref.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt])
  if (!list.length || attempt === 0) return null
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      className="rounded-[var(--radius-card)] border-2 border-danger bg-danger-soft p-4 text-danger"
    >
      <p className="flex items-center gap-2 font-bold">
        <CircleAlert aria-hidden className="size-5" />
        {list.length === 1 ? 'Corrija 1 campo para continuar' : `Corrija ${list.length} campos para continuar`}
      </p>
      <ul className="mt-2 list-disc pl-7">
        {list.map(([field, msg]) => (
          <li key={field}>
            <a href={`#${field}`} className="font-semibold text-danger underline">
              {msg}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
