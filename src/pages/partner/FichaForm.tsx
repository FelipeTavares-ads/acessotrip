import { useId, useRef, type ChangeEvent } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { StatusIcon, cx } from '../../components/ui'
import { STATUS_LABEL } from '../../data/domain'
import type { CategoryId, FichaItem, ItemStatus } from '../../data/types'
import { setPartner, usePartner } from '../../state/partner'

const OPTIONS: ItemStatus[] = ['sim', 'parcial', 'nao', 'nao_informado', 'nao_se_aplica']

/** Campos estruturados de uma categoria da ficha (RF18) + fotos da categoria (RF19). */
export function CategoryFields({ categoria }: { categoria: CategoryId }) {
  const { ficha, fotos } = usePartner()
  const items = ficha.filter((i) => i.categoria === categoria)
  const catFotos = fotos.filter((f) => f.categoria === categoria)
  const fileId = useId()
  const fileRef = useRef<HTMLInputElement>(null)

  const patch = (id: string, p: Partial<FichaItem>) =>
    setPartner((s) => ({ ficha: s.ficha.map((i) => (i.id === id ? { ...i, ...p } : i)) }))

  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setPartner((s) => ({
      fotos: [
        ...s.fotos,
        ...files.map((f) => ({ id: `${Date.now()}-${f.name}`, nome: f.name, categoria, src: URL.createObjectURL(f) })),
      ],
    }))
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.id} className="rounded-[var(--radius-card)] border border-line bg-canvas p-4">
          <p id={`${item.id}-lbl`} className="font-bold text-ink">
            {item.atributo}
          </p>
          <div role="radiogroup" aria-labelledby={`${item.id}-lbl`} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {OPTIONS.map((o) => (
              <label
                key={o}
                className={cx(
                  'flex min-h-12 cursor-pointer items-center gap-2 rounded-[var(--radius-control)] border px-3 text-[0.9375rem] font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand',
                  item.status === o ? 'border-brand-ink bg-brand-soft text-brand-ink' : 'border-line-strong text-ink',
                )}
              >
                <input
                  type="radio"
                  name={item.id}
                  checked={item.status === o}
                  onChange={() => patch(item.id, { status: o })}
                  className="sr-only"
                />
                <StatusIcon status={o} className="size-[1.125rem] shrink-0" />
                {STATUS_LABEL[o]}
              </label>
            ))}
          </div>
          {item.status !== 'nao_informado' && item.status !== 'nao_se_aplica' && (
            <div className="mt-3 grid gap-3 sm:grid-cols-[12rem_1fr]">
              <div className="flex flex-col gap-1">
                <label htmlFor={`${item.id}-valor`} className="text-[0.9375rem] font-semibold">
                  Medida <span className="font-normal text-ink-3">(opcional)</span>
                </label>
                <input
                  id={`${item.id}-valor`}
                  value={item.valor ?? ''}
                  onChange={(e) => patch(item.id, { valor: e.target.value || undefined })}
                  placeholder="Ex.: 90 cm"
                  className="min-h-11 rounded-[var(--radius-control)] border border-line-strong px-3 tabular"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={`${item.id}-obs`} className="text-[0.9375rem] font-semibold">
                  Observação <span className="font-normal text-ink-3">(opcional)</span>
                </label>
                <input
                  id={`${item.id}-obs`}
                  value={item.observacao ?? ''}
                  onChange={(e) => patch(item.id, { observacao: e.target.value || undefined })}
                  placeholder="Ex.: só no térreo"
                  className="min-h-11 rounded-[var(--radius-control)] border border-line-strong px-3"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas p-4">
        <p className="font-bold">Fotos desta categoria</p>
        <p id={`${fileId}-hint`} className="text-[0.9375rem] text-ink-2">
          Fotos reais do local, como a rampa, a porta ou o banheiro. JPG ou PNG.
        </p>
        {catFotos.length > 0 && (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {catFotos.map((f) => (
              <li key={f.id} className="overflow-hidden rounded-[var(--radius-control)] border border-line">
                {f.src && <img src={f.src} alt="" className="aspect-[4/3] w-full object-cover" />}
                <div className="flex items-center justify-between gap-1 px-2 py-1">
                  <span className="truncate text-sm text-ink-2">{f.nome}</span>
                  <button
                    type="button"
                    onClick={() => setPartner((s) => ({ fotos: s.fotos.filter((x) => x.id !== f.id) }))}
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 aria-hidden className="size-4" />
                    <span className="sr-only">Remover foto {f.nome}</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <input ref={fileRef} id={fileId} type="file" accept="image/*" multiple onChange={onFiles} hidden />
        <button
          type="button"
          aria-describedby={`${fileId}-hint`}
          onClick={() => fileRef.current?.click()}
          className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-control)] border border-brand px-4 font-semibold text-brand hover:bg-brand-soft"
        >
          <ImagePlus aria-hidden className="size-5" />
          Adicionar fotos
        </button>
      </div>
    </div>
  )
}
