import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check, AlertTriangle, Building2, BadgeCheck, GitMerge, ScanSearch, FileCheck2,
  Download, ChevronRight, Circle, Menu, Sparkles, X, Search, CornerDownLeft,
} from 'lucide-react'
import { STEP_TITLES, useStore, type IssuerMode, type JumpTarget, type StepId } from '../store'
import { Brand, Chip } from '../components/ui'
import Copilot from '../components/Copilot'
import { COMPANY, ISSUE, GAPS, PHASES, SECTIONS, TIME_TO_DRAFT } from '../data/mock'
import { Counter } from '../components/motion'
import { downloadTextFile } from '../lib/actions'
import { DUR, EASE } from '../lib/motion'
import CompanyBase from './steps/CompanyBase'
import KYC from './steps/KYC'
import Eligibility from './steps/Eligibility'
import Synthesis from './steps/Synthesis'
import Gaps from './steps/Gaps'
import FinalDRHP from './steps/FinalDRHP'

type StepStatus = 'done' | 'attention' | 'current' | 'todo'
type StepMeta = { id: StepId; title: string; sub: string; status: StepStatus; icon: any }
type SearchResult = {
  id: string
  label: string
  detail: string
  step: StepId
  target: JumpTarget
}

const STEP_ICONS: Record<StepId, any> = {
  base: Building2,
  kyc: BadgeCheck,
  eligibility: ScanSearch,
  synthesis: GitMerge,
  gaps: AlertTriangle,
  final: FileCheck2,
}

const STEP_STAGE: Record<StepId, string> = {
  base: 'Company base captured',
  kyc: 'Verification in progress',
  eligibility: 'Eligibility checked',
  synthesis: 'Draft being synthesised',
  gaps: 'Gap resolution underway',
  final: 'Draft ready for handoff',
}

/**
 * The journey rail reads live state, so a step that says "2 need input"
 * says something else the moment those two are resolved.
 */
function useJourneySteps(current: StepId): StepMeta[] {
  const completedSteps = useStore((s) => s.completedSteps)
  const baseConfirmed = useStore((s) => s.baseConfirmed)
  const resolvedKyc = useStore((s) => s.resolvedKyc)
  const eligibilityRun = useStore((s) => s.eligibilityRun)
  const sectionDrafts = useStore((s) => s.sectionDrafts)
  const gapResolutions = useStore((s) => s.gapResolutions)
  const bankerReviewStarted = useStore((s) => s.bankerReviewStarted)

  return useMemo(() => {
    const openKyc = PHASES.flatMap((p) => p.items).filter(
      (i) => i.status === 'attention' && !resolvedKyc[i.label]
    ).length
    const undrafted = SECTIONS.filter((s) => !sectionDrafts[s.no]).length
    const openGaps = GAPS.filter((g) => !gapResolutions[g.id]).length

    const rows: { id: StepId; sub: string; needsWork: boolean }[] = [
      {
        id: 'base',
        sub: baseConfirmed ? 'Confirmed by you' : 'Needs your confirmation',
        needsWork: !baseConfirmed,
      },
      {
        id: 'kyc',
        sub: openKyc ? `6 phases · ${openKyc} need input` : '6 phases · all clear',
        needsWork: openKyc > 0,
      },
      {
        id: 'eligibility',
        sub: eligibilityRun ? 'Scored against NSE Emerge' : 'Not run yet',
        needsWork: !eligibilityRun,
      },
      {
        id: 'synthesis',
        sub: undrafted ? `${undrafted} of ${SECTIONS.length} sections to draft` : `${SECTIONS.length} sections drafted`,
        needsWork: undrafted > 0,
      },
      {
        id: 'gaps',
        sub: openGaps ? `${openGaps} item${openGaps === 1 ? '' : 's'} to review` : 'All items resolved',
        needsWork: openGaps > 0,
      },
      {
        id: 'final',
        sub: bankerReviewStarted ? 'With your banker' : 'Review & certify',
        needsWork: false,
      },
    ]

    return rows.map(({ id, sub, needsWork }) => ({
      id,
      title: STEP_TITLES[id],
      sub,
      icon: STEP_ICONS[id],
      status: needsWork
        ? 'attention'
        : completedSteps.includes(id)
          ? 'done'
          : id === current
            ? 'current'
            : 'todo',
    }))
  }, [
    completedSteps, baseConfirmed, resolvedKyc, eligibilityRun, sectionDrafts, gapResolutions,
    bankerReviewStarted, current,
  ])
}

export default function Workspace() {
  const { step, goStep, showToast, issuerMode, setIssuerMode, setJumpTarget, goScreen } = useStore()
  const sectionDrafts = useStore((s) => s.sectionDrafts)
  const gapResolutions = useStore((s) => s.gapResolutions)
  const bankerReviewStarted = useStore((s) => s.bankerReviewStarted)
  const steps = useJourneySteps(step)
  const mainRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const [navOpen, setNavOpen] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [cursor, setCursor] = useState(0)

  const searchIndex = useMemo<SearchResult[]>(() => ([
    ...SECTIONS.map((section) => ({
      id: `section-${section.no}`,
      label: `${section.no} · ${section.title}`,
      detail: 'Jump to DRHP synthesis section',
      step: 'synthesis' as StepId,
      target: { kind: 'section', id: section.no } as JumpTarget,
    })),
    ...GAPS.map((gap) => ({
      id: `gap-${gap.id}`,
      label: gap.title,
      detail: gap.detail,
      step: 'gaps' as StepId,
      target: { kind: 'gap', id: gap.id } as JumpTarget,
    })),
    ...PHASES.flatMap((phase) => phase.items.map((item, index) => ({
      id: `phase-${phase.id}-${index}`,
      label: item.label,
      detail: `${phase.title} · ${item.note ?? phase.sub}`,
      step: 'kyc' as StepId,
      target: { kind: 'phase', id: phase.id } as JumpTarget,
    }))),
  ]), [])

  const results = useMemo(() => {
    const clean = query.trim().toLowerCase()
    if (!clean) return []
    return searchIndex.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(clean)).slice(0, 7)
  }, [query, searchIndex])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      mainRef.current?.scrollTo({ top: 0, behavior: 'auto' })
      return
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [step])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  // Keep the highlighted result in range as the query narrows.
  useEffect(() => setCursor(0), [query])

  function onStepSelect(next: StepId) {
    goStep(next)
    setNavOpen(false)
  }

  function pickResult(result: SearchResult) {
    setQuery(result.label)
    setSearchOpen(false)
    goStep(result.step)
    setJumpTarget(result.target)
  }

  /** Arrow keys walk the list, Enter opens, Escape dismisses. */
  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!searchOpen || !results.length) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCursor((c) => (c + 1) % results.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCursor((c) => (c - 1 + results.length) % results.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      pickResult(results[cursor])
    } else if (event.key === 'Escape') {
      setSearchOpen(false)
    }
  }

  const daysSaved = TIME_TO_DRAFT.stageDaysSaved[step]
  const stepIndex = steps.findIndex((s) => s.id === step)

  /** Export = a real file. The journey state, not a screenshot of it. */
  function exportStatus() {
    const openGaps = GAPS.filter((g) => !gapResolutions[g.id])
    const lines = [
      `${COMPANY.proposedName} — DRHP progress summary`,
      `Generated ${new Date().toLocaleString('en-IN')}`,
      `Platform: ${ISSUE.platform} · Fresh issue ₹${ISSUE.sizeCr} Cr · Lead manager ${ISSUE.leadManager}`,
      '',
      '--- JOURNEY ---',
      ...steps.map((s, i) => `${i + 1}. ${s.title} — ${s.sub}${s.status === 'done' ? ' [completed]' : ''}`),
      '',
      '--- SECTIONS ---',
      ...SECTIONS.map((s) => {
        const draft = sectionDrafts[s.no]
        return `${s.no} · ${s.title} — ${draft?.complete ?? s.complete}% ${draft ? (draft.edited ? '(edited)' : '(drafted)') : '(not drafted)'}`
      }),
      '',
      '--- OPEN FINDINGS ---',
      openGaps.length
        ? openGaps.map((g) => `[${g.severity.toUpperCase()}] ${g.title} — ${g.location}`).join('\n')
        : 'None open.',
      '',
      `Certification: ${bankerReviewStarted ? 'sent to merchant banker' : 'not yet sent'}.`,
      'Nothing is filed with SEBI or an exchange until a merchant banker certifies the draft.',
    ]
    downloadTextFile('Satvik_Foods_DRHP_progress.txt', lines.join('\n'))
    showToast('Progress summary downloaded')
  }

  return (
    <div className="lg:grid lg:h-screen lg:grid-cols-[268px_minmax(0,1fr)_380px] lg:overflow-hidden">
      <aside className="hidden lg:flex lg:min-h-0">
        <WorkspaceNav steps={steps} step={step} onStepSelect={onStepSelect} />
      </aside>

      <div ref={mainRef} className="min-w-0 bg-canvas lg:overflow-y-auto">
        {/* ===== Top bar ===== */}
        <div className="sticky top-0 z-30 border-b border-line bg-canvas/88 backdrop-blur-xl print:hidden">
          {/* Journey progress — a thread, not a percentage. */}
          <div className="h-[2px] w-full bg-line/70" aria-hidden="true">
            <motion.div
              className="h-full origin-left"
              style={{ background: 'linear-gradient(90deg,#7DB7F8,#5B8DEF)' }}
              animate={{ scaleX: (stepIndex + 1) / steps.length }}
              transition={{ duration: 0.6, ease: EASE }}
            />
          </div>

          <div className="px-4 py-3.5 sm:px-6 lg:px-8">
            {/* The centre pane's width is set by the two fixed rails, not by
                the viewport, so this stacks on its own rather than at a
                viewport breakpoint that knows nothing about it. */}
            <div className="flex flex-col gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setNavOpen(true)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl2 border border-line bg-white text-ink lg:hidden"
                  aria-label="Open journey navigation"
                >
                  <Menu size={18} />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted">
                    <span>Journey</span>
                    <ChevronRight size={13} />
                    <b className="truncate text-ink">{STEP_TITLES[step]}</b>
                    <span className="mono ml-1 hidden shrink-0 rounded-md bg-panel px-1.5 py-0.5 text-[11px] text-muted sm:inline">
                      {stepIndex + 1}/{steps.length}
                    </span>
                  </div>
                  <div className="text-[12px] text-muted lg:hidden">{COMPANY.proposedName}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div ref={searchRef} className="relative min-w-[190px] flex-1 sm:max-w-[300px]">
                  <div className="flex items-center gap-2.5 rounded-xl2 border border-line bg-white px-3 py-2 shadow-xs2 transition-colors duration-200 focus-within:border-accent-300">
                    <Search size={15} className="shrink-0 text-muted" />
                    <input
                      value={query}
                      onChange={(e) => { setQuery(e.target.value); setSearchOpen(true) }}
                      onFocus={() => setSearchOpen(true)}
                      onKeyDown={onSearchKeyDown}
                      role="combobox"
                      aria-expanded={searchOpen && !!query.trim()}
                      aria-controls="workspace-search-results"
                      aria-autocomplete="list"
                      aria-label="Search across sections, gaps, and verification checks"
                      placeholder="Search sections, gaps, or checks"
                      className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted"
                    />
                  </div>

                  <AnimatePresence>
                    {searchOpen && query.trim() && (
                      <motion.div
                        id="workspace-search-results"
                        role="listbox"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.16, ease: EASE }}
                        className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl2 border border-line bg-white shadow-lg2"
                      >
                        {results.length ? (
                          results.map((result, i) => (
                            <button
                              key={result.id}
                              role="option"
                              aria-selected={i === cursor}
                              onMouseEnter={() => setCursor(i)}
                              onClick={() => pickResult(result)}
                              className={`flex w-full items-center gap-3 border-b border-line px-4 py-2.5 text-left last:border-0 ${
                                i === cursor ? 'bg-accent-50' : 'bg-white'
                              }`}
                            >
                              <span className="min-w-0 flex-1">
                                <b className="block truncate text-[13px] text-ink">{result.label}</b>
                                <span className="block truncate text-[11.5px] text-muted">{result.detail}</span>
                              </span>
                              {i === cursor && <CornerDownLeft size={13} className="shrink-0 text-accent-500" />}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-[12.5px] text-muted">
                            No matches in sections, gaps, or KYC checks.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Issuer mode — a real segmented control with a sliding thumb. */}
                <div
                  className="relative inline-flex shrink-0 rounded-xl2 bg-panel p-1"
                  role="tablist"
                  aria-label="Issuer experience mode"
                >
                  <IssuerModeButton mode="expert" current={issuerMode} onSelect={setIssuerMode} />
                  <IssuerModeButton mode="firstTime" current={issuerMode} onSelect={setIssuerMode} />
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-2">
                  <button onClick={() => goScreen('dashboard')} className="btn btn-ghost btn-sm">
                    Dashboard
                  </button>
                  <button onClick={exportStatus} className="btn btn-ghost btn-sm hidden sm:inline-flex">
                    <Download size={14} /> Export progress
                  </button>
                  <button onClick={() => setCopilotOpen(true)} className="btn btn-ghost btn-sm lg:hidden">
                    <Sparkles size={14} /> Co-pilot
                  </button>
                  <button onClick={() => goStep('final')} className="btn btn-navy btn-sm">
                    Go to draft <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Context strip =====
            One quiet line, not a dashboard. The stage itself is the page. */}
        <div className="px-4 pt-5 sm:px-6 lg:px-8 print:hidden">
          <div className="mx-auto flex max-w-[940px] flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl2 border border-line bg-white/70 px-4 py-3">
            <span className="flex items-baseline gap-1.5">
              <b className="text-[18px] font-extrabold leading-none tracking-[-0.03em]">
                <Counter to={daysSaved} suffix="+" />
              </b>
              <span className="text-[12px] text-muted">days saved so far</span>
            </span>
            <span className="hidden h-4 w-px bg-line sm:block" />
            <span className="text-[12px] text-muted">
              Traditional prep <b className="font-bold text-ink-2">{TIME_TO_DRAFT.traditionalRange}</b> · with
              Sahayak <b className="font-bold text-ink-2">{TIME_TO_DRAFT.copilotRange}</b>
            </span>
            <span className="hidden h-4 w-px bg-line sm:block" />
            <span className="text-[12px] text-muted">{STEP_STAGE[step]}</span>
            <Chip tone={issuerMode === 'firstTime' ? 'blue' : 'gray'} className="ml-auto">
              {issuerMode === 'firstTime' ? 'Plain-language explanations on' : 'Expert view'}
            </Chip>
          </div>
        </div>

        {/* ===== Step body ===== */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.base, ease: EASE }}
          className="mx-auto min-w-0 max-w-[940px] px-4 pb-20 pt-7 sm:px-6 lg:px-8"
        >
          {step === 'base' && <CompanyBase />}
          {step === 'kyc' && <KYC />}
          {step === 'eligibility' && <Eligibility />}
          {step === 'synthesis' && <Synthesis />}
          {step === 'gaps' && <Gaps />}
          {step === 'final' && <FinalDRHP />}
        </motion.div>
      </div>

      <div className="hidden lg:flex lg:min-h-0">
        <Copilot className="w-full" />
      </div>

      {/* ===== Mobile nav ===== */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#0E1828]/50 backdrop-blur-sm lg:hidden"
            onClick={() => setNavOpen(false)}
          >
            <motion.div
              initial={{ x: -28, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -28, opacity: 0 }}
              transition={{ duration: 0.24, ease: EASE }}
              className="h-full max-w-[320px]"
              onClick={(e) => e.stopPropagation()}
            >
              <WorkspaceNav
                steps={steps}
                step={step}
                onStepSelect={onStepSelect}
                mobile
                onClose={() => setNavOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Mobile co-pilot ===== */}
      <AnimatePresence>
        {copilotOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#0E1828]/50 backdrop-blur-sm lg:hidden"
            onClick={() => setCopilotOpen(false)}
          >
            <motion.div
              initial={{ y: 32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 32, opacity: 0 }}
              transition={{ duration: 0.26, ease: EASE }}
              className="absolute inset-x-0 bottom-0 top-16 overflow-hidden rounded-t-3xl2 bg-white shadow-xl2"
              onClick={(e) => e.stopPropagation()}
            >
              <Copilot mobile onClose={() => setCopilotOpen(false)} className="rounded-t-3xl2" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ============================================================
   Journey navigation
   ============================================================ */

function WorkspaceNav({
  steps,
  step,
  onStepSelect,
  mobile = false,
  onClose,
}: {
  steps: StepMeta[]
  step: StepId
  onStepSelect: (step: StepId) => void
  mobile?: boolean
  onClose?: () => void
}) {
  const completed = steps.filter((s) => s.status === 'done').length
  return (
    <nav
      className="flex min-h-0 flex-1 flex-col overflow-y-auto text-[#C7D5E9]"
      style={{ background: 'linear-gradient(180deg,#1C2C47 0%,#16233A 46%,#101B2E 100%)' }}
      aria-label="DRHP journey"
    >
      <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4">
        <Brand light />
        {mobile && onClose && (
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-[#C7D5E9] hover:bg-white/5"
            aria-label="Close journey navigation"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Issuer card */}
      <div className="border-b border-white/[.07] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[13px] font-extrabold text-white"
            style={{ background: 'linear-gradient(140deg,#5B8DEF,#2E4E9C)' }}
          >
            {COMPANY.logoLetters}
          </span>
          <span className="min-w-0 truncate text-[14.5px] font-bold text-white">{COMPANY.proposedName}</span>
        </div>
        <div className="mono mt-2.5 text-[11.5px] leading-[1.6] text-[#8299BC]">
          {COMPANY.sector}
          <br />
          CIN · {COMPANY.cin}
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-accent-400/[.16] px-2.5 py-1.5 text-[11.5px] font-bold text-accent-300">
          <BadgeCheck size={13} /> {ISSUE.platform.split(' ')[0]} Emerge · ₹{ISSUE.sizeCr} Cr
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 px-3 py-4">
        <div className="flex items-baseline justify-between px-3 pb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#8299BC]">
            Your journey
          </span>
          <span className="mono text-[10.5px] font-bold text-[#8299BC]">
            {completed}/{steps.length} done
          </span>
        </div>
        <ol className="relative space-y-0.5">
          {steps.map((s, i) => {
            const active = step === s.id
            const StepGlyph = s.icon
            return (
              <li key={s.id} className="relative">
                {/* The thread joining one step to the next. */}
                {i < steps.length - 1 && (
                  <span className="absolute left-[26px] top-[38px] h-[calc(100%-24px)] w-px bg-white/[.09]" aria-hidden="true" />
                )}
                <button
                  onClick={() => onStepSelect(s.id)}
                  aria-current={active ? 'step' : undefined}
                  className={`relative flex w-full items-center gap-3 rounded-xl2 px-3 py-2.5 text-left transition-colors duration-200 ${
                    active ? 'bg-white/[.1]' : 'hover:bg-white/[.05]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-y-1 left-0 w-[3px] rounded-r-full bg-accent-400"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                  <StepIcon status={s.status} active={active} />
                  <span className="min-w-0 flex-1">
                    <b className={`block truncate text-[13.5px] font-bold ${active ? 'text-white' : 'text-[#DCE6F6]'}`}>
                      {s.title}
                    </b>
                    <span className="block truncate text-[11px] text-[#8299BC]">{s.sub}</span>
                    {/* Status in words, so the colour of the marker is never
                        the only thing carrying it. */}
                    <span className="sr-only">
                      {s.status === 'done'
                        ? 'Completed'
                        : s.status === 'attention'
                          ? 'Needs your input'
                          : active
                            ? 'Current stage'
                            : 'Not started'}
                    </span>
                  </span>
                  <StepGlyph size={15} className={active ? 'text-accent-300' : 'text-[#8299BC]'} />
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="border-t border-white/[.07] px-5 py-4 text-[11px] leading-[1.6] text-[#7891B5]">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Lead manager · {ISSUE.leadManager}
        </div>
        Draft auto-saved · human-in-loop mode on
      </div>
    </nav>
  )
}

function StepIcon({ status, active }: { status: StepStatus; active: boolean }) {
  if (status === 'done') {
    return (
      <span className="relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ok text-white ring-4 ring-[#16233A]">
        <Check size={13} strokeWidth={3} />
      </span>
    )
  }
  if (status === 'attention') {
    return (
      <span className="relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-warn text-white ring-4 ring-[#16233A]">
        <AlertTriangle size={13} />
      </span>
    )
  }
  return (
    <span
      className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full ring-4 ring-[#16233A] ${
        active ? 'bg-accent-400 text-white' : 'bg-white/[.09] text-[#7891B5]'
      }`}
    >
      <Circle size={8} fill="currentColor" />
    </span>
  )
}

function IssuerModeButton({
  mode,
  current,
  onSelect,
}: {
  mode: IssuerMode
  current: IssuerMode
  onSelect: (mode: IssuerMode) => void
}) {
  const active = mode === current
  return (
    <button
      onClick={() => onSelect(mode)}
      role="tab"
      aria-selected={active}
      className={`relative rounded-lg px-3 py-1.5 text-[12.5px] font-bold transition-colors duration-200 ${
        active ? 'text-white' : 'text-ink-3 hover:text-ink'
      }`}
    >
      {active && (
        <motion.span
          layoutId="issuer-mode"
          className="absolute inset-0 rounded-lg bg-ink"
          transition={{ type: 'spring', stiffness: 400, damping: 34 }}
        />
      )}
      <span className="relative whitespace-nowrap">{mode === 'expert' ? 'Expert' : 'First-time issuer'}</span>
    </button>
  )
}
