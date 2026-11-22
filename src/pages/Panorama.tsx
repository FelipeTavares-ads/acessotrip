import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, ShieldCheck, Star } from 'lucide-react'
import { catalogo } from '../api/endpoints'
import type { PanoramaDestino, PanoramaNecessidade } from '../api/types'
import { useApi } from '../api/useApi'
import { PageHeader } from '../components/Layout'
import { LoadError, Loading, NeedIcon, SelectField } from '../components/ui'
import { formatNota, needMeta } from '../data/domain'

const pct = (parte: number, total: number) => (total ? Math.round((parte / total) * 100) : 0)

/**
 * Medidor "X de Y": o texto carrega a informação (lido pelo leitor de tela); a barra é só reforço
 * visual, em uma cor (a da marca) sobre a faixa clara da mesma cor.
 */
function Medidor({ n, total }: { n: PanoramaNecessidade; total: number }) {
  const p = pct(n.lugares, total)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
          <NeedIcon need={n.necessidade.codigo} className="size-4 shrink-0" />
          {needMeta(n.necessidade).label}
        </span>
        <span className="text-[0.9375rem] text-ink-2 tabular">
          {n.lugares} de {total} ({p}%)
        </span>
      </div>
      <div aria-hidden className="h-2.5 w-full overflow-hidden rounded-full bg-brand-soft">
        {p > 0 && <div className="h-full rounded-full bg-brand" style={{ width: `${p}%` }} />}
      </div>
    </div>
  )
}

function Indicador({ rotulo, valor, detalhe }: { rotulo: string; valor: string; detalhe?: string }) {
  return (
    <div className="p-4 md:p-5">
      <dt className="text-[0.9375rem] text-ink-2">{rotulo}</dt>
      <dd className="mt-1 text-[1.75rem] font-bold leading-tight text-ink tabular">{valor}</dd>
      {detalhe && <dd className="text-sm text-ink-3">{detalhe}</dd>}
    </div>
  )
}

function CartaoDestino({ d }: { d: PanoramaDestino }) {
  const destino = `${d.cidade}, ${d.estado}`
  const busca = (nec: string) => `/resultados?${new URLSearchParams({ destino, nec })}`
  return (
    <li className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-canvas p-5">
      <div>
        <h3 className="flex items-center gap-1.5 text-lg font-bold text-ink">
          <MapPin aria-hidden className="size-5 shrink-0 text-brand" />
          {destino}
        </h3>
        <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[0.9375rem] text-ink-2">
          <div className="flex gap-1">
            <dt>Lugares:</dt>
            <dd className="font-semibold text-ink tabular">{d.lugares}</dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="inline-flex items-center gap-1">
              <ShieldCheck aria-hidden className="size-4" />
              Com Selo:
            </dt>
            <dd className="font-semibold text-ink tabular">{d.comSelo}</dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="inline-flex items-center gap-1">
              <Star aria-hidden className="size-4" />
              Nota média:
            </dt>
            <dd className="font-semibold text-ink tabular">{d.notaMedia === null ? 'sem avaliações' : formatNota(d.notaMedia)}</dd>
          </div>
        </dl>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-ink-3">Lugares que atendem a cada necessidade</p>
        {d.necessidades.map((n) => (
          <Medidor key={n.necessidade.codigo} n={n} total={d.lugares} />
        ))}
      </div>
      <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1">
        <Link to={busca('nenhuma')} className="inline-flex min-h-11 items-center gap-1 font-semibold text-brand">
          Ver lugares<span className="sr-only"> em {destino}</span>
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    </li>
  )
}

/** Panorama público da acessibilidade por destino (funcionalidade extra, fora do PDF). */
export default function Panorama() {
  const [uf, setUf] = useState('')
  // Sem filtro: dá os estados disponíveis e os números gerais
  const todos = useApi(() => catalogo.panorama(), [])
  const filtrado = useApi(uf ? () => catalogo.panorama(uf) : null, [uf])
  const st = uf ? filtrado : todos
  const ufs = [...new Set(todos.data?.destinos.map((d) => d.estado) ?? [])].sort()

  return (
    <>
      <PageHeader
        title="Panorama da acessibilidade"
        lead="Quantos lugares do catálogo atendem a cada necessidade em cada destino. Os números mudam conforme estabelecimentos preenchem a ficha e viajantes avaliam."
      />
      <div className="mb-6 max-w-xs">
        <SelectField label="Estado" optional value={uf} onChange={(e) => setUf(e.target.value)} disabled={!ufs.length}>
          <option value="">Todos os estados</option>
          {ufs.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </SelectField>
      </div>

      {st.error ? (
        <LoadError error={st.error} onRetry={st.reload} />
      ) : st.loading || !st.data ? (
        <Loading label="Calculando o panorama…" />
      ) : st.data.geral.lugares === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line-strong bg-canvas p-5 text-ink-2">
          Ainda não há lugares no catálogo{uf ? ` em ${uf}` : ''}.
        </p>
      ) : (
        <div aria-live="polite" className="flex flex-col gap-10">
          <section aria-labelledby="geral">
            <h2 id="geral" className="mb-4 text-xl font-bold">
              {uf ? `Em ${uf}` : 'No Brasil'}
            </h2>
            <dl className="grid grid-cols-2 overflow-hidden rounded-[var(--radius-card)] border border-line bg-canvas sm:grid-cols-3 sm:divide-x sm:divide-line">
              <Indicador rotulo="Lugares no catálogo" valor={String(st.data.geral.lugares)} />
              <Indicador rotulo="Destinos" valor={String(st.data.geral.destinos)} />
              <Indicador
                rotulo="Com Selo Verificado"
                valor={String(st.data.geral.comSelo)}
                detalhe={`${pct(st.data.geral.comSelo, st.data.geral.lugares)}% dos lugares`}
              />
            </dl>
            <div className="mt-4 flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-canvas p-5">
              <h3 className="font-bold text-ink">Lugares que atendem a cada necessidade</h3>
              {st.data.geral.necessidades.map((n) => (
                <Medidor key={n.necessidade.codigo} n={n} total={st.data!.geral.lugares} />
              ))}
            </div>
          </section>

          <section aria-labelledby="destinos">
            <h2 id="destinos" className="mb-1 text-xl font-bold">
              Por destino
            </h2>
            <p className="mb-4 text-[0.9375rem] text-ink-2">Do destino com mais lugares para o com menos.</p>
            <ul className="grid gap-4 md:grid-cols-2">
              {st.data.destinos.map((d) => (
                <CartaoDestino key={`${d.cidade}-${d.estado}`} d={d} />
              ))}
            </ul>
          </section>

          <p className="text-sm text-ink-3">
            Um lugar “atende” a uma necessidade quando mais da metade dos itens da ficha ligados a ela existe no local, a mesma regra
            usada na busca. Só entram lugares com a ficha concluída.
          </p>
        </div>
      )}
    </>
  )
}
