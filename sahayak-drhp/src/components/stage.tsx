import { useEffect, useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, Info, Loader2, AlertTriangle, LayoutDashboard,
} from 'lucide-react'
import { STEP_IDS, STEP_TITLES, prevStep, stepIndex, useStore, type StepId } from '../store'
import { EASE } from '../lib/motion'
import type { ActionState } from '../lib/actions'

// ============================================================
//  Stage shell
//
//  Every stage answers the same five questions in the same order:
//  where am I, what is this, why am I here, what do I do, what next.
//  These components own that rhythm so no stage has to reinvent it.
// ============================================================

/**
 * The header of a stage: position in the journey, its name, why it
 * exists, and the single instruction that gets the issuer moving.
 */
export function StageHeader({
  step,
  why,
  todo,
  eyebrow,
}: {
  step: StepId
  why: React.ReactNode
  todo: React.ReactNode
  eyebrow?: React.ReactNode
}) {
  const completedSteps = useStore((s) => s.completedSteps)
  const index = stepIndex(step)

  return (
    <header>
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-[11.5px] font-extrabold uppercase tracking-[0.1em] text-white">
          Stage {index + 1} of {STEP_IDS.length}
        </span>

        {/* Journey dots. The label beside them carries the same meaning
            for anyone who cannot see the fill states. */}
        <span className="flex items-center gap-1.5" aria-hidden="true">
          {STEP_IDS.map((id, i) => {
            const done = completedSteps.includes(id)
            const current = i === index
            return (
              <span
                key={id}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  current ? 'w-6 bg-accent-500' : done ? 'w-3 bg-ok' : 'w-3 bg-line-strong'
                }`}
              />
            )
          })}
        </span>
        <span className="sr-only">
          {completedSteps.length} of {STEP_IDS.length} stages completed
        </span>

        {eyebrow}
      </div>

      <h1 className="mt-4 text-[27px] font-extrabold tracking-[-0.03em]">{STEP_TITLES[step]}</h1>
      <p className="mt-2 max-w-[62ch] text-[14.5px] leading-[1.62] text-ink-3">{why}</p>

      <div className="mt-5 flex items-start gap-3 rounded-2xl2 border border-accent-100 bg-accent-50 px-4 py-3.5">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent-600 text-white">
          <Info size={15} />
        </span>
        <div className="min-w-0">
          <div className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-accent-700">
            What you need to do here
          </div>
          <p className="mt-1 max-w-[62ch] text-[13.5px] leading-[1.6] text-ink-2">{todo}</p>
        </div>
      </div>
    </header>
  )
}

/**
 * A titled block inside a stage. `tone` marks the one block that is
 * the stage's actual task, so supporting material reads as secondary.
 */
export function StageBlock({
  title,
  hint,
  aside,
  children,
  className = '',
  id,
}: {
  title: string
  hint?: React.ReactNode
  aside?: React.ReactNode
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`mt-6 ${className}`}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[17px] font-bold tracking-[-0.02em]">{title}</h2>
          {hint && <p className="mt-1 max-w-[64ch] text-[13px] leading-[1.6] text-muted">{hint}</p>}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      {children}
    </section>
  )
}

/**
 * Progressive disclosure in one control. Supporting and advanced
 * material lives in here so the default view of a stage stays short.
 */
export function Disclose({
  summary,
  meta,
  children,
  defaultOpen = false,
  className = '',
}: {
  summary: string
  meta?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = `disclose-${useId().replace(/:/g, '')}`

  return (
    <div className={`card overflow-hidden ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors duration-200 hover:bg-panel/60"
      >
        <span className="min-w-0 flex-1">
          <b className="block text-[14px] font-bold">{summary}</b>
          {meta && <span className="mt-0.5 block text-[12px] text-muted">{meta}</span>}
        </span>
        <span className="shrink-0 text-[12.5px] font-bold text-accent-700">
          {open ? 'Hide' : 'View details'}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.24, ease: EASE }}>
          <ChevronDown size={17} className="text-muted" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden border-t border-line"
          >
            <div className="px-5 py-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * A button whose label follows the action through its states, so the
 * user never has to guess whether a click registered.
 */
export function ActionButton({
  state,
  idle,
  running,
  done,
  icon,
  onClick,
  className = 'btn btn-gold',
  disabled = false,
  title,
}: {
  state: ActionState
  idle: React.ReactNode
  running: React.ReactNode
  done: React.ReactNode
  icon?: React.ReactNode
  onClick: () => void
  className?: string
  disabled?: boolean
  title?: string
}) {
  const busy = state === 'running'
  return (
    <button
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={busy}
      title={title}
      className={className}
    >
      {busy ? (
        <>
          <Loader2 size={15} className="animate-spin" /> {running}
        </>
      ) : state === 'done' ? (
        <>
          <Check size={15} /> {done}
        </>
      ) : (
        <>
          {icon}
          {idle}
        </>
      )}
    </button>
  )
}

/** Inline "here is what just happened" strip for a completed action. */
export function ResultNote({
  tone = 'ok',
  children,
  className = '',
}: {
  tone?: 'ok' | 'warn' | 'info'
  children: React.ReactNode
  className?: string
}) {
  const map = {
    ok: 'border-ok-line bg-ok-bg text-ok',
    warn: 'border-warn-line bg-warn-bg text-warn',
    info: 'border-info-line bg-info-bg text-info',
  }
  const Icon = tone === 'ok' ? Check : tone === 'warn' ? AlertTriangle : Info
  return (
    <div
      role="status"
      className={`flex items-start gap-2.5 rounded-xl2 border px-3.5 py-2.5 text-[12.5px] font-semibold leading-[1.5] ${map[tone]} ${className}`}
    >
      <Icon size={14} className="mt-[1px] shrink-0" />
      <span>{children}</span>
    </div>
  )
}

/**
 * Back and Continue, with the validation that decides whether Continue
 * is allowed to move. Blocked attempts explain themselves rather than
 * failing silently.
 */
export function StageFooter({
  step,
  onContinue,
  continueLabel,
  canContinue = true,
  blockedReason,
  note,
  extra,
}: {
  step: StepId
  /** Omit on the last stage — the footer then offers the dashboard instead. */
  onContinue?: () => void
  continueLabel?: React.ReactNode
  canContinue?: boolean
  blockedReason?: string
  note?: React.ReactNode
  extra?: React.ReactNode
}) {
  const goStep = useStore((s) => s.goStep)
  const goScreen = useStore((s) => s.goScreen)
  const [showBlocked, setShowBlocked] = useState(false)
  const back = prevStep(step)

  // A resolved requirement should clear the warning it caused.
  useEffect(() => {
    if (canContinue) setShowBlocked(false)
  }, [canContinue])

  function handleContinue() {
    if (!canContinue) {
      setShowBlocked(true)
      return
    }
    onContinue?.()
  }

  return (
    <div className="mt-10 border-t border-line pt-6">
      <AnimatePresence>
        {showBlocked && blockedReason && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="mb-4"
          >
            <ResultNote tone="warn">{blockedReason}</ResultNote>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {back ? (
            <button onClick={() => goStep(back)} className="btn btn-ghost">
              <ArrowLeft size={16} /> Back to {STEP_TITLES[back]}
            </button>
          ) : (
            <button onClick={() => goScreen('dashboard')} className="btn btn-ghost">
              <LayoutDashboard size={16} /> Back to dashboard
            </button>
          )}
          {extra}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {note && <span className="max-w-[42ch] text-[12.5px] leading-[1.5] text-muted">{note}</span>}
          {onContinue && (
            <button
              onClick={handleContinue}
              aria-disabled={!canContinue}
              className={`btn btn-gold btn-lg ${canContinue ? '' : 'opacity-55'}`}
            >
              {continueLabel} <ArrowRight size={17} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
