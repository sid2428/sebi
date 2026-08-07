import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, AlertTriangle, ChevronDown, ArrowRight, ShieldCheck, Fingerprint,
  Landmark, PieChart, Scale, FileSignature,
} from 'lucide-react'
import { useStore } from '../../store'
import { PHASES } from '../../data/mock'
import Term from '../../components/Term'
import { Chip } from '../../components/ui'
import { Counter, Reveal } from '../../components/motion'
import { EASE } from '../../lib/motion'

const ICONS: Record<string, any> = {
  identity: ShieldCheck,
  people: Fingerprint,
  financials: Landmark,
  capital: PieChart,
  legal: Scale,
  contracts: FileSignature,
}

export default function KYC() {
  const goStep = useStore((s) => s.goStep)
  const showToast = useStore((s) => s.showToast)
  const jumpTarget = useStore((s) => s.jumpTarget)
  const setJumpTarget = useStore((s) => s.setJumpTarget)
  const [open, setOpen] = useState<string | null>('people')

  const done = PHASES.filter((p) => p.status === 'done').length
  const attention = PHASES.filter((p) => p.status === 'attention').length

  useEffect(() => {
    if (jumpTarget?.kind !== 'phase') return
    setOpen(jumpTarget.id)
    document.getElementById(`phase-${jumpTarget.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setJumpTarget(null)
  }, [jumpTarget, setJumpTarget])

  return (
    <div>
      <Chip tone="accent" className="mb-3">
        <Fingerprint size={12} /> Guided <Term term="KYC">KYC</Term> · 6 phases
      </Chip>
      <h1 className="text-[27px] font-extrabold tracking-[-0.03em]">Verification &amp; KYC</h1>
      <p className="mt-2 max-w-[58ch] text-[14.5px] leading-[1.62] text-ink-3">
        {/* Desired outcome 1 and 6: first-time issuers can decode diligence jargon inline instead of leaving the flow. */}
        We verify your particulars area by area, the way a <Term term="merchant_banker">merchant banker</Term>’s
        diligence checklist runs. Each phase turns green only when it genuinely clears.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat n={done} label="Phases cleared" tone="ok" icon={Check} />
        <Stat n={attention} label="Need your input" tone="warn" icon={AlertTriangle} />
        <Stat n={PHASES.reduce((a, p) => a + p.items.length, 0)} label="Checks run" tone="accent" icon={ShieldCheck} />
      </div>

      <div className="mt-6 space-y-3">
        {PHASES.map((p, index) => {
          const Icon = ICONS[p.id]
          const isOpen = open === p.id
          const doneCount = p.items.filter((i) => i.status === 'done').length
          const attn = p.status === 'attention'

          return (
            <Reveal key={p.id} shape="settle" delay={index * 0.04}>
              <div
                id={`phase-${p.id}`}
                className={`card scroll-mt-28 overflow-hidden transition-colors duration-200 ${
                  isOpen ? 'border-accent-200' : ''
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : p.id)}
                  aria-expanded={isOpen}
                  aria-controls={`phase-panel-${p.id}`}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-panel/50"
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl2 ${
                      attn ? 'bg-warn-bg text-warn' : 'bg-ok-bg text-ok'
                    }`}
                  >
                    <Icon size={19} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <b className="block text-[15.5px] font-bold">{p.title}</b>
                    <span className="block truncate text-[12.5px] text-muted">{p.sub}</span>
                  </span>

                  {/* Segmented completion — reads at a glance, no percentage. */}
                  <span className="hidden items-center gap-1 sm:flex" aria-hidden="true">
                    {p.items.map((it, i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-5 rounded-full ${
                          it.status === 'done' ? 'bg-ok' : 'bg-warn'
                        }`}
                      />
                    ))}
                  </span>

                  <span className={`mono shrink-0 text-[13px] font-bold ${attn ? 'text-warn' : 'text-ok'}`}>
                    {doneCount}/{p.items.length}
                  </span>

                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.24, ease: EASE }}>
                    <ChevronDown size={17} className="text-muted" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`phase-panel-${p.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      className="overflow-hidden border-t border-line"
                    >
                      <ul className="px-5 py-1">
                        {p.items.map((it) => (
                          <li
                            key={it.label}
                            className="flex items-center gap-3.5 border-b border-dashed border-line py-3 text-[13.5px] last:border-0"
                          >
                            <span
                              className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full ${
                                it.status === 'done' ? 'bg-ok-bg text-ok' : 'bg-warn-bg text-warn'
                              }`}
                            >
                              {it.status === 'done' ? <Check size={12} strokeWidth={3} /> : <AlertTriangle size={11} />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={`block ${it.status === 'attention' ? 'font-bold text-ink' : 'text-ink-2'}`}>
                                {it.label}
                              </span>
                              {it.note && <small className="mono mt-0.5 block text-[11.5px] text-muted">{it.note}</small>}
                            </span>
                            {it.status === 'attention' && (
                              <button
                                onClick={() => showToast('Resolution requested — co-pilot notified')}
                                className="btn btn-ghost btn-sm shrink-0"
                              >
                                Resolve
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          )
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <p className="max-w-[46ch] text-[13.5px] leading-relaxed text-muted">
          Two items are flagged but non-blocking. The co-pilot carries them into the right DRHP sections.
        </p>
        <button onClick={() => goStep('eligibility')} className="btn btn-gold btn-lg">
          Run eligibility check <ArrowRight size={17} />
        </button>
      </div>
    </div>
  )
}

function Stat({ n, label, tone, icon: Icon }: { n: number; label: string; tone: 'ok' | 'warn' | 'accent'; icon: any }) {
  const map = {
    ok: 'bg-ok-bg text-ok',
    warn: 'bg-warn-bg text-warn',
    accent: 'bg-accent-50 text-accent-600',
  }
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl2 ${map[tone]}`}>
        <Icon size={18} />
      </span>
      <div>
        <div className="mono text-[23px] font-extrabold leading-none tracking-[-0.035em]">
          <Counter to={n} />
        </div>
        <div className="mt-1 text-[12px] text-muted">{label}</div>
      </div>
    </div>
  )
}
