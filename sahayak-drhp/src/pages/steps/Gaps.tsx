import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, AlertTriangle, MapPin, ScanSearch, ShieldCheck, CheckCircle2, Sparkles, X } from 'lucide-react'
import { useStore } from '../../store'
import { GAPS } from '../../data/mock'
import Term from '../../components/Term'

const sev = {
  high: { label: 'High', cls: 'bg-bad-bg text-[#b23428]', icon: '#d5493f' },
  medium: { label: 'Medium', cls: 'bg-warn-bg text-[#a5651a]', icon: '#d9902a' },
  low: { label: 'Low', cls: 'bg-info-bg text-[#1e56b8]', icon: '#2f6fdc' },
}

const severityRank = { high: 0, medium: 1, low: 2 }

export default function Gaps() {
  const goStep = useStore((s) => s.goStep)
  const showToast = useStore((s) => s.showToast)
  const resolveGap = useStore((s) => s.resolveGap)
  const resolvedGapIds = useStore((s) => s.resolvedGapIds)
  const jumpTarget = useStore((s) => s.jumpTarget)
  const setJumpTarget = useStore((s) => s.setJumpTarget)
  const [selectedGap, setSelectedGap] = useState<typeof GAPS[number] | null>(null)

  const unresolved = GAPS.filter((gap) => !resolvedGapIds.includes(gap.id))
  const nextGap = [...unresolved].sort((a, b) => severityRank[a.severity] - severityRank[b.severity])[0]
  const high = unresolved.filter((g) => g.severity === 'high').length

  useEffect(() => {
    if (jumpTarget?.kind !== 'gap') return
    document.getElementById(`gap-${jumpTarget.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setJumpTarget(null)
  }, [jumpTarget, setJumpTarget])

  function handleResolve(id: string, title: string) {
    setSelectedGap(GAPS.find((gap) => gap.id === id) ?? null)
  }

  function confirmResolve() {
    if (!selectedGap) return
    resolveGap(selectedGap.id)
    showToast(`Resolved: ${selectedGap.title}`)
    setSelectedGap(null)
  }

  return (
    <div>
      <div className="chip bg-navy-900 text-gold-soft mb-3"><ScanSearch size={13} /> Consistency & completeness scan</div>
      <h2 className="text-[26px] tracking-[-0.02em] font-extrabold mb-1.5">Gaps & Consistency</h2>
      <p className="text-muted text-[15px] mb-6 max-w-[580px]">
        {/* Desired outcome 1, 3, and 6: keep unresolved disclosure work explicit and understandable for first-time issuers. */}
        Before anything reaches your <Term term="merchant_banker">merchant banker</Term>, here’s every gap and inconsistency we could find —
        ranked by severity, each linked to the exact section it affects.
      </p>

      <div
        className="mb-6 flex flex-wrap items-center gap-5 rounded-[14px] px-6 py-5 shadow-md2"
        style={{ background: high ? 'linear-gradient(120deg,#7a2820,#a83a2e)' : 'linear-gradient(120deg,#0e7a4d,#159a62)', color: '#fff' }}
      >
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/[.16]"><AlertTriangle size={28} /></div>
        <div className="flex-1">
          <h3 className="mb-0.5 text-[19px] font-bold">{unresolved.length} items to review · {high} block certification</h3>
          <p className="max-w-[480px] text-[13.5px] opacity-95">Resolve the high-severity items and this draft is ready to hand to your lead manager.</p>
        </div>
        <button onClick={() => showToast('Co-pilot is walking you through resolutions →')} className="btn shrink-0 !bg-white/15 !text-white hover:!bg-white/25">
          Auto-resolve with co-pilot
        </button>
      </div>

      {nextGap ? (
        <div className="card mb-5 border-gold bg-[#fffdf7] p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="chip bg-navy-900 text-gold-soft"><Sparkles size={12} /> Next best action</span>
            <span className={`chip ${sev[nextGap.severity].cls}`}>{sev[nextGap.severity].label} severity</span>
          </div>
          <b className="block text-[17px]">{nextGap.title}</b>
          <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{nextGap.detail}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[12px] text-muted"><MapPin size={12} /> {nextGap.location}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => handleResolve(nextGap.id, nextGap.title)} className="btn btn-gold btn-sm">
              Resolve this
            </button>
            <button onClick={() => document.getElementById(`gap-${nextGap.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="btn btn-ghost btn-sm">
              Show in list
            </button>
          </div>
        </div>
      ) : (
        <div className="card mb-5 flex items-center gap-3 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ok-bg text-ok"><CheckCircle2 size={24} /></span>
          <div>
            <b className="block text-[16px]">All flagged gaps are resolved</b>
            <span className="text-[13px] text-muted">The draft is ready to move into the intermediary review stage.</span>
          </div>
        </div>
      )}

      {GAPS.map((g, i) => {
        const s = sev[g.severity]
        const resolved = resolvedGapIds.includes(g.id)
        return (
          <motion.div
            key={g.id}
            id={`gap-${g.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`mb-3 flex scroll-mt-28 gap-4 rounded-[14px] border px-5 py-4 ${resolved ? 'border-[#cfe7db] bg-[#f5fbf8]' : 'border-line bg-white'} shadow-sm2`}
          >
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${s.icon}18`, color: s.icon }}>
              {resolved ? <CheckCircle2 size={19} /> : <AlertTriangle size={19} />}
            </span>
            <div className="flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className={`chip ${s.cls}`}>{s.label} severity</span>
                <span className="chip bg-[#eef2f8] text-muted">{g.type}</span>
                {resolved && <span className="chip bg-ok-bg text-[#0d6b43]">Resolved</span>}
              </div>
              <b className="mb-1 block text-[15px]">{g.title}</b>
              <p className="text-[13.5px] leading-relaxed text-ink-2">{g.detail}</p>
              <div className="mt-2 flex items-center gap-1.5 text-[12px] text-muted"><MapPin size={12} /> {g.location}</div>
            </div>
            <button
              onClick={() => handleResolve(g.id, g.title)}
              disabled={resolved}
              className="btn btn-ghost btn-sm self-center shrink-0"
            >
              {resolved ? 'Resolved' : 'Resolve'}
            </button>
          </motion.div>
        )
      })}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <div className="flex items-center gap-2 text-[13.5px] text-muted"><ShieldCheck size={16} className="text-ok" /> All flags are disclosed to your banker — nothing is hidden.</div>
        <button onClick={() => goStep('final')} className="btn btn-gold btn-lg">View final draft <ArrowRight size={18} /></button>
      </div>

      <AnimatePresence>
        {selectedGap && (
          <motion.div
            className="fixed inset-0 z-[150] grid place-items-center p-4"
            style={{ background: 'rgba(8,20,40,.55)', backdropFilter: 'blur(3px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedGap(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-[460px] rounded-2xl2 bg-white p-7 shadow-lg2"
              style={{ borderRadius: 20 }}
              role="dialog"
              aria-modal="true"
              aria-label="Resolve gap"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-bad-bg text-[#b23428]"><AlertTriangle size={24} /></div>
                <button onClick={() => setSelectedGap(null)} className="text-muted hover:text-ink" aria-label="Close resolution dialog"><X size={20} /></button>
              </div>
              <h3 className="mb-1.5 text-[20px] font-extrabold tracking-tight">Resolve this issue</h3>
              <p className="mb-4 text-[14px] leading-relaxed text-muted">Below is the unresolved item from your gap review. Choose how you want to handle it.</p>
              <div className="card mb-4 bg-paper p-4">
                <div className="mb-2 text-[12px] uppercase tracking-[0.18em] text-slate-500">Issue</div>
                <div className="text-[15px] font-semibold text-ink">{selectedGap.title}</div>
                <div className="mt-2 text-[13px] leading-relaxed text-slate-600">{selectedGap.detail}</div>
                <div className="mt-3 text-[12px] text-muted">Location: {selectedGap.location}</div>
              </div>
              <div className="mb-4 rounded-2xl border border-line bg-[#f7f9fc] px-4 py-3 text-[13px] text-slate-700">
                What should be done?
                <ul className="mt-2 list-disc pl-5 text-[13px] leading-relaxed text-slate-600">
                  <li>Mark the issue as resolved and continue.</li>
                  <li>Keep it open if you want to revisit or update the underlying source first.</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedGap(null)} className="btn btn-ghost flex-1 justify-center">Keep open</button>
                <button onClick={confirmResolve} className="btn btn-gold flex-1 justify-center">Mark resolved</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
