import { ChevronLeft, ChevronRight, ImageOff, Ruler } from 'lucide-react'
import { useState } from 'react'
import type { CardEstabelecimento, CategoriaFicha, Foto } from '../api/types'
import { STATUS_LABEL, categoryHelp, formatValor, needMeta, resumo, resumoLabel, statusNecessidade } from '../data/domain'
import type { FichaCategoria, FichaLinha, NeedCode } from '../data/types'
import { useDominios } from '../state/dominios'
import { NeedIcon, SectionTitle, StatusBadge, StatusIcon, cx } from './ui'

const lista = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} e ${xs[xs.length - 1]}`)
const minusc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

/**
 * Resumo por necessidade: diz em frases o que atende, o que não atende, as medidas e o que falta informar.
 * Com `card`, o status vem de `necessidadesAtendidas` da API (mesma regra do filtro).
 */
export function NeedSummary({ ficha, needs, card }: { ficha: FichaCategoria[]; needs: NeedCode[]; card?: CardEstabelecimento }) {
  const { necessidades } = useDominios()
  const shown: NeedCode[] = needs.length ? needs : necessidades.map((n) => n.codigo)
  const linhas = ficha.flatMap((c) => c.linhas)
  return (
    <section aria-labelledby="resumo" className="rounded-[var(--radius-card)] border-2 border-brand-ink bg-canvas p-5 md:p-6">
      <h2 id="resumo" className="text-[1.375rem] font-bold leading-tight">
        {needs.length ? 'Para as suas necessidades' : 'Resumo por necessidade'}
      </h2>
      <ul className="mt-4 flex flex-col gap-5">
        {shown.map((n) => {
          const items = linhas.filter((l) => l.campo.necessidade.codigo === n)
          const sim = items.filter((l) => l.status === 'sim').map((l) => minusc(l.campo.rotulo))
          const nao = items.filter((l) => l.status === 'nao').map((l) => minusc(l.campo.rotulo))
          const medidas = items.filter((l) => l.item && l.campo.tipoValor !== 'SIM_NAO')
          const naoInf = items.filter((l) => !l.item).map((l) => minusc(l.campo.rotulo))
          const r = resumo(items)
          return (
            <li key={n} className="flex gap-3">
              <span className="mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
                <NeedIcon need={n} className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="text-lg font-bold text-ink">{needMeta(n).label}</h3>
                  {card ? (
                    <StatusBadge status={statusNecessidade(card, n, ficha)} size="sm" />
                  ) : (
                    <StatusBadge status={r.status} label={resumoLabel(r)} size="sm" />
                  )}
                </div>
                <div className="mt-1.5 flex flex-col gap-1 text-[1.0625rem] leading-relaxed text-ink">
                  {sim.length > 0 && (
                    <p>
                      <strong className="text-ok">Tem:</strong> {lista(sim)}.
                    </p>
                  )}
                  {nao.length > 0 && (
                    <p>
                      <strong className="text-danger">Não tem:</strong> {lista(nao)}.
                    </p>
                  )}
                  {medidas.length > 0 && (
                    <p>
                      <strong>Medidas:</strong> {medidas.map((l) => `${minusc(l.campo.rotulo)}: ${formatValor(l)}`).join('; ')}.
                    </p>
                  )}
                  {naoInf.length > 0 && (
                    <p className="text-ink-2">
                      <strong className="text-unknown">Não informado:</strong> {lista(naoInf)}.
                    </p>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Linha({ linha, highlight }: { linha: FichaLinha; highlight: boolean }) {
  const { campo, item, status } = linha
  return (
    <li className="flex items-start gap-3 py-3">
      {status ? (
        <StatusIcon status={status} className="mt-0.5 size-5 shrink-0" />
      ) : (
        <Ruler aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
          <p className={cx('text-ink', highlight && 'font-semibold')}>
            {campo.rotulo}
            {status && <span className="sr-only">: {STATUS_LABEL[status]}</span>}
          </p>
          {item && campo.tipoValor !== 'SIM_NAO' && <p className="font-semibold text-ink tabular">{formatValor(linha)}</p>}
        </div>
        {!item && <p className="mt-0.5 text-[0.9375rem] text-ink-3">O local ainda não informou.</p>}
      </div>
    </li>
  )
}

/** Ficha técnica completa por categoria (RF11). */
export function FichaCategorias({ ficha, needs }: { ficha: FichaCategoria[]; needs: NeedCode[] }) {
  return (
    <section aria-labelledby="ficha">
      <SectionTitle id="ficha">Ficha técnica de acessibilidade</SectionTitle>
      <div className="flex flex-col gap-3">
        {ficha.map(({ categoria, linhas }) => {
          const r = resumo(linhas)
          const algumInformado = linhas.some((l) => l.item)
          return (
            <details key={categoria.id} open={algumInformado} className="group rounded-[var(--radius-card)] border border-line bg-canvas">
              <summary className="flex min-h-14 cursor-pointer list-none flex-wrap items-center justify-between gap-x-3 gap-y-2 px-5 py-3 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1 basis-44">
                  <h3 className="text-lg font-bold">{categoria.descricao}</h3>
                  <span className="text-sm text-ink-3">{categoryHelp(categoria.codigo)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <StatusBadge status={r.status} label={resumoLabel(r)} size="sm" />
                  <ChevronRight aria-hidden className="size-5 text-ink-3 transition-transform group-open:rotate-90" />
                </span>
              </summary>
              <ul className="divide-y divide-line border-t border-line px-5">
                {linhas.map((l) => (
                  <Linha key={l.campo.id} linha={l} highlight={needs.includes(l.campo.necessidade.codigo)} />
                ))}
              </ul>
            </details>
          )
        })}
      </div>
    </section>
  )
}

/** Galeria de fotos enviadas pelo estabelecimento (RF12). */
export function Galeria({ fotos, categorias }: { fotos: Foto[]; categorias: CategoriaFicha[] }) {
  const [i, setI] = useState(0)
  const n = fotos.length
  if (!n)
    return (
      <section aria-labelledby="galeria">
        <SectionTitle id="galeria">Fotos do local</SectionTitle>
        <p className="flex items-center gap-2 rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas p-5 text-ink-2">
          <ImageOff aria-hidden className="size-5" />
          O local ainda não enviou fotos.
        </p>
      </section>
    )
  const foto = fotos[Math.min(i, n - 1)]
  return (
    <section aria-labelledby="galeria" aria-roledescription="galeria">
      <SectionTitle id="galeria">Fotos do local</SectionTitle>
      <figure className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-canvas">
        <img src={foto.url} alt={foto.textoAlternativo} className="aspect-[16/10] w-full object-cover" />
        <figcaption className="flex items-center justify-between gap-3 px-4 py-2">
          <span className="text-[0.9375rem] text-ink-2">
            {categorias.find((c) => c.id === foto.categoriaId)?.descricao}
            {' · '}
            <span className="tabular" aria-live="polite">
              Foto {i + 1} de {n}
            </span>
          </span>
          {n > 1 && (
            <span className="flex gap-1">
              <button type="button" onClick={() => setI((i - 1 + n) % n)} className="inline-flex size-11 items-center justify-center rounded-full border border-line hover:bg-surface">
                <ChevronLeft aria-hidden className="size-5" />
                <span className="sr-only">Foto anterior</span>
              </button>
              <button type="button" onClick={() => setI((i + 1) % n)} className="inline-flex size-11 items-center justify-center rounded-full border border-line hover:bg-surface">
                <ChevronRight aria-hidden className="size-5" />
                <span className="sr-only">Próxima foto</span>
              </button>
            </span>
          )}
        </figcaption>
      </figure>
    </section>
  )
}
