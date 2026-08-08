import { Check, Clock, ChevronRight, Target } from 'lucide-react'
import { Chip } from '../ui'
import { useStore } from '../../store'
import { journeyStages, roadmap, proceeds, register, type Priority } from '../../report/model'

type JourneyState = 'done' | 'current' | 'next' | 'upcoming'

const NODE: Record<JourneyState, { circle: string; card: string }> = {
  done: { circle: 'bg-ok text-white', card: 'border-line bg-white' },
  current: { circle: 'bg-accent-600 text-white', card: 'border-accent-300 bg-accent-50/50' },
  next: { circle: 'border-2 border-warn text-warn bg-white', card: 'border-warn-line bg-warn-bg/40' },
  upcoming: { circle: 'bg-panel text-muted', card: 'border-line bg-panel/30' },
}

const SEV_BADGE: Record<Priority, string> = {
  P1: 'bg-bad-bg text-bad ring-bad-line',
  P2: 'bg-warn-bg text-warn ring-warn-line',
  P3: 'bg-info-bg text-info ring-info-line',
}

/**
 * Path to Filing — where the draft stands in the IPO journey, what
 * remains before filing, and how the proceeds are deployed. CSS-based
 * and print-friendly; every element carries information.
 */
export default function PathToFiling() {
  const bankerReviewStarted = useStore((s) => s.bankerReviewStarted)
  const gapResolutions = useStore((s) => s.gapResolutions)

  const stateOf = (id: string): JourneyState => {
    if (id === 'promoter' || id === 'generate') return 'done'
    // The draft is prepared and validated; it now sits ready for review.
    if (id === 'ready') return bankerReviewStarted ? 'done' : 'next'
    if (id === 'banker') return bankerReviewStarted ? 'current' : 'upcoming'
    return 'upcoming'
  }
  const allResolved = register.every((f) => !!gapResolutions[f.id])

  return (
    <section aria-label="Path to filing" className="card mb-5 overflow-hidden">
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <div className="eyebrow">Path to filing</div>
        <h2 className="mt-1.5 text-[20px] font-extrabold tracking-[-0.028em] text-ink">IPO Readiness Journey</h2>
        <p className="mt-1.5 max-w-[74ch] text-[13px] leading-[1.55] text-muted">
          Where the draft sits in the IPO journey, the items still to clear before filing, and how the
          fresh-issue proceeds are deployed.
        </p>
      </div>

      {/* IPO journey */}
      <Part title="IPO journey">
        <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          {journeyStages.map((s, i) => {
            const st = stateOf(s.id)
            return (
              <li key={s.id} className="contents">
                <div className={`flex-1 rounded-xl2 border p-3 ${NODE[st].card}`}>
                  <div className="flex items-center gap-2">
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${NODE[st].circle}`}>
                      {st === 'done' ? <Check size={13} aria-hidden="true" /> : st === 'next' ? <Clock size={12} aria-hidden="true" /> : i + 1}
                    </span>
                    {st === 'current' && <Chip tone="blue">In review</Chip>}
                    {st === 'next' && <Chip tone="amber">You are here</Chip>}
                  </div>
                  <div className="mt-2 text-[12.5px] font-bold text-ink">{s.label}</div>
                  <div className="mt-0.5 text-[11px] leading-snug text-muted">{s.detail}</div>
                </div>
                {i < journeyStages.length - 1 && (
                  <ChevronRight size={18} className="hidden shrink-0 self-center text-muted sm:block" aria-hidden="true" />
                )}
              </li>
            )
          })}
        </ol>
      </Part>

      {/* Remediation roadmap */}
      <Part title="Remediation roadmap">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
          {roadmap.map((stage) => {
            const stageDone = stage.items.length > 0 && stage.items.every((it) => !!gapResolutions[it.id])
            return (
              <div key={stage.key} className="contents">
                <div className="flex-1 rounded-xl2 border border-line bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink-2">{stage.label}</span>
                    <span className={`mono rounded px-1.5 py-0.5 text-[10px] font-bold ring-1 ring-inset ${SEV_BADGE[stage.priority]}`}>
                      {stage.priority}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1.5">
                    {stage.items.length === 0 && <li className="text-[11px] text-faint">None</li>}
                    {stage.items.map((it) => {
                      const done = !!gapResolutions[it.id]
                      return (
                        <li key={it.id} className="flex items-start gap-1.5 text-[11.5px] leading-snug">
                          {done ? (
                            <Check size={12} className="mt-0.5 shrink-0 text-ok" aria-hidden="true" />
                          ) : (
                            <span className="mono mt-px shrink-0 text-[10px] font-bold text-accent-700">{it.code}</span>
                          )}
                          <span className={done ? 'text-muted line-through' : 'text-ink-2'}>{it.title}</span>
                        </li>
                      )
                    })}
                  </ul>
                  {stageDone && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-bold text-ok">
                      <Check size={11} aria-hidden="true" /> Cleared
                    </div>
                  )}
                </div>
                <ChevronRight size={18} className="hidden shrink-0 self-center text-muted sm:block" aria-hidden="true" />
              </div>
            )
          })}
          <div
            className={`grid shrink-0 place-items-center rounded-xl2 border p-3 text-center sm:w-[112px] ${
              allResolved ? 'border-ok-line bg-ok-bg/50' : 'border-line bg-panel/30'
            }`}
          >
            <div>
              <Target size={18} className={`mx-auto ${allResolved ? 'text-ok' : 'text-muted'}`} aria-hidden="true" />
              <div className={`mt-1 text-[11.5px] font-bold ${allResolved ? 'text-ok' : 'text-ink-2'}`}>Ready to file</div>
            </div>
          </div>
        </div>
      </Part>

      {/* Use of proceeds */}
      <Part title="Use of proceeds" aside={<Chip tone="outline">₹{proceeds.totalCr.toFixed(2)} Cr total</Chip>}>
        <div className="flex h-7 w-full overflow-hidden rounded-lg border border-line" role="img" aria-label="Use of proceeds breakdown">
          {proceeds.items.map((it) => (
            <div key={it.purpose} style={{ width: `${it.pct}%`, background: it.color }} title={`${it.purpose}: ${it.pct}%`} />
          ))}
        </div>

        <div className="mt-3 space-y-1.5">
          {proceeds.items.map((it) => (
            <div key={it.purpose} className="flex items-center justify-between gap-3 text-[12px]">
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: it.color }} aria-hidden="true" />
                <span className="truncate text-ink-2">{it.purpose}</span>
              </span>
              <span className="mono shrink-0 font-semibold text-ink">₹{it.amtCr.toFixed(2)} Cr · {it.pct}%</span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px]">
            <span className="text-ink-2">
              GCP: <span className="mono font-semibold text-ink">₹{proceeds.gcpAmtCr.toFixed(2)} Cr</span>
            </span>
            <span className="text-ink-2">
              Applicable Cap: <span className="mono font-semibold text-ink">₹{proceeds.gcpCapCr.toFixed(2)} Cr</span>
            </span>
            <Chip tone={proceeds.gcpPass ? 'green' : 'amber'}>
              {proceeds.gcpPass && <Check size={11} aria-hidden="true" />} Status: {proceeds.gcpPass ? 'Pass' : 'Review'}
            </Chip>
          </div>
          <span className="mono text-[12px] font-bold text-ink">Total ₹{proceeds.totalCr.toFixed(2)} Cr</span>
        </div>
      </Part>
    </section>
  )
}

/* ---------- local primitives ---------- */

function Part({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-b border-line px-5 py-5 last:border-b-0 sm:px-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-ink-2">{title}</h3>
        {aside}
      </div>
      {children}
    </div>
  )
}
