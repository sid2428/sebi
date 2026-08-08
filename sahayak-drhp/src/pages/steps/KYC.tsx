import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, AlertTriangle, ChevronDown, ShieldCheck, Fingerprint,
  Landmark, PieChart, Scale, FileSignature, RotateCcw,
} from 'lucide-react'
import { useStore } from '../../store'
import { PHASES } from '../../data/mock'
import { KYC_RESOLUTIONS, type ResolutionOption } from '../../data/drafts'
import Term from '../../components/Term'
import { Chip } from '../../components/ui'
import { ResultNote, StageBlock, StageFooter, StageHeader } from '../../components/stage'
import ResolutionDialog from '../../components/ResolutionDialog'
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

type Filter = 'all' | 'attention' | 'cleared'

export default function KYC() {
  const goStep = useStore((s) => s.goStep)
  const completeStep = useStore((s) => s.completeStep)
  const showToast = useStore((s) => s.showToast)
  const jumpTarget = useStore((s) => s.jumpTarget)
  const setJumpTarget = useStore((s) => s.setJumpTarget)
  const resolvedKyc = useStore((s) => s.resolvedKyc)
  const resolveKycItem = useStore((s) => s.resolveKycItem)

  const [open, setOpen] = useState<string | null>('people')
  const [filter, setFilter] = useState<Filter>('all')
  const [active, setActive] = useState<string | null>(null)

  const isCleared = (label: string, status: string) => status === 'done' || !!resolvedKyc[label]

  const phases = useMemo(
    () =>
      PHASES.map((p) => {
        const items = p.items.map((item) => ({ ...item, cleared: isCleared(item.label, item.status) }))
        const openCount = items.filter((i) => !i.cleared).length
        return { ...p, items, openCount, cleared: openCount === 0 }
      }),
    [resolvedKyc]
  )

  const visible = phases.filter((p) =>
    filter === 'all' ? true : filter === 'attention' ? !p.cleared : p.cleared
  )

  const cleared = phases.filter((p) => p.cleared).length
  const attention = phases.length - cleared
  const totalChecks = phases.reduce((a, p) => a + p.items.length, 0)
  const openItems = phases.flatMap((p) => p.items.filter((i) => !i.cleared))

  useEffect(() => {
    if (jumpTarget?.kind !== 'phase') return
    setFilter('all')
    setOpen(jumpTarget.id)
    document.getElementById(`phase-${jumpTarget.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setJumpTarget(null)
  }, [jumpTarget, setJumpTarget])

  const activeConfig = active ? KYC_RESOLUTIONS[active] : null

  function handleResolved(option: ResolutionOption) {
    if (!active) return
    resolveKycItem(active, option.outcome)
    showToast(`Resolved · ${option.label}`)
  }

  return (
    <div>
      <StageHeader
        step="kyc"
        eyebrow={
          <Chip tone="accent">
            <Fingerprint size={12} /> Guided <Term term="KYC">KYC</Term> · 6 phases
          </Chip>
        }
        why={
          <>
            We check your particulars area by area, the way a{' '}
            <Term term="merchant_banker">merchant banker</Term>’s diligence checklist runs. A phase turns green
            only when everything inside it genuinely clears.
          </>
        }
        todo={
          openItems.length
            ? `Open the amber phases and resolve the ${openItems.length} item${openItems.length === 1 ? '' : 's'} that needs a decision from you. Everything else has already cleared automatically.`
            : 'Every check has cleared. Read the summary if you want, then continue to the eligibility check.'
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat n={cleared} label="Phases cleared" tone="ok" icon={Check} />
        <Stat n={attention} label="Need your input" tone={attention ? 'warn' : 'ok'} icon={AlertTriangle} />
        <Stat n={totalChecks} label="Checks run" tone="accent" icon={ShieldCheck} />
      </div>

      {/* ===== The one thing to do here ===== */}
      {openItems.length > 0 && (
        <StageBlock
          title="Needs a decision from you"
          hint="These two are not blockers, but your banker will ask about them. Deciding now keeps the draft clean."
        >
          <div className="space-y-3">
            {openItems.map((item) => (
              <Reveal key={item.label} shape="settle">
                <div className="card flex flex-wrap items-center gap-4 border-warn-line bg-warn-bg/30 p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl2 bg-warn-bg text-warn">
                    <AlertTriangle size={19} />
                  </span>
                  <div className="min-w-[220px] flex-1">
                    <b className="block text-[14.5px] font-bold">{item.label}</b>
                    {item.note && <p className="mono mt-1 text-[12px] text-muted">{item.note}</p>}
                  </div>
                  <button onClick={() => setActive(item.label)} className="btn btn-gold btn-sm shrink-0">
                    Resolve this
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </StageBlock>
      )}

      {/* ===== The full checklist ===== */}
      <StageBlock
        title="All six verification phases"
        hint="Open a phase to see each individual check and what it was matched against."
        aside={
          <div className="inline-flex rounded-xl2 bg-panel p-1" role="tablist" aria-label="Filter phases">
            {(
              [
                ['all', `All ${phases.length}`],
                ['attention', `Open ${attention}`],
                ['cleared', `Cleared ${cleared}`],
              ] as const
            ).map(([id, label]) => {
              const on = filter === id
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setFilter(id)}
                  className={`relative rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition-colors duration-200 ${
                    on ? 'text-white' : 'text-ink-3 hover:text-ink'
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="kyc-filter"
                      className="absolute inset-0 rounded-lg bg-ink"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span className="relative whitespace-nowrap">{label}</span>
                </button>
              )
            })}
          </div>
        }
      >
        {visible.length === 0 ? (
          <div className="card p-6 text-center">
            <b className="block text-[14.5px] font-bold">Nothing in this filter</b>
            <p className="mt-1 text-[13px] text-muted">
              {filter === 'attention'
                ? 'Every phase has cleared — there is nothing left needing your input.'
                : 'No phase has fully cleared yet.'}
            </p>
            <button onClick={() => setFilter('all')} className="btn btn-ghost btn-sm mt-4">
              Show all phases
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((p, index) => {
              const Icon = ICONS[p.id]
              const isOpen = open === p.id
              const doneCount = p.items.filter((i) => i.cleared).length

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
                          p.cleared ? 'bg-ok-bg text-ok' : 'bg-warn-bg text-warn'
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
                            className={`h-1.5 w-5 rounded-full transition-colors duration-300 ${
                              it.cleared ? 'bg-ok' : 'bg-warn'
                            }`}
                          />
                        ))}
                      </span>

                      <span className={`mono shrink-0 text-[13px] font-bold ${p.cleared ? 'text-ok' : 'text-warn'}`}>
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
                            {p.items.map((it) => {
                              const resolution = resolvedKyc[it.label]
                              return (
                                <li
                                  key={it.label}
                                  className="flex items-center gap-3.5 border-b border-dashed border-line py-3 text-[13.5px] last:border-0"
                                >
                                  <span
                                    className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full ${
                                      it.cleared ? 'bg-ok-bg text-ok' : 'bg-warn-bg text-warn'
                                    }`}
                                  >
                                    {it.cleared ? <Check size={12} strokeWidth={3} /> : <AlertTriangle size={11} />}
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className={`block ${it.cleared ? 'text-ink-2' : 'font-bold text-ink'}`}>
                                      {it.label}
                                    </span>
                                    {it.note && !resolution && (
                                      <small className="mono mt-0.5 block text-[11.5px] text-muted">{it.note}</small>
                                    )}
                                    {resolution && (
                                      <small className="mt-0.5 block text-[11.5px] font-semibold text-ok">
                                        Resolved · {resolution}
                                      </small>
                                    )}
                                  </span>
                                  {!it.cleared && (
                                    <button
                                      onClick={() => setActive(it.label)}
                                      className="btn btn-ghost btn-sm shrink-0"
                                    >
                                      Resolve
                                    </button>
                                  )}
                                </li>
                              )
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              )
            })}
          </div>
        )}
      </StageBlock>

      {openItems.length === 0 && (
        <ResultNote className="mt-6" tone="ok">
          All {totalChecks} checks have cleared. Your decisions are recorded in the audit trail and carried into
          the sections they affect.
        </ResultNote>
      )}

      <StageFooter
        step="kyc"
        continueLabel="Run eligibility check"
        note={
          openItems.length
            ? `${openItems.length} item${openItems.length === 1 ? '' : 's'} still open — they will be disclosed, not hidden.`
            : 'Every phase is green.'
        }
        extra={
          Object.keys(resolvedKyc).length > 0 ? (
            <button
              onClick={() => {
                useStore.setState({ resolvedKyc: {} })
                showToast('Verification decisions reset')
              }}
              className="btn btn-quiet btn-sm"
            >
              <RotateCcw size={13} /> Reset my decisions
            </button>
          ) : undefined
        }
        onContinue={() => {
          completeStep('kyc')
          goStep('eligibility')
        }}
      />

      <ResolutionDialog
        open={!!activeConfig}
        heading="Resolve this check"
        question={activeConfig?.question ?? ''}
        subject={active ?? ''}
        options={activeConfig?.options ?? []}
        onClose={() => setActive(null)}
        onResolve={handleResolved}
      />
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
