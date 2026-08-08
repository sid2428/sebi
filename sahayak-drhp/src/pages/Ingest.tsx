import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, ArrowRight, Check, UploadCloud, ArrowLeft, Building2, FileText, MapPin, Briefcase, Sparkles,
  X, Loader2, Paperclip,
} from 'lucide-react'
import { useStore } from '../store'
import { Brand, Chip, Ring } from '../components/ui'
import { COMPANY, CRAWL_STEPS, FINANCIALS } from '../data/mock'
import { Counter, Reveal, Stagger, StaggerItem } from '../components/motion'
import ScanStory, { ACTS, actForProgress } from '../components/illustrations/ScanStory'
import { SceneIngest } from '../components/illustrations'
import { formatBytes, useSimulatedAction } from '../lib/actions'
import { DUR, EASE, useReducedMotion } from '../lib/motion'

type Phase = 'input' | 'crawling' | 'result'
type Step = { label: string; meta: string; ms: number }

/** The document route runs its own passes — reading files, not pages. */
function docSteps(count: number): Step[] {
  return [
    { label: 'Reading the files you supplied', meta: `${count} file${count === 1 ? '' : 's'}`, ms: 1400 },
    { label: 'Extracting company identity from incorporation papers', meta: 'CIN, RoC', ms: 2100 },
    { label: 'Parsing audited financial statements', meta: 'FY21–FY23', ms: 2800 },
    { label: 'Reconciling the cap table and register of members', meta: '6 holders', ms: 2200 },
    { label: 'Cross-referencing MCA master data', meta: 'MCA registry', ms: 3000 },
    { label: 'Building company knowledge base', meta: '42 attributes', ms: 1600 },
  ]
}

export default function Ingest() {
  const go = useStore((s) => s.goScreen)
  const setCrawlDone = useStore((s) => s.setCrawlDone)
  const addUploadedDocs = useStore((s) => s.addUploadedDocs)
  const showToast = useStore((s) => s.showToast)

  const [phase, setPhase] = useState<Phase>('input')
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [source, setSource] = useState<'website' | 'documents'>('website')
  const [steps, setSteps] = useState<Step[]>(CRAWL_STEPS)
  const [active, setActive] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [files, setFiles] = useState<{ id: string; name: string; size: number }[]>([])
  const [uploaded, setUploaded] = useState(false)
  const upload = useSimulatedAction({ ms: 1500 })
  const fileInput = useRef<HTMLInputElement>(null)
  const timers = useRef<number[]>([])

  function runPasses(list: Step[]) {
    setSteps(list)
    setPhase('crawling')
    setActive(-1)
    setProgress(0)
    let acc = 0
    const total = list.reduce((a, s) => a + s.ms, 0)
    list.forEach((step, i) => {
      const startT = acc
      timers.current.push(window.setTimeout(() => setActive(i), startT))
      acc += step.ms
      // Snapshot the accumulator. The callback must not read `acc` at fire
      // time — by then it has already run to its final value, which made
      // every one of these timers report 100%.
      const reached = acc
      timers.current.push(
        window.setTimeout(() => setProgress(Math.round((reached / total) * 100)), reached - 50)
      )
    })
    timers.current.push(window.setTimeout(() => { setActive(list.length); setProgress(100) }, acc + 200))
    timers.current.push(window.setTimeout(() => setPhase('result'), acc + 900))
  }

  function start(u: string) {
    if (phase !== 'input') return
    const clean = u.trim()
    if (!clean) {
      setUrlError('Enter your website address, or use the example below.')
      return
    }
    if (/\s/.test(clean) || !clean.includes('.')) {
      setUrlError('That does not look like a web address. Try something like www.yourcompany.in')
      return
    }
    setUrlError(null)
    setUrl(clean)
    setSource('website')
    runPasses(CRAWL_STEPS)
  }

  /** The upload route: real file picker, simulated transfer. */
  function onFilesPicked(list: FileList | null) {
    if (!list?.length) return
    const picked = Array.from(list).map((f) => ({
      id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      size: f.size,
    }))
    setFiles((prev) => [...prev, ...picked])
    setUploaded(false)
    upload.reset()
  }

  function uploadFiles() {
    if (!files.length) return
    upload.run({
      onComplete: () => {
        addUploadedDocs(files)
        setUploaded(true)
        showToast(`${files.length} document${files.length === 1 ? '' : 's'} uploaded`)
      },
    })
  }

  function startFromDocs() {
    setSource('documents')
    setUrl(`${files.length} uploaded document${files.length === 1 ? '' : 's'}`)
    runPasses(docSteps(files.length))
  }

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function enterWorkspace() {
    setCrawlDone(true)
    go('dashboard')
  }

  function goHome() {
    if (phase === 'crawling' && !window.confirm('Leave the crawl and return home? Your current progress will be discarded.')) {
      return
    }
    go('landing')
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[64px] max-w-[1100px] items-center justify-between px-6">
          <Brand />
          <button onClick={goHome} className="btn btn-ghost btn-sm">
            <ArrowLeft size={15} /> Home
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1000px] flex-1 px-6 py-14">
        <AnimatePresence mode="wait">
          {/* ---------- INPUT ---------- */}
          {phase === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: DUR.base, ease: EASE }}
            >
              <div className="mx-auto max-w-[680px] text-center">
                <Chip tone="accent" className="mb-5">
                  <Sparkles size={13} /> Step one of the journey
                </Chip>
                <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold leading-[1.08] tracking-[-0.032em]">
                  Let’s build your company base
                </h1>
                <p className="mx-auto mt-4 max-w-[50ch] text-[16.5px] leading-[1.6] text-ink-3">
                  Give us your website. We read it end to end — identity, sector, products, funding — so you
                  never start from a blank form.
                </p>
              </div>

              {/* The one input on the page gets the weight. */}
              <div className="mx-auto mt-9 max-w-[680px]">
                <div
                  className={`group flex items-center gap-3 rounded-2xl2 border bg-white p-2 pl-4 shadow-md2 transition-shadow duration-200 focus-within:shadow-accent ${
                    urlError ? 'border-bad' : 'border-line-strong focus-within:border-accent-300'
                  }`}
                >
                  <Globe size={19} className="shrink-0 text-muted transition-colors group-focus-within:text-accent-600" />
                  <input
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value)
                      if (urlError) setUrlError(null)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && start(url)}
                    aria-label="Company website"
                    aria-invalid={!!urlError}
                    aria-describedby={urlError ? 'url-error' : undefined}
                    placeholder="www.satvikfoods.in"
                    className="min-w-0 flex-1 bg-transparent py-2.5 text-[16px] font-medium outline-none placeholder:text-muted"
                  />
                  <button onClick={() => start(url)} className="btn btn-gold shrink-0">
                    Scan website <ArrowRight size={17} />
                  </button>
                </div>

                {urlError && (
                  <p id="url-error" role="alert" className="mt-2 text-center text-[12.5px] font-semibold text-bad">
                    {urlError}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <span className="text-[12.5px] text-muted">Try</span>
                  {[COMPANY.website].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setUrl(s); start(s) }}
                      className="rounded-full border border-line bg-white px-3 py-1.5 text-[12.5px] font-semibold text-ink-2 transition-colors duration-200 hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="my-8 flex items-center gap-4 text-[12.5px] text-muted">
                  <span className="rule flex-1" />
                  or
                  <span className="rule flex-1" />
                </div>

                {/* Document route. The picker is real; the transfer is simulated. */}
                <input
                  ref={fileInput}
                  type="file"
                  multiple
                  className="sr-only"
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={(e) => {
                    onFilesPicked(e.target.files)
                    e.target.value = ''
                  }}
                />

                <button
                  onClick={() => fileInput.current?.click()}
                  className="flex w-full items-center justify-center gap-2.5 rounded-2xl2 border-[1.5px] border-dashed border-line-strong bg-white/60 px-5 py-4 text-[14px] font-semibold text-ink-2 transition-colors duration-200 hover:border-accent-300 hover:bg-accent-50 hover:text-accent-700"
                >
                  <UploadCloud size={18} /> Choose incorporation docs, audited financials &amp; cap table instead
                </button>

                <AnimatePresence>
                  {files.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.24, ease: EASE }}
                      className="card mt-4 p-4 text-left"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <b className="text-[13.5px] font-bold">
                          {files.length} file{files.length === 1 ? '' : 's'} selected
                        </b>
                        {uploaded ? (
                          <Chip tone="green">
                            <Check size={11} /> Upload complete
                          </Chip>
                        ) : (
                          <Chip tone="gray">Not uploaded yet</Chip>
                        )}
                      </div>

                      <ul className="space-y-2">
                        {files.map((f) => (
                          <li
                            key={f.id}
                            className="flex items-center gap-3 rounded-xl2 border border-line bg-white px-3 py-2 text-[13px]"
                          >
                            <Paperclip size={14} className="shrink-0 text-accent-600" />
                            <span className="min-w-0 flex-1 truncate font-semibold text-ink-2">{f.name}</span>
                            <span className="mono shrink-0 text-[11.5px] text-muted">{formatBytes(f.size)}</span>
                            {!uploaded && (
                              <button
                                onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                                className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-panel hover:text-bad"
                                aria-label={`Remove ${f.name}`}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>

                      {upload.isRunning && (
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-panel-2" aria-live="polite">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg,#7DB7F8,#5B8DEF)' }}
                            initial={{ width: '4%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 1.4, ease: 'linear' }}
                          />
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {!uploaded ? (
                          <button
                            onClick={uploadFiles}
                            disabled={upload.isRunning}
                            aria-busy={upload.isRunning}
                            className="btn btn-gold btn-sm"
                          >
                            {upload.isRunning ? (
                              <>
                                <Loader2 size={14} className="animate-spin" /> Uploading…
                              </>
                            ) : (
                              <>
                                <UploadCloud size={14} /> Upload {files.length} file
                                {files.length === 1 ? '' : 's'}
                              </>
                            )}
                          </button>
                        ) : (
                          <button onClick={startFromDocs} className="btn btn-gold btn-sm">
                            Build my company base <ArrowRight size={15} />
                          </button>
                        )}
                        <button onClick={() => fileInput.current?.click()} className="btn btn-ghost btn-sm">
                          Add more files
                        </button>
                        {!upload.isRunning && (
                          <button
                            onClick={() => {
                              setFiles([])
                              setUploaded(false)
                              upload.reset()
                            }}
                            className="btn btn-quiet btn-sm"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Reveal delay={0.1} className="mx-auto mt-12 max-w-[860px]">
                <div className="card overflow-hidden">
                  <div className="grid items-center gap-6 p-6 sm:grid-cols-[1fr_.85fr] sm:p-7">
                    <div>
                      <div className="eyebrow">What we pull</div>
                      <h2 className="mt-2 text-[19px] font-bold tracking-[-0.02em]">
                        42 attributes, each kept next to the page it came from
                      </h2>
                      <Stagger className="mt-5 space-y-2.5" each={0.07}>
                        {[
                          { i: Building2, t: 'Identity', d: 'CIN, registered office, RoC, GSTIN' },
                          { i: Briefcase, t: 'Business', d: 'Sector, products, model, scale' },
                          { i: FileText, t: 'Signals', d: 'Funding history and press mentions' },
                        ].map((c) => (
                          <StaggerItem key={c.t} shape="slideIn" className="flex items-start gap-3">
                            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-50 text-accent-600">
                              <c.i size={16} />
                            </span>
                            <div>
                              <b className="block text-[13.5px] text-ink">{c.t}</b>
                              <span className="text-[12.5px] text-muted">{c.d}</span>
                            </div>
                          </StaggerItem>
                        ))}
                      </Stagger>
                    </div>
                    <div className="rounded-xl2 bg-panel p-4">
                      <SceneIngest className="h-auto w-full" />
                    </div>
                  </div>
                </div>
              </Reveal>
            </motion.div>
          )}

          {/* ---------- CRAWLING ---------- */}
          {phase === 'crawling' && (
            <motion.div
              key="crawling"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.base, ease: EASE }}
              className="mx-auto max-w-[920px]"
            >
              <ScanProgress url={url} progress={progress} active={active} steps={steps} source={source} />
            </motion.div>
          )}

          {/* ---------- RESULT ---------- */}
          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.slow, ease: EASE }}
              className="mx-auto max-w-[860px]"
            >
              <div className="mb-8 text-center">
                <motion.span
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                  className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl2 bg-ok-bg text-ok"
                >
                  <Check size={30} strokeWidth={2.6} />
                </motion.span>
                <h1 className="text-[clamp(24px,3.4vw,32px)] font-extrabold tracking-[-0.03em]">
                  Your company base is built
                </h1>
                <p className="mt-3 text-[15.5px] text-ink-3">
                  <Counter to={42} className="font-bold text-ink" /> attributes extracted from {url}. Review
                  the snapshot, then we begin verification.
                </p>
              </div>

              <Reveal shape="settle" className="mb-5">
                <div className="card overflow-hidden">
                  <div className="flex flex-wrap items-start gap-4 border-b border-line p-6">
                    <span
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-xl2 text-[19px] font-extrabold text-white"
                      style={{ background: 'linear-gradient(140deg,#5B8DEF,#2E4E9C)' }}
                    >
                      {COMPANY.logoLetters}
                    </span>
                    <div className="min-w-[220px] flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-[20px] font-bold tracking-[-0.02em]">{COMPANY.legalName}</h2>
                        <Chip tone="green">
                          <Check size={12} /> Verified with MCA
                        </Chip>
                      </div>
                      <p className="mt-1 text-[13.5px] text-ink-3">{COMPANY.subSector}</p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-muted">
                        <MapPin size={12} /> {COMPANY.regOffice}
                      </p>
                    </div>
                    <Ring value={100} size={54} color="#0F7052" track="#E7F5EF" label="✓" />
                  </div>

                  <Stagger className="grid gap-x-8 p-6 sm:grid-cols-2" each={0.04}>
                    {[
                      ['Corporate identity no. (CIN)', COMPANY.cin],
                      ['Sector', COMPANY.sector],
                      ['Incorporated', COMPANY.incorporated],
                      ['Registrar of companies', COMPANY.roc],
                      ['Employees', String(COMPANY.employees)],
                      ['Target platform', COMPANY.targetExchange],
                    ].map(([k, v]) => (
                      <StaggerItem
                        key={k}
                        shape="fade"
                        className="flex justify-between gap-3 border-b border-dashed border-line py-2.5 text-[13.5px] last:border-0"
                      >
                        <span className="text-muted">{k}</span>
                        <span className="mono text-right font-bold text-ink">{v}</span>
                      </StaggerItem>
                    ))}
                  </Stagger>
                </div>
              </Reveal>

              <Stagger className="mb-8 grid gap-4 sm:grid-cols-3" each={0.08}>
                {FINANCIALS.map((f) => (
                  <StaggerItem key={f.fy} shape="settle" className="card p-4">
                    <div className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-muted">
                      {f.fy} revenue
                    </div>
                    <div className="mt-1.5 text-[23px] font-extrabold tracking-[-0.025em] text-ink">
                      ₹<Counter to={f.revenue / 100} decimals={2} />
                      <span className="text-[13px] font-bold text-muted"> Cr</span>
                    </div>
                    <div className="mt-1 text-[12px] font-bold text-ok">
                      PAT ₹{(f.pat / 100).toFixed(2)} Cr
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
                <p className="max-w-[46ch] text-[13.5px] leading-relaxed text-muted">
                  Everything here stays editable. Next we verify each area in phases, like a guided KYC.
                </p>
                <button onClick={enterWorkspace} className="btn btn-gold btn-lg">
                  Begin verification <ArrowRight size={17} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ============================================================
   Scan progress

   The wait is the explanation. The illustration on the left is the
   act currently running; the list on the right is the audit trail of
   what has already been done. Nothing here is decorative — every
   frame corresponds to a real step in CRAWL_STEPS.
   ============================================================ */

function ScanProgress({
  url,
  progress,
  active,
  steps,
  source,
}: {
  url: string
  progress: number
  active: number
  steps: Step[]
  source: 'website' | 'documents'
}) {
  const reduced = useReducedMotion()
  const act = ACTS[actForProgress(progress)]

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,.92fr)_minmax(0,1.08fr)] lg:items-start">
      {/* Stage */}
      <div className="card overflow-hidden">
        <div className="border-b border-line bg-panel/70 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-600 text-white">
              <Globe size={17} className={reduced ? '' : 'spin'} />
            </span>
            <div className="min-w-0">
              <b className="block truncate text-[14px] text-ink">{url}</b>
              <span className="text-[12px] text-muted">
                {source === 'website' ? 'Reading your website' : 'Reading your documents'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4">
          <ScanStory progress={progress} />
        </div>

        <div className="border-t border-line px-5 py-4" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={act.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: EASE }}
            >
              <b className="block text-[14.5px] font-bold text-ink">{act.title}</b>
              <span className="text-[12.5px] text-muted">{act.line}</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Trail */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <div className="eyebrow">Knowledge base</div>
            <b className="mt-1 block text-[15px] font-bold">Building from {steps.length} passes</b>
          </div>
          <div className="text-right">
            <div className="text-[26px] font-extrabold leading-none tracking-[-0.03em] text-ink mono">
              {progress}%
            </div>
          </div>
        </div>

        <div className="px-5 pt-4">
          <div
            className="h-1.5 overflow-hidden rounded-full bg-panel-2"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Website scan progress"
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg,#7DB7F8,#5B8DEF)' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: EASE, duration: 0.4 }}
            />
          </div>
        </div>

        <ol className="p-2">
          {steps.map((step, i) => {
            const state = i < active ? 'done' : i === active ? 'run' : 'wait'
            return (
              <motion.li
                key={step.label}
                className="flex items-center gap-3 rounded-xl2 px-3 py-3 text-[13.5px]"
                animate={{
                  opacity: state === 'wait' ? 0.42 : 1,
                  backgroundColor: state === 'run' ? 'rgba(241,246,254,1)' : 'rgba(255,255,255,0)',
                }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                    state === 'done'
                      ? 'bg-ok-bg text-ok'
                      : state === 'run'
                        ? 'bg-accent-50 text-accent-600 ring-1 ring-accent-200'
                        : 'bg-panel text-faint ring-1 ring-line'
                  }`}
                >
                  {state === 'done' && <Check size={13} strokeWidth={3} />}
                  {state === 'run' && (
                    <span className="h-3 w-3 rounded-full border-2 border-accent-400 border-t-transparent spin" />
                  )}
                </span>
                <span className={`min-w-0 flex-1 ${state === 'run' ? 'font-bold text-ink' : 'font-semibold text-ink-2'}`}>
                  {step.label}
                </span>
                <span className="mono shrink-0 text-[11.5px] text-muted">
                  {state !== 'wait' ? step.meta : ''}
                </span>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
