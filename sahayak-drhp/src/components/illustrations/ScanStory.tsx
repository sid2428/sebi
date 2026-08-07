import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import gsap from 'gsap'
import DrhpDocument from './DrhpDocument'
import MagnifyingGlass from './MagnifyingGlass'
import AiProcessor from './AiProcessor'
import KnowledgeGraph from './KnowledgeGraph'
import { ComplianceBadge } from './Indicators'
import { C } from './primitives'
import { DUR, EASE, useReducedMotion } from '../../lib/motion'

// ============================================================
//  Scan story
//
//  The loading state, told as the actual sequence of work:
//
//    read → scan → extract → relate → verify
//
//  Each act is a real claim about what the system is doing at that
//  moment, so the wait reads as progress rather than as a spinner.
//  Act selection is driven by real progress, never by a timer.
// ============================================================

export const ACTS = [
  { id: 'read', title: 'Reading the document', line: 'Pages resolved and split into clauses.' },
  { id: 'scan', title: 'Scanning for disclosures', line: 'Matching each clause against the ICDR schedule.' },
  { id: 'extract', title: 'Extracting structured facts', line: 'Identity, figures and parties lifted into fields.' },
  { id: 'relate', title: 'Building the knowledge graph', line: 'Linking every fact back to the file it came from.' },
  { id: 'verify', title: 'Running compliance checks', line: 'Testing the draft against the eligibility norms.' },
] as const

export type ActId = (typeof ACTS)[number]['id']

/** Progress 0–100 → act index. */
export function actForProgress(progress: number) {
  return Math.min(ACTS.length - 1, Math.floor((progress / 100) * ACTS.length))
}

export default function ScanStory({
  progress = 0,
  className = '',
}: {
  progress?: number
  className?: string
}) {
  const act = actForProgress(progress)
  const reduced = useReducedMotion()

  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <div className="relative mx-auto aspect-[4/3] w-full max-w-[440px]">
        {/* A true crossfade, not mode="wait" — the children are already
            stacked absolutely, and waiting for the exit left the stage
            empty for a beat on every act change. */}
        <AnimatePresence>
          <motion.div
            key={ACTS[act].id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: reduced ? 0 : 0.3, ease: EASE }}
          >
            {act === 0 && <ActRead />}
            {act === 1 && <ActScan />}
            {act === 2 && <ActExtract />}
            {act === 3 && <ActRelate />}
            {act === 4 && <ActVerify />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---------- Act 1 · the document arrives and the stack fans ---------- */
function ActRead() {
  return (
    <div className="grid h-full place-items-center">
      <motion.div
        className="h-full"
        initial={{ opacity: 0, y: 18, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <DrhpDocument className="h-full w-auto" stamp={false} />
      </motion.div>
    </div>
  )
}

/* ---------- Act 2 · the lens reads the page ---------- */
function ActScan() {
  const lensRef = useRef<HTMLDivElement>(null)
  const [lit, setLit] = useState<number[]>([])
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) {
      setLit([0, 1, 2, 3])
      return
    }
    const el = lensRef.current
    if (!el) return

    // A reading path, not a random drift: across each clause, then down.
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } })
      const rows = [
        { y: '2%', mark: 0 },
        { y: '26%', mark: 1 },
        { y: '50%', mark: 2 },
        { y: '74%', mark: 3 },
      ]

      gsap.set(el, { xPercent: -14, yPercent: -6, opacity: 0 })
      tl.to(el, { opacity: 1, duration: 0.4 })

      rows.forEach((row, i) => {
        const toRight = i % 2 === 0
        tl.to(el, { y: row.y, duration: 0.35 }, '>-0.1')
          .to(el, { x: toRight ? 92 : -6, duration: 0.85 }, '<')
          .call(() => setLit((prev) => (prev.includes(row.mark) ? prev : [...prev, row.mark])), [], '<0.5')
          .to(el, { x: toRight ? -6 : 92, duration: 0.85 })
      })

      tl.to(el, { opacity: 0, duration: 0.35 }).call(() => setLit([]))
    }, lensRef)

    return () => ctx.revert()
  }, [reduced])

  return (
    <div className="relative grid h-full place-items-center">
      <div className="relative h-full">
        <DrhpDocument className="h-full w-auto" stamp={false} tabs={false} highlight={lit} />
        <div
          ref={lensRef}
          className="pointer-events-none absolute left-0 top-0 w-[46%] gpu"
          style={{ willChange: 'transform' }}
        >
          <MagnifyingGlass className="h-auto w-full" tint={0.2} />
        </div>
      </div>
    </div>
  )
}

/* ---------- Act 3 · facts leave the page for the engine ---------- */
function ActExtract() {
  return (
    <div className="grid h-full grid-cols-[1fr_auto_1fr] items-center gap-2">
      <motion.div
        className="justify-self-end"
        initial={{ opacity: 0, x: -14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: DUR.base, ease: EASE }}
      >
        <DrhpDocument className="h-[190px] w-auto" stamp={false} tabs={false} stack={false} highlight={[1, 2]} />
      </motion.div>

      {/* Facts in transit */}
      <svg viewBox="0 0 60 120" className="h-[120px] w-[60px]" aria-hidden="true">
        <path d="M2 60 H58" stroke={C.lineStrong} strokeWidth="1.5" strokeDasharray="4 5" strokeLinecap="round" />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx="2" cy="60" r="3.4" fill={C.accent}>
            <animate attributeName="cx" from="2" to="58" dur="1.5s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0" dur="1.5s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      <motion.div
        initial={{ opacity: 0, scale: 0.86 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: DUR.base, ease: EASE, delay: 0.1 }}
      >
        <AiProcessor className="h-[180px] w-auto" />
      </motion.div>
    </div>
  )
}

/* ---------- Act 4 · the graph assembles ---------- */
function ActRelate() {
  return (
    <div className="grid h-full place-items-center px-2">
      <KnowledgeGraph className="h-auto w-full" />
    </div>
  )
}

/* ---------- Act 5 · seals are struck ---------- */
function ActVerify() {
  const levels = ['pass', 'pass', 'partial', 'pass'] as const
  return (
    <div className="grid h-full grid-cols-2 place-items-center gap-4 px-8">
      {levels.map((level, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5, rotate: -14 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18, delay: i * 0.14 }}
        >
          <ComplianceBadge level={level} className="h-[92px] w-auto" />
        </motion.div>
      ))}
    </div>
  )
}
