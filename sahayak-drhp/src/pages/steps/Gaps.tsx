import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, MapPin, ScanSearch, ShieldCheck, CheckCircle2, Sparkles, Loader2, RotateCcw, Download,
} from 'lucide-react'
import { useStore } from '../../store'
import { GAPS, COMPANY, getCombinedGaps } from '../../data/mock'
import { GAP_RESOLUTIONS, type ResolutionOption } from '../../data/drafts'
import { ALL_DOCS } from '../../data/documents'
import Term from '../../components/Term'
import { Chip } from '../../components/ui'
import { ResultNote, StageBlock, StageFooter, StageHeader } from '../../components/stage'
import ResolutionDialog from '../../components/ResolutionDialog'
import { Reveal } from '../../components/motion'
import { EmptyStateArt } from '../../components/illustrations'
import { downloadTextFile, nowStamp, useSimulatedAction } from '../../lib/actions'
import { EASE } from '../../lib/motion'

const sev = {
  high: { label: 'High', cls: 'bg-bad-bg text-bad ring-1 ring-inset ring-bad-line', icon: '#A93A31' },
  medium: { label: 'Medium', cls: 'bg-warn-bg text-warn ring-1 ring-inset ring-warn-line', icon: '#8A5A12' },
  low: { label: 'Low', cls: 'bg-info-bg text-info ring-1 ring-inset ring-info-line', icon: '#2F55B0' },
}

const severityRank = { high: 0, medium: 1, low: 2 }

type Filter = 'open' | 'high' | 'medium' | 'low' | 'resolved' | 'all'

export default function Gaps() {
  const goStep = useStore((s) => s.goStep)
  const completeStep = useStore((s) => s.completeStep)
  const showToast = useStore((s) => s.showToast)
  const resolveGap = useStore((s) => s.resolveGap)
  const gapResolutions = useStore((s) => s.gapResolutions)
  const jumpTarget = useStore((s) => s.jumpTarget)
  const setJumpTarget = useStore((s) => s.setJumpTarget)
  const docRecords = useStore((s) => s.docRecords)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('open')
  const auto = useSimulatedAction({ ms: 1600 })
  const [bankerModalId, setBankerModalId] = useState<string | null>(null)
  const [mbAction, setMbAction] = useState<'request' | 'review' | 'resolve'>('request')
  const [mbComment, setMbComment] = useState('')

  const gapsList = useMemo(() => getCombinedGaps(docRecords), [docRecords])

  const unresolved = gapsList.filter((gap) => !gapResolutions[gap.id])
  const nextGap = [...unresolved].sort((a, b) => severityRank[a.severity] - severityRank[b.severity])[0]
  const high = unresolved.filter((g) => g.severity === 'high').length
  const resolvedCount = gapsList.length - unresolved.length

  const visible = useMemo(
    () =>
      gapsList.filter((g) => {
        const resolved = !!gapResolutions[g.id]
        if (filter === 'all') return true
        if (filter === 'resolved') return resolved
        if (filter === 'open') return !resolved
        return !resolved && g.severity === filter
      }),
    [filter, gapResolutions, gapsList]
  )

  useEffect(() => {
    if (jumpTarget?.kind !== 'gap') return
    setFilter('all')
    const id = jumpTarget.id
    setJumpTarget(null)
    window.setTimeout(
      () => document.getElementById(`gap-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      60
    )
  }, [jumpTarget, setJumpTarget])

  const getGapResolutions = (gapId: string): ResolutionOption[] => {
    if (gapId.startsWith('missing-doc-')) {
      return [
        {
          id: 'mb-override',
          label: 'Flag for Merchant Banker review & waiver',
          detail: 'Request your merchant banker to manually review and waive the requirement for this document.',
          outcome: `Flagged for Merchant Banker review; queued for manual waiver.`,
        },
        {
          id: 'upload-now',
          label: 'Acknowledge missing document',
          detail: 'Proceed with the current draft while marking the document requirement as acknowledged.',
          outcome: `Acknowledged missing document. Promoters will supply it prior to final filing.`,
        }
      ]
    }
    return GAP_RESOLUTIONS[gapId] ?? []
  }

  /** The co-pilot can only close what does not need a human decision:
   *  the medium and low items. High-severity items stay with you. */
  function autoResolve() {
    const targets = unresolved.filter((g) => g.severity !== 'high')
    if (!targets.length) return
    auto.run({
      onComplete: () => {
        targets.forEach((g) => {
          const option = getGapResolutions(g.id)[0]
          resolveGap(g.id, {
            choice: option?.label ?? 'Co-pilot resolution',
            note: option?.outcome ?? 'Resolved by the co-pilot.',
            at: nowStamp(),
          })
        })
        showToast(`${targets.length} items resolved by the co-pilot`)
      },
    })
  }

  function handleResolved(option: ResolutionOption) {
    if (!activeId) return
    const gap = gapsList.find((g) => g.id === activeId)
    resolveGap(activeId, { choice: option.label, note: option.outcome, at: nowStamp() })
    showToast(`Resolved: ${gap?.title ?? 'item'}`)
  }

  function exportRegister() {
    const lines = [
      `${COMPANY.proposedName} — Gaps & consistency register`,
      `Generated ${new Date().toLocaleString('en-IN')}`,
      `${unresolved.length} open · ${resolvedCount} resolved`,
      '',
      ...gapsList.map((g) => {
        const r = gapResolutions[g.id]
        return [
          `[${sev[g.severity].label.toUpperCase()}] ${g.title}`,
          `Type: ${g.type}`,
          `Location: ${g.location}`,
          `Detail: ${g.detail}`,
          r ? `Status: Resolved at ${r.at} — ${r.choice}. ${r.note}` : 'Status: Open',
          '',
        ].join('\n')
      }),
    ]
    downloadTextFile('Satvik_Foods_Gap_Register.txt', lines.join('\n'))
    showToast('Gap register downloaded')
  }

  const activeGap = activeId ? gapsList.find((g) => g.id === activeId) ?? null : null
  const bankerGap = bankerModalId ? gapsList.find((g) => g.id === bankerModalId) ?? null : null
  const autoTargets = unresolved.filter((g) => g.severity !== 'high').length

  return (
    <div>
      <StageHeader
        step="gaps"
        eyebrow={
          <Chip tone="accent">
            <ScanSearch size={12} /> Consistency &amp; completeness scan
          </Chip>
        }
        why={
          <>
            Before anything reaches your <Term term="merchant_banker">merchant banker</Term>, here is every gap
            and inconsistency we could find — ranked by severity, each linked to the section it affects.
          </>
        }
        todo={
          unresolved.length
            ? `Work down the list. High-severity items need a decision from you; the co-pilot can close the rest in one go. ${high} of ${unresolved.length} open items block certification.`
            : 'Every flagged item is resolved. Review the record below, then move to the final draft.'
        }
      />

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
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl2 bg-white/[.18]">
            {high ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
          </span>
          <div className="min-w-[220px] flex-1">
            <h2 className="text-[18px] font-bold tracking-[-0.02em]">
              {unresolved.length} {unresolved.length === 1 ? 'item' : 'items'} to review · {high} block certification
            </h2>
            <p className="mt-1 max-w-[52ch] text-[13.5px] leading-[1.55] text-white/90">
              {high
                ? 'Clear the high-severity items and this draft is ready to hand to your lead manager.'
                : 'Nothing is blocking certification. Your banker still reviews every disclosure before filing.'}
            </p>
          </div>
          {autoTargets > 0 && (
            <button
              onClick={autoResolve}
              disabled={auto.isRunning}
              aria-busy={auto.isRunning}
              className="btn shrink-0 border border-white/25 bg-white/15 text-white hover:bg-white/25"
            >
              {auto.isRunning ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Resolving…
                </>
              ) : (
                <>
                  <Sparkles size={15} /> Auto-resolve {autoTargets} with co-pilot
                </>
              )}
            </button>
          )}
        </div>
      </Reveal>

      {auto.state === 'done' && (
        <ResultNote className="mt-4">
          The co-pilot closed every item that did not need your judgement. High-severity items are still yours to
          decide.
        </ResultNote>
      )}

      {/* Next best action */}
      {nextGap ? (
        <StageBlock title="Start here">
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
              <button onClick={() => setActiveId(nextGap.id)} className="btn btn-gold btn-sm">
                Resolve this
              </button>
              <button
                onClick={() => {
                  setFilter('all')
                  window.setTimeout(
                    () =>
                      document
                        .getElementById(`gap-${nextGap.id}`)
                        ?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
                    60
                  )
                }}
                className="btn btn-ghost btn-sm"
              >
                Show in list
              </button>
            </div>
          </div>
        </StageBlock>
      ) : (
        <StageBlock title="Nothing left open">
          <div className="card flex flex-wrap items-center gap-5 p-6">
            <EmptyStateArt variant="all-clear" className="h-24 w-auto shrink-0" />
            <div>
              <b className="block text-[16.5px] font-bold tracking-[-0.02em]">Every flagged gap is resolved</b>
              <p className="mt-1 text-[13.5px] text-muted">
                The draft is ready to move into the intermediary review stage.
              </p>
            </div>
          </div>
        </StageBlock>
      )}

      {/* The register */}
      <StageBlock
        title="Everything we flagged"
        hint="Each entry names the section it affects and, once resolved, the decision that closed it."
        aside={
          <button onClick={exportRegister} className="btn btn-ghost btn-sm">
            <Download size={14} /> Download register
          </button>
        }
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {(
            [
              ['open', `Open ${unresolved.length}`],
              ['high', `High ${unresolved.filter((g) => g.severity === 'high').length}`],
              ['medium', `Medium ${unresolved.filter((g) => g.severity === 'medium').length}`],
              ['low', `Low ${unresolved.filter((g) => g.severity === 'low').length}`],
              ['resolved', `Resolved ${resolvedCount}`],
              ['all', `All ${GAPS.length}`],
            ] as const
          ).map(([id, label]) => {
            const on = filter === id
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                aria-pressed={on}
                className={`rounded-full border px-3 py-1.5 text-[12.5px] font-bold transition-colors duration-200 ${
                  on
                    ? 'border-ink bg-ink text-white'
                    : 'border-line bg-white text-ink-3 hover:border-accent-200 hover:text-accent-700'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        {visible.length === 0 ? (
          <div className="card p-6 text-center">
            <b className="block text-[14.5px] font-bold">Nothing in this filter</b>
            <p className="mt-1 text-[13px] text-muted">
              {filter === 'resolved'
                ? 'You have not resolved anything yet.'
                : 'No open items at this severity — try another filter.'}
            </p>
            <button onClick={() => setFilter('all')} className="btn btn-ghost btn-sm mt-4">
              Show every item
            </button>
          </div>
        ) : (
          <ol className="space-y-3">
            <AnimatePresence initial={false}>
              {visible.map((g, i) => {
                const s = sev[g.severity]
                const resolution = gapResolutions[g.id]
                return (
                  <motion.li
                    key={g.id}
                    id={`gap-${g.id}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ delay: Math.min(i * 0.04, 0.2), duration: 0.35, ease: EASE }}
                    className={`flex scroll-mt-28 gap-4 rounded-2xl2 border px-5 py-4 transition-colors duration-200 ${
                      resolution ? 'border-ok-line bg-ok-bg/45' : 'border-line bg-white'
                    }`}
                  >
                    <span
                      className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl2"
                      style={{
                        background: resolution ? '#E7F5EF' : `${s.icon}16`,
                        color: resolution ? '#0F7052' : s.icon,
                      }}
                    >
                      {resolution ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <span className={`chip ${s.cls}`}>{s.label} severity</span>
                        <Chip tone="gray">{g.type}</Chip>
                        {resolution && <Chip tone="green">Resolved</Chip>}
                      </div>
                      <b
                        className={`block text-[14.5px] font-bold ${
                          resolution ? 'text-ink-2 line-through decoration-ok/40' : ''
                        }`}
                      >
                        {g.title}
                      </b>
                      <p className="mt-1 max-w-[70ch] text-[13px] leading-[1.62] text-ink-3">{g.detail}</p>
                      <p className="mt-2 flex items-center gap-1.5 text-[12px] text-muted">
                        <MapPin size={12} /> {g.location}
                      </p>

                      {resolution && (
                        <div className="mt-3 rounded-xl2 border border-ok-line bg-white px-3.5 py-2.5">
                          <div className="text-[10.5px] font-extrabold uppercase tracking-[0.11em] text-ok">
                            Decision recorded at {resolution.at}
                          </div>
                          <p className="mt-1 text-[12.5px] leading-[1.55] text-ink-2">
                            <b>{resolution.choice}.</b> {resolution.note}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 self-center flex items-center gap-2">
                      {resolution ? (
                        <button
                          onClick={() => {
                            useStore.setState((st) => {
                              const next = { ...st.gapResolutions }
                              delete next[g.id]
                              return { gapResolutions: next }
                            })
                            showToast(`Reopened: ${g.title}`)
                          }}
                          className="btn btn-quiet btn-sm"
                        >
                          <RotateCcw size={13} /> Reopen
                        </button>
                      ) : (
                        <>
                          <button onClick={() => setBankerModalId(g.id)} className="btn btn-quiet btn-sm text-accent-700">
                            Ask Merchant Banker
                          </button>
                          <button onClick={() => setActiveId(g.id)} className="btn btn-ghost btn-sm">
                            Resolve
                          </button>
                        </>
                      )}
                    </div>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ol>
        )}
      </StageBlock>

      <StageFooter
        step="gaps"
        continueLabel="Verify & Review Final Draft"
        note={
          high
            ? `${high} high-severity item${high === 1 ? '' : 's'} still open — you can open the document room, but certification stays locked.`
            : 'Nothing blocking. Every flag is disclosed to your banker.'
        }
        extra={
          <span className="flex items-center gap-2 text-[12.5px] text-muted">
            <ShieldCheck size={15} className="shrink-0 text-ok" /> Nothing is hidden from your banker
          </span>
        }
        onContinue={() => {
          completeStep('gaps')
          goStep('final')
        }}
      />

      <ResolutionDialog
        open={!!activeGap}
        heading="Resolve this issue"
        question="Choose how to handle it. Your decision is recorded in the audit trail and shown to your merchant banker."
        subject={activeGap?.title ?? ''}
        detail={activeGap?.detail}
        location={activeGap?.location}
        options={activeGap ? getGapResolutions(activeGap.id) : []}
        confirmLabel="Apply and resolve"
        onClose={() => setActiveId(null)}
        onResolve={handleResolved}
      />

      {/* Merchant Banker Human-in-the-loop Modal */}
      <AnimatePresence>
        {bankerGap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0E1828]/50 p-4 backdrop-blur-xs"
            onClick={() => setBankerModalId(null)}
          >
            <motion.div
              initial={{ y: 20, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.96 }}
              className="w-full max-w-[540px] rounded-3xl2 border border-line bg-white p-6 shadow-xl2"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-[18px] font-bold text-ink flex items-center gap-2">
                <Sparkles size={18} className="text-accent-600" />
                Ask Merchant Banker
              </h3>
              <p className="mt-1 text-[12.5px] text-muted">
                Escalate this unresolved gap to your Merchant Banker for manual review and guidance.
              </p>

              <div className="mt-4 space-y-4">
                <div className="rounded-xl2 border border-line bg-panel/30 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted">GAP / CONCERN</div>
                  <b className="mt-0.5 block text-[13.5px] text-ink">{bankerGap.title}</b>
                  
                  <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-muted">REASON / DETAIL</div>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-3">{bankerGap.detail}</p>
                </div>

                <div>
                  <label className="block text-[12.5px] font-bold text-ink">Merchant Banker Action</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[
                      { id: 'request', label: 'Request from Company' },
                      { id: 'review', label: 'Review' },
                      { id: 'resolve', label: 'Resolve' },
                    ].map((act) => {
                      const active = mbAction === act.id
                      return (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => setMbAction(act.id as any)}
                          className={`rounded-xl2 border px-3 py-2 text-center text-[12.5px] font-bold transition-all ${
                            active
                              ? 'border-accent-500 bg-accent-50 text-accent-700 shadow-sm2'
                              : 'border-line bg-white text-ink-3 hover:bg-panel'
                          }`}
                        >
                          {act.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label htmlFor="mb-comment" className="block text-[12.5px] font-bold text-ink">Comment / Instruction</label>
                  <textarea
                    id="mb-comment"
                    value={mbComment}
                    onChange={(e) => setMbComment(e.target.value)}
                    placeholder="Enter instructions for the company or audit justification..."
                    rows={3}
                    className="mt-1.5 w-full rounded-xl2 border border-line p-3 text-[13px] outline-none focus:border-accent-300 placeholder:text-muted"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBankerModalId(null)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const actionLabel = mbAction === 'request' ? 'Requested from Company' : mbAction === 'review' ? 'Under Review' : 'Resolved & Waived'
                    resolveGap(bankerGap.id, {
                      choice: `Merchant Banker: ${actionLabel}`,
                      note: mbComment || 'Escalated for Banker review.',
                      at: nowStamp(),
                    })
                    showToast(`Escalated to Merchant Banker: ${actionLabel}`)
                    setBankerModalId(null)
                    setMbComment('')
                  }}
                  className="btn btn-gold btn-sm"
                >
                  Submit Review Action
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
