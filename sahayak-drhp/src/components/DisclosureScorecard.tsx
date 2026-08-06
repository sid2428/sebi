import { AnimatePresence, motion } from 'framer-motion'
import { Check, AlertTriangle, MinusCircle, Scale, X } from 'lucide-react'
import { REQUIREMENTS } from '../data/mock'

const STATUS_STYLES = {
  full: { label: 'Fully covered', chip: 'bg-ok-bg text-[#0d6b43]', icon: Check },
  partial: { label: 'Partially covered', chip: 'bg-warn-bg text-[#8a5514]', icon: AlertTriangle },
  missing: { label: 'Missing before filing', chip: 'bg-bad-bg text-[#b23428]', icon: MinusCircle },
}

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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[160] grid place-items-center p-4"
          style={{ background: 'rgba(8,20,40,.55)', backdropFilter: 'blur(3px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="max-h-[85vh] w-full max-w-[980px] overflow-hidden rounded-[18px] bg-white shadow-lg2"
            role="dialog"
            aria-modal="true"
            aria-label="SEBI ICDR disclosure completeness scorecard"
          >
            <div className="flex items-start justify-between border-b border-line px-6 py-5">
              <div>
                <div className="chip bg-navy-900 text-gold-soft mb-3"><Scale size={13} /> Compliance-framework view</div>
                <h3 className="text-[22px] font-extrabold tracking-tight">SEBI ICDR Disclosure Completeness Scorecard</h3>
                <p className="mt-1 max-w-[620px] text-[14px] leading-relaxed text-muted">
                  This view checks whether the draft covers the material disclosure buckets expected in an SME IPO offer document,
                  separately from section-by-section drafting progress.
                </p>
              </div>
              <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl border border-line text-muted hover:bg-paper" aria-label="Close disclosure scorecard">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 border-b border-line bg-paper px-6 py-4 sm:grid-cols-3">
              <StatCard label="Fully covered" value={summary.full} tone="full" />
              <StatCard label="Partially covered" value={summary.partial} tone="partial" />
              <StatCard label="Missing before filing" value={summary.missing} tone="missing" />
            </div>

            <div className="overflow-auto px-6 py-4">
              <table className="w-full min-w-[760px] border-collapse text-left text-[13px]">
                <thead>
                  <tr>
                    <th className="border-b border-line px-3 py-3 font-bold text-ink-2">Requirement bucket</th>
                    <th className="border-b border-line px-3 py-3 font-bold text-ink-2">Mapped sections</th>
                    <th className="border-b border-line px-3 py-3 font-bold text-ink-2">Status</th>
                    <th className="border-b border-line px-3 py-3 font-bold text-ink-2">Why it stands here</th>
                  </tr>
                </thead>
                <tbody>
                  {REQUIREMENTS.map((item) => {
                    const style = STATUS_STYLES[item.status]
                    const Icon = style.icon
                    return (
                      <tr key={item.id}>
                        <td className="border-b border-line px-3 py-3 font-semibold text-ink">{item.label}</td>
                        <td className="border-b border-line px-3 py-3 text-ink-2">
                          <div className="flex flex-wrap gap-1.5">
                            {item.mappedSections.map((section) => (
                              <span key={section} className="chip bg-info-bg text-[#1e56b8]">{section}</span>
                            ))}
                          </div>
                        </td>
                        <td className="border-b border-line px-3 py-3">
                          <span className={`chip ${style.chip}`}><Icon size={12} /> {style.label}</span>
                        </td>
                        <td className="border-b border-line px-3 py-3 leading-relaxed text-ink-2">{item.note}</td>
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
  const Icon = STATUS_STYLES[tone].icon
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${STATUS_STYLES[tone].chip}`}>
        <Icon size={18} />
      </span>
      <div>
        <div className="text-[24px] font-extrabold mono leading-none">{value}</div>
        <div className="mt-1 text-[12px] text-muted">{label}</div>
      </div>
    </div>
  )
}
