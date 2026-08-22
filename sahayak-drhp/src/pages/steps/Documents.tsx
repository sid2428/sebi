import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Building2, Landmark, Stamp, Users, Scale, FileSignature, Check, AlertTriangle, UploadCloud,
  Loader2, FileText, X, RefreshCw, Download, ChevronRight, ChevronLeft, Sparkles, Lock, ShieldCheck,
} from 'lucide-react'
import { useStore, type DocRecord } from '../../store'
import { DOC_TRACKS, VERIFY_STEPS, type DocTrack, type RequiredDoc } from '../../data/documents'
import { Chip, Ring } from '../../components/ui'
import Term from '../../components/Term'
import { ResultNote, StageBlock, StageFooter, StageHeader } from '../../components/stage'
import { Counter, Reveal, Stagger, StaggerItem } from '../../components/motion'
import { formatBytes, nowStamp, useProgressNarration } from '../../lib/actions'
import { DUR, EASE, useReducedMotion } from '../../lib/motion'

const TRACK_ICONS: Record<string, any> = {
  corporate: Building2,
  financial: Landmark,
  statutory: Stamp,
  people: Users,
  legal: Scale,
  contracts: FileSignature,
}

/** Plausible byte sizes, so the file chips don't all read the same. */
function mockSize(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return 180_000 + (h % 3_400_000)
}

export default function Documents() {
  const goStep = useStore((s) => s.goStep)
  const completeStep = useStore((s) => s.completeStep)
  const showToast = useStore((s) => s.showToast)
  const docRecords = useStore((s) => s.docRecords)
  const setDocRecord = useStore((s) => s.setDocRecord)
  const clearTrack = useStore((s) => s.clearTrack)
  const clearedTracks = useStore((s) => s.clearedTracks)
  const trackIndex = useStore((s) => s.docTrackIndex)
  const setTrackIndex = useStore((s) => s.setDocTrackIndex)
  // Documents currently being read. Held here rather than in the store —
  // it is transient UI state, not part of the issuer's record.
  const [reading, setReading] = useState<Record<string, boolean>>({})
  const timers = useRef<number[]>([])
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const track = DOC_TRACKS[trackIndex]
  const isLastTrack = trackIndex === DOC_TRACKS.length - 1

  const supplied = (doc: RequiredDoc) => !!docRecords[doc.id]

  /** Progress for one track, counting only what is actually compulsory. */
  function trackProgress(t: DocTrack) {
    const mandatory = t.docs.filter((d) => d.necessity === 'mandatory')
    const done = mandatory.filter((d) => docRecords[d.id]).length
    const flagged = t.docs.filter((d) => docRecords[d.id]?.status === 'flagged').length
    return { done, total: mandatory.length, complete: done === mandatory.length, flagged }
  }

  const overall = useMemo(() => {
    const all = DOC_TRACKS.flatMap((t) => t.docs)
    const mandatory = all.filter((d) => d.necessity === 'mandatory')
    const done = mandatory.filter((d) => docRecords[d.id]).length
    const flagged = all.filter((d) => docRecords[d.id]?.status === 'flagged').length
    return {
      done,
      total: mandatory.length,
      flagged,
      pct: Math.round((done / mandatory.length) * 100),
      collected: all.filter((d) => docRecords[d.id]).length,
      allDocs: all.length,
    }
  }, [docRecords])

  const current = trackProgress(track)

  /** Read a document, then file it. The wait is where the work is shown. */
  function ingestDoc(doc: RequiredDoc, source: DocRecord['source'], fileName: string, size: number, delay = 0) {
    timers.current.push(
      window.setTimeout(() => {
        setReading((r) => ({ ...r, [doc.id]: true }))
        timers.current.push(
          window.setTimeout(() => {
            setReading((r) => {
              const next = { ...r }
              delete next[doc.id]
              return next
            })
            setDocRecord(doc.id, {
              fileName,
              size,
              at: nowStamp(),
              source,
              status: doc.flag ? 'flagged' : 'verified',
            })
          }, 1500 + (delay ? 0 : 300))
        )
      }, delay)
    )
  }

  /** The data-room shortcut: everything still outstanding in this track. */
  function attachRemaining() {
    const remaining = track.docs.filter((d) => !docRecords[d.id] && !reading[d.id])
    if (!remaining.length) return
    remaining.forEach((doc, i) => {
      ingestDoc(doc, doc.autoSource ? 'registry' : 'upload', doc.sample, mockSize(doc.id), i * 260)
    })
    showToast(`Reading ${remaining.length} document${remaining.length === 1 ? '' : 's'} from your data room`)
  }

  function goToTrack(next: number) {
    setTrackIndex(next)
    // The rail stays put; only the panel changes, so bring its top into view.
    window.setTimeout(
      () => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      40
    )
  }

  function continueFromTrack() {
    clearTrack(track.id)
    if (isLastTrack) {
      completeStep('documents')
      goStep('kyc')
      return
    }
    showToast(`${track.title} filed · moving to ${DOC_TRACKS[trackIndex + 1].title}`)
    goToTrack(trackIndex + 1)
  }

  const outstanding = track.docs.filter((d) => d.necessity === 'mandatory' && !docRecords[d.id]).length

  return (
    <div>
      <StageHeader
        step="documents"
        eyebrow={
          <Chip tone="accent">
            <FileText size={12} /> 6 chapter groups · {overall.total} required documents
          </Chip>
        }
        why={
          <>
            We have your company base from the website. Now we collect the evidence behind it, in the order a{' '}
            <Term term="DRHP">DRHP</Term> is actually assembled — one chapter group at a time, so you always know
            which part of the document you are feeding.
          </>
        }
        todo={
          outstanding
            ? `You are on ${track.title}. Supply the ${outstanding} outstanding document${outstanding === 1 ? '' : 's'} below — upload them, or let us pull the ones held on a public registry.`
            : `${track.title} is complete. Review what we read, then continue to the next chapter group.`
        }
      />

      {/* ===== Overall progress ===== */}
      <Reveal shape="settle" className="mt-6">
        <div
          className="flex flex-wrap items-center gap-6 rounded-3xl2 px-6 py-5 text-[#DCE6F6] shadow-lg2 sm:px-7"
          style={{ background: 'linear-gradient(148deg,#1C2C47,#16233A 55%,#1F3563)' }}
        >
          <Ring
            value={overall.pct}
            size={72}
            stroke={7}
            color="#7DB7F8"
            track="rgba(255,255,255,.16)"
            labelColor="#FFFFFF"
          />
          <div className="min-w-[220px] flex-1">
            <h2 className="text-[17.5px] font-bold text-white">
              {overall.done} of {overall.total} required documents on file
            </h2>
            <p className="mt-1 max-w-[52ch] text-[13px] leading-[1.6] text-[#A7BCDD]">
              Each one is read, checked against your company base, and filed against the DRHP chapters it feeds.
              Nothing leaves your browser.
            </p>
          </div>
          <div className="flex shrink-0 gap-7">
            <div>
              <b className="mono block text-[21px] font-extrabold leading-none text-white">
                <Counter to={overall.collected} />
              </b>
              <span className="text-[11px] text-[#8299BC]">Collected</span>
            </div>
            <div>
              <b
                className={`mono block text-[21px] font-extrabold leading-none ${
                  overall.flagged ? 'text-[#F0C46B]' : 'text-white'
                }`}
              >
                <Counter to={overall.flagged} />
              </b>
              <span className="text-[11px] text-[#8299BC]">Flagged</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ===== Chapter-group rail ===== */}
      {/* Six groups in a narrow centre column: a grid keeps all of them on
          screen, where a scroller would hide the last two. Given the room,
          they straighten out into a single row — the journey reads as one
          line rather than two. */}
      <nav aria-label="Document collection progress" className="mt-6">
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 2xl:grid-cols-6">
          {DOC_TRACKS.map((t, i) => {
            const p = trackProgress(t)
            const active = i === trackIndex
            const Icon = TRACK_ICONS[t.id]
            const state = p.complete ? 'done' : active ? 'current' : p.done > 0 ? 'started' : 'todo'
            return (
              <li key={t.id}>
                <button
                  onClick={() => goToTrack(i)}
                  aria-current={active ? 'step' : undefined}
                  className={`relative flex h-full w-full items-start gap-2.5 rounded-2xl2 border px-3.5 py-3 text-left transition-colors duration-200 ${
                    active
                      ? 'border-accent-300 bg-accent-50'
                      : 'border-line bg-white hover:border-accent-200 hover:bg-accent-50/50'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="doc-track-active"
                      className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-accent-500"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span
                    className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
                      state === 'done'
                        ? 'bg-ok text-white'
                        : active
                          ? 'bg-accent-600 text-white'
                          : 'bg-panel text-muted'
                    }`}
                  >
                    {state === 'done' ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="mono block text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
                      Group {i + 1}
                    </span>
                    <b className={`block text-[12.5px] font-bold leading-tight ${active ? 'text-accent-800' : 'text-ink'}`}>
                      {t.title}
                    </b>
                    <span className="mono mt-1 block text-[11px] text-muted">
                      {p.done}/{p.total} filed
                      {p.flagged > 0 && <span className="text-warn"> · {p.flagged} flagged</span>}
                    </span>
                  </span>
                  {/* Colour is never the only carrier of state. */}
                  <span className="sr-only">
                    {state === 'done'
                      ? 'Complete'
                      : active
                        ? 'Current group'
                        : state === 'started'
                          ? 'In progress'
                          : 'Not started'}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      {/* ===== The current chapter group ===== */}
      <div ref={panelRef} className="scroll-mt-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: DUR.base, ease: EASE }}
          >
            <StageBlock
              title={track.title}
              hint={track.why}
              aside={
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="gray">{track.drhpSection}</Chip>
                  {!current.complete && (
                    <button onClick={attachRemaining} className="btn btn-navy btn-sm">
                      <Sparkles size={13} /> Attach from data room
                    </button>
                  )}
                </div>
              }
            >
              <div className="space-y-3">
                {track.docs.map((doc, i) => (
                  <DocCard
                    key={doc.id}
                    doc={doc}
                    index={i}
                    record={docRecords[doc.id]}
                    reading={!!reading[doc.id]}
                    onIngest={(source, fileName, size) => ingestDoc(doc, source, fileName, size)}
                  />
                ))}
              </div>

              {current.complete && (
                <ResultNote className="mt-4" tone={current.flagged ? 'warn' : 'ok'}>
                  {current.flagged
                    ? `Every required document for ${track.title} is on file. ${current.flagged} carries a finding that your merchant banker will raise — each one is already queued for the Gaps stage.`
                    : `Every required document for ${track.title} is on file and reconciles with your company base.`}
                </ResultNote>
              )}
            </StageBlock>

            {/* Group navigation — separate from the journey footer below, which
                moves between stages rather than between groups. */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl2 border border-line bg-white px-5 py-4">
              <button
                onClick={() => goToTrack(trackIndex - 1)}
                disabled={trackIndex === 0}
                className="btn btn-ghost btn-sm disabled:opacity-40"
              >
                <ChevronLeft size={15} /> Previous group
              </button>

              <span className="mono text-[12px] text-muted">
                Group {trackIndex + 1} of {DOC_TRACKS.length}
              </span>

              <div className="flex flex-wrap items-center gap-3">
                {!current.complete && (
                  <span className="text-[12.5px] text-muted">
                    {outstanding} still outstanding
                  </span>
                )}
                <button
                  onClick={continueFromTrack}
                  disabled={!current.complete}
                  className={`btn btn-gold btn-sm ${current.complete ? '' : 'opacity-50'}`}
                  title={current.complete ? undefined : 'Supply the outstanding documents first'}
                >
                  {isLastTrack ? 'Finish and run verification' : `Continue to ${DOC_TRACKS[trackIndex + 1].title}`}
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <StageFooter
        step="documents"
        canContinue={overall.done === overall.total}
        blockedReason="Some required documents are still outstanding. Work through the chapter groups above — the rail shows which ones are short."
        continueLabel="Run verification"
        note={
          overall.done === overall.total
            ? 'Every required document is filed. Verification now runs against them.'
            : `${overall.total - overall.done} required document${overall.total - overall.done === 1 ? '' : 's'} still outstanding.`
        }
        extra={
          <span className="flex items-center gap-2 text-[12.5px] text-muted">
            <Lock size={14} className="shrink-0 text-ok" /> Files stay in your browser
          </span>
        }
        onContinue={() => {
          DOC_TRACKS.forEach((t) => clearTrack(t.id))
          completeStep('documents')
          goStep('kyc')
        }}
      />
    </div>
  )
}

/* ============================================================
   One required document

   Three states in one card: outstanding, being read, filed. The card
   never changes height abruptly — the read state occupies roughly the
   room the extracted fields will need.
   ============================================================ */

function DocCard({
  doc,
  index,
  record,
  reading,
  onIngest,
}: {
  doc: RequiredDoc
  index: number
  record?: DocRecord
  reading: boolean
  onIngest: (source: DocRecord['source'], fileName: string, size: number) => void
}) {
  const clearDocRecord = useStore((s) => s.clearDocRecord)
  const showToast = useStore((s) => s.showToast)
  const reduced = useReducedMotion()
  const fileInput = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const narration = useProgressNarration(VERIFY_STEPS, reading, 340)

  const flagged = record?.status === 'flagged'

  function takeFiles(list: FileList | null) {
    const file = list?.[0]
    if (!file) return
    onIngest('upload', file.name, file.size)
  }

  const tone = record
    ? flagged
      ? 'border-warn-line bg-warn-bg/25'
      : 'border-ok-line bg-ok-bg/25'
    : reading
      ? 'border-accent-200 bg-accent-50/50'
      : 'border-line bg-white'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.28), duration: 0.34, ease: EASE }}
      layout={!reduced}
      className={`rounded-2xl2 border p-5 transition-colors duration-300 ${tone}`}
    >
      <div className="flex flex-wrap items-start gap-4">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl2 ${
            record
              ? flagged
                ? 'bg-warn-bg text-warn'
                : 'bg-ok-bg text-ok'
              : reading
                ? 'bg-accent-100 text-accent-700'
                : 'bg-panel text-muted'
          }`}
        >
          {record ? (
            flagged ? (
              <AlertTriangle size={18} />
            ) : (
              <Check size={18} strokeWidth={3} />
            )
          ) : reading ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <FileText size={17} />
          )}
        </span>

        <div className="min-w-[240px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <b className="text-[14.5px] font-bold">{doc.name}</b>
            {doc.necessity === 'conditional' ? (
              <Chip tone="gray">If applicable</Chip>
            ) : (
              <Chip tone={record ? (flagged ? 'amber' : 'green') : 'blue'}>
                {record ? (flagged ? 'Filed · flagged' : 'Verified') : 'Required'}
              </Chip>
            )}
          </div>

          <p className="mt-1 max-w-[68ch] text-[13px] leading-[1.6] text-ink-3">{doc.detail}</p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-panel px-2 py-0.5 text-[11px] font-bold text-ink-2 ring-1 ring-inset ring-line">
              <ShieldCheck size={10} /> {doc.basis}
            </span>
            {doc.chapters.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5 text-[11px] font-bold text-accent-700 ring-1 ring-inset ring-accent-100"
              >
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Actions live top-right on wide cards, wrap underneath on narrow ones. */}
        {!record && !reading && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {doc.autoSource && (
              <button
                onClick={() => onIngest('registry', doc.sample, mockSize(doc.id))}
                className="btn btn-ghost btn-sm"
              >
                <Download size={13} /> Fetch from {doc.autoSource}
              </button>
            )}
            <button onClick={() => fileInput.current?.click()} className="btn btn-gold btn-sm">
              <UploadCloud size={14} /> Upload
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileInput}
        type="file"
        className="sr-only"
        tabIndex={-1}
        aria-label={`Upload ${doc.name}`}
        onChange={(e) => {
          takeFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {/* ---------- Outstanding: the drop target ---------- */}
      {!record && !reading && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            takeFiles(e.dataTransfer.files)
          }}
          className={`mt-4 rounded-xl2 border-[1.5px] border-dashed px-4 py-3 text-center transition-colors duration-200 ${
            dragging ? 'border-accent-400 bg-accent-50' : 'border-line-strong bg-panel/40'
          }`}
        >
          <span className="text-[12.5px] text-muted">
            {dragging ? 'Drop it here' : `Drag a file here · ${doc.accept}`}
          </span>
        </div>
      )}

      {/* ---------- Being read ---------- */}
      <AnimatePresence>
        {reading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-xl2 border border-line bg-white p-4" aria-live="polite">
              <div className="flex items-center gap-2.5 text-[13px] font-semibold text-ink-2">
                <Loader2 size={14} className="animate-spin text-accent-600" />
                {narration}
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-panel-2">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#7DB7F8,#5B8DEF)' }}
                  initial={{ width: '6%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.6, ease: 'linear' }}
                />
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2" aria-hidden="true">
                {[92, 74, 86, 61].map((w, i) => (
                  <div
                    key={i}
                    className="h-3 animate-pulse rounded bg-panel"
                    style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Filed ---------- */}
      {record && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2.5 rounded-xl2 border border-line bg-white px-3.5 py-2.5">
            <FileText size={14} className="shrink-0 text-accent-600" />
            <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink-2">
              {record.fileName}
            </span>
            <span className="mono shrink-0 text-[11px] text-muted">{formatBytes(record.size)}</span>
            <Chip tone="gray">{record.source === 'registry' ? 'From registry' : 'Uploaded'}</Chip>
            <span className="mono shrink-0 text-[11px] text-muted">{record.at}</span>
            <button
              onClick={() => {
                clearDocRecord(doc.id)
                showToast(`Removed ${doc.name}`)
              }}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-panel hover:text-bad"
              aria-label={`Remove ${doc.name}`}
            >
              <X size={14} />
            </button>
          </div>

          {/* What we read off it. */}
          <div className="mt-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-muted">
                What we read from it
              </span>
              <button onClick={() => fileInput.current?.click()} className="btn btn-quiet btn-sm">
                <RefreshCw size={12} /> Replace
              </button>
            </div>
            <Stagger className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-3" each={0.05}>
              {doc.extracts.map((f) => (
                <StaggerItem
                  key={f.label}
                  shape="fade"
                  className="flex items-baseline justify-between gap-3 rounded-lg border border-line bg-white px-3 py-2 text-[12.5px]"
                >
                  <span className="shrink-0 text-muted">{f.label}</span>
                  <b className="mono min-w-0 truncate text-right font-bold text-ink">{f.value}</b>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          {flagged && doc.flag && (
            <ResultNote className="mt-3" tone="warn">
              {doc.flag.text}
            </ResultNote>
          )}
        </div>
      )}
    </motion.div>
  )
}
