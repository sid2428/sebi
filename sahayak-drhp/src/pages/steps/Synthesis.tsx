import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  GitMerge, AlertTriangle, Check, FileText, Layers, Grid3x3, Scale, X, Sparkles,
  RefreshCw, Copy, Download, Pencil, Save, Loader2,
} from 'lucide-react'
import { useStore, type SectionDraft } from '../../store'
import { Chip, Ring } from '../../components/ui'
import { SECTIONS, DOCS, COMPANY, getLogicalSectionCompleteness } from '../../data/mock'
import { SECTION_DRAFTS, SYNTHESIS_STEPS } from '../../data/drafts'
import DisclosureScorecard from '../../components/DisclosureScorecard'
import Term from '../../components/Term'
import { ActionButton, ResultNote, StageBlock, StageFooter, StageHeader } from '../../components/stage'
import { Counter, Reveal } from '../../components/motion'
import { copyText, downloadTextFile, nowStamp, useProgressNarration, useSimulatedAction } from '../../lib/actions'
import { EASE } from '../../lib/motion'

const docName = (id: string) => DOCS.find((d) => d.id === id)?.short ?? id

type Filter = 'all' | 'todraft' | 'flagged' | 'ready'

export default function Synthesis() {
  const goStep = useStore((s) => s.goStep)
  const completeStep = useStore((s) => s.completeStep)
  const showToast = useStore((s) => s.showToast)
  const jumpTarget = useStore((s) => s.jumpTarget)
  const setJumpTarget = useStore((s) => s.setJumpTarget)
  const sectionDrafts = useStore((s) => s.sectionDrafts)
  const setSectionDraft = useStore((s) => s.setSectionDraft)
  const docRecords = useStore((s) => s.docRecords)

  const [tab, setTab] = useState<'sections' | 'matrix'>('sections')
  const [filter, setFilter] = useState<Filter>('all')
  const [sourceFilter, setSourceFilter] = useState<string | null>(null)
  const [scorecardOpen, setScorecardOpen] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [hoverCell, setHoverCell] = useState<{ doc: string; sec: string } | null>(null)

  const drafted = SECTIONS.filter((s) => sectionDrafts[s.no])
  const bulk = useSimulatedAction({ ms: 1800 })
  const bulkNarration = useProgressNarration(SYNTHESIS_STEPS, bulk.isRunning, 460)

  const completenessOf = (no: string, fallback: number) => {
    if (sectionDrafts[no]) return sectionDrafts[no].complete
    return getLogicalSectionCompleteness(no, docRecords)
  }

  const avg = Math.round(
    SECTIONS.reduce((a, s) => a + completenessOf(s.no, s.complete), 0) / SECTIONS.length
  )
  const flagged = SECTIONS.filter((s) => s.flags.length).length

  const visible = useMemo(
    () =>
      SECTIONS.filter((s) => {
        if (sourceFilter && !s.sources.includes(sourceFilter)) return false
        if (filter === 'todraft') return !sectionDrafts[s.no]
        if (filter === 'flagged') return s.flags.length > 0
        if (filter === 'ready') return completenessOf(s.no, s.complete) === 100
        return true
      }),
    [filter, sourceFilter, sectionDrafts]
  )

  useEffect(() => {
    if (jumpTarget?.kind !== 'section') return
    setTab('sections')
    setFilter('all')
    setSourceFilter(null)
    setOpenSection(jumpTarget.id)
    setJumpTarget(null)
  }, [jumpTarget, setJumpTarget])

  /** Drafting a section: body from the library, completeness rises,
   *  but an open flag still holds it below 100. */
  function draftFor(no: string, version: number): SectionDraft {
    const source = SECTIONS.find((s) => s.no === no)!
    const variants = SECTION_DRAFTS[no] ?? ['']
    return {
      body: variants[version % variants.length],
      version,
      savedAt: nowStamp(),
      edited: false,
      complete: source.flags.length ? Math.max(source.complete, 94) : 100,
    }
  }

  function generateAllRemaining() {
    const remaining = SECTIONS.filter((s) => !sectionDrafts[s.no])
    if (!remaining.length) return
    bulk.run({
      onComplete: () => {
        remaining.forEach((s) => setSectionDraft(s.no, draftFor(s.no, 0)))
        showToast(`${remaining.length} sections drafted`)
      },
    })
  }

  const remainingCount = SECTIONS.length - drafted.length
  const active = openSection ? SECTIONS.find((s) => s.no === openSection) ?? null : null

  return (
    <div>
      <StageHeader
        step="synthesis"
        eyebrow={
          <Chip tone="accent">
            <GitMerge size={12} /> Document synthesis
          </Chip>
        }
        why={
          <>
            An offer document is a synthesis of many sources — one document feeds several sections, one section
            pulls from several documents. The <Term term="DRHP">DRHP</Term> is assembled here, and every section
            keeps the list of files it was built from.
          </>
        }
        todo={
          remainingCount > 0
            ? `Draft the ${remainingCount} section${remainingCount === 1 ? '' : 's'} that has not been written yet — all at once, or one at a time by opening it.`
            : 'Every section has a draft. Open any of them to read, edit, regenerate or download it.'
        }
      />

      {/* Summary */}
      <Reveal shape="settle" className="mt-6">
        <div
          className="flex flex-wrap items-center gap-6 rounded-3xl2 px-6 py-5 text-[#DCE6F6] shadow-lg2 sm:px-7"
          style={{ background: 'linear-gradient(148deg,#1C2C47,#16233A 55%,#1F3563)' }}
        >
          <Ring value={avg} size={72} stroke={7} color="#7DB7F8" track="rgba(255,255,255,.16)" labelColor="#FFFFFF" />
          <div className="min-w-[220px] flex-1">
            <h2 className="text-[17.5px] font-bold text-white">Draft is {avg}% complete</h2>
            <p className="mt-1 max-w-[50ch] text-[13px] leading-[1.6] text-[#A7BCDD]">
              {SECTIONS.length} sections synthesised from {DOCS.length} source documents. {flagged} sections carry
              a flag for review.
            </p>
          </div>
          <div className="flex shrink-0 gap-7">
            <div>
              <b className="mono block text-[21px] font-extrabold leading-none text-white">
                <Counter to={drafted.length} />
              </b>
              <span className="text-[11px] text-[#8299BC]">Drafted</span>
            </div>
            <div>
              <b className="mono block text-[21px] font-extrabold leading-none text-white">
                <Counter to={DOCS.length} />
              </b>
              <span className="text-[11px] text-[#8299BC]">Sources</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ===== The main action ===== */}
      {remainingCount > 0 && (
        <StageBlock title="Draft the remaining sections">
          <div className="card p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-[240px] flex-1">
                <b className="block text-[14.5px] font-bold">
                  {remainingCount} of {SECTIONS.length} sections still need a first draft
                </b>
                <p className="mt-1 max-w-[58ch] text-[13px] leading-[1.6] text-muted">
                  Each one is written from the source documents linked to it. You can edit or regenerate any of
                  them afterwards.
                </p>
              </div>
              <ActionButton
                state={bulk.state}
                idle={`Draft all ${remainingCount} sections`}
                running="Drafting…"
                done="Sections drafted"
                icon={<Sparkles size={16} />}
                className="btn btn-gold shrink-0"
                onClick={generateAllRemaining}
              />
            </div>

            <AnimatePresence>
              {bulk.isRunning && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.24, ease: EASE }}
                  className="mt-4 rounded-2xl2 border border-line bg-panel/70 p-4"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-2.5 text-[13.5px] font-semibold text-ink-2">
                    <Loader2 size={15} className="animate-spin text-accent-600" />
                    {bulkNarration}
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg,#7DB7F8,#5B8DEF)' }}
                      initial={{ width: '4%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1.8, ease: 'linear' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </StageBlock>
      )}

      {/* ===== Views ===== */}
      <StageBlock
        title="Your sections"
        hint={
          tab === 'sections'
            ? 'Open a section to read its draft, edit it, or see the documents behind it.'
            : 'Every tick shows one source document feeding one section. Select a document to filter the section list.'
        }
        aside={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative inline-flex rounded-xl2 bg-panel p-1" role="tablist" aria-label="Synthesis views">
              {([
                ['sections', 'Sections', Layers],
                ['matrix', 'Provenance map', Grid3x3],
              ] as const).map(([id, label, Icon]) => {
                const on = tab === id
                return (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    role="tab"
                    aria-selected={on}
                    className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition-colors duration-200 ${
                      on ? 'text-white' : 'text-ink-3 hover:text-ink'
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId="synthesis-tab"
                        className="absolute inset-0 rounded-lg bg-ink"
                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                      />
                    )}
                    <Icon size={13} className="relative" />
                    <span className="relative">{label}</span>
                  </button>
                )
              })}
            </div>
            <button onClick={() => setScorecardOpen(true)} className="btn btn-ghost btn-sm">
              <Scale size={14} /> ICDR scorecard
            </button>
          </div>
        }
      >
        {tab === 'sections' && (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {(
                [
                  ['all', `All ${SECTIONS.length}`],
                  ['todraft', `To draft ${remainingCount}`],
                  ['flagged', `Flagged ${flagged}`],
                  ['ready', `Complete ${SECTIONS.filter((s) => completenessOf(s.no, s.complete) === 100).length}`],
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

              {sourceFilter && (
                <button onClick={() => setSourceFilter(null)} className="btn btn-quiet btn-sm">
                  <X size={13} /> Fed by {docName(sourceFilter)}
                </button>
              )}
            </div>

            {visible.length === 0 ? (
              <div className="card p-6 text-center">
                <b className="block text-[14.5px] font-bold">No sections match this filter</b>
                <p className="mt-1 text-[13px] text-muted">
                  {filter === 'todraft'
                    ? 'Every section already has a draft.'
                    : 'Try a different filter to see the rest of the document.'}
                </p>
                <button
                  onClick={() => {
                    setFilter('all')
                    setSourceFilter(null)
                  }}
                  className="btn btn-ghost btn-sm mt-4"
                >
                  Show all sections
                </button>
              </div>
            ) : (
              <ol className="space-y-2.5">
                {visible.map((s, i) => {
                  const draft = sectionDrafts[s.no]
                  const complete = completenessOf(s.no, s.complete)
                  return (
                    <motion.li
                      key={s.no}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.025, 0.3), duration: 0.34, ease: EASE }}
                    >
                      <button
                        id={`section-${s.no}`}
                        onClick={() => setOpenSection(s.no)}
                        className="lift-on-hover flex w-full scroll-mt-28 items-center gap-4 rounded-2xl2 border border-line bg-white px-5 py-4 text-left"
                      >
                        {/* The Roman numeral is the section's real name. */}
                        <span className="numeral w-9 shrink-0 text-[13px]">{s.no}</span>

                        <span className="min-w-0 flex-1">
                          <b className="mb-1.5 block text-[15px] font-bold">{s.title}</b>
                          <span className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset ${
                                draft
                                  ? 'bg-ok-bg text-ok ring-ok-line'
                                  : 'bg-panel text-muted ring-line'
                              }`}
                            >
                              {draft ? <Check size={10} /> : null}
                              {draft ? (draft.edited ? 'Edited by you' : 'Drafted') : 'Not drafted yet'}
                            </span>
                            {s.sources.map((d) => (
                              <span
                                key={d}
                                className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5 text-[11px] font-bold text-accent-700 ring-1 ring-inset ring-accent-100"
                              >
                                <FileText size={10} /> {docName(d)}
                              </span>
                            ))}
                            {s.flags.map((f) => (
                              <span
                                key={f.text}
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset ${
                                  f.type === 'inconsistency'
                                    ? 'bg-bad-bg text-bad ring-bad-line'
                                    : 'bg-warn-bg text-warn ring-warn-line'
                                }`}
                              >
                                <AlertTriangle size={10} /> {f.text}
                              </span>
                            ))}
                          </span>
                        </span>

                        <Ring
                          value={complete}
                          size={44}
                          stroke={5}
                          color={complete === 100 ? '#0F7052' : complete >= 85 ? '#3A63C4' : '#8A5A12'}
                        />
                      </button>
                    </motion.li>
                  )
                })}
              </ol>
            )}
          </>
        )}

        {tab === 'matrix' && (
          <Reveal shape="fade">
            <div className="card overflow-hidden">
              <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Provenance matrix, scrollable">
                <table className="w-full min-w-[820px] border-collapse text-[12.5px]">
                  <caption className="sr-only">Which source document feeds which DRHP section</caption>
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="sticky left-0 z-10 border-b border-line bg-panel px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted"
                      >
                        Source ↓ / Section →
                      </th>
                      {SECTIONS.map((s) => (
                        <th
                          key={s.no}
                          scope="col"
                          title={s.title}
                          className={`numeral whitespace-nowrap border-b border-line px-2 py-3 text-[11.5px] transition-colors duration-150 ${
                            hoverCell?.sec === s.no ? 'bg-accent-50' : 'bg-panel'
                          }`}
                        >
                          {s.no}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DOCS.map((d) => (
                      <tr key={d.id} className={hoverCell?.doc === d.id ? 'bg-accent-50/40' : ''}>
                        <th
                          scope="row"
                          className="sticky left-0 z-10 whitespace-nowrap border-b border-r border-line bg-white px-2 py-1.5 text-left font-bold text-ink"
                        >
                          <button
                            onClick={() => {
                              setSourceFilter(d.id)
                              setFilter('all')
                              setTab('sections')
                            }}
                            className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-accent-50 hover:text-accent-700"
                            title={`Show the sections ${d.name} feeds`}
                          >
                            <span className="mono grid h-5 w-5 place-items-center rounded bg-ink text-[9px] font-extrabold text-white">
                              {d.id}
                            </span>
                            {d.short}
                          </button>
                        </th>
                        {SECTIONS.map((s) => {
                          const feeds = s.sources.includes(d.id)
                          const lit = hoverCell?.doc === d.id || hoverCell?.sec === s.no
                          return (
                            <td
                              key={s.no}
                              onMouseEnter={() => setHoverCell({ doc: d.id, sec: s.no })}
                              onMouseLeave={() => setHoverCell(null)}
                              className={`border-b border-line px-2 py-2.5 text-center transition-colors duration-150 ${
                                lit ? 'bg-accent-50' : ''
                              }`}
                            >
                              {feeds ? (
                                <button
                                  onClick={() => setOpenSection(s.no)}
                                  className="mx-auto inline-grid h-[19px] w-[19px] place-items-center rounded-[5px] bg-accent-600 transition-transform duration-150 hover:scale-110"
                                  title={`${d.name} feeds ${s.title} — open the section`}
                                >
                                  <Check size={11} className="text-white" strokeWidth={3} />
                                  <span className="sr-only">{`${d.short} feeds section ${s.no}. Open it.`}</span>
                                </button>
                              ) : (
                                <span className="text-line-strong" aria-hidden="true">
                                  ·
                                </span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        )}
      </StageBlock>

      <StageFooter
        step="synthesis"
        continueLabel="Review gaps"
        note={
          remainingCount
            ? `${remainingCount} section${remainingCount === 1 ? '' : 's'} still undrafted — you can come back to them.`
            : 'Sections are drafted. Next, review everything we flagged.'
        }
        onContinue={() => {
          completeStep('synthesis')
          goStep('gaps')
        }}
      />

      <SectionPanel
        section={active}
        onClose={() => setOpenSection(null)}
        makeDraft={draftFor}
      />

      <DisclosureScorecard open={scorecardOpen} onClose={() => setScorecardOpen(false)} />
    </div>
  )
}

/* ============================================================
   Section detail — read, generate, regenerate, edit, export
   ============================================================ */

function SectionPanel({
  section,
  onClose,
  makeDraft,
}: {
  section: (typeof SECTIONS)[number] | null
  onClose: () => void
  makeDraft: (no: string, version: number) => SectionDraft
}) {
  const sectionDrafts = useStore((s) => s.sectionDrafts)
  const setSectionDraft = useStore((s) => s.setSectionDraft)
  const showToast = useStore((s) => s.showToast)

  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState('')
  const [copied, setCopied] = useState(false)
  const generate = useSimulatedAction({ ms: 1400 })
  const regenerate = useSimulatedAction({ ms: 1100, holdMs: 1600 })
  const save = useSimulatedAction({ ms: 650, holdMs: 2000 })
  const narration = useProgressNarration(SYNTHESIS_STEPS, generate.isRunning || regenerate.isRunning, 380)

  const draft = section ? sectionDrafts[section.no] : undefined

  // Every opening starts clean; Escape closes.
  useEffect(() => {
    if (!section) return
    setEditing(false)
    setCopied(false)
    generate.reset()
    regenerate.reset()
    save.reset()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section?.no])

  const docRecords = useStore((s) => s.docRecords)

  if (!section) return null

  const variants = SECTION_DRAFTS[section.no] ?? []
  const complete = draft?.complete ?? getLogicalSectionCompleteness(section.no, docRecords)
  const plainText = [
    `${COMPANY.proposedName} — Draft Red Herring Prospectus`,
    `Section ${section.no} · ${section.title}`,
    `Sources: ${section.sources.map(docName).join(', ')}`,
    draft?.savedAt ? `Drafted at ${draft.savedAt}` : '',
    '',
    draft?.body ?? '',
    '',
    section.flags.length ? `Open flags:\n${section.flags.map((f) => `- ${f.text}`).join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return (
    <AnimatePresence>
      <motion.div
        key={section.no}
        className="fixed inset-0 z-[150] grid place-items-center overflow-y-auto p-4"
        style={{ background: 'rgba(14,24,40,.5)', backdropFilter: 'blur(6px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.97, y: 14, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.98, y: 8, opacity: 0 }}
          transition={{ duration: 0.26, ease: EASE }}
          className="my-auto flex max-h-[88vh] w-full max-w-[760px] flex-col overflow-hidden rounded-3xl2 bg-white shadow-xl2"
          role="dialog"
          aria-modal="true"
          aria-label={`Section ${section.no}, ${section.title}`}
        >
          <header className="flex items-start gap-4 border-b border-line px-6 py-5">
            <span className="numeral shrink-0 pt-1 text-[15px]">{section.no}</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-[19px] font-extrabold tracking-[-0.025em]">{section.title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {section.sources.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5 text-[11px] font-bold text-accent-700 ring-1 ring-inset ring-accent-100"
                  >
                    <FileText size={10} /> {docName(d)}
                  </span>
                ))}
              </div>
            </div>
            <Ring
              value={complete}
              size={44}
              stroke={5}
              color={complete === 100 ? '#0F7052' : complete >= 85 ? '#3A63C4' : '#8A5A12'}
            />
            <button
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-panel hover:text-ink"
              aria-label="Close section"
            >
              <X size={18} />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {section.flags.length > 0 && (
              <div className="mb-4 space-y-2">
                {section.flags.map((f) => (
                  <ResultNote key={f.text} tone="warn">
                    {f.type === 'inconsistency' ? 'Inconsistency · ' : 'Gap · '}
                    {f.text}. It is disclosed to your banker and holds this section below 100%.
                  </ResultNote>
                ))}
              </div>
            )}

            {/* Not drafted yet */}
            {!draft && !generate.isRunning && (
              <div className="rounded-2xl2 border border-dashed border-line-strong bg-panel/50 p-6 text-center">
                <b className="block text-[15px] font-bold">This section has not been drafted yet</b>
                <p className="mx-auto mt-1.5 max-w-[46ch] text-[13px] leading-[1.6] text-muted">
                  We will write it from {section.sources.map(docName).join(', ')} and check it against the ICDR
                  disclosure list for this section.
                </p>
                <ActionButton
                  state={generate.state}
                  idle="Generate this section"
                  running="Generating…"
                  done="Generated"
                  icon={<Sparkles size={16} />}
                  className="btn btn-gold mt-5"
                  onClick={() =>
                    generate.run({
                      onComplete: () => {
                        setSectionDraft(section.no, makeDraft(section.no, 0))
                        showToast(`Section ${section.no} drafted`)
                      },
                    })
                  }
                />
              </div>
            )}

            {/* Working */}
            {(generate.isRunning || regenerate.isRunning) && (
              <div className="rounded-2xl2 border border-line bg-panel/70 p-5" aria-live="polite">
                <div className="flex items-center gap-2.5 text-[13.5px] font-semibold text-ink-2">
                  <Loader2 size={15} className="animate-spin text-accent-600" />
                  {narration}
                </div>
                <div className="mt-4 space-y-2" aria-hidden="true">
                  {[100, 94, 97, 72].map((w, i) => (
                    <div
                      key={i}
                      className="h-3 animate-pulse rounded bg-white"
                      style={{ width: `${w}%`, animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Drafted */}
            {draft && !generate.isRunning && !regenerate.isRunning && (
              <>
                <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px] text-muted">
                  <Chip tone={draft.edited ? 'blue' : 'green'}>
                    {draft.edited ? 'Edited by you' : `Draft v${draft.version + 1}`}
                  </Chip>
                  <span>Saved at {draft.savedAt}</span>
                </div>

                {editing ? (
                  <>
                    <label htmlFor="section-body" className="sr-only">
                      Section text
                    </label>
                    <textarea
                      id="section-body"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={12}
                      className="w-full rounded-2xl2 border border-line-strong bg-white p-4 font-serif text-[14px] leading-[1.75] text-[#2A3547] outline-none transition-colors focus:border-accent-400"
                    />
                    {!body.trim() && (
                      <p role="alert" className="mt-2 text-[12px] font-semibold text-bad">
                        The section cannot be left empty.
                      </p>
                    )}
                  </>
                ) : (
                  <article className="rounded-2xl2 border border-line bg-white p-5 font-serif text-[14.5px] leading-[1.78] text-[#2A3547]">
                    {draft.body}
                  </article>
                )}

                {save.state === 'done' && !editing && (
                  <ResultNote className="mt-3">Your edit is saved into the draft.</ResultNote>
                )}
                {regenerate.state === 'done' && (
                  <ResultNote className="mt-3">
                    Regenerated — this is an alternative wording of the same disclosure.
                  </ResultNote>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          {draft && (
            <footer className="flex flex-wrap items-center gap-2 border-t border-line bg-panel/50 px-6 py-4">
              {editing ? (
                <>
                  <ActionButton
                    state={save.state}
                    idle="Save changes"
                    running="Saving…"
                    done="Saved"
                    icon={<Save size={14} />}
                    className="btn btn-gold btn-sm"
                    disabled={!body.trim()}
                    onClick={() =>
                      save.run({
                        onComplete: () => {
                          setSectionDraft(section.no, {
                            ...draft,
                            body: body.trim(),
                            edited: true,
                            savedAt: nowStamp(),
                          })
                          setEditing(false)
                          showToast(`Section ${section.no} updated`)
                        },
                      })
                    }
                  />
                  <button onClick={() => setEditing(false)} className="btn btn-ghost btn-sm">
                    <X size={14} /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setBody(draft.body)
                      setEditing(true)
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() =>
                      regenerate.run({
                        onComplete: () => {
                          const next = (draft.version + 1) % Math.max(variants.length, 1)
                          setSectionDraft(section.no, {
                            ...makeDraft(section.no, next),
                            savedAt: nowStamp(),
                          })
                          showToast(`Section ${section.no} regenerated`)
                        },
                      })
                    }
                    disabled={variants.length < 2 || regenerate.isRunning}
                    title={variants.length < 2 ? 'Only one version is available for this section' : undefined}
                    className="btn btn-ghost btn-sm"
                  >
                    <RefreshCw size={14} /> Regenerate
                  </button>
                  <button
                    onClick={async () => {
                      const ok = await copyText(draft.body)
                      setCopied(ok)
                      showToast(ok ? 'Section copied to clipboard' : 'Copy blocked by the browser')
                      window.setTimeout(() => setCopied(false), 2200)
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => {
                      downloadTextFile(`Satvik_Foods_Section_${section.no}.txt`, plainText)
                      showToast(`Downloaded Section ${section.no}`)
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    <Download size={14} /> Download
                  </button>
                  <button onClick={onClose} className="btn btn-navy btn-sm ml-auto">
                    Done
                  </button>
                </>
              )}
            </footer>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
