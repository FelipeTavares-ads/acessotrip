import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

/**
 * Diálogo modal nativo (<dialog> + showModal): o navegador cuida do foco preso,
 * do Esc e do inert no resto da página. Ao fechar, o foco volta para quem abriu.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      returnTo.current = document.activeElement as HTMLElement
      d.showModal()
    } else if (!open && d.open) {
      d.close()
    }
  }, [open])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    const handle = () => {
      onClose()
      returnTo.current?.focus()
    }
    d.addEventListener('close', handle)
    return () => d.removeEventListener('close', handle)
  }, [onClose])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className="m-auto w-[min(32rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] rounded-[var(--radius-card)] bg-canvas p-0 text-ink shadow-[0_12px_40px_rgb(16_21_28/0.25)] backdrop:bg-[rgb(16_21_28/0.55)]"
    >
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <h2 id={titleId} className="text-xl font-bold">
          {title}
        </h2>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          className="-mr-2 -mt-2 inline-flex size-11 items-center justify-center rounded-full text-ink-2 hover:bg-surface"
        >
          <X aria-hidden className="size-5" />
          <span className="sr-only">Fechar</span>
        </button>
      </div>
      {description && (
        <p id={descId} className="px-5 pt-1 text-ink-2">
          {description}
        </p>
      )}
      <div className="px-5 pb-5 pt-4">{children}</div>
    </dialog>
  )
}
