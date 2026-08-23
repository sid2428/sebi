import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import {
  Check, Loader2, FileText, Layers, Scale, GitMerge, Type, ShieldCheck, Sparkles,
  BookMarked,
} from 'lucide-react'
import { COMPANY, ISSUE, SECTIONS } from '../data/mock'
import { renderPageToCanvas } from '../lib/pdf'
import { EASE, useReducedMotion } from '../lib/motion'

// ============================================================
//  Generation sequence
//
//  The stage before this one ends with verification signed off. This
//  is what the issuer watches while the offer document is produced:
//  a scripted run of the passes a drafting engine actually makes, each
//  holding long enough to be read, with the real PDF work happening
//  underneath. Two things make it read as production rather than
//  theatre — the progress is gated on the actual file being parsed,
//  and the sheet on the right resolves into page one of the document
//  that was just built, drawn from the PDF itself.
// ============================================================

type Phase = {
  id: string
  label: string
  detail: string
  icon: any
  /** How long this pass holds on screen, in ms. */
  ms: number
  /** Sub-steps, cycled across the pass so the row keeps moving. */
  steps: string[]
  /** Console lines this pass emits, spread across its duration. */
  logs: string[]
}

const PHASES: Phase[] = [
  {
    id: 'collect',
    label: 'Assembling verified inputs',
    detail: 'Pulling every confirmed attribute, document and decision out of the earlier stages.',
    icon: Layers,
    ms: 2400,
    steps: ['company base', 'evidence locker', 'verification signatures'],
    logs: [
      'reading company base — 42 attributes confirmed',
      'loading 9 source documents from the evidence locker',
      'attaching verification signatures from stage 3',
    ],
  },
  {
    id: 'compose',
    label: 'Composing section text',
    detail: `Drafting all ${SECTIONS.length} chapters against the SEBI ICDR structure.`,
    icon: FileText,
    ms: 5200,
    steps: SECTIONS.map((s) => `§${s.no} ${s.title}`),
    logs: SECTIONS.slice(0, 10).map((s) => `drafting §${s.no} — ${s.title}`),
  },
  {
    id: 'figures',
    label: 'Binding figures to audited statements',
    detail: 'Every number in the narrative is re-derived from the restated audited financials.',
    icon: Scale,
    ms: 3000,
    steps: ['restated P&L', 'ratios', 'cash flows', 'reconciliation'],
    logs: [
      'restated P&L FY21–FY23 → §VII tables',
      'recomputing EBITDA, PAT margin, RoNW, NAV',
      'reconciling narrative figures against audit — 0 drift',
    ],
  },
  {
    id: 'icdr',
    label: 'Applying ICDR Schedule VI formatting',
    detail: 'Statutory headings, mandated ordering, legal typography and page furniture.',
    icon: Type,
    ms: 2800,
    steps: ['heading hierarchy', 'statutory legends', 'running heads', 'folios'],
    logs: [
      'applying Schedule VI heading hierarchy',
      'inserting statutory disclaimers and cover-page legends',
      'setting running heads, folios and confidentiality marks',
    ],
  },
  {
    id: 'provenance',
    label: 'Stitching the provenance trail',
    detail: 'Each assertion keeps a link back to the page of the document it came from.',
    icon: GitMerge,
    ms: 2400,
    steps: ['linking assertions', 'flagging inferences', 'sealing the trail'],
    logs: [
      'linking 214 assertions to source pages',
      'flagging unverified items for banker attention',
    ],
  },
  {
    id: 'typeset',
    label: 'Typesetting and paginating',
    detail: 'Laying the document onto A4, resolving cross-references and the table of contents.',
    icon: Sparkles,
    ms: 3200,
    steps: ['breaking pages', 'balancing tables', 'resolving references', 'embedding fonts'],
    logs: [
      'breaking pages, balancing tables across folios',
      'resolving cross-references and the table of contents',
      'embedding fonts and generating bookmarks',
    ],
  },
  {
    id: 'render',
    label: 'Rendering the offer document',
    detail: 'Writing the final PDF and opening it for review.',
    icon: ShieldCheck,
    ms: 2600,
    steps: ['writing PDF stream', 'indexing sections', 'opening the document'],
    logs: ['writing PDF stream', 'indexing sections for navigation'],
  },
]

const SCRIPT_MS = PHASES.reduce((n, p) => n + p.ms, 0)
/** The scripted run covers this much of the bar; the file finishes the rest. */
const SCRIPT_SHARE = 0.93

export default function DrhpGeneration({
  ready,
  doc,
  sectionCount,
  indexProgress,
  onDone,
}: {
  /** True once the PDF has loaded and its sections are indexed. */
  ready: boolean
  /** The parsed document, as soon as it opens — page one is drawn from it. */
  doc: PDFDocumentProxy | null
  sectionCount: number | null
  indexProgress: { done: number; total: number } | null
  onDone: () => void
}) {
  const reduced = useReducedMotion()
  const [elapsed, setElapsed] = useState(0)
  const [skipped, setSkipped] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [bytes, setBytes] = useState<number | null>(null)
  const startedAt = useRef(performance.now())

  const pageCount = doc?.numPages ?? null

  // One clock for the whole sequence. Everything on screen — the phase
  // index, the bar, the console, the sheet — is derived from it, so
  // nothing can drift out of step with anything else.
  useEffect(() => {
    let frame = 0
    const tick = () => {
      setElapsed(performance.now() - startedAt.current)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  // The real file size, for the receipt at the end.
  useEffect(() => {
    if (!doc) return
    let live = true
    doc.getDownloadInfo().then((info: any) => {
      if (live && typeof info?.length === 'number') setBytes(info.length)
    }).catch(() => {})
    return () => {
      live = false
    }
  }, [doc])

  const scriptDone = skipped || elapsed >= SCRIPT_MS

  // Which pass is on screen, and how far through it we are.
  const { index: phaseIndex, phaseProgress } = useMemo(() => {
    if (scriptDone) return { index: PHASES.length - 1, phaseProgress: 1 }
    let acc = 0
    for (let i = 0; i < PHASES.length; i++) {
      if (elapsed < acc + PHASES[i].ms) {
        return { index: i, phaseProgress: (elapsed - acc) / PHASES[i].ms }
      }
      acc += PHASES[i].ms
    }
    return { index: PHASES.length - 1, phaseProgress: 1 }
  }, [elapsed, scriptDone])

  // The bar never sits still: the script drives it to 93%, then it eases
  // toward — but never reaches — 100% until the real file is in hand.
  const progress = useMemo(() => {
    if (finishing) return 1
    const scripted = Math.min(skipped ? 1 : elapsed / SCRIPT_MS, 1) * SCRIPT_SHARE
    if (!scriptDone) return scripted
    const waited = Math.max(0, elapsed - (skipped ? 0 : SCRIPT_MS))
    return SCRIPT_SHARE + (1 - SCRIPT_SHARE) * (1 - Math.exp(-waited / 2600))
  }, [elapsed, scriptDone, skipped, finishing])

  // Console lines, revealed on the same clock rather than on their own timers.
  const logs = useMemo(() => {
    const out: { key: string; text: string }[] = []
    let acc = 0
    for (const p of PHASES) {
      p.logs.forEach((line, j) => {
        // Spread a pass's lines over the first 85% of its window.
        const at = acc + (p.ms * 0.85 * (j + 0.35)) / p.logs.length
        if (skipped || elapsed >= at) out.push({ key: `${p.id}-${j}`, text: line })
      })
      acc += p.ms
    }
    return out
  }, [elapsed, skipped])

  // The reveal is gated on both clocks: the scripted run and the real file.
  useEffect(() => {
    if (!scriptDone || !ready) return
    setFinishing(true)
  }, [scriptDone, ready])

  // Hold on a "done" beat so the finish is seen rather than merely happening.
  // The callback goes through a ref so a new closure from the parent cannot
  // restart the timer mid-beat.
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone
  useEffect(() => {
    if (!finishing) return
    const t = window.setTimeout(() => onDoneRef.current(), reduced ? 400 : 2000)
    return () => window.clearTimeout(t)
  }, [finishing, reduced])

  const pct = Math.round(progress * 100)
  const active = PHASES[phaseIndex]
  const activeStep = active.steps[
    Math.min(active.steps.length - 1, Math.floor(phaseProgress * active.steps.length))
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14, scale: 0.985 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="card relative overflow-hidden p-0"
      aria-live="polite"
      aria-busy={!finishing}
    >
      {/* A slow wash of accent light travelling across the panel. */}
      {!reduced && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(680px 220px at var(--x) -10%, rgba(91,141,239,.16), transparent 70%)',
          }}
          animate={{ ['--x' as any]: ['12%', '88%', '12%'] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative border-b border-line px-6 py-5 sm:px-7">
        <div className="flex flex-wrap items-center gap-4">
          <GenerationMark done={finishing} reduced={reduced} />
          <div className="min-w-0 flex-1">
            <div className="eyebrow">Verification complete · drafting</div>
            <h2 className="mt-1 text-[19px] font-extrabold tracking-[-0.028em]">
              {finishing
                ? 'Draft Red Herring Prospectus generated'
                : 'Generating the Draft Red Herring Prospectus'}
            </h2>
            <p className="mt-1 text-[12.5px] leading-[1.5] text-muted">
              {COMPANY.proposedName} · {ISSUE.platform}
            </p>
          </div>
          <div className="text-right">
            <div className="font-display text-[34px] font-extrabold leading-none tracking-[-0.04em] text-accent-700 tabular-nums">
              {pct}
              <span className="text-[18px] text-accent-400">%</span>
            </div>
            <div className="mt-1 text-[11px] font-semibold text-muted">
              {finishing
                ? 'complete'
                : scriptDone
                  ? 'finalising file'
                  : `pass ${phaseIndex + 1} of ${PHASES.length}`}
            </div>
          </div>
        </div>

        {/* Progress bar, with a light travelling over the filled part. */}
        <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-panel-2">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-400 to-accent-600"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.25, ease: 'linear' }}
          />
          {!reduced && !finishing && (
            <motion.div
              aria-hidden="true"
              className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/55 to-transparent"
              animate={{ x: ['-100%', '600%'] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </div>
      </div>

      <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1fr)_330px]">
        {/* ---- passes ---- */}
        <div className="border-b border-line p-6 sm:px-7 lg:border-b-0 lg:border-r">
          <ol className="space-y-1">
            {PHASES.map((p, i) => {
              const state = finishing || i < phaseIndex ? 'done' : i === phaseIndex ? 'active' : 'todo'
              return (
                <PhaseRow
                  key={p.id}
                  phase={p}
                  state={state}
                  reduced={reduced}
                  fraction={i === phaseIndex && !finishing ? phaseProgress : state === 'done' ? 1 : 0}
                  note={
                    finishing
                      ? undefined
                      : p.id === 'render' && indexProgress && indexProgress.total > 0
                        ? `indexing page ${indexProgress.done} of ${indexProgress.total}`
                        : i === phaseIndex
                          ? activeStep
                          : undefined
                  }
                />
              )
            })}
          </ol>

          {/* ---- console ---- */}
          <div className="mt-5 overflow-hidden rounded-xl2 border border-line bg-[#0E1828]">
            <div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-2">
              <span className="h-2 w-2 rounded-full bg-[#F0B429]/80" />
              <span className="h-2 w-2 rounded-full bg-[#3DD68C]/70" />
              <span className="ml-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/45">
                drafting engine
              </span>
              {!finishing && (
                <Loader2 size={12} className="ml-auto animate-spin text-white/40" aria-hidden="true" />
              )}
            </div>
            <div className="h-[132px] overflow-hidden px-3.5 py-2.5 font-mono text-[11px] leading-[1.75] text-[#8FB4EC]">
              <div
                className="transition-transform duration-500 ease-out"
                style={{ transform: `translateY(${Math.min(0, (6 - logs.length) * 20)}px)` }}
              >
                <AnimatePresence initial={false}>
                  {logs.map((l) => (
                    <motion.div
                      key={l.key}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      className="truncate"
                    >
                      <span className="text-white/30">›</span> {l.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {!finishing && (
                  <span className="inline-block h-[11px] w-[7px] translate-y-[1px] animate-blink bg-[#8FB4EC]" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ---- the sheet being produced ---- */}
        <div className="flex flex-col items-center justify-center gap-4 p-6">
          <PagePreview progress={progress} reduced={reduced} done={finishing} doc={doc} />
          <div className="min-h-[42px] text-center">
            <div className="text-[12.5px] font-extrabold tabular-nums text-ink">
              {pageCount
                ? `${finishing ? pageCount : Math.max(1, Math.round(progress * pageCount))} / ${pageCount} pages`
                : 'paginating…'}
            </div>
            <div className="mt-0.5 text-[11.5px] leading-[1.4] text-muted">
              {finishing ? 'A4 · SEBI ICDR Schedule VI format' : active.detail}
            </div>
          </div>
          {!finishing && !skipped && (
            <button
              onClick={() => {
                setSkipped(true)
                startedAt.current = performance.now() - SCRIPT_MS
              }}
              className="text-[11.5px] font-bold text-muted underline underline-offset-2 transition-colors hover:text-accent-700"
            >
              Skip the animation
            </button>
          )}
        </div>
      </div>

      {/* ---- the receipt, once it is really done ---- */}
      <AnimatePresence>
        {finishing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.42, ease: EASE }}
            className="relative overflow-hidden border-t border-ok-line bg-ok-bg/40"
          >
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2 px-6 py-3.5 sm:px-7">
              <Stat label="Pages" value={pageCount ?? 0} delay={0.05} />
              <Stat label="Sections" value={sectionCount ?? 0} delay={0.13} />
              <Stat
                label="File size"
                value={bytes ? Math.round(bytes / 1024) : 0}
                suffix=" kB"
                delay={0.21}
              />
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: EASE, delay: 0.3 }}
                className="ml-auto flex items-center gap-1.5 text-[12px] font-bold text-ok"
              >
                <BookMarked size={13} /> Bookmarked and ready to read
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

/** A number that counts up when it lands, so the receipt reads as a result. */
function Stat({
  label,
  value,
  suffix = '',
  delay,
}: {
  label: string
  value: number
  suffix?: string
  delay: number
}) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(reduced ? value : 0)

  useEffect(() => {
    if (reduced) {
      setShown(value)
      return
    }
    let frame = 0
    const start = performance.now() + delay * 1000
    const run = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / 700))
      setShown(Math.round(value * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(run)
    }
    frame = requestAnimationFrame(run)
    return () => cancelAnimationFrame(frame)
  }, [value, delay, reduced])

  return (
    <motion.span
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE, delay }}
      className="flex items-baseline gap-1.5"
    >
      <b className="text-[15px] font-extrabold tabular-nums text-ink">
        {shown}
        {suffix}
      </b>
      <span className="text-[11.5px] font-semibold text-muted">{label}</span>
    </motion.span>
  )
}

/** The header glyph: a ring that spins while working and settles on a tick. */
function GenerationMark({ done, reduced }: { done: boolean; reduced: boolean }) {
  return (
    <span className="relative grid h-12 w-12 shrink-0 place-items-center">
      {!reduced && !done && (
        <>
          <span className="absolute inset-0 rounded-2xl2 bg-accent-200/60 animate-pulse-ring" aria-hidden="true" />
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl2 border-2 border-transparent border-t-accent-400 border-r-accent-300"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          />
        </>
      )}
      <motion.span
        animate={done ? { scale: [0.7, 1.12, 1] } : {}}
        transition={{ duration: 0.5, ease: EASE }}
        className={`grid h-11 w-11 place-items-center rounded-2xl2 text-white ${
          done ? 'bg-ok' : 'bg-ink'
        }`}
      >
        {done ? <Check size={22} strokeWidth={3} /> : <FileText size={20} />}
      </motion.span>
    </span>
  )
}

function PhaseRow({
  phase,
  state,
  fraction,
  note,
  reduced,
}: {
  phase: Phase
  state: 'done' | 'active' | 'todo'
  fraction: number
  note?: string
  reduced: boolean
}) {
  const Icon = phase.icon
  return (
    <li>
      <div
        className={`relative flex items-center gap-3 overflow-hidden rounded-xl2 px-3 py-2.5 transition-opacity duration-300 ${
          state === 'todo' ? 'opacity-40' : 'opacity-100'
        } ${state === 'active' ? 'bg-accent-50 ring-1 ring-inset ring-accent-100' : ''}`}
      >
        {/* The active row fills left-to-right as its pass runs. */}
        {state === 'active' && !reduced && (
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 bg-accent-100/55 transition-[width] duration-200 ease-linear"
            style={{ width: `${Math.min(100, fraction * 100)}%` }}
          />
        )}

        <span
          className={`relative grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors duration-300 ${
            state === 'done'
              ? 'bg-ok text-white'
              : state === 'active'
                ? 'bg-accent-600 text-white'
                : 'bg-panel-2 text-muted'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {state === 'done' ? (
              <motion.span
                key="done"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 480, damping: 22 }}
              >
                <Check size={14} strokeWidth={3} />
              </motion.span>
            ) : state === 'active' ? (
              <motion.span key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Loader2 size={14} className="animate-spin" />
              </motion.span>
            ) : (
              <motion.span key="todo" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Icon size={13} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>

        <span className="relative min-w-0 flex-1">
          <b
            className={`block truncate text-[13px] font-bold ${
              state === 'active' ? 'text-accent-700' : 'text-ink'
            }`}
          >
            {phase.label}
          </b>
          <AnimatePresence mode="wait" initial={false}>
            {note && (
              <motion.span
                key={note}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.18 }}
                className="block truncate text-[11px] tabular-nums text-muted"
              >
                {note}
              </motion.span>
            )}
          </AnimatePresence>
        </span>

        {state === 'done' && (
          <span className="relative shrink-0 text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-ok">
            done
          </span>
        )}
      </div>
    </li>
  )
}

/**
 * An A4 sheet filling with type as the run proceeds — and then, once the
 * file exists, the actual first page of it, drawn from the PDF and faded
 * in over the skeleton. That last beat is the point: the thing on screen
 * stops standing in for the document and becomes it.
 */
function PagePreview({
  progress,
  reduced,
  done,
  doc,
}: {
  progress: number
  reduced: boolean
  done: boolean
  doc: PDFDocumentProxy | null
}) {
  const ROWS = 22
  const filled = Math.round(progress * ROWS)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [realPage, setRealPage] = useState(false)

  // Draw page one as soon as the document is open and the run is far
  // enough along that swapping it in reads as an arrival, not a jump.
  useEffect(() => {
    if (!doc || realPage || progress < 0.62) return
    let cancelled = false
    ;(async () => {
      try {
        const page = await doc.getPage(1)
        const canvas = canvasRef.current
        if (cancelled || !canvas) return
        await renderPageToCanvas(page, canvas, 190)
        page.cleanup()
        if (!cancelled) setRealPage(true)
      } catch {
        /* the skeleton stays; nothing to report */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [doc, progress, realPage])

  return (
    <div className="relative h-[268px] w-[190px]">
      {/* Sheets already produced, stacked behind. */}
      {[3, 2, 1].map((d) => (
        <motion.div
          key={d}
          aria-hidden="true"
          className="absolute inset-0 rounded-lg border border-line bg-white shadow-xs2"
          initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: progress > d * 0.16 ? 1 : 0, x: d * 5, y: -d * 5, rotate: d * 1.1 }}
          transition={{ duration: 0.5, ease: EASE }}
        />
      ))}

      {/* The sheet currently being set. */}
      <div className="absolute inset-0 overflow-hidden rounded-lg border border-line-strong bg-white shadow-md2">
        {/* Skeleton — fades out under the real page. */}
        <motion.div
          className="absolute inset-0 flex flex-col gap-[6px] p-3.5"
          animate={{ opacity: realPage ? 0 : 1 }}
          transition={{ duration: 0.65, ease: EASE }}
        >
          <motion.div
            className="mx-auto h-1.5 w-[52%] rounded-full bg-ink/80"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress > 0.04 ? 1 : 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            style={{ transformOrigin: 'center' }}
          />
          <motion.div
            className="mx-auto h-1 w-[34%] rounded-full bg-accent-300"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress > 0.09 ? 1 : 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: 0.08 }}
            style={{ transformOrigin: 'center' }}
          />
          <div className="mt-1.5 flex flex-1 flex-col gap-[5px]">
            {Array.from({ length: ROWS }).map((_, i) => {
              const on = i < filled
              // A few rows read as a table block rather than prose.
              const isTable = i === 9 || i === 10 || i === 11
              return (
                <motion.div
                  key={i}
                  className={`h-[3px] rounded-full ${isTable ? 'bg-accent-200' : 'bg-line-strong'}`}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: on ? 1 : 0, opacity: on ? 1 : 0 }}
                  transition={{ duration: 0.34, ease: EASE }}
                  style={{
                    transformOrigin: 'left',
                    width: `${[96, 88, 92, 78, 94, 84][i % 6]}%`,
                  }}
                />
              )
            })}
          </div>
        </motion.div>

        {/* The real page one. */}
        <motion.canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-contain"
          initial={{ opacity: 0 }}
          animate={{ opacity: realPage ? 1 : 0, scale: realPage ? 1 : 1.03 }}
          transition={{ duration: 0.7, ease: EASE }}
          aria-hidden="true"
        />

        {/* Scanner sweep — the sheet is being worked on. */}
        {!reduced && !done && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-accent-200/45 to-transparent"
            animate={{ y: ['-20%', '270%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Finished: a seal drops onto the sheet, then lifts away. */}
        <AnimatePresence>
          {done && (
            <motion.div
              className="absolute inset-0 grid place-items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0], backgroundColor: 'rgba(255,255,255,0.62)' }}
              transition={{ duration: 1.9, times: [0, 0.18, 0.62, 1], ease: EASE }}
            >
              <motion.span
                initial={{ scale: 0.5, opacity: 0, rotate: -14 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                className="grid h-14 w-14 place-items-center rounded-full bg-ok text-white shadow-lg2"
              >
                <Check size={28} strokeWidth={3} />
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
