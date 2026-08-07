import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, AlertTriangle, MinusCircle, Scale, X } from 'lucide-react'
import { REQUIREMENTS } from '../data/mock'
import { ComplianceBadge, type ComplianceLevel } from './illustrations'
import { EASE } from '../lib/motion'

const STATUS_STYLES = {
  full: { label: 'Fully covered', chip: 'bg-ok-bg text-ok ring-1 ring-inset ring-ok-line', icon: Check, badge: 'pass' },
  partial: { label: 'Partially covered', chip: 'bg-warn-bg text-warn ring-1 ring-inset ring-warn-line', icon: AlertTriangle, badge: 'partial' },
  missing: { label: 'Missing before filing', chip: 'bg-bad-bg text-bad ring-1 ring-inset ring-bad-line', icon: MinusCircle, badge: 'fail' },
} as const

export default function DisclosureScorecard({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const summary = {
    full: REQUIREMENTS.filter((item) => item.status === 'full').length,
    partial: REQUIREMENTS.filter((item) => item.status === 'partial').length,
    missing: REQUIREMENTS.filter((item) => item.status === 'missing').length,
  }

  // Escape closes, and the page behind stops scrolling while it's up.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[160] grid place-items-center p-4"
          style={{ background: 'rgba(14,24,40,.5)', backdropFilter: 'blur(6px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.97, y: 14, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 8, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="flex max-h-[86vh] w-full max-w-[1000px] flex-col overflow-hidden rounded-3xl2 bg-white shadow-xl2"
            role="dialog"
            aria-modal="true"
            aria-label="SEBI ICDR disclosure completeness scorecard"
          >
            <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
              <div>
                <span className="chip bg-accent-600 text-white">
                  <Scale size={12} /> Compliance-framework view
                </span>
                <h3 className="mt-3 text-[22px] font-extrabold tracking-[-0.028em]">
                  SEBI ICDR disclosure completeness
                </h3>
                <p className="mt-1.5 max-w-[64ch] text-[13.5px] leading-[1.6] text-ink-3">
                  Whether the draft covers each material disclosure bucket expected in an SME IPO offer
                  document — assessed separately from section-by-section drafting progress.
                </p>
              </div>
              <button
                onClick={onClose}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl2 border border-line text-muted transition-colors hover:bg-panel hover:text-ink"
                aria-label="Close disclosure scorecard"
              >
                <X size={18} />
              </button>
            </header>

            <div className="grid gap-3 border-b border-line bg-panel/60 px-6 py-4 sm:grid-cols-3">
              <StatCard label="Fully covered" value={summary.full} tone="full" />
              <StatCard label="Partially covered" value={summary.partial} tone="partial" />
              <StatCard label="Missing before filing" value={summary.missing} tone="missing" />
            </div>

            <div className="min-h-0 flex-1 overflow-auto" tabIndex={0} role="region" aria-label="Disclosure scorecard table, scrollable">
              <table className="w-full min-w-[820px] border-collapse text-left text-[13px]">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr>
                    {['Requirement bucket', 'Mapped sections', 'Status', 'Why it stands here'].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="border-b border-line-strong bg-white px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.09em] text-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {REQUIREMENTS.map((item, i) => {
                    const style = STATUS_STYLES[item.status]
                    const Icon = style.icon
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors duration-150 hover:bg-accent-50/50 ${
                          i % 2 ? 'bg-panel/35' : 'bg-white'
                        }`}
                      >
                        <td className="border-b border-line px-5 py-3.5 align-top font-bold text-ink">
                          {item.label}
                        </td>
                        <td className="border-b border-line px-5 py-3.5 align-top">
                          <span className="flex flex-wrap gap-1.5">
                            {item.mappedSections.map((section) => (
                              <span
                                key={section}
                                className="numeral inline-grid h-6 min-w-[26px] place-items-center rounded-md bg-accent-50 px-1.5 text-[11px] ring-1 ring-inset ring-accent-100"
                              >
                                {section}
                              </span>
                            ))}
                          </span>
                        </td>
                        <td className="border-b border-line px-5 py-3.5 align-top">
                          <span className={`chip ${style.chip} whitespace-nowrap`}>
                            <Icon size={12} /> {style.label}
                          </span>
                        </td>
                        <td className="border-b border-line px-5 py-3.5 align-top leading-[1.6] text-ink-3">
                          {item.note}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: keyof typeof STATUS_STYLES }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl2 border border-line bg-white p-4">
      <ComplianceBadge level={STATUS_STYLES[tone].badge as ComplianceLevel} className="h-10 w-auto shrink-0" ribbon={false} />
      <div>
        <div className="mono text-[24px] font-extrabold leading-none tracking-[-0.035em]">{value}</div>
        <div className="mt-1 text-[12px] text-muted">{label}</div>
      </div>
    </div>
  )
}
