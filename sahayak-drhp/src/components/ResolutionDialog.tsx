import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Check, Loader2, X } from 'lucide-react'
import type { ResolutionOption } from '../data/drafts'
import { EASE } from '../lib/motion'
import { useSimulatedAction } from '../lib/actions'

/**
 * One dialog for every "this needs a human decision" moment — a
 * flagged verification item, a gap, an inconsistency. The user picks
 * how to handle it, the choice is applied with visible progress, and
 * the chosen outcome is what gets recorded.
 */
export default function ResolutionDialog({
  open,
  heading,
  question,
  subject,
  detail,
  location,
  options,
  confirmLabel = 'Apply and resolve',
  onClose,
  onResolve,
}: {
  open: boolean
  heading: string
  question: string
  subject: string
  detail?: string
  location?: string
  options: ResolutionOption[]
  confirmLabel?: string
  onClose: () => void
  onResolve: (option: ResolutionOption) => void
}) {
  const [choice, setChoice] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  const apply = useSimulatedAction({ ms: 950 })

  // Every opening starts from a clean slate.
  useEffect(() => {
    if (!open) return
    setChoice(options[0]?.id ?? null)
    setTouched(false)
    apply.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Escape closes, and the page behind stops scrolling while it is up.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  const selected = options.find((o) => o.id === choice) ?? null

  function confirm() {
    setTouched(true)
    if (!selected) return
    apply.run({
      onComplete: () => {
        onResolve(selected)
        onClose()
      },
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="resolution-dialog"
          className="fixed inset-0 z-[150] grid place-items-center overflow-y-auto p-4"
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
            transition={{ duration: 0.26, ease: EASE }}
            className="my-auto w-full max-w-[520px] rounded-3xl2 bg-white p-6 shadow-xl2 sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-label={heading}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl2 bg-warn-bg text-warn">
                <AlertTriangle size={20} />
              </span>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-panel hover:text-ink"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <h3 className="text-[20px] font-extrabold tracking-[-0.028em]">{heading}</h3>
            <p className="mt-1.5 text-[13.5px] leading-[1.6] text-muted">{question}</p>

            <div className="mt-4 rounded-2xl2 border border-line bg-panel/70 p-4">
              <div className="text-[10.5px] font-extrabold uppercase tracking-[0.11em] text-muted">Item</div>
              <div className="mt-1.5 text-[14px] font-bold text-ink">{subject}</div>
              {detail && <p className="mt-2 text-[12.5px] leading-[1.6] text-ink-3">{detail}</p>}
              {location && <p className="mono mt-2.5 text-[11.5px] text-muted">Location · {location}</p>}
            </div>

            <fieldset className="mt-4">
              <legend className="sr-only">Choose how to resolve this item</legend>
              <div className="space-y-2">
                {options.map((option) => {
                  const active = option.id === choice
                  return (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer gap-3 rounded-2xl2 border px-4 py-3 transition-colors duration-150 ${
                        active ? 'border-accent-300 bg-accent-50' : 'border-line bg-white hover:bg-panel/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="resolution-choice"
                        value={option.id}
                        checked={active}
                        onChange={() => setChoice(option.id)}
                        className="mt-1 h-4 w-4 shrink-0 border-line-strong text-accent-600 focus:ring-accent-400"
                      />
                      <span className="min-w-0">
                        <b className="block text-[13.5px] font-bold text-ink">{option.label}</b>
                        <span className="mt-0.5 block text-[12.5px] leading-[1.6] text-ink-3">{option.detail}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>

            {touched && !selected && (
              <p role="alert" className="mt-3 text-[12px] font-semibold text-bad">
                Choose one option to continue.
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={onClose} className="btn btn-ghost flex-1 justify-center" disabled={apply.isRunning}>
                Keep open
              </button>
              <button
                onClick={confirm}
                disabled={apply.isRunning}
                aria-busy={apply.isRunning}
                className="btn btn-gold flex-1 justify-center"
              >
                {apply.isRunning ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Applying…
                  </>
                ) : (
                  <>
                    <Check size={15} /> {confirmLabel}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
