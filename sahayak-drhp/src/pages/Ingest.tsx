import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, ArrowRight, Check, UploadCloud, ArrowLeft, Building2, Sparkles, FileText, MapPin, Briefcase,
} from 'lucide-react'
import { useStore } from '../store'
import { Brand, Ring } from '../components/ui'
import { COMPANY, CRAWL_STEPS, FINANCIALS } from '../data/mock'

type Phase = 'input' | 'crawling' | 'result'

export default function Ingest() {
  const go = useStore((s) => s.goScreen)
  const setCrawlDone = useStore((s) => s.setCrawlDone)
  const [phase, setPhase] = useState<Phase>('input')
  const [url, setUrl] = useState('')
  const [active, setActive] = useState(-1)
  const [progress, setProgress] = useState(0)
  const timers = useRef<number[]>([])

  function start(u: string) {
    if (phase !== 'input') return
    const clean = u.trim() || COMPANY.website
    setUrl(clean)
    setPhase('crawling')
    let acc = 0
    const total = CRAWL_STEPS.reduce((a, s) => a + s.ms, 0)
    CRAWL_STEPS.forEach((step, i) => {
      const startT = acc
      timers.current.push(window.setTimeout(() => setActive(i), startT))
      acc += step.ms
      timers.current.push(window.setTimeout(() => setProgress(Math.round((acc / total) * 100)), acc - 50))
    })
    timers.current.push(window.setTimeout(() => { setActive(CRAWL_STEPS.length); setProgress(100) }, acc + 200))
    timers.current.push(window.setTimeout(() => setPhase('result'), acc + 900))
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
    <div className="min-h-screen flex flex-col bg-[#eef2f8]">
      {/* top bar */}
      <div className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-line">
        <div className="max-w-[1220px] mx-auto px-7 flex items-center justify-between h-[70px]">
          <Brand />
          <button onClick={goHome} className="btn btn-ghost btn-sm"><ArrowLeft size={16} /> Home</button>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[940px] mx-auto px-7 py-14">
        <AnimatePresence mode="wait">
          {/* ---------- INPUT ---------- */}
          {phase === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center">
              <div className="inline-flex items-center gap-2 chip bg-navy-900 text-gold-soft mb-5"><Sparkles size={14} /> Step 1 of the journey</div>
              <h1 className="text-[34px] tracking-[-0.02em] font-extrabold mb-3">Let’s build your company’s base</h1>
              <p className="text-[16.5px] text-muted max-w-[560px] mx-auto mb-9">
                Give us your website and we’ll read it end-to-end — identity, sector, products, funding
                and more — so you don’t start from a blank form.
              </p>

              <div className="flex gap-3 bg-white border border-line rounded-2xl p-2.5 pl-5 shadow-md2 items-center max-w-[720px] mx-auto">
                <Globe size={20} className="text-muted shrink-0" />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && start(url)}
                  aria-label="Company website"
                  placeholder="www.satvikfoods.in"
                  className="flex-1 outline-none text-[16px] font-medium bg-transparent placeholder:text-[#9fb0c7]"
                />
                <button onClick={() => start(url)} className="btn btn-gold">
                  Scan website <ArrowRight size={18} />
                </button>
              </div>

              <div className="flex gap-2.5 justify-center mt-4 flex-wrap">
                <span className="text-[13px] text-muted mr-1 self-center">Try:</span>
                {['www.satvikfoods.in'].map((s) => (
                  <button key={s} onClick={() => { setUrl(s); start(s) }}
                    className="text-[13px] px-3.5 py-1.5 rounded-full bg-white border border-line text-ink-2 hover:border-gold hover:text-ink transition">
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 justify-center mt-8 text-muted text-sm">
                <div className="h-px w-16 bg-line" /> or <div className="h-px w-16 bg-line" />
              </div>
              <button onClick={() => start('')} className="mt-6 inline-flex items-center gap-2.5 border-[1.5px] border-dashed border-[#c6d2e4] rounded-xl px-5 py-3 text-ink-2 bg-white hover:border-gold hover:bg-[#fffdf7] transition">
                <UploadCloud size={18} /> Drop incorporation docs, audited financials & cap table instead
              </button>

              <div className="grid sm:grid-cols-3 gap-3 mt-10 max-w-[720px] mx-auto text-left">
                {[
                  { i: Building2, t: 'Identity', d: 'CIN, registered office, RoC, GSTIN' },
                  { i: Briefcase, t: 'Business', d: 'Sector, products, model, scale' },
                  { i: FileText, t: 'Signals', d: 'Funding history & press mentions' },
                ].map((c) => (
                  <div key={c.t} className="card p-4 flex gap-3 items-start">
                    <c.i size={18} className="text-gold-deep mt-0.5 shrink-0" />
                    <div><b className="text-[13.5px] block">{c.t}</b><span className="text-[12.5px] text-muted">{c.d}</span></div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ---------- CRAWLING ---------- */}
          {phase === 'crawling' && (
            <motion.div key="crawling" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-[760px] mx-auto">
              <div className="flex items-center gap-4 bg-white border border-line rounded-2xl p-5 shadow-md2 mb-5">
                <div className="w-11 h-11 rounded-xl grid place-items-center bg-navy-900 shrink-0">
                  <Globe size={22} className="text-gold-soft spin" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-[16px]">{url}</div>
                  <div className="text-[13.5px] text-muted">Reading your website & building a knowledge base…</div>
                  <div className="h-1.5 bg-[#eef2f8] rounded-full overflow-hidden mt-3">
                    <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#d4af5f,#b8923f)', boxShadow: '0 0 12px rgba(212,175,95,.6)' }}
                      animate={{ width: `${progress}%` }} transition={{ ease: 'easeOut' }} />
                  </div>
                </div>
                <div className="text-[22px] font-extrabold mono text-navy-800">{progress}%</div>
              </div>

              <div className="card overflow-hidden">
                {CRAWL_STEPS.map((step, i) => {
                  const state = i < active ? 'done' : i === active ? 'run' : 'wait'
                  return (
                    <motion.div key={step.label}
                      className="flex items-center gap-3.5 px-5 py-4 border-b border-line last:border-0 text-[14.5px]"
                      animate={{ opacity: state === 'wait' ? 0.4 : 1 }}>
                      <span className={`w-6 h-6 rounded-full grid place-items-center shrink-0 ${state === 'done' ? 'bg-ok-bg text-ok' : ''}`}
                        style={state !== 'done' ? { border: state === 'run' ? '2px solid #d4af5f' : '2px solid #dbe3ef', borderTopColor: state === 'run' ? 'transparent' : undefined } as any : undefined}>
                        {state === 'done' && <Check size={13} />}
                        {state === 'run' && <span className="w-3.5 h-3.5 rounded-full border-2 border-gold border-t-transparent spin" />}
                      </span>
                      <b className="font-semibold">{step.label}</b>
                      <span className="ml-auto text-[12.5px] text-muted mono">{state !== 'wait' ? step.meta : ''}</span>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ---------- RESULT ---------- */}
          {phase === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="max-w-[820px] mx-auto">
              <div className="text-center mb-7">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                  className="w-16 h-16 rounded-2xl bg-ok-bg text-ok grid place-items-center mx-auto mb-4">
                  <Check size={34} strokeWidth={2.5} />
                </motion.div>
                <h1 className="text-[30px] tracking-[-0.02em] font-extrabold mb-2">We’ve built your company base</h1>
                <p className="text-[16px] text-muted">42 attributes extracted from {url}. Review the snapshot, then we’ll begin verification.</p>
              </div>

              {/* company card */}
              <div className="card overflow-hidden mb-5">
                <div className="p-6 flex items-start gap-4 border-b border-line">
                  <div className="w-14 h-14 rounded-xl grid place-items-center text-white font-extrabold text-xl shrink-0"
                    style={{ background: 'linear-gradient(135deg,#1e6f4e,#2fae74)' }}>{COMPANY.logoLetters}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-[20px] font-bold">{COMPANY.legalName}</h2>
                      <span className="chip bg-ok-bg text-[#0d6b43]"><Check size={13} /> Verified with MCA</span>
                    </div>
                    <div className="text-[14px] text-muted mt-1">{COMPANY.subSector}</div>
                    <div className="flex items-center gap-1.5 text-[13px] text-muted mt-1.5"><MapPin size={13} /> {COMPANY.regOffice}</div>
                  </div>
                  <Ring value={100} size={56} color="#159a62" label="✓" />
                </div>

                <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0 p-6">
                  {[
                    ['Corporate Identity No. (CIN)', COMPANY.cin],
                    ['Sector', COMPANY.sector],
                    ['Incorporated', COMPANY.incorporated],
                    ['Registrar of Companies', COMPANY.roc],
                    ['Employees', String(COMPANY.employees)],
                    ['Target platform', COMPANY.targetExchange],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 py-2.5 border-b border-dashed border-line text-[14px]">
                      <span className="text-muted">{k}</span>
                      <span className="font-semibold text-right mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* quick financial peek */}
              <div className="grid sm:grid-cols-3 gap-4 mb-7">
                {FINANCIALS.map((f) => (
                  <div key={f.fy} className="card p-4">
                    <div className="text-[12px] text-muted font-semibold">{f.fy} Revenue</div>
                    <div className="text-[22px] font-extrabold mono mt-1">₹{(f.revenue / 100).toFixed(2)}<span className="text-[14px] text-muted"> Cr</span></div>
                    <div className="text-[12px] text-ok font-semibold mt-1">PAT ₹{(f.pat / 100).toFixed(2)} Cr</div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center flex-wrap gap-3">
                <div className="text-[13.5px] text-muted max-w-[440px]">
                  Everything here is editable later. Next, we verify each area in phases — like a guided KYC.
                </div>
                <button onClick={enterWorkspace} className="btn btn-gold btn-lg">
                  Begin verification <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
