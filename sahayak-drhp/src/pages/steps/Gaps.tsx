import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, AlertTriangle, MapPin, ScanSearch, ShieldCheck, CheckCircle2, Sparkles, X } from 'lucide-react'
import { useStore } from '../../store'
import { GAPS } from '../../data/mock'
import Term from '../../components/Term'
import { Chip } from '../../components/ui'
import { Reveal } from '../../components/motion'
import { EmptyStateArt } from '../../components/illustrations'
import { EASE } from '../../lib/motion'

const sev = {
  high: { label: 'High', cls: 'bg-bad-bg text-bad ring-1 ring-inset ring-bad-line', icon: '#A93A31' },
  medium: { label: 'Medium', cls: 'bg-warn-bg text-warn ring-1 ring-inset ring-warn-line', icon: '#8A5A12' },
  low: { label: 'Low', cls: 'bg-info-bg text-info ring-1 ring-inset ring-info-line', icon: '#2F55B0' },
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

  // Escape closes the resolution dialog.
  useEffect(() => {
    if (!selectedGap) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSelectedGap(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selectedGap])

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
      <Chip tone="accent" className="mb-3">
        <ScanSearch size={12} /> Consistency &amp; completeness scan
      </Chip>
      <h2 className="text-[27px] font-extrabold tracking-[-0.03em]">Gaps &amp; consistency</h2>
      <p className="mt-2 max-w-[60ch] text-[14.5px] leading-[1.62] text-ink-3">
        {/* Desired outcome 1, 3, and 6: keep unresolved disclosure work explicit and understandable for first-time issuers. */}
        Before anything reaches your <Term term="merchant_banker">merchant banker</Term>, here is every gap and
        inconsistency we could find — ranked by severity, each linked to the section it affects.
      </p>

      {/* Verdict banner */}
      <Reveal shape="settle" className="mt-6">
        <div
          className="flex flex-wrap items-center gap-5 rounded-3xl2 px-6 py-5 text-white shadow-lg2"
          style={{
            background: high
              ? 'linear-gradient(140deg,#8F2F28,#A93A31 60%,#C2483F)'
              : 'linear-gradient(140deg,#0F7052,#12805E 55%,#149A6F)',
          }}
        >
          <span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl2 bg-white/[.18] p-3">
            {high ? <AlertTriangle size={26} /> : <CheckCircle2 size={26} />}
          </span>
          <div className="min-w-[220px] flex-1">
            <h3 className="text-[18px] font-bold tracking-[-0.02em]">
              {unresolved.length} {unresolved.length === 1 ? 'item' : 'items'} to review · {high} block certification
            </h3>
            <p className="mt-1 max-w-[52ch] text-[13.5px] leading-[1.55] text-white/90">
              Clear the high-severity items and this draft is ready to hand to your lead manager.
            </p>
          </div>
          <button
            onClick={() => showToast('Co-pilot is walking you through resolutions →')}
            className="btn shrink-0 border border-white/25 bg-white/15 text-white hover:bg-white/25"
          >
            Auto-resolve with co-pilot
          </button>
        </div>
      </Reveal>

      {/* Next best action */}
      {nextGap ? (
        <Reveal shape="settle" className="mt-5">
          <div className="card border-accent-200 bg-accent-50 p-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Chip tone="accent">
                <Sparkles size={11} /> Next best action
              </Chip>
              <span className={`chip ${sev[nextGap.severity].cls}`}>{sev[nextGap.severity].label} severity</span>
            </div>
            <b className="block text-[16.5px] font-bold tracking-[-0.02em]">{nextGap.title}</b>
            <p className="mt-1.5 max-w-[68ch] text-[13.5px] leading-[1.62] text-ink-2">{nextGap.detail}</p>
            <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
              <MapPin size={12} /> {nextGap.location}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => handleResolve(nextGap.id, nextGap.title)} className="btn btn-gold btn-sm">
                Resolve this
              </button>
              <button
                onClick={() =>
                  document.getElementById(`gap-${nextGap.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
                className="btn btn-ghost btn-sm"
              >
                Show in list
              </button>
            </div>
          </div>
        </Reveal>
      ) : (
        <Reveal shape="settle" className="mt-5">
          <div className="card flex flex-wrap items-center gap-5 p-6">
            <EmptyStateArt variant="all-clear" className="h-24 w-auto shrink-0" />
            <div>
              <b className="block text-[16.5px] font-bold tracking-[-0.02em]">Every flagged gap is resolved</b>
              <p className="mt-1 text-[13.5px] text-muted">
                The draft is ready to move into the intermediary review stage.
              </p>
            </div>
          </div>
        </Reveal>
      )}

      {/* The list */}
      <ol className="mt-5 space-y-3">
        {GAPS.map((g, i) => {
          const s = sev[g.severity]
          const resolved = resolvedGapIds.includes(g.id)
          return (
            <motion.li
              key={g.id}
              id={`gap-${g.id}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: EASE }}
              className={`flex scroll-mt-28 gap-4 rounded-2xl2 border px-5 py-4 transition-colors duration-200 ${
                resolved ? 'border-ok-line bg-ok-bg/45' : 'border-line bg-white'
              }`}
            >
              <span
                className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl2"
                style={{ background: resolved ? '#E7F5EF' : `${s.icon}16`, color: resolved ? '#0F7052' : s.icon }}
              >
                {resolved ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              </span>

              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className={`chip ${s.cls}`}>{s.label} severity</span>
                  <Chip tone="gray">{g.type}</Chip>
                  {resolved && <Chip tone="green">Resolved</Chip>}
                </div>
                <b className={`block text-[14.5px] font-bold ${resolved ? 'text-ink-2 line-through decoration-ok/40' : ''}`}>
                  {g.title}
                </b>
                <p className="mt-1 max-w-[70ch] text-[13px] leading-[1.62] text-ink-3">{g.detail}</p>
                <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
                  <MapPin size={12} /> {g.location}
                </p>
              </div>

              <button
                onClick={() => handleResolve(g.id, g.title)}
                disabled={resolved}
                className="btn btn-ghost btn-sm shrink-0 self-center"
              >
                {resolved ? 'Resolved' : 'Resolve'}
              </button>
            </motion.li>
          )
        })}
      </ol>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <p className="flex items-center gap-2 text-[13.5px] text-muted">
          <ShieldCheck size={16} className="shrink-0 text-ok" /> Every flag is disclosed to your banker — nothing is
          hidden.
        </p>
        <button onClick={() => goStep('final')} className="btn btn-gold btn-lg">
          View final draft <ArrowRight size={17} />
        </button>
      </div>

      {/* Resolution dialog */}
      <AnimatePresence>
        {selectedGap && (
          <motion.div
            className="fixed inset-0 z-[150] grid place-items-center p-4"
            style={{ background: 'rgba(14,24,40,.5)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedGap(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.97, y: 14, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 8, opacity: 0 }}
              transition={{ duration: 0.26, ease: EASE }}
              className="w-full max-w-[480px] rounded-3xl2 bg-white p-7 shadow-xl2"
              role="dialog"
              aria-modal="true"
              aria-label="Resolve gap"
            >
              <div className="mb-4 flex items-start justify-between">
                <span className={`grid h-12 w-12 place-items-center rounded-2xl2 ${sev[selectedGap.severity].cls}`}>
                  <AlertTriangle size={22} />
                </span>
                <button
                  onClick={() => setSelectedGap(null)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-panel hover:text-ink"
                  aria-label="Close resolution dialog"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-[20px] font-extrabold tracking-[-0.028em]">Resolve this issue</h3>
              <p className="mt-1.5 text-[13.5px] leading-[1.6] text-muted">
                Choose how to handle the item below. Marking it resolved records your decision in the audit trail.
              </p>

              <div className="mt-4 rounded-2xl2 border border-line bg-panel/70 p-4">
                <div className="text-[10.5px] font-extrabold uppercase tracking-[0.11em] text-muted">Issue</div>
                <div className="mt-1.5 text-[14.5px] font-bold text-ink">{selectedGap.title}</div>
                <p className="mt-2 text-[12.5px] leading-[1.6] text-ink-3">{selectedGap.detail}</p>
                <p className="mono mt-3 text-[11.5px] text-muted">Location · {selectedGap.location}</p>
              </div>

              <ul className="mt-4 space-y-1.5 rounded-2xl2 border border-line bg-white px-4 py-3.5 text-[12.5px] leading-[1.6] text-ink-3">
                <li className="flex gap-2">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent-400" />
                  Mark it resolved and continue.
                </li>
                <li className="flex gap-2">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent-400" />
                  Keep it open to revisit or update the underlying source first.
                </li>
              </ul>

              <div className="mt-5 flex gap-3">
                <button onClick={() => setSelectedGap(null)} className="btn btn-ghost flex-1 justify-center">
                  Keep open
                </button>
                <button onClick={confirmResolve} className="btn btn-gold flex-1 justify-center">
                  Mark resolved
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
