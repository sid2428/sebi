import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check, AlertTriangle, Building2, BadgeCheck, GitMerge, ScanSearch, FileCheck2,
  Download, ChevronRight, Circle, Menu, Sparkles, X, Search,
} from 'lucide-react'
import { useStore, type IssuerMode, type JumpTarget, type StepId } from '../store'
import { Brand } from '../components/ui'
import Copilot from '../components/Copilot'
import { COMPANY, ISSUE, GAPS, PHASES, SECTIONS, TIME_TO_DRAFT } from '../data/mock'
import CompanyBase from './steps/CompanyBase'
import KYC from './steps/KYC'
import Eligibility from './steps/Eligibility'
import Synthesis from './steps/Synthesis'
import Gaps from './steps/Gaps'
import FinalDRHP from './steps/FinalDRHP'

type StepMeta = { id: StepId; title: string; sub: string; status: 'done' | 'attention' | 'todo'; icon: any }
type SearchResult = {
  id: string
  label: string
  detail: string
  step: StepId
  target: JumpTarget
}

const STEPS: StepMeta[] = [
  { id: 'base', title: 'Company Base', sub: 'Extracted profile', status: 'done', icon: Building2 },
  { id: 'kyc', title: 'Verification & KYC', sub: '6 phases · 2 need input', status: 'attention', icon: BadgeCheck },
  { id: 'eligibility', title: 'Eligibility Check', sub: 'NSE Emerge norms', status: 'done', icon: ScanSearch },
  { id: 'synthesis', title: 'DRHP Synthesis', sub: '14 sections mapped', status: 'attention', icon: GitMerge },
  { id: 'gaps', title: 'Gaps & Consistency', sub: '5 items to review', status: 'attention', icon: AlertTriangle },
  { id: 'final', title: 'Final Draft DRHP', sub: 'Review & certify', status: 'todo', icon: FileCheck2 },
]

const CRUMB: Record<StepId, string> = {
  base: 'Company Base',
  kyc: 'Verification & KYC',
  eligibility: 'Eligibility Check',
  synthesis: 'DRHP Synthesis',
  gaps: 'Gaps & Consistency',
  final: 'Final Draft DRHP',
}

const STEP_STAGE: Record<StepId, string> = {
  base: 'Company base captured',
  kyc: 'Verification in progress',
  eligibility: 'Eligibility checked',
  synthesis: 'Draft being synthesised',
  gaps: 'Gap resolution underway',
  final: 'Draft ready for handoff',
}

export default function Workspace() {
  const { step, goStep, showToast, issuerMode, setIssuerMode, setJumpTarget, goScreen } = useStore()
  const mainRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const [navOpen, setNavOpen] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

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

  const daysSaved = TIME_TO_DRAFT.stageDaysSaved[step]

  return (
    <div className="lg:grid lg:h-screen lg:grid-cols-[266px_minmax(0,1fr)_372px] lg:overflow-hidden">
      <aside className="hidden lg:flex lg:min-h-0">
        <WorkspaceNav step={step} onStepSelect={onStepSelect} />
      </aside>

      <div ref={mainRef} className="min-w-0 bg-[#eef2f8] lg:overflow-y-auto">
        <div className="sticky top-0 z-30 border-b border-line bg-[#eef2f8]/92 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setNavOpen(true)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-white text-ink lg:hidden"
                aria-label="Open journey navigation"
              >
                <Menu size={18} />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-muted">
                  <span>Journey</span>
                  <ChevronRight size={14} />
                  <b className="truncate text-ink">{CRUMB[step]}</b>
                </div>
                <div className="text-[12px] text-muted lg:hidden">{COMPANY.proposedName}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3 xl:min-w-[720px] xl:flex-row xl:items-center xl:justify-end">
              <div ref={searchRef} className="relative min-w-0 flex-1 xl:max-w-[340px]">
                <div className="flex items-center gap-2.5 rounded-xl border border-line bg-white px-3 py-2.5 shadow-sm2">
                  <Search size={16} className="shrink-0 text-muted" />
                  <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSearchOpen(true) }}
                    onFocus={() => setSearchOpen(true)}
                    aria-label="Search across sections, gaps, and verification checks"
                    placeholder="Search sections, gaps, or checks"
                    className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none"
                  />
                </div>
                {searchOpen && query.trim() && (
                  <div className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-[14px] border border-line bg-white shadow-lg2">
                    {results.length ? results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => pickResult(result)}
                        className="block w-full border-b border-line px-4 py-3 text-left last:border-0 hover:bg-paper"
                      >
                        <b className="block text-[13px]">{result.label}</b>
                        <span className="text-[12px] text-muted">{result.detail}</span>
                      </button>
                    )) : (
                      <div className="px-4 py-3 text-[12.5px] text-muted">No matches in sections, gaps, or KYC checks.</div>
                    )}
                  </div>
                )}
              </div>

              <div className="inline-flex rounded-xl border border-line bg-white p-1 shadow-sm2" role="tablist" aria-label="Issuer experience mode">
                <IssuerModeButton mode="expert" current={issuerMode} onSelect={setIssuerMode} />
                <IssuerModeButton mode="firstTime" current={issuerMode} onSelect={setIssuerMode} />
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => goScreen('dashboard')} className="btn btn-ghost btn-sm">
                  Back to dashboard
                </button>
                <button onClick={() => showToast('Draft exported as PDF (mock)')} className="btn btn-ghost btn-sm hidden sm:inline-flex">
                  <Download size={15} /> Export
                </button>
                <button onClick={() => setCopilotOpen(true)} className="btn btn-ghost btn-sm lg:hidden">
                  <Sparkles size={15} /> Co-pilot
                </button>
                <button onClick={() => goStep('final')} className="btn btn-navy btn-sm">
                  Go to draft <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 md:grid-cols-[1.1fr_.9fr]">
            <div className="card p-4">
              <div className="eyebrow">Time Saved</div>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <div>
                  <b className="block text-[25px] font-extrabold tracking-tight">{daysSaved}+ days</b>
                  <span className="text-[12.5px] text-muted">saved so far in the early drafting stage</span>
                </div>
                <div className="h-10 w-px bg-line hidden sm:block" />
                <div className="grid gap-1 text-[12.5px] text-muted sm:grid-cols-2 sm:gap-x-5">
                  <span>Traditional prep: <b className="text-ink-2">{TIME_TO_DRAFT.traditionalRange}</b></span>
                  <span>Sahayak draft: <b className="text-ink-2">{TIME_TO_DRAFT.copilotRange}</b></span>
                  <span>Current stage: <b className="text-ink-2">{STEP_STAGE[step]}</b></span>
                  <span>Human review still required before filing.</span>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="eyebrow">View Mode</div>
              <b className="mt-2 block text-[16px]">{issuerMode === 'firstTime' ? 'First-time issuer view is on' : 'Expert view is on'}</b>
              <p className="mt-1 text-[13px] leading-relaxed text-muted">
                {issuerMode === 'firstTime'
                  ? 'Capital-markets jargon now opens plain-language explanations inline while you review each step.'
                  : 'Switch to first-time issuer view whenever you want one-line explanations of DRHP and compliance terms.'}
              </p>
            </div>
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mx-auto min-w-0 max-w-[900px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pt-7"
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

      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#081428]/45 lg:hidden"
            onClick={() => setNavOpen(false)}
          >
            <motion.div
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="h-full max-w-[320px]"
              onClick={(e) => e.stopPropagation()}
            >
              <WorkspaceNav step={step} onStepSelect={onStepSelect} mobile onClose={() => setNavOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {copilotOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#081428]/45 lg:hidden"
            onClick={() => setCopilotOpen(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="absolute inset-x-0 bottom-0 top-16 rounded-t-[26px] bg-white shadow-lg2"
              onClick={(e) => e.stopPropagation()}
            >
              <Copilot mobile onClose={() => setCopilotOpen(false)} className="rounded-t-[26px]" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function WorkspaceNav({
  step,
  onStepSelect,
  mobile = false,
  onClose,
}: {
  step: StepId
  onStepSelect: (step: StepId) => void
  mobile?: boolean
  onClose?: () => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[#081428] text-[#c9d6ea] [background:linear-gradient(180deg,#0b1e3f,#081428)]">
      <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4">
        <Brand light />
        {mobile && onClose && (
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-[#c9d6ea] hover:bg-white/5"
            aria-label="Close journey navigation"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="border-b border-white/[.07] px-5 py-4">
        <div className="flex items-center gap-2.5 text-[15px] font-bold text-white">
          <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg text-[14px] font-extrabold text-white" style={{ background: 'linear-gradient(135deg,#1e6f4e,#2fae74)' }}>
            {COMPANY.logoLetters}
          </span>
          <span className="min-w-0 truncate">{COMPANY.proposedName}</span>
        </div>
        <div className="mt-2 text-[12px] leading-relaxed text-[#8598b9]">
          {COMPANY.sector}<br />CIN · {COMPANY.cin}
        </div>
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gold/[.12] px-2.5 py-1.5 text-[12px] font-bold text-gold-soft">
          <BadgeCheck size={13} /> {ISSUE.platform.split(' ')[0]} Emerge · ₹{ISSUE.sizeCr} Cr
        </div>
      </div>

      <div className="flex-1 px-3 py-3.5">
        <div className="px-3 pb-1.5 pt-2 text-[10.5px] font-bold uppercase tracking-[0.13em] text-[#5e739a]">Your journey</div>
        <div className="space-y-1">
          {STEPS.map((s) => {
            const active = step === s.id
            const StepGlyph = s.icon
            return (
              <button
                key={s.id}
                onClick={() => onStepSelect(s.id)}
                aria-current={active ? 'step' : undefined}
                className={`flex w-full items-center gap-3 rounded-[11px] px-3 py-2.5 text-left transition ${active ? 'bg-gold/[.13] ring-1 ring-gold/25' : 'hover:bg-white/5'}`}
              >
                <StepIcon status={s.status} active={active} />
                <div className="min-w-0 flex-1">
                  <b className={`block truncate text-[14px] font-semibold ${active ? 'text-white' : 'text-[#e8eefa]'}`}>{s.title}</b>
                  <span className="text-[11.5px] text-[#8598b9]">{s.sub}</span>
                </div>
                <StepGlyph size={16} className={active ? 'text-gold-soft' : 'text-[#5e739a]'} />
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-t border-white/[.07] px-5 py-4 text-[11.5px] leading-relaxed text-[#7d93b8]">
        <div className="mb-1 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-ok" /> Lead manager: {ISSUE.leadManager}</div>
        Draft auto-saved · Human-in-loop mode on
      </div>
    </div>
  )
}

function StepIcon({ status, active }: { status: string; active: boolean }) {
  if (status === 'done') {
    return <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ok text-white"><Check size={14} strokeWidth={3} /></span>
  }
  if (status === 'attention') {
    return <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-warn text-[#3a2c07]"><AlertTriangle size={14} /></span>
  }
  return (
    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${active ? 'bg-gold text-[#3a2c07] ring-4 ring-gold/20' : 'bg-white/[.08] text-[#7d93b8]'}`}>
      <Circle size={9} fill={active ? '#3a2c07' : 'transparent'} />
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
      className={`rounded-lg px-3 py-2 text-[12.5px] font-semibold transition ${active ? 'bg-navy-900 text-white' : 'text-muted'}`}
    >
      {mode === 'expert' ? 'Expert view' : 'First-time issuer'}
    </button>
  )
}
