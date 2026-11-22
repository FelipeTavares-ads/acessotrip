import { useEffect, useId, useMemo, useState, type KeyboardEvent } from 'react'
import { MapPin } from 'lucide-react'
import { catalogo } from '../api/endpoints'
import { cx } from './ui'

/**
 * Autocomplete no padrão ARIA 1.2 "combobox com lista" (RF04).
 * Setas navegam, Enter escolhe, Esc fecha; o total de sugestões é anunciado.
 */
export function Combobox({
  label,
  hint,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
}) {
  const id = useId()
  const listId = `${id}-list`
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)

  const matches = useMemo(() => {
    const q = value
      .trim()
      .toLocaleLowerCase('pt-BR')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
    if (!q) return []
    return options
      .filter((o) =>
        o
          .toLocaleLowerCase('pt-BR')
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .includes(q),
      )
      .slice(0, 6)
  }, [value, options])

  const expanded = open && matches.length > 0 && !(matches.length === 1 && matches[0] === value)

  const choose = (v: string) => {
    onChange(v)
    setOpen(false)
    setActive(-1)
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((a) => Math.min(a + 1, matches.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && expanded && active >= 0) {
      e.preventDefault()
      choose(matches[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-semibold text-ink">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="-mt-0.5 text-sm text-ink-3">
          {hint}
        </p>
      )}
      <div className="relative">
        <MapPin aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink-3" />
        <input
          id={id}
          role="combobox"
          type="text"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-activedescendant={expanded && active >= 0 ? `${id}-opt-${active}` : undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
            setActive(-1)
          }}
          onKeyDown={onKey}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          className="w-full min-h-14 rounded-[var(--radius-control)] border border-line-strong bg-canvas pl-11 pr-4 text-[1.0625rem] text-ink placeholder:text-ink-3 hover:border-ink-3"
        />
        {/* Padrão ARIA 1.2 de combobox: listbox/option em ul/li é o esperado */}
        <ul
          id={listId}
          role="listbox"
          aria-label={`Sugestões para ${label.toLowerCase()}`}
          hidden={!expanded}
          className="absolute inset-x-0 top-[calc(100%+0.375rem)] z-20 overflow-hidden rounded-[var(--radius-control)] border border-line bg-canvas py-1 shadow-[0_8px_24px_rgb(16_21_28/0.14)]"
        >
          {matches.map((m, i) => (
            <li
              key={m}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                choose(m)
              }}
              className={cx(
                'flex min-h-12 cursor-pointer items-center gap-3 px-4 text-base',
                i === active ? 'bg-brand-soft text-brand-ink' : 'text-ink hover:bg-surface',
              )}
            >
              <MapPin aria-hidden className="size-4 shrink-0 text-ink-3" />
              {m}
            </li>
          ))}
        </ul>
      </div>
      <p className="sr-only" aria-live="polite">
        {expanded ? `${matches.length} sugestões. Use as setas para navegar.` : ''}
      </p>
    </div>
  )
}

/** "Porto Seguro, BA" → { cidade: "Porto Seguro", estado: "BA" }. Sem UF reconhecível, tudo vira cidade. */
// eslint-disable-next-line react-refresh/only-export-components
export function parseDestino(v: string): { cidade: string; estado?: string } {
  const m = v.trim().match(/^(.*?),\s*([A-Za-z]{2})$/)
  return m ? { cidade: m[1].trim(), estado: m[2].toUpperCase() } : { cidade: v.trim() }
}

/** Combobox de destinos com sugestões do catálogo (RF04): mínimo de 2 letras, consulta com atraso curto. */
export function DestinoCombobox(props: { label: string; hint?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [options, setOptions] = useState<string[]>([])
  const q = props.value.trim()
  useEffect(() => {
    if (q.length < 2 || /,\s*[A-Za-z]{2}$/.test(q)) return
    const ctrl = new AbortController()
    const t = window.setTimeout(() => {
      catalogo.destinos(q, ctrl.signal).then(
        (ds) => setOptions(ds.map((d) => `${d.cidade}, ${d.estado}`)),
        () => undefined,
      )
    }, 250)
    return () => {
      window.clearTimeout(t)
      ctrl.abort()
    }
  }, [q])
  return <Combobox {...props} options={q.length < 2 ? [] : options} />
}
