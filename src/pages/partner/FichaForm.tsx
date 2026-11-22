import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState, type FormEvent } from 'react'
import { ImagePlus, Pencil, Trash2 } from 'lucide-react'
import { ApiError, mensagemDeErro } from '../../api/client'
import { parceiro } from '../../api/endpoints'
import type { CategoriaCampos, CategoriaFichaPreenchida, Foto } from '../../api/types'
import { Button, TextArea, TextField, cx } from '../../components/ui'
import { useStore } from '../../state/store'

/* ---------- Campos estruturados de uma categoria (RF18) ---------- */

const NUMERO = /^\d{1,4}([.,]\d{1,2})?$/

function validar(tipo: string, v: string): string | undefined {
  if (!v) return undefined
  if (tipo === 'NUMERO' && (!NUMERO.test(v) || Number(v.replace(',', '.')) > 9999))
    return 'Informe um número de 0 a 9999, com até 2 casas decimais.'
  if (tipo === 'TEXTO' && v.length > 500) return 'Use no máximo 500 caracteres.'
  return undefined
}

export interface CategoryEditorHandle {
  /** Salva a categoria; devolve true se deu certo (ou se não havia nada a validar com erro). */
  salvar: () => Promise<boolean>
}

/**
 * Formulário de uma categoria, gerado a partir do catálogo de campos (`/campos-ficha`).
 * "Não informar" = item omitido. O PUT substitui a categoria inteira, então enviamos sempre
 * todos os itens preenchidos.
 */
export const CategoryEditor = forwardRef<
  CategoryEditorHandle,
  { grupo: CategoriaCampos; preenchida: CategoriaFichaPreenchida[]; onSaved: (f: CategoriaFichaPreenchida[]) => void; botao?: boolean }
>(function CategoryEditor({ grupo, preenchida, onSaved, botao = true }, ref) {
  const { notify } = useStore()
  const itens = preenchida.find((c) => c.categoria.id === grupo.categoria.id)?.itens ?? []
  const chaveItens = JSON.stringify(itens.map((i) => [i.campoId, i.valor]))
  const inicial = () => {
    return Object.fromEntries(grupo.campos.map((c) => [c.id, itens.find((i) => i.campoId === c.id)?.valor ?? '']))
  }
  const [valores, setValores] = useState<Record<number, string>>(inicial)
  const [tentou, setTentou] = useState(false)
  const [status, setStatus] = useState('')
  const [salvando, setSalvando] = useState(false)
  // Só recarrega quando os itens salvos DESTA categoria mudam (não perde edições de outras)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setValores(inicial()), [grupo.categoria.id, chaveItens])

  const erros = Object.fromEntries(grupo.campos.map((c) => [c.id, validar(c.tipoValor, valores[c.id]?.trim() ?? '')]))
  const temErro = Object.values(erros).some(Boolean)

  const salvar = async () => {
    setTentou(true)
    if (temErro) {
      setStatus('Corrija os campos destacados antes de salvar.')
      return false
    }
    setSalvando(true)
    setStatus('Salvando…')
    try {
      const itens = grupo.campos
        .filter((c) => valores[c.id]?.trim())
        .map((c) => ({ campoId: c.id, valor: valores[c.id].trim() }))
      const nova = await parceiro.salvarCategoria(grupo.categoria.id, itens)
      onSaved(nova)
      setStatus(`${grupo.categoria.descricao}: alterações salvas.`)
      notify(`${grupo.categoria.descricao}: alterações salvas.`)
      return true
    } catch (e) {
      setStatus(e instanceof ApiError ? e.message : mensagemDeErro(e))
      return false
    } finally {
      setSalvando(false)
    }
  }
  useImperativeHandle(ref, () => ({ salvar }))

  const set = (id: number, v: string) => setValores((s) => ({ ...s, [id]: v }))

  return (
    <div className="flex flex-col gap-4">
      {grupo.campos.map((c) => {
        const v = valores[c.id] ?? ''
        const err = tentou ? erros[c.id] : undefined
        const hintId = `campo-${c.id}-ajuda`
        if (c.tipoValor === 'SIM_NAO')
          return (
            <fieldset key={c.id} className="rounded-[var(--radius-card)] border border-line bg-canvas p-4" aria-describedby={c.ajuda ? hintId : undefined}>
              <legend className="float-left w-full font-bold text-ink">{c.rotulo}</legend>
              {c.ajuda && (
                <p id={hintId} className="text-[0.9375rem] text-ink-3">
                  {c.ajuda}
                </p>
              )}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  ['SIM', 'Sim'],
                  ['NAO', 'Não'],
                  ['', 'Não informar'],
                ].map(([val, label]) => (
                  <label
                    key={val}
                    className={cx(
                      'flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-control)] border px-3 text-center text-[0.9375rem] font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand',
                      v === val ? 'border-brand-ink bg-brand-soft text-brand-ink' : 'border-line-strong text-ink',
                    )}
                  >
                    <input type="radio" name={`campo-${c.id}`} checked={v === val} onChange={() => set(c.id, val)} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          )
        if (c.tipoValor === 'NUMERO')
          return (
            <div key={c.id} className="rounded-[var(--radius-card)] border border-line bg-canvas p-4">
              <TextField
                id={`campo-${c.id}`}
                label={c.unidade ? `${c.rotulo} (${c.unidade})` : c.rotulo}
                hint={c.ajuda ? `${c.ajuda} Deixe em branco para não informar.` : 'Deixe em branco para não informar.'}
                inputMode="decimal"
                optional
                value={v}
                onChange={(e) => set(c.id, e.target.value)}
                error={err}
                className="tabular sm:max-w-48"
              />
            </div>
          )
        return (
          <div key={c.id} className="rounded-[var(--radius-card)] border border-line bg-canvas p-4">
            <TextArea id={`campo-${c.id}`} label={c.rotulo} hint={c.ajuda ?? undefined} optional maxLength={500} value={v} onChange={(e) => set(c.id, e.target.value)} error={err} />
          </div>
        )
      })}
      <div className="flex flex-wrap items-center gap-3">
        {botao && (
          <Button onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando…' : `Salvar ${grupo.categoria.descricao.toLowerCase()}`}
          </Button>
        )}
        <p role="status" className={cx('text-[0.9375rem]', temErro && tentou ? 'font-semibold text-danger' : 'text-ink-2')}>
          {status}
        </p>
      </div>
    </div>
  )
})

/* ---------- Fotos de uma categoria (RF19) ---------- */

const TIPOS_FOTO = ['image/jpeg', 'image/png']
const MAX_BYTES = 5 * 1024 * 1024

export function CategoryPhotos({ categoriaId, fotos, onChange }: { categoriaId: number; fotos: Foto[]; onChange: (f: Foto[]) => void }) {
  const { notify } = useStore()
  const id = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [alt, setAlt] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [altEdit, setAltEdit] = useState('')
  const daCategoria = fotos.filter((f) => f.categoriaId === categoriaId)

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview])

  const escolher = (f: File | undefined) => {
    setErro('')
    if (!f) return
    if (!TIPOS_FOTO.includes(f.type)) return setErro('Use uma foto JPG ou PNG.')
    if (f.size > MAX_BYTES) return setErro('A foto deve ter no máximo 5 MB.')
    setArquivo(f)
    setPreview(URL.createObjectURL(f))
  }
  const cancelar = () => {
    setArquivo(null)
    setPreview('')
    setAlt('')
    setErro('')
    if (fileRef.current) fileRef.current.value = ''
  }
  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    if (!arquivo) return
    if (alt.trim().length < 5) return setErro('Descreva a foto com pelo menos 5 caracteres.')
    setEnviando(true)
    try {
      const nova = await parceiro.enviarFoto(arquivo, categoriaId, alt.trim())
      onChange([...fotos, nova])
      notify('Foto enviada.')
      cancelar()
    } catch (err) {
      setErro(mensagemDeErro(err))
    } finally {
      setEnviando(false)
    }
  }
  const remover = async (f: Foto) => {
    if (!window.confirm('Remover esta foto?')) return
    try {
      await parceiro.removerFoto(f.id)
      onChange(fotos.filter((x) => x.id !== f.id))
      notify('Foto removida.')
    } catch (err) {
      notify(mensagemDeErro(err))
    }
  }
  const salvarAlt = async (f: Foto) => {
    if (altEdit.trim().length < 5) return notify('Descreva a foto com pelo menos 5 caracteres.')
    try {
      const nova = await parceiro.alterarFoto(f.id, { textoAlternativo: altEdit.trim() })
      onChange(fotos.map((x) => (x.id === f.id ? nova : x)))
      setEditando(null)
      notify('Descrição atualizada.')
    } catch (err) {
      notify(mensagemDeErro(err))
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas p-4">
      <p className="font-bold">Fotos desta categoria</p>
      <p id={`${id}-hint`} className="text-[0.9375rem] text-ink-2">
        Fotos reais do local, como a rampa, a porta ou o banheiro. JPG ou PNG, até 5 MB. Máximo de 30 fotos no total.
      </p>
      {daCategoria.length > 0 && (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {daCategoria.map((f) => (
            <li key={f.id} className="overflow-hidden rounded-[var(--radius-control)] border border-line">
              <img src={f.url} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="flex flex-col gap-2 p-2">
                {editando === f.id ? (
                  <>
                    <TextField label="Descrição da foto" maxLength={300} value={altEdit} onChange={(e) => setAltEdit(e.target.value)} />
                    <div className="flex gap-2">
                      <Button onClick={() => salvarAlt(f)}>Salvar</Button>
                      <Button variant="ghost" onClick={() => setEditando(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-ink-2">{f.textoAlternativo}</p>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditando(f.id)
                          setAltEdit(f.textoAlternativo)
                        }}
                        className="inline-flex size-11 items-center justify-center rounded-full text-ink-2 hover:bg-surface"
                      >
                        <Pencil aria-hidden className="size-4" />
                        <span className="sr-only">Editar descrição da foto: {f.textoAlternativo}</span>
                      </button>
                      <button type="button" onClick={() => remover(f)} className="inline-flex size-11 items-center justify-center rounded-full text-ink-2 hover:bg-danger-soft hover:text-danger">
                        <Trash2 aria-hidden className="size-4" />
                        <span className="sr-only">Remover foto: {f.textoAlternativo}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <input ref={fileRef} id={id} type="file" accept="image/jpeg,image/png" onChange={(e) => escolher(e.target.files?.[0])} hidden />
      {arquivo ? (
        <form onSubmit={enviar} noValidate className="mt-3 flex flex-col gap-3">
          <img src={preview} alt="" className="aspect-[4/3] w-full max-w-xs rounded-[var(--radius-control)] object-cover" />
          <TextField
            label="Descreva a foto para quem não pode vê-la"
            hint="De 5 a 300 caracteres. Ex.: Rampa de concreto com corrimão dos dois lados na entrada principal."
            maxLength={300}
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            error={erro || undefined}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar foto'}
            </Button>
            <Button variant="ghost" onClick={cancelar}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <>
          {erro && (
            <p role="alert" className="mt-2 text-sm font-semibold text-danger">
              {erro}
            </p>
          )}
          <button
            type="button"
            aria-describedby={`${id}-hint`}
            onClick={() => fileRef.current?.click()}
            className="mt-3 inline-flex min-h-12 items-center gap-2 rounded-[var(--radius-control)] border border-brand px-4 font-semibold text-brand hover:bg-brand-soft"
          >
            <ImagePlus aria-hidden className="size-5" />
            Adicionar foto
          </button>
        </>
      )}
    </div>
  )
}
