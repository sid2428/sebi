import { useEffect, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import {
  Globe, Search, Database, FileUp, Flag, ClipboardCheck, FileCheck2,
  Sparkles, Check, AlertTriangle, Play, Pause, ShieldCheck, Plus,
} from 'lucide-react'
import { EASE, useReducedMotion } from '../lib/motion'

// ============================================================
//  PipelineFilm — the website→DRHP journey as a looping motion graphic.
//
//  A self-driving "explainer film": seven chapters cross-fade on a
//  timer, a segmented scrubber marks progress, and each chapter is a
//  small animated scene. Under prefers-reduced-motion it collapses to
//  a static, fully-labelled storyboard so the message still lands.
//
//  Palette is the dark-panel set (light blues + soft status colours)
//  so status greens/ambers read against navy, unlike the app's
//  print-safe light-surface tokens.
// ============================================================

const A = {
  accent: '#7DB7F8',
  accentDeep: '#5B8DEF',
  ok: '#4ADE9E',
  okDim: 'rgba(74,222,158,.16)',
  warn: '#F6C667',
  warnDim: 'rgba(246,198,103,.16)',
  bad: '#F3937D',
  text: '#EAF1FB',
  muted: '#93A9CC',
  card: 'rgba(255,255,255,.06)',
  cardLine: 'rgba(255,255,255,.11)',
} as const

type Stage = {
  id: string
  chapter: string
  title: string
  sub: string
  icon: typeof Globe
  hold: number
  Scene: () => JSX.Element
}

const STAGES: Stage[] = [
  { id: 'scan', chapter: 'Scan site', icon: Globe, hold: 3600, Scene: SceneScan,
    title: 'Reading your website', sub: 'Sahayak crawls satvikfoods.in, page by page.' },
  { id: 'extract', chapter: 'Extract', icon: Database, hold: 3600, Scene: SceneExtract,
    title: 'Lifting the facts', sub: 'Name, CIN, sector and financials become a company base.' },
  { id: 'upload', chapter: 'Upload', icon: FileUp, hold: 3400, Scene: SceneUpload,
    title: 'Taking in your documents', sub: 'GST, PAN, MOA, AOA and financial statements come in.' },
  { id: 'flag', chapter: 'Flag', icon: Flag, hold: 3400, Scene: SceneFlag,
    title: 'Flagging what looks off', sub: 'Mismatches and missing disclosures are caught at once.' },
  { id: 'review', chapter: 'Review', icon: ClipboardCheck, hold: 3600, Scene: SceneReview,
    title: 'Reviewing against SEBI norms', sub: 'Every item checked against SEBI (ICDR) SME rules.' },
  { id: 'guide', chapter: 'Guide', icon: Sparkles, hold: 3600, Scene: SceneGuide,
    title: 'Telling you what to fix', sub: 'The co-pilot lists corrections and the documents still needed.' },
  { id: 'drhp', chapter: 'DRHP', icon: FileCheck2, hold: 4200, Scene: SceneGenerate,
    title: 'DRHP generated', sub: 'A source-traced draft — ready for your merchant banker.' },
]

export default function PipelineFilm() {
  const reduced = useReducedMotion()
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (reduced || !playing) return
    const t = setTimeout(() => setI((p) => (p + 1) % STAGES.length), STAGES[i].hold)
    return () => clearTimeout(t)
  }, [i, playing, reduced])

  if (reduced) return <Storyboard />

  const stage = STAGES[i]
  const Scene = stage.Scene

  return (
    <figure
      className="navy-panel relative overflow-hidden rounded-3xl2 p-4 sm:p-6"
      aria-label="Animated walkthrough: Sahayak reads a website, ingests documents, flags gaps, reviews against SEBI norms, guides corrections, and generates a DRHP."
    >
      {/* faint grid + top glow, matching the hero */}
      <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true">
        <div className="hero-grid h-full w-full" />
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-48 blur-3xl"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(91,141,239,.35), transparent 70%)' }}
        aria-hidden="true"
      />

      {/* window chrome — sells the "playing video" frame */}
      <div className="relative flex items-center justify-between gap-3 px-1 pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#F3937D' }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#F6C667' }} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#4ADE9E' }} />
          <span className="ml-2 text-[11.5px] font-bold tracking-[.02em]" style={{ color: A.muted }}>
            Sahayak · website → DRHP
          </span>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{ background: A.okDim, color: A.ok }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ background: A.ok, opacity: .5 }} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: A.ok }} />
          </span>
          Live
        </span>
      </div>

      {/* stage canvas */}
      <div
        className="relative h-[300px] overflow-hidden rounded-2xl2 border sm:h-[360px]"
        style={{ background: 'linear-gradient(180deg,#0E1828,#132038)', borderColor: A.cardLine }}
      >
        <AnimatePresence>
          <motion.div
            key={stage.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <Scene />
          </motion.div>
        </AnimatePresence>

        {/* chapter number, top-left of canvas */}
        <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
          <span
            className="grid h-7 w-7 place-items-center rounded-lg text-[12px] font-extrabold text-white"
            style={{ background: 'linear-gradient(140deg,#5B8DEF,#2E4E9C)' }}
          >
            {i + 1}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[.14em]" style={{ color: A.muted }}>
            {stage.chapter}
          </span>
        </div>
      </div>

      {/* caption */}
      <div className="relative mt-4 flex min-h-[52px] items-start gap-3 px-1">
        <span
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl2"
          style={{ background: A.card, border: `1px solid ${A.cardLine}`, color: A.accent }}
        >
          <stage.icon size={18} />
        </span>
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <b className="block text-[15px] font-bold text-white">{stage.title}</b>
              <span className="text-[13px] leading-snug" style={{ color: A.muted }}>{stage.sub}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* scrubber — segmented chapters + play/pause */}
      <div className="relative mt-4 flex items-center gap-3 px-1">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors"
          style={{ background: A.card, border: `1px solid ${A.cardLine}`, color: A.text }}
          aria-label={playing ? 'Pause walkthrough' : 'Play walkthrough'}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <div className="flex flex-1 gap-1.5">
          {STAGES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setI(idx)}
              className="group relative h-1.5 flex-1 overflow-hidden rounded-full"
              style={{ background: 'rgba(255,255,255,.12)' }}
              aria-label={`Go to chapter ${idx + 1}: ${s.chapter}`}
            >
              <motion.span
                key={`${s.id}-${idx === i ? 'live' : 'idle'}`}
                className="absolute inset-0 origin-left rounded-full"
                style={{ background: `linear-gradient(90deg,${A.accent},${A.accentDeep})` }}
                initial={{ scaleX: idx < i ? 1 : 0 }}
                animate={{ scaleX: idx < i ? 1 : idx === i ? 1 : 0 }}
                transition={idx === i && playing
                  ? { duration: s.hold / 1000, ease: 'linear' }
                  : { duration: 0.3, ease: EASE }}
              />
            </button>
          ))}
        </div>
        <span className="shrink-0 text-[11px] font-bold tabular-nums" style={{ color: A.muted }}>
          {i + 1}/{STAGES.length}
        </span>
      </div>
    </figure>
  )
}

/* ============================================================
   Scene primitives
   ============================================================ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: (d: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE, delay: d } }),
}

function Panel({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-xl2 ${className}`}
      style={{ background: A.card, border: `1px solid ${A.cardLine}`, ...style }}
    >
      {children}
    </div>
  )
}

function Bar({ w, c = 'rgba(255,255,255,.22)', h = 6 }: { w: number | string; c?: string; h?: number }) {
  return <span className="block rounded-full" style={{ width: w, height: h, background: c }} />
}

/* ---------- 1 · Scan the website ---------- */
function SceneScan() {
  return (
    <div className="grid h-full place-items-center p-6">
      <div className="relative w-[78%] max-w-[360px]">
        <Panel className="overflow-hidden">
          {/* browser bar */}
          <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: A.cardLine }}>
            <Globe size={13} style={{ color: A.accent }} />
            <div className="flex-1 rounded-md px-2 py-1 text-[11px] font-semibold" style={{ background: 'rgba(255,255,255,.07)', color: A.muted }}>
              www.satvikfoods.in
            </div>
            <Search size={13} style={{ color: A.muted }} />
          </div>
          {/* page body */}
          <div className="relative space-y-2.5 p-4">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-md" style={{ background: 'linear-gradient(140deg,#5B8DEF,#2E4E9C)' }} />
              <Bar w={90} c="rgba(255,255,255,.3)" h={7} />
            </div>
            <Bar w="88%" />
            <Bar w="72%" />
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[0, 1, 2].map((k) => (
                <div key={k} className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,.05)' }}>
                  <span className="block h-8 rounded-md" style={{ background: 'rgba(255,255,255,.08)' }} />
                  <span className="mt-1.5 block"><Bar w="80%" h={4} /></span>
                </div>
              ))}
            </div>

            {/* the scan line */}
            <motion.div
              className="pointer-events-none absolute inset-x-0"
              initial={{ top: '2%' }}
              animate={{ top: ['2%', '92%', '2%'] }}
              transition={{ duration: 2.6, ease: 'easeInOut', repeat: Infinity }}
            >
              <div className="h-[2px] w-full" style={{ background: A.accent, boxShadow: `0 0 12px 2px ${A.accent}` }} />
              <div className="h-8 w-full" style={{ background: `linear-gradient(${A.accentDeep}55, transparent)` }} />
            </motion.div>
          </div>
        </Panel>

        {/* crawl chip */}
        <motion.div
          className="absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{ background: A.accentDeep, color: '#fff' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
        >
          <Search size={12} /> Crawling…
        </motion.div>
      </div>
    </div>
  )
}

/* ---------- 2 · Extract company base ---------- */
function SceneExtract() {
  const rows = [
    { k: 'Legal name', v: 'Satvik Foods Private Limited' },
    { k: 'CIN', v: 'U15490PN2016PTC167432' },
    { k: 'Sector', v: 'Packaged Foods · FMCG (D2C)' },
    { k: 'Incorporated', v: '14 March 2016' },
    { k: 'FY25 revenue', v: '₹48.6 Cr' },
  ]
  return (
    <div className="grid h-full grid-cols-[1fr_1.2fr] items-center gap-4 p-6 pt-12">
      {/* mini site */}
      <Panel className="p-3">
        <div className="flex items-center gap-1.5 pb-2">
          <Globe size={12} style={{ color: A.accent }} />
          <Bar w={60} c="rgba(255,255,255,.25)" h={5} />
        </div>
        <div className="space-y-1.5">
          <Bar w="90%" h={5} /><Bar w="75%" h={5} /><Bar w="84%" h={5} /><Bar w="60%" h={5} />
        </div>
        {/* data particles flying to the card */}
        {[0, 1, 2].map((k) => (
          <motion.span
            key={k}
            className="absolute h-2 w-2 rounded-full"
            style={{ background: A.accent, boxShadow: `0 0 8px ${A.accent}`, left: '30%', top: '46%' }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], x: [0, 60, 130], y: [0, -6, 4] }}
            transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity, delay: k * 0.5 }}
          />
        ))}
      </Panel>

      {/* company base filling in */}
      <Panel className="p-3.5">
        <div className="mb-2 flex items-center gap-2">
          <Database size={13} style={{ color: A.accent }} />
          <b className="text-[12px] font-bold" style={{ color: A.text }}>Company base</b>
          <span className="ml-auto text-[10.5px] font-bold" style={{ color: A.ok }}>42 fields</span>
        </div>
        <motion.div className="space-y-1.5" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.28 } } }}>
          {rows.map((r) => (
            <motion.div key={r.k} className="flex items-center gap-2 rounded-lg px-2 py-1.5"
              style={{ background: 'rgba(255,255,255,.04)' }}
              variants={{ hidden: { opacity: 0, x: 12 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } } }}>
              <Check size={12} style={{ color: A.ok }} className="shrink-0" />
              <span className="w-[86px] shrink-0 text-[10.5px] font-semibold" style={{ color: A.muted }}>{r.k}</span>
              <span className="truncate text-[11px] font-bold" style={{ color: A.text }}>{r.v}</span>
            </motion.div>
          ))}
        </motion.div>
      </Panel>
    </div>
  )
}

/* ---------- 3 · Upload documents ---------- */
function SceneUpload() {
  const docs = ['GST certificate', 'PAN', 'MOA', 'AOA', 'Financial statements']
  return (
    <div className="grid h-full place-items-center p-6 pt-12">
      <Panel className="w-[80%] max-w-[380px] p-4" style={{ borderStyle: 'dashed' }}>
        <div className="mb-3 flex items-center gap-2">
          <FileUp size={14} style={{ color: A.accent }} />
          <b className="text-[12.5px] font-bold" style={{ color: A.text }}>Uploading documents</b>
        </div>
        <motion.div className="space-y-2" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.32 } } }}>
          {docs.map((d) => (
            <motion.div key={d}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2"
              style={{ background: 'rgba(255,255,255,.05)' }}
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } } }}>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md" style={{ background: A.accentDeep + '33', color: A.accent }}>
                <FileCheck2 size={14} />
              </span>
              <span className="flex-1 text-[11.5px] font-bold" style={{ color: A.text }}>{d}</span>
              <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,.12)' }}>
                <motion.span className="block h-full origin-left rounded-full" style={{ background: A.ok }}
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, ease: EASE, delay: 0.15 }} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Panel>
    </div>
  )
}

/* ---------- 4 · Flag documents ---------- */
function SceneFlag() {
  const items = [
    { n: 'GST certificate', ok: true },
    { n: 'PAN', ok: true },
    { n: 'MOA — object clause', ok: false, note: "Doesn't cover new product line" },
    { n: 'Financial statements', ok: true },
  ]
  return (
    <div className="grid h-full place-items-center p-6 pt-12">
      <div className="w-[82%] max-w-[400px] space-y-2">
        {items.map((it, idx) => (
          <motion.div key={it.n}
            className="flex items-center gap-3 rounded-xl2 px-3 py-2.5"
            style={{ background: it.ok ? A.card : A.warnDim, border: `1px solid ${it.ok ? A.cardLine : A.warn + '66'}` }}
            variants={fadeUp} initial="hidden" animate="show" custom={idx * 0.18}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
              style={{ background: it.ok ? A.okDim : A.warnDim, color: it.ok ? A.ok : A.warn }}>
              {it.ok ? <Check size={16} /> : <AlertTriangle size={16} />}
            </span>
            <div className="min-w-0 flex-1">
              <b className="block text-[12.5px] font-bold" style={{ color: A.text }}>{it.n}</b>
              {it.note && <span className="text-[11px]" style={{ color: A.warn }}>{it.note}</span>}
            </div>
            {!it.ok && (
              <motion.span
                className="flex items-center gap-1 rounded-full px-2 py-1 text-[10.5px] font-bold"
                style={{ background: A.warn, color: '#241a06' }}
                initial={{ scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.7, type: 'spring', stiffness: 380, damping: 16 }}>
                <Flag size={11} /> Flagged
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

/* ---------- 5 · Review against norms ---------- */
function SceneReview() {
  const checks = [
    'Net tangible assets ≥ ₹3 Cr',
    'Positive net worth',
    'Track record — 3 years',
    'Post-issue paid-up capital ≤ ₹25 Cr',
    'Promoter contribution locked-in',
  ]
  return (
    <div className="grid h-full place-items-center p-6 pt-12">
      <Panel className="w-[82%] max-w-[400px] p-4">
        <div className="mb-3 flex items-center gap-2">
          <ClipboardCheck size={14} style={{ color: A.accent }} />
          <b className="text-[12.5px] font-bold" style={{ color: A.text }}>SEBI (ICDR) SME · NSE Emerge</b>
          <span className="ml-auto rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: A.okDim, color: A.ok }}>92% eligible</span>
        </div>
        <motion.div className="space-y-2" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.34 } } }}>
          {checks.map((c, idx) => {
            const warn = idx === 3
            return (
              <motion.div key={c} className="flex items-center gap-2.5"
                variants={{ hidden: { opacity: 0, x: 10 }, show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } } }}>
                <motion.span className="grid h-6 w-6 shrink-0 place-items-center rounded-md"
                  style={{ background: warn ? A.warnDim : A.okDim, color: warn ? A.warn : A.ok }}
                  initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ delay: idx * 0.34 + 0.1, type: 'spring', stiffness: 400, damping: 18 }}>
                  {warn ? <AlertTriangle size={13} /> : <Check size={13} />}
                </motion.span>
                <span className="text-[11.5px] font-semibold" style={{ color: warn ? A.warn : A.text }}>{c}</span>
              </motion.div>
            )
          })}
        </motion.div>
      </Panel>
    </div>
  )
}

/* ---------- 6 · Guide: correct & needed documents ---------- */
function SceneGuide() {
  const fixes = [
    { icon: AlertTriangle, tone: A.warn, t: 'Amend MOA object clause', s: 'Add the millet-snacks product line.' },
    { icon: Plus, tone: A.accent, t: 'Add auditor’s certificate', s: 'FY23–FY25, signed & dated.' },
    { icon: Plus, tone: A.accent, t: 'Add promoter KYC', s: 'DIN + PAN for both promoters.' },
  ]
  return (
    <div className="grid h-full place-items-center p-6 pt-12">
      <div className="w-[84%] max-w-[420px]">
        <motion.div className="mb-2 flex items-center gap-2" variants={fadeUp} initial="hidden" animate="show">
          <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: A.accentDeep, color: '#fff' }}>
            <Sparkles size={14} />
          </span>
          <b className="text-[12.5px] font-bold" style={{ color: A.text }}>Co-pilot · here’s what’s left</b>
        </motion.div>
        <motion.div className="space-y-2" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.3, delayChildren: 0.2 } } }}>
          {fixes.map((f) => (
            <motion.div key={f.t} className="flex items-start gap-2.5 rounded-xl2 px-3 py-2.5"
              style={{ background: A.card, border: `1px solid ${A.cardLine}` }}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: EASE } } }}>
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                style={{ background: f.tone + '22', color: f.tone }}>
                <f.icon size={14} />
              </span>
              <div>
                <b className="block text-[12px] font-bold" style={{ color: A.text }}>{f.t}</b>
                <span className="text-[11px]" style={{ color: A.muted }}>{f.s}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

/* ---------- 7 · DRHP generated ---------- */
function SceneGenerate() {
  const sections = [88, 100, 74, 96, 100, 82]
  return (
    <div className="grid h-full place-items-center p-6 pt-10">
      <div className="relative">
        {/* stacked page shadows */}
        <motion.div className="absolute -left-2 -top-2 h-full w-full rounded-xl2"
          style={{ background: 'rgba(255,255,255,.05)', border: `1px solid ${A.cardLine}` }}
          initial={{ opacity: 0, x: 8, y: 8 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.5, ease: EASE }} />
        <motion.div className="relative w-[210px] rounded-xl2 p-4"
          style={{ background: 'linear-gradient(180deg,#f7fafc,#e9f0f8)' }}
          initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55, ease: EASE }}>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-extrabold uppercase tracking-[.14em]" style={{ color: '#3A63C4' }}>Draft · DRHP</span>
            <FileCheck2 size={13} style={{ color: '#3A63C4' }} />
          </div>
          <div className="mt-2 space-y-1">
            <span className="block h-2.5 w-[70%] rounded-full" style={{ background: '#16233A' }} />
            <span className="block h-1.5 w-[50%] rounded-full" style={{ background: '#8aa0c4' }} />
          </div>
          <div className="mt-3 space-y-1.5">
            {sections.map((pct, k) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className="text-[8px] font-bold" style={{ color: '#7086a8' }}>{String.fromCharCode(73 + k)}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: '#d6e0ee' }}>
                  <motion.span className="block h-full origin-left rounded-full"
                    style={{ background: 'linear-gradient(90deg,#7DB7F8,#3A63C4)' }}
                    initial={{ scaleX: 0 }} animate={{ scaleX: pct / 100 }} transition={{ duration: 0.7, ease: EASE, delay: 0.4 + k * 0.1 }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* certified-ready seal */}
        <motion.div
          className="absolute -bottom-3 -right-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold shadow-lg2"
          style={{ background: A.ok, color: '#052e20' }}
          initial={{ opacity: 0, scale: 0.4, rotate: -14 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 1.15, type: 'spring', stiffness: 320, damping: 15 }}>
          <ShieldCheck size={14} /> Ready for banker
        </motion.div>

        {/* sparkle burst */}
        {[0, 1, 2, 3].map((k) => (
          <motion.span key={k} className="absolute h-1.5 w-1.5 rounded-full"
            style={{ background: A.accent, top: '10%', left: '50%' }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.4], x: [0, (k - 1.5) * 34], y: [0, -22 - k * 5] }}
            transition={{ delay: 1.2, duration: 1, ease: 'easeOut' }} />
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   Reduced-motion fallback — static storyboard
   ============================================================ */
function Storyboard() {
  return (
    <figure className="navy-panel overflow-hidden rounded-3xl2 p-6 text-[#DCE6F6] sm:p-8">
      <figcaption className="mb-5 text-[13px] font-bold" style={{ color: A.muted }}>
        How Sahayak turns a website into a DRHP
      </figcaption>
      <ol className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((s, i) => (
          <li key={s.id} className="flex items-start gap-3 rounded-xl2 p-3"
            style={{ background: A.card, border: `1px solid ${A.cardLine}` }}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl2"
              style={{ background: A.accentDeep + '33', color: A.accent }}>
              <s.icon size={17} />
            </span>
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-[.12em]" style={{ color: A.accent }}>
                {i + 1} · {s.chapter}
              </span>
              <b className="mt-0.5 block text-[13px] text-white">{s.title}</b>
              <span className="text-[11.5px] leading-snug" style={{ color: A.muted }}>{s.sub}</span>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  )
}
