import { useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BedDouble, CircleAlert, LoaderCircle, Sparkles, UtensilsCrossed } from 'lucide-react'
import { ErrorSummary } from '../components/ErrorSummary'
import { PageHeader } from '../components/Layout'
import { Button, NeedIcon, NeedStatusPill, SelectField, ToggleChip } from '../components/ui'
import { NEEDS, statusForNeed } from '../data/domain'
import { PLACES } from '../data/places'
import type { NeedId, Place } from '../data/types'
import { useStore } from '../state/store'

const CITIES = Array.from(new Set(PLACES.map((p) => `${p.cidade}, ${p.uf}`))).sort((a, b) => a.localeCompare(b, 'pt-BR'))

interface Day {
  dia: number
  hospedagem?: Place
  refeicao?: Place
}

/**
 * RF26 — Roteiro gerado por agente de IA. Nesta versão de telas o "agente" é simulado:
 * escolhe só estabelecimentos do catálogo que não falham nas necessidades (RN09 — fidelidade).
 */
function gerar(cidade: string, dias: number, needs: NeedId[]): Day[] {
  const ok = (p: Place) => `${p.cidade}, ${p.uf}` === cidade && needs.every((n) => statusForNeed(p, n) !== 'nao')
  const stay = PLACES.filter((p) => ok(p) && p.tipo !== 'RESTAURANTE').sort((a, b) => Number(b.seloVerificado) - Number(a.seloVerificado))[0]
  const food = PLACES.filter((p) => ok(p) && p.tipo === 'RESTAURANTE')
  return Array.from({ length: dias }, (_, i) => ({ dia: i + 1, hospedagem: stay, refeicao: food[i % Math.max(food.length, 1)] }))
}

export default function Roteiro() {
  const { traveler } = useStore()
  const [cidade, setCidade] = useState('')
  const [dias, setDias] = useState('3')
  const [needs, setNeeds] = useState<NeedId[]>(traveler?.necessidades ?? [])
  const [attempt, setAttempt] = useState(0)
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<Day[] | null>(null)
  const resultRef = useRef<HTMLHeadingElement>(null)

  const errors = { cidade: !cidade ? 'Escolha o destino.' : undefined }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setAttempt((a) => a + 1)
    if (errors.cidade) return
    setLoading(true)
    setPlan(null)
    window.setTimeout(() => {
      setPlan(gerar(cidade, Number(dias), needs))
      setLoading(false)
      window.setTimeout(() => resultRef.current?.focus(), 0)
    }, 900)
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Roteiro acessível"
        lead="Diga o destino e suas necessidades. O assistente monta um roteiro só com lugares que estão no catálogo e têm ficha técnica."
      />
      <form noValidate onSubmit={submit} className="flex flex-col gap-5 rounded-[var(--radius-card)] border border-line bg-canvas p-5">
        <ErrorSummary errors={attempt ? errors : {}} attempt={attempt} />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField id="cidade" label="Destino" value={cidade} onChange={(e) => setCidade(e.target.value)} error={attempt ? errors.cidade : undefined}>
            <option value="">Escolha uma cidade</option>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </SelectField>
          <SelectField label="Duração" value={dias} onChange={(e) => setDias(e.target.value)}>
            {[1, 2, 3, 4, 5].map((d) => (
              <option key={d} value={d}>
                {d} {d === 1 ? 'dia' : 'dias'}
              </option>
            ))}
          </SelectField>
        </div>
        <fieldset>
          <legend className="mb-2 font-semibold">Necessidades</legend>
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
        <Button type="submit" disabled={loading} className="sm:self-start">
          {loading ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : <Sparkles aria-hidden className="size-5" />}
          {loading ? 'Montando roteiro…' : 'Gerar roteiro'}
        </Button>
      </form>

      <div aria-live="polite" className="sr-only">
        {loading ? 'Montando roteiro, aguarde.' : plan ? 'Roteiro pronto.' : ''}
      </div>

      {plan && (
        <section aria-labelledby="roteiro-resultado" className="mt-8">
          <h2 id="roteiro-resultado" ref={resultRef} tabIndex={-1} className="text-xl font-bold outline-none">
            Seu roteiro em {cidade}
          </h2>
          {!plan[0]?.hospedagem && !plan[0]?.refeicao ? (
            <p className="mt-3 flex gap-2 rounded-[var(--radius-card)] bg-partial-soft p-4 text-partial">
              <CircleAlert aria-hidden className="size-5 shrink-0" />
              Ainda não há lugares no catálogo de {cidade} que atendam a essas necessidades. Preferimos não sugerir nada a sugerir um
              lugar sem ficha.
            </p>
          ) : (
            <ol className="mt-4 flex flex-col gap-4">
              {plan.map((d) => (
                <li key={d.dia} className="rounded-[var(--radius-card)] border border-line bg-canvas p-5">
                  <h3 className="text-lg font-bold">Dia {d.dia}</h3>
                  <ul className="mt-3 flex flex-col gap-3">
                    {[
                      { p: d.hospedagem, Icon: BedDouble, label: 'Hospedagem' },
                      { p: d.refeicao, Icon: UtensilsCrossed, label: 'Refeição' },
                    ].map(({ p, Icon, label }) =>
                      p ? (
                        <li key={label} className="flex items-start gap-3">
                          <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-brand" />
                          <div>
                            <p className="text-sm font-semibold text-ink-3">{label}</p>
                            <Link to={`/local/${p.id}`} className="font-bold text-brand">
                              {p.nome}
                            </Link>
                            {needs.length > 0 && (
                              <ul aria-label="Acessibilidade" className="mt-1.5 flex flex-wrap gap-1.5">
                                {needs.map((n) => (
                                  <li key={n}>
                                    <NeedStatusPill need={n} status={statusForNeed(p, n)} />
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </li>
                      ) : (
                        <li key={label} className="flex items-start gap-3 text-ink-2">
                          <Icon aria-hidden className="mt-0.5 size-5 shrink-0 text-ink-3" />
                          {label}: nenhum lugar do catálogo atende a essas necessidades ainda.
                        </li>
                      ),
                    )}
                  </ul>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-4 text-sm text-ink-3">
            Sugestões geradas automaticamente a partir das fichas. Confira a ficha de cada lugar antes de reservar.
          </p>
        </section>
      )}
    </div>
  )
}
