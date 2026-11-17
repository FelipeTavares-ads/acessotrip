import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { Combobox } from '../components/Combobox'
import { Button, ButtonLink, NeedIcon, StatusIcon, ToggleChip, SealBadge } from '../components/ui'
import { DESTINATIONS, PLACES } from '../data/places'
import { CATEGORIES, NEEDS, STATUS_LABEL, statusForCategory } from '../data/domain'
import type { NeedId } from '../data/types'

const sample = PLACES[0]

export default function Landing() {
  const nav = useNavigate()
  const [destino, setDestino] = useState('')
  const [needs, setNeeds] = useState<NeedId[]>([])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const q = new URLSearchParams()
    if (destino) q.set('destino', destino)
    if (needs.length) q.set('nec', needs.join(','))
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
              Hotéis, pousadas e restaurantes com ficha técnica de acessibilidade: medidas reais, fotos do local e relatos de
              quem tem a mesma necessidade que você.
            </p>

            <form onSubmit={submit} role="search" aria-label="Buscar lugares acessíveis" className="mt-8 flex flex-col gap-5">
              <Combobox
                label="Para onde você vai?"
                value={destino}
                onChange={setDestino}
                options={DESTINATIONS}
                placeholder="Cidade ou estado"
              />
              <fieldset>
                <legend className="mb-2 font-semibold text-ink">Mostrar o que importa para</legend>
                <div className="flex flex-wrap gap-2">
                  {NEEDS.map((n) => (
                    <ToggleChip
                      key={n.id}
                      pressed={needs.includes(n.id)}
                      onToggle={() => setNeeds((s) => (s.includes(n.id) ? s.filter((x) => x !== n.id) : [...s, n.id]))}
                      icon={<NeedIcon need={n.id} className="size-4" />}
                    >
                      {n.label}
                    </ToggleChip>
                  ))}
                </div>
              </fieldset>
              <Button type="submit" className="min-h-14 text-[1.0625rem] md:self-start md:px-8">
                <Search aria-hidden className="size-5" />
                Buscar lugares
              </Button>
            </form>
          </div>

          {/* Prova do mecanismo: um trecho de ficha real do catálogo de exemplo */}
          <figure className="self-start overflow-hidden rounded-[var(--radius-card)] border border-line bg-canvas shadow-[var(--shadow-raise)]">
            <div className="relative aspect-[16/9]">
              <img src={sample.fotos[0].src} alt={sample.fotos[0].alt} className="size-full object-cover" />
              <span className="absolute left-3 top-3">
                <SealBadge />
              </span>
            </div>
            <div className="p-5">
              <p className="text-xl font-bold text-ink">{sample.nome}</p>
              <p className="text-[0.9375rem] text-ink-2">
                Hotel em {sample.cidade}, {sample.uf}
              </p>
              <dl className="mt-4 divide-y divide-line border-y border-line">
                {CATEGORIES.map((c) => {
                  const st = statusForCategory(sample, c.id)
                  return (
                    <div key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                      <dt className="text-ink">{c.label}</dt>
                      <dd className="flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink-2">
                        <StatusIcon status={st} />
                        {STATUS_LABEL[st]}
                      </dd>
                    </div>
                  )
                })}
              </dl>
              <figcaption className="mt-4 flex items-center justify-between gap-3 text-sm text-ink-3">
                <span>Exemplo de ficha (dados fictícios)</span>
                <Link to={`/local/${sample.id}`} className="inline-flex min-h-11 items-center gap-1 font-semibold text-brand">
                  Ver ficha completa
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </figcaption>
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
              Acesso externo, circulação interna, sanitários, sinalização e atendimento. Cada item diz se atende, atende em
              parte ou se o local ainda não informou.
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
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-ink-3 md:flex-row md:justify-between md:px-6">
          <p>AcessoTrip · Projeto Integrador ADS, IFBA Campus Eunápolis, 2026.</p>
          <p>Estabelecimentos e avaliações exibidos são exemplos fictícios.</p>
        </div>
      </footer>
    </>
  )
}
