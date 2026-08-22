import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check, AlertTriangle, Building2, BadgeCheck, GitMerge, ScanSearch, FileCheck2,
  Download, ChevronRight, Sparkles, X, Search, CornerDownLeft, FolderCheck,
} from 'lucide-react'
import { STEP_TITLES, useStore, type IssuerMode, type JumpTarget, type StepId } from '../store'
import { Brand, Chip } from '../components/ui'
import Copilot from '../components/Copilot'
import { COMPANY, ISSUE, GAPS, PHASES, SECTIONS, TIME_TO_DRAFT, getLogicalSectionCompleteness, getCombinedGaps } from '../data/mock'
import { DOC_TRACKS } from '../data/documents'
import { downloadTextFile } from '../lib/actions'
import { DUR, EASE } from '../lib/motion'
import CompanyBase from './steps/CompanyBase'
import Documents from './steps/Documents'
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
  documents: FolderCheck,
  kyc: BadgeCheck,
  eligibility: ScanSearch,
  synthesis: GitMerge,
  gaps: AlertTriangle,
  final: FileCheck2,
}

const STEP_STAGE: Record<StepId, string> = {
  base: 'Company base captured',
  documents: 'Evidence being collected',
  kyc: 'Cross-checking documents',
  eligibility: 'SEBI Eligibility verified',
  gaps: 'Gaps & Concerns resolution',
  synthesis: 'Drafting DRHP preview',
  final: 'Draft ready for handoff',
}

/**
 * The journey rail reads live state, so a step that says "2 need input"
 * says something else the moment those two are resolved.
 */
function useJourneySteps(current: StepId): StepMeta[] {
  const completedSteps = useStore((s) => s.completedSteps)
  const baseConfirmed = useStore((s) => s.baseConfirmed)
  const docRecords = useStore((s) => s.docRecords)
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
    const openGaps = getCombinedGaps(docRecords).filter((g) => !gapResolutions[g.id]).length

    const requiredDocs = DOC_TRACKS.flatMap((t) => t.docs).filter((d) => d.necessity === 'mandatory')
    const filedDocs = requiredDocs.filter((d) => docRecords[d.id]).length

    const rows: { id: StepId; sub: string; needsWork: boolean }[] = [
      {
        id: 'base',
        sub: baseConfirmed ? 'Confirmed by you' : 'Needs your confirmation',
        needsWork: !baseConfirmed,
      },
      {
        id: 'documents',
        sub:
          filedDocs === requiredDocs.length
            ? `All ${requiredDocs.length} documents filed`
            : `${filedDocs} of ${requiredDocs.length} documents filed`,
        needsWork: filedDocs < requiredDocs.length,
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
    completedSteps, baseConfirmed, docRecords, resolvedKyc, eligibilityRun, sectionDrafts,
    gapResolutions, bankerReviewStarted, current,
  ])
}

export default function Workspace() {
  const { step, goStep, showToast, issuerMode, setIssuerMode, setJumpTarget, goScreen } = useStore()
  const sectionDrafts = useStore((s) => s.sectionDrafts)
  const gapResolutions = useStore((s) => s.gapResolutions)
  const bankerReviewStarted = useStore((s) => s.bankerReviewStarted)
  const steps = useJourneySteps(step)
  const searchRef = useRef<HTMLDivElement>(null)
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

  const stepIndex = steps.findIndex((s) => s.id === step)

  /** Export = a real file. The journey state, not a screenshot of it. */
  function exportStatus() {
    const docRecords = useStore.getState().docRecords
    const openGaps = GAPS.filter((g) => !gapResolutions[g.id])
    const lines = [
      `${COMPANY.proposedName} — DRHP progress summary`,
      `Generated ${new Date().toLocaleString('en-IN')}`,
      'IPO terms, capital structure and intermediary appointments: awaiting issuer evidence.',
      '',
      '--- JOURNEY ---',
      ...steps.map((s, i) => `${i + 1}. ${s.title} — ${s.sub}${s.status === 'done' ? ' [completed]' : ''}`),
      '',
      '--- SECTIONS ---',
      ...SECTIONS.map((s) => {
        const draft = sectionDrafts[s.no]
        return `${s.no} · ${s.title} — ${draft?.complete ?? getLogicalSectionCompleteness(s.no, docRecords)}% ${draft ? (draft.edited ? '(edited)' : '(drafted)') : '(not drafted)'}`
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
    <div className="min-h-screen bg-canvas">
      <div data-workspace-topbar className="sticky top-0 z-30 border-b border-line bg-canvas/92 backdrop-blur-xl print:hidden">
        <div className="h-[3px] w-full bg-line/70" aria-hidden="true">
          <motion.div
            className="h-full origin-left bg-accent-500"
            animate={{ scaleX: (stepIndex + 1) / steps.length }}
            transition={{ duration: 0.6, ease: EASE }}
          />
        </div>
        <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <Brand />
            <div className="hidden h-7 w-px bg-line sm:block" />
            <div className="min-w-0">
              <b className="block truncate text-[13px] text-ink">{COMPANY.proposedName}</b>
              <span className="block text-[11px] text-muted">{COMPANY.sector} · public profile in review</span>
            </div>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <div ref={searchRef} className="relative hidden min-w-[220px] sm:block">
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
              <div className="relative inline-flex shrink-0 rounded-xl2 bg-panel p-1" role="tablist" aria-label="Issuer experience mode">
                <IssuerModeButton mode="expert" current={issuerMode} onSelect={setIssuerMode} />
                <IssuerModeButton mode="firstTime" current={issuerMode} onSelect={setIssuerMode} />
              </div>
              <button onClick={() => setCopilotOpen(true)} className="btn btn-ghost btn-sm">
                <Sparkles size={14} /> Co-pilot
              </button>
              <button onClick={exportStatus} className="btn btn-ghost btn-sm hidden xl:inline-flex">
                <Download size={14} /> Export progress
              </button>
              <button onClick={() => goScreen('dashboard')} className="btn btn-ghost btn-sm hidden md:inline-flex">Dashboard</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-6 sm:px-6 lg:px-10">
        <section className="overflow-hidden rounded-3xl2 border border-accent-100 bg-white shadow-md2 print:hidden" aria-label="IPO preparation journey">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line bg-accent-50/70 px-5 py-4 sm:px-6">
            <div>
              <div className="eyebrow">IPO readiness journey</div>
              <h1 className="mt-1 text-[20px] font-extrabold">Build the draft, one chapter at a time</h1>
              <p className="mt-1 text-[12.5px] text-muted">Each chapter keeps its evidence, decisions and review status connected.</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl2 border border-accent-100 bg-white px-3 py-2 text-[12px] text-muted">
              <b className="text-accent-700">{stepIndex + 1}/{steps.length}</b>
              <span className="h-4 w-px bg-line" />
              <span>{STEP_STAGE[step]}</span>
            </div>
          </div>
          <JourneyProcess steps={steps} step={step} onStepSelect={goStep} />
        </section>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.base, ease: EASE }}
          className="min-w-0 pt-7"
        >
          {step === 'base' && <CompanyBase />}
          {step === 'documents' && <Documents />}
          {step === 'kyc' && <KYC />}
          {step === 'eligibility' && <Eligibility />}
          {step === 'synthesis' && <Synthesis />}
          {step === 'gaps' && <Gaps />}
          {step === 'final' && <FinalDRHP />}
        </motion.div>
      </div>

      <AnimatePresence>
        {copilotOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#0E1828]/50 backdrop-blur-sm"
            onClick={() => setCopilotOpen(false)}
          >
            <motion.div
              initial={{ y: 32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 32, opacity: 0 }}
              transition={{ duration: 0.26, ease: EASE }}
              className="absolute inset-x-0 bottom-0 top-12 overflow-hidden rounded-t-3xl2 bg-white shadow-xl2 sm:inset-x-auto sm:bottom-8 sm:right-8 sm:top-8 sm:w-[420px] sm:rounded-3xl2"
              onClick={(e) => e.stopPropagation()}
            >
              <Copilot mobile onClose={() => setCopilotOpen(false)} className="h-full rounded-t-3xl2 sm:rounded-3xl2" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** A single horizontal process rail: the workflow is visible before its detail. */
function JourneyProcess({
  steps,
  step,
  onStepSelect,
}: {
  steps: StepMeta[]
  step: StepId
  onStepSelect: (step: StepId) => void
}) {
  return (
    <nav className="overflow-x-auto px-4 py-5 sm:px-6" aria-label="DRHP journey">
      <ol className="flex min-w-[860px] items-start justify-between gap-0">
        {steps.map((s, i) => {
          const active = step === s.id
          const StepGlyph = s.icon
          const done = s.status === 'done'
          const attention = s.status === 'attention'
          return (
            <li key={s.id} className="relative flex min-w-[118px] flex-1 flex-col items-center text-center">
              {i < steps.length - 1 && (
                <span className={`absolute left-[calc(50%+25px)] right-[calc(-50%+25px)] top-[24px] h-[2px] ${done ? 'bg-ok' : 'bg-line'}`} aria-hidden="true" />
              )}
              <button
                onClick={() => onStepSelect(s.id)}
                aria-current={active ? 'step' : undefined}
                className="group relative z-10 flex flex-col items-center focus:outline-none"
              >
                <span className={`grid h-12 w-12 place-items-center rounded-full border-4 transition-all duration-200 ${
                  active ? 'border-accent-100 bg-accent-600 text-white shadow-accent' :
                  done ? 'border-ok-bg bg-ok text-white' :
                  attention ? 'border-warn-bg bg-warn text-white' : 'border-panel-2 bg-white text-muted group-hover:border-accent-100 group-hover:text-accent-600'
                }`}>
                  {done ? <Check size={19} strokeWidth={3} /> : attention ? <AlertTriangle size={18} /> : <StepGlyph size={18} />}
                </span>
                <b className={`mt-2 block text-[12px] font-extrabold leading-tight ${active ? 'text-accent-700' : 'text-ink-2'}`}>{s.title}</b>
                <span className="mt-1 block max-w-[112px] text-[10.5px] leading-[1.35] text-muted">{s.sub}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
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
