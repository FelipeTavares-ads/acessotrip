import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { DestinoCombobox } from '../components/Combobox'
import { Button, ButtonLink, SealBadge, StatusIcon } from '../components/ui'
import { STATUS_LABEL } from '../data/domain'
import type { AggStatus } from '../data/types'
import { NeedChips } from './Search'

/** Exemplo ilustrativo e fixo (D13): mostra o formato da ficha sem depender de dados do catálogo. */
const EXEMPLO: { categoria: string; status: AggStatus; detalhe: string }[] = [
  { categoria: 'Acesso externo', status: 'sim', detalhe: 'Entrada sem degraus, porta de 90 cm' },
  { categoria: 'Circulação interna', status: 'sim', detalhe: 'Elevador e quarto adaptado' },
  { categoria: 'Sanitários', status: 'parcial', detalhe: 'Barras de apoio; sem banco de banho' },
  { categoria: 'Sinalização', status: 'nao', detalhe: 'Sem braille nem mapa tátil' },
  { categoria: 'Atendimento', status: 'nao_informado', detalhe: 'O local ainda não informou' },
]

export default function Landing() {
  const nav = useNavigate()
  const [destino, setDestino] = useState('')
  const [needs, setNeeds] = useState<string[]>([])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = new URLSearchParams()
    if (destino) q.set('destino', destino)
    q.set('nec', needs.join(',') || 'nenhuma')
    nav(`/resultados?${q}`)
  }

  return (
    <>
      <section className="border-b border-line bg-canvas">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[1.05fr_1fr] md:gap-14 md:px-6 md:py-16">
          <div>
            <h1 className="text-[2.125rem] font-bold leading-[1.08] text-ink outline-none md:text-[3.25rem]">
              Saiba se o lugar serve para você antes de reservar.
            </h1>
            <p className="mt-4 max-w-[52ch] text-[1.125rem] text-ink-2">
              Hotéis, pousadas, restaurantes e espaços de eventos com ficha técnica de acessibilidade: medidas reais, fotos do
              local e relatos de viajantes.
            </p>

            <form onSubmit={submit} role="search" aria-label="Buscar lugares acessíveis" className="mt-8 flex flex-col gap-5">
              <DestinoCombobox label="Para onde você vai?" value={destino} onChange={setDestino} placeholder="Cidade" />
              <NeedChips legend="Mostrar o que importa para" value={needs} onChange={setNeeds} />
              <Button type="submit" className="min-h-14 text-[1.0625rem] md:self-start md:px-8">
                <Search aria-hidden className="size-5" />
                Buscar lugares
              </Button>
            </form>
          </div>

          <figure aria-labelledby="exemplo-titulo" className="self-start overflow-hidden rounded-[var(--radius-card)] border border-line bg-canvas shadow-[var(--shadow-raise)]">
            <div className="flex items-center justify-between gap-3 border-b border-line bg-brand-soft px-5 py-3">
              <p id="exemplo-titulo" className="font-semibold text-brand-ink">
                Exemplo ilustrativo de ficha
              </p>
              <SealBadge compact />
            </div>
            <div className="p-5">
              <p className="text-xl font-bold text-ink">Pousada de exemplo</p>
              <p className="text-[0.9375rem] text-ink-2">Este estabelecimento não existe: serve só para mostrar o formato.</p>
              <dl className="mt-4 divide-y divide-line border-y border-line">
                {EXEMPLO.map((c) => (
                  <div key={c.categoria} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5">
                    <dt className="text-ink">{c.categoria}</dt>
                    <dd className="flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink-2">
                      <StatusIcon status={c.status} />
                      <span>
                        {STATUS_LABEL[c.status]}
                        <span className="block text-sm font-normal text-ink-3">{c.detalhe}</span>
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
              <figcaption className="mt-4 text-sm text-ink-3">Na plataforma, cada ficha é preenchida pelo próprio estabelecimento.</figcaption>
            </div>
          </figure>
        </div>
      </section>

      <section aria-labelledby="como" className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <h2 id="como" className="max-w-[24ch] text-[1.75rem] font-bold leading-tight text-ink">
          “Acessível” não basta. Aqui você vê o que tem.
        </h2>
        <div className="mt-8 grid gap-x-12 gap-y-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold text-ink">Ficha em cinco partes</h3>
            <p className="mt-2 text-ink-2">
              Acesso externo, circulação interna, sanitários, sinalização e atendimento. Cada item diz se existe, traz a medida ou
              mostra que o local ainda não informou.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">Filtro pela sua necessidade</h3>
            <p className="mt-2 text-ink-2">
              Mobilidade reduzida, deficiência visual ou auditiva. Os resultados mostram primeiro o que muda a sua viagem.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink">Selo por mérito</h3>
            <p className="mt-2 text-ink-2">
              O Selo Acessibilidade Verificada só aparece depois que viajantes reais confirmam a ficha com boas avaliações.
            </p>
          </div>
        </div>
        <Link to="/panorama" className="mt-8 inline-flex min-h-11 items-center gap-1 font-semibold text-brand">
          Ver o panorama da acessibilidade por destino
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </section>

      <section className="bg-brand-ink on-dark">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <h2 className="text-[1.5rem] font-bold text-white">Seu negócio é acessível? Mostre isso com dados.</h2>
            <p className="mt-2 max-w-[56ch] text-[#d6e2fb]">
              Preencha a ficha uma vez, receba avaliações de quem precisa de acessibilidade e conquiste o Selo.
            </p>
          </div>
          <ButtonLink to="/parceiro/cadastro" variant="secondary" className="shrink-0 border-white">
            Cadastrar meu negócio
          </ButtonLink>
        </div>
      </section>

      <footer className="border-t border-line bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-3 md:px-6">
          <p>AcessoTrip · Projeto Integrador ADS, IFBA Campus Eunápolis, 2026.</p>
        </div>
      </footer>
    </>
  )
}
