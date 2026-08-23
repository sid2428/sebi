import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertTriangle, ScanSearch, ChevronDown, RotateCcw, Loader2 } from 'lucide-react'
import { useStore } from '../../store'
import { Chip, Ring } from '../../components/ui'
import { ELIGIBILITY, ISSUE } from '../../data/mock'
import Term from '../../components/Term'
import { ActionButton, ResultNote, StageBlock, StageFooter, StageHeader } from '../../components/stage'
import { Counter, Reveal } from '../../components/motion'
import { ComplianceBadge } from '../../components/illustrations'
import { useProgressNarration, useSimulatedAction } from '../../lib/actions'
import { EASE } from '../../lib/motion'

/** Where each verdict ends up in the draft — the "so what" of a criterion. */
const LANDS_IN: Record<string, string> = {
  'Post-issue paid-up capital': 'Section VIII · Capital Structure',
  'Operating track record': 'Section VI · Our Business',
  'Operating profit (EBITDA)': 'Section VII · Financial Information',
  'Net tangible assets': 'Section VII · Financial Information',
  'Positive net worth': 'Section VII · Financial Information',
  'Free cash flow to equity': 'Section VII · Financial Information',
  Leverage: 'Section VII · Financial Information',
  'Promoter contribution & lock-in': 'Section XIII · Promoters & Promoter Group',
  'Offer for sale': 'Section IX · Objects of the Issue',
  'General corporate purposes': 'Section IX · Objects of the Issue',
  'Winding-up / insolvency': 'Section XI · Legal & Regulatory',
  'Material litigation': 'Section XI · Legal & Regulatory',
}

const RUN_LINES = [
  'Reading the exchange listing norms…',
  'Testing capital and net-worth thresholds…',
  'Checking the three-year operating record…',
  'Running the regulatory and litigation search…',
  'Scoring the result…',
]

type Filter = 'all' | 'cleared' | 'disclose'

export default function Eligibility() {
  const goStep = useStore((s) => s.goStep)
  const completeStep = useStore((s) => s.completeStep)
  const showToast = useStore((s) => s.showToast)
  const eligibilityRun = useStore((s) => s.eligibilityRun)
  const setEligibilityRun = useStore((s) => s.setEligibilityRun)

  const [filter, setFilter] = useState<Filter>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const check = useSimulatedAction({ ms: 2000 })
  const narration = useProgressNarration(RUN_LINES, check.isRunning, 420)

  const passed = ELIGIBILITY.criteria.filter((c) => c.ok).length
  const toDisclose = ELIGIBILITY.criteria.length - passed
  const visible = ELIGIBILITY.criteria.filter((c) =>
    filter === 'all' ? true : filter === 'cleared' ? c.ok : !c.ok
  )

  function runCheck(rerun = false) {
    check.run({
      onComplete: () => {
        setEligibilityRun(true)
        showToast(rerun ? 'Eligibility re-checked — no change in verdict' : `Eligibility scored ${ELIGIBILITY.score}/100`)
      },
    })
  }

  return (
    <div>
      <StageHeader
        step="eligibility"
        eyebrow={
          <Chip tone="accent">
            <ScanSearch size={12} /> Rule engine · {ISSUE.platform}
          </Chip>
        }
        why={
          <>
            Before drafting anything, we test your company against the SME-platform listing norms, so you find
            out early whether the exchange will accept you — and on what terms under{' '}
            <Term term="SEBI ICDR">SEBI ICDR</Term>.
          </>
        }
        todo={
          eligibilityRun
            ? 'Read the verdict, then open any criterion you want the reasoning for. Amber items are disclosure work, not disqualifications.'
            : `Run the check. It tests ${ELIGIBILITY.criteria.length} criteria against the figures in the documents you just supplied, and takes a couple of seconds.`
        }
      />

      {/* ===== Not run yet ===== */}
      {!eligibilityRun && (
        <StageBlock title="Run the SEBI Eligibility Verification">
          <div className="card p-6">
            <p className="max-w-[62ch] text-[13.5px] leading-[1.65] text-ink-3">
              We will test {ELIGIBILITY.criteria.length} criteria — post-issue capital, track record, the ₹1
              crore operating-profit floor introduced in 2025, net tangible assets, net worth, free cash flow to
              equity, leverage, promoter contribution and lock-in, the offer-for-sale and general-corporate-purposes
              caps, insolvency proceedings and material litigation. Nothing is filed or sent anywhere; this runs
              entirely on the figures read out of your documents.
            </p>

            <div className="mt-5">
              <ActionButton
                state={check.state}
                idle="Run SEBI Eligibility Verification"
                running="Checking…"
                done="Check complete"
                icon={<ScanSearch size={16} />}
                className="btn btn-gold btn-lg"
                onClick={() => runCheck()}
              />
            </div>

            <AnimatePresence>
              {check.isRunning && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.24, ease: EASE }}
                  className="mt-5 rounded-2xl2 border border-line bg-panel/70 p-4"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-2.5 text-[13.5px] font-semibold text-ink-2">
                    <Loader2 size={15} className="animate-spin text-accent-600" />
                    {narration}
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg,#7DB7F8,#5B8DEF)' }}
                      initial={{ width: '4%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, ease: 'linear' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </StageBlock>
      )}

      {/* ===== Results ===== */}
      {eligibilityRun && (
        <>
          <Reveal shape="settle" className="mt-6">
            <div
              className="flex flex-wrap items-center gap-6 rounded-3xl2 px-6 py-6 text-white shadow-lg2 sm:px-7"
              style={{ background: 'linear-gradient(140deg,#0F7052 0%,#12805E 55%,#149A6F 100%)' }}
            >
              <ComplianceBadge level="pass" className="h-16 w-auto shrink-0" />
              <div className="min-w-[220px] flex-1">
                <h2 className="text-[21px] font-bold tracking-[-0.02em]">{ELIGIBILITY.verdict}</h2>
                <p className="mt-1.5 max-w-[54ch] text-[13.5px] leading-[1.6] text-white/90">{ELIGIBILITY.summary}</p>
              </div>
              <div className="grid shrink-0 place-items-center">
                <Ring
                  value={ELIGIBILITY.score}
                  size={88}
                  stroke={8}
                  color="#fff"
                  track="rgba(255,255,255,.22)"
                  label={`${ELIGIBILITY.score}`}
                  labelColor="#FFFFFF"
                />
                <span className="-mt-0.5 text-[11px] text-white/80">Eligibility score</span>
              </div>
            </div>
          </Reveal>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="card flex items-center gap-3 px-4 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl2 bg-ok-bg text-ok">
                <Check size={17} strokeWidth={2.6} />
              </span>
              <div>
                <b className="mono block text-[19px] font-extrabold leading-none">
                  <Counter to={passed} />
                </b>
                <span className="text-[12px] text-muted">criteria cleared</span>
              </div>
            </div>
            <div className="card flex items-center gap-3 px-4 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl2 bg-warn-bg text-warn">
                <AlertTriangle size={16} />
              </span>
              <div>
                <b className="mono block text-[19px] font-extrabold leading-none">
                  <Counter to={toDisclose} />
                </b>
                <span className="text-[12px] text-muted">needs disclosure</span>
              </div>
            </div>

            <button
              onClick={() => runCheck(true)}
              disabled={check.isRunning}
              className="btn btn-ghost btn-sm ml-auto"
              aria-busy={check.isRunning}
            >
              {check.isRunning ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Re-checking…
                </>
              ) : (
                <>
                  <RotateCcw size={13} /> Run the check again
                </>
              )}
            </button>
          </div>

          <StageBlock
            title="Criterion by criterion"
            hint="Open any row to see the requirement, your figure, and where the verdict lands in the draft."
            aside={
              <div className="inline-flex rounded-xl2 bg-panel p-1" role="tablist" aria-label="Filter criteria">
                {(
                  [
                    ['all', `All ${ELIGIBILITY.criteria.length}`],
                    ['cleared', `Cleared ${passed}`],
                    ['disclose', `Disclose ${toDisclose}`],
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
                          layoutId="eligibility-filter"
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
            <div className="card overflow-hidden">
              <ul>
                {visible.map((c, i) => {
                  const isOpen = expanded === c.title
                  return (
                    <motion.li
                      key={c.title}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.25), duration: 0.34, ease: EASE }}
                      className={`border-b border-line last:border-0 ${c.ok ? '' : 'bg-warn-bg/35'}`}
                    >
                      <button
                        onClick={() => setExpanded(isOpen ? null : c.title)}
                        aria-expanded={isOpen}
                        aria-controls={`criterion-${i}`}
                        className="flex w-full flex-col md:flex-row md:items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-panel/50"
                      >
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                          <span
                            className={`mt-0.5 grid h-[35px] w-[35px] shrink-0 place-items-center rounded-xl2 ${
                              c.ok ? 'bg-ok-bg text-ok' : 'bg-warn-bg text-warn'
                            }`}
                          >
                            {c.ok ? <Check size={18} strokeWidth={2.6} /> : <AlertTriangle size={17} />}
                          </span>

                          <div className="min-w-0 flex-1">
                            <span className="block text-[11px] font-bold uppercase tracking-[0.05em] text-muted">Rule</span>
                            <b className="block text-[14.5px] font-bold text-ink">{c.title}</b>
                            <span className="mt-0.5 block text-[12.5px] leading-[1.55] text-ink-3">
                              <span className="font-semibold text-muted">Result: </span>{c.note}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12.5px] pl-[51px] md:pl-0 md:text-right">
                          <div className="min-w-[120px]">
                            <span className="block text-[11px] font-bold uppercase tracking-[0.05em] text-muted">Requirement</span>
                            <span className="mono mt-0.5 block font-bold text-ink-2">{c.req}</span>
                          </div>
                          <div className="min-w-[120px]">
                            <span className="block text-[11px] font-bold uppercase tracking-[0.05em] text-muted">Company Value</span>
                            <span className="mono mt-0.5 block font-extrabold text-accent-700">{c.val}</span>
                          </div>
                          <div className="min-w-[80px]">
                            <span className="block text-[11px] font-bold uppercase tracking-[0.05em] text-muted">Status</span>
                            <span className={`mt-1 inline-block rounded px-2 py-0.5 text-[11px] font-extrabold ${
                              c.ok ? 'bg-ok-bg text-ok' : 'bg-warn-bg text-warn'
                            }`}>
                              {c.ok ? 'PASS' : 'DISCLOSE'}
                            </span>
                          </div>
                        </div>

                        <motion.span
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.24, ease: EASE }}
                          className="hidden md:block shrink-0 self-center"
                        >
                          <ChevronDown size={16} className="text-muted" />
                        </motion.span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={`criterion-${i}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.26, ease: EASE }}
                            className="overflow-hidden border-t border-line"
                          >
                            <dl className="grid gap-3 bg-white/70 px-5 py-4 text-[12.5px] sm:grid-cols-3">
                              <div>
                                <dt className="font-bold text-muted">What the exchange asks for</dt>
                                <dd className="mono mt-1 font-bold text-ink">{c.req}</dd>
                              </div>
                              <div>
                                <dt className="font-bold text-muted">What your figures show</dt>
                                <dd className="mono mt-1 font-bold text-ink">{c.val}</dd>
                              </div>
                              <div>
                                <dt className="font-bold text-muted">Where it lands in the draft</dt>
                                <dd className="mt-1 font-semibold text-ink-2">{LANDS_IN[c.title] ?? 'Section I'}</dd>
                              </div>
                            </dl>
                            {!c.ok && (
                              <div className="border-t border-line px-5 py-4">
                                <ResultNote tone="warn">
                                  This does not disqualify you. It becomes a disclosure item, and the co-pilot has
                                  already carried it into the Legal section as a gap to resolve.
                                </ResultNote>
                                <button
                                  onClick={() => {
                                    completeStep('eligibility')
                                    goStep('gaps')
                                  }}
                                  className="btn btn-ghost btn-sm mt-3"
                                >
                                  Go to the linked gap
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  )
                })}
              </ul>
            </div>
          </StageBlock>
        </>
      )}

      <StageFooter
        step="eligibility"
        canContinue={eligibilityRun}
        blockedReason="Run the SEBI Eligibility Verification first — the draft is assembled against its result."
        continueLabel="Synthesise DRHP Draft"
        note={
          eligibilityRun
            ? 'Eligible to proceed. Continue to the DRHP draft.'
            : undefined
        }
        onContinue={() => {
          completeStep('eligibility')
          goStep('synthesis')
        }}
      />
    </div>
  )
}
