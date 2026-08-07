import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bell, CalendarDays, ChevronRight, FileText, ShieldCheck, TrendingUp, ArrowUpRight, Sparkles,
} from 'lucide-react'
import { useStore } from '../store'
import { Brand, Chip, Ring, SectionHeading } from '../components/ui'
import { COMPANY, ISSUE, HANDOFF_STAGES, SECTIONS, TIME_TO_DRAFT, REQUIREMENTS } from '../data/mock'
import { Counter, MeterBar, Reveal, Stagger, StaggerItem } from '../components/motion'
import { ComplianceBadge } from '../components/illustrations'
import { useLenis } from '../lib/useLenis'
import { EASE } from '../lib/motion'

const PRIORITIES = [
  { label: 'Legal Review', status: 'Not started' },
  { label: 'Merchant Banker Review', status: 'Pending' },
  { label: 'Financial Review', status: 'Completed' },
  { label: 'Risk Factors', status: 'In progress' },
]

const TASKS = [
  { title: 'Upload GST certificate', status: 'Pending' },
  { title: 'Confirm promoter shareholding', status: 'Pending' },
  { title: 'Review DRHP risk narrative', status: 'In progress' },
  { title: 'Approve legal counsel note', status: 'Waiting' },
]

const ACTIVITIES = [
  { time: '11:20', text: 'Financial review approved' },
  { time: '10:05', text: 'Merchant banker commented' },
  { time: '09:42', text: 'Risk Factors generated' },
  { time: '09:20', text: 'Business updated' },
]

const DOCUMENT_STATUS = [
  { name: 'GST Certificate', status: 'Verified' },
  { name: 'PAN', status: 'Verified' },
  { name: 'MOA', status: 'Needs review' },
  { name: 'AOA', status: 'Verified' },
  { name: 'Financial Statements', status: 'AI Extracted' },
  { name: 'ROC Filings', status: 'Pending' },
]

export default function Dashboard() {
  const go = useStore((s) => s.goScreen)
  const goStep = useStore((s) => s.goStep)
  const showToast = useStore((s) => s.showToast)
  const [simulatorSize, setSimulatorSize] = useState(32)
  const [simulatorMode, setSimulatorMode] = useState<'Fresh Issue' | 'Offer for Sale'>('Fresh Issue')
  useLenis()

  const readiness = useMemo(() => ({
    companyDetails: 100,
    promoters: 80,
    financials: 92,
    issueStructure: 65,
    riskFactors: 40,
    legal: 90,
    overall: Math.round((100 + 80 + 92 + 65 + 40 + 90) / 6),
  }), [])

  const critical = REQUIREMENTS.filter((item) => item.status === 'missing').length
  const warnings = REQUIREMENTS.filter((item) => item.status === 'partial').length
  const suggestions = warnings * 2 + critical * 3 + 1
  const readySections = SECTIONS.filter((s) => s.complete === 100).length
  const timeRemaining = Math.max(1, Math.round(TIME_TO_DRAFT.stageDaysSaved.base / 3))
  const aiMessage = critical > 0
    ? `I found ${critical} critical issue${critical > 1 ? 's' : ''} and ${warnings} warning${warnings !== 1 ? 's' : ''}. I can help you draft the missing legal or risk narrative.`
    : `Your draft looks strong. I can help you polish risk factors or generate a lawyer-ready counsel note.`

  const simulatorScore = useMemo(() => {
    const delta = simulatorSize - 32
    const base = 84
    let score = base - delta * 0.25 + (simulatorMode === 'Fresh Issue' ? 3 : -2)
    return Math.min(96, Math.max(62, Math.round(score)))
  }, [simulatorSize, simulatorMode])

  const riskSignals = [
    { label: 'Operational', level: 'High', tone: 'bg-bad-bg text-[#b23428]' },
    { label: 'Financial', level: 'Medium', tone: 'bg-warn-bg text-[#a5651a]' },
    { label: 'Legal', level: 'Low', tone: 'bg-ok-bg text-ok' },
    { label: 'Industry', level: 'High', tone: 'bg-bad-bg text-[#b23428]' },
    { label: 'Governance', level: 'Medium', tone: 'bg-warn-bg text-[#a5651a]' },
  ]

  const complianceRatings = [
    { label: 'SEBI Compliance', value: 95 },
    { label: 'Companies Act', value: 100 },
    { label: 'Accounting', value: 89 },
    { label: 'Secretarial', value: 90 },
  ]

  const checklistItems = SECTIONS.slice(0, 8).map((section) => ({
    title: section.title,
    status: section.complete === 100 ? 'Done' : section.complete >= 80 ? 'Pending' : 'Attention',
  }))

  function handleGenerate() {
    showToast('Generating the suggested section now...')
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-6 py-3.5">
          <div className="flex items-center gap-4">
            <Brand />
            <span className="hidden h-6 w-px bg-line lg:block" />
            <div className="hidden lg:block">
              <div className="text-[13px] font-bold leading-tight text-ink">{COMPANY.proposedName}</div>
              <div className="text-[11.5px] text-muted">
                {ISSUE.platform.split(' ')[0]} Emerge · ₹{ISSUE.sizeCr} Cr fresh issue
              </div>
            </div>
          </div>
          <button onClick={() => go('workspace')} className="btn btn-navy btn-sm">
            Continue your IPO journey <ChevronRight size={15} />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-6 py-8">
        {/* ===== Readiness headline ===== */}
        <Reveal shape="settle">
          <section className="card overflow-hidden">
            <div className="grid gap-6 p-6 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="eyebrow">IPO readiness</div>
                <div className="mt-3 flex flex-wrap items-baseline gap-3">
                  <h1 className="text-[clamp(40px,5vw,54px)] font-extrabold leading-none tracking-[-0.04em]">
                    <Counter to={83} suffix="%" />
                  </h1>
                  <Chip tone="blue">Health check</Chip>
                </div>
                <p className="mt-3 max-w-[58ch] text-[14.5px] leading-relaxed text-ink-3">
                  Where your offer document stands right now. Clear the critical items to move into
                  merchant-banker review.
                </p>
              </div>
              <Ring value={83} size={112} stroke={10} color="#3A63C4" track="#E9F1FE" />
            </div>

            <Stagger className="grid gap-px border-t border-line bg-line sm:grid-cols-2 xl:grid-cols-4" each={0.07}>
              <StatusCard label="Estimated time remaining" value={`${timeRemaining} days`} icon={CalendarDays} />
              <StatusCard label="Critical issues" value={critical.toString()} icon={Bell} tone={critical ? 'bad' : 'ok'} />
              <StatusCard label="Warnings" value={warnings.toString()} icon={ShieldCheck} tone="warn" />
              <StatusCard label="Ready sections" value={`${readySections}/24`} icon={FileText} />
            </Stagger>
          </section>
        </Reveal>

        {/* ===== Validation + simulator ===== */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
          <Reveal shape="settle">
            <Panel
              eyebrow="Smart validation centre"
              title="What needs a decision"
              aside={<span className="text-[12px] text-muted">Guided, one item at a time</span>}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <ValidationBadge label="Critical" value={critical} tone="bad" />
                <ValidationBadge label="Warnings" value={warnings} tone="amber" />
                <ValidationBadge label="Suggestions" value={suggestions} tone="blue" />
              </div>

              <div className="mt-5 rounded-2xl2 border border-line bg-panel/70 p-5">
                <div className="flex items-center gap-2">
                  <span className="chip bg-bad-bg text-bad ring-1 ring-inset ring-bad-line">Top issue</span>
                </div>
                <h3 className="mt-3 text-[16px] font-bold tracking-[-0.015em]">No litigation disclosed</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-3">
                  One of three things is true. Tell us which, and we will word the disclosure correctly.
                </p>
                <div className="mt-4 space-y-1">
                  {['No litigation exists', 'Information missing', 'Supporting document pending'].map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] text-ink-2 transition-colors duration-150 hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-line-strong text-accent-600 focus:ring-accent-400"
                      />
                      {option}
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => showToast('Opening Legal Proceedings guidance...')}
                  className="btn btn-navy btn-sm mt-4"
                >
                  Review legal section <ChevronRight size={14} />
                </button>
              </div>
            </Panel>
          </Reveal>

          <Reveal shape="settle" delay={0.06}>
            <Panel
              eyebrow="Readiness simulator"
              title="Forecast a change to the issue"
              aside={<Chip tone="blue">Interactive</Chip>}
            >
              <div className="space-y-5">
                <div>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="issue-size" className="text-[13px] font-semibold text-ink-2">
                      Issue size
                    </label>
                    <span className="mono text-[15px] font-extrabold text-ink">₹{simulatorSize} Cr</span>
                  </div>
                  <input
                    id="issue-size"
                    type="range"
                    min={10}
                    max={60}
                    value={simulatorSize}
                    onChange={(event) => setSimulatorSize(Number(event.target.value))}
                    className="mt-3 w-full accent-[#3A63C4]"
                  />
                  <div className="mt-1.5 flex items-center justify-between text-[11.5px] text-muted">
                    <span>₹10 Cr</span>
                    <span>₹60 Cr</span>
                  </div>
                </div>

                <div
                  className="grid grid-cols-2 gap-2 rounded-xl2 bg-panel p-1"
                  role="group"
                  aria-label="Issue structure"
                >
                  {['Fresh Issue', 'Offer for Sale'].map((mode) => {
                    const active = simulatorMode === mode
                    return (
                      <button
                        key={mode}
                        onClick={() => setSimulatorMode(mode as typeof simulatorMode)}
                        aria-pressed={active}
                        className={`relative rounded-lg px-3 py-2 text-[13px] font-bold transition-colors duration-200 ${
                          active ? 'text-white' : 'text-ink-3 hover:text-ink'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="sim-mode"
                            className="absolute inset-0 rounded-lg bg-ink"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        )}
                        <span className="relative">{mode}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="rounded-2xl2 border border-accent-100 bg-accent-50 p-5">
                  <div className="text-[12.5px] font-semibold text-accent-700">Projected readiness</div>
                  <div className="mt-1.5 flex items-end gap-3">
                    <motion.div
                      key={simulatorScore}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      className="mono text-[38px] font-extrabold leading-none tracking-[-0.04em] text-ink"
                    >
                      {simulatorScore}%
                    </motion.div>
                    <span className="pb-1 text-[12.5px] text-muted">after simulation</span>
                  </div>
                  <MeterBar
                    value={simulatorScore}
                    className="mt-4"
                    height={6}
                    barClassName="bg-accent-500"
                    trackClassName="bg-white"
                    label="Projected readiness score"
                  />
                </div>
              </div>
            </Panel>
          </Reveal>
        </div>

        {/* ===== Section readiness + weakest area ===== */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <Reveal shape="settle">
            <Panel
              eyebrow="Readiness by area"
              title="Section progress"
              aside={
                <button
                  onClick={() => { go('workspace'); goStep('synthesis'); showToast('Opening DRHP synthesis for detail review.') }}
                  className="btn btn-ghost btn-sm"
                >
                  View details <ArrowUpRight size={14} />
                </button>
              }
            >
              <Stagger className="space-y-2" each={0.05}>
                <ReadinessRow label="Company details" value={readiness.companyDetails} />
                <ReadinessRow label="Promoters" value={readiness.promoters} />
                <ReadinessRow label="Financials" value={readiness.financials} />
                <ReadinessRow label="Issue structure" value={readiness.issueStructure} />
                <ReadinessRow label="Risk factors" value={readiness.riskFactors} />
                <ReadinessRow label="Legal" value={readiness.legal} />
                <ReadinessRow label="Overall" value={readiness.overall} accent />
              </Stagger>
            </Panel>
          </Reveal>

          <Reveal shape="settle" delay={0.06}>
            <Panel
              eyebrow="Weakest area"
              title="Risk factors"
              aside={<Chip tone="amber">Action needed</Chip>}
            >
              <div className="rounded-2xl2 bg-panel p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[12.5px] text-muted">Overall score</div>
                    <div className="mono mt-1 text-[34px] font-extrabold leading-none tracking-[-0.04em]">83%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12.5px] text-muted">Status</div>
                    <div className="mt-1 text-[15px] font-bold text-ok">IPO ready</div>
                  </div>
                </div>
                <MeterBar value={83} className="mt-4" height={6} barClassName="bg-ok" trackClassName="bg-white" label="Overall readiness" />
              </div>

              <div className="mt-4 flex items-center gap-3.5 rounded-2xl2 border border-line bg-white p-4">
                <ComplianceBadge level="partial" className="h-11 w-auto shrink-0" />
                <div>
                  <div className="text-[12px] font-semibold text-muted">Recommended next step</div>
                  <div className="mt-0.5 text-[14.5px] font-bold text-ink">Complete legal proceedings</div>
                </div>
              </div>
            </Panel>
          </Reveal>
        </div>

        {/* ===== Activity + tasks ===== */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Reveal shape="settle">
            <Panel
              eyebrow="Recent activity"
              title="What happened last"
              aside={
                <button
                  onClick={() => { go('workspace'); goStep('final'); showToast('Opening audit log and final draft review.') }}
                  className="btn btn-ghost btn-sm"
                >
                  Audit log
                </button>
              }
            >
              {/* Timeline rail — activity is a sequence, so it gets a line.
                  The rail is a sibling of the list, not a child: an <ol>
                  may only contain <li>. */}
              <div className="relative">
                <span className="absolute bottom-3 left-[7px] top-3 w-px bg-line" aria-hidden="true" />
                <ol className="space-y-1 pl-6">
                {ACTIVITIES.map((item, i) => (
                  <motion.li
                    key={item.time}
                    initial={{ opacity: 0, x: -6 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, ease: EASE, delay: i * 0.06 }}
                    className="relative flex items-center justify-between gap-3 rounded-xl2 px-3 py-2.5 transition-colors duration-150 hover:bg-panel"
                  >
                    <span
                      className={`absolute -left-[22px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full ring-2 ring-white ${
                        i === 0 ? 'bg-accent-500' : 'bg-line-strong'
                      }`}
                      aria-hidden="true"
                    />
                    <div>
                      <div className="text-[13.5px] font-semibold text-ink-2">{item.text}</div>
                      <div className="mono text-[11.5px] text-muted">{item.time}</div>
                    </div>
                    <TrendingUp size={16} className="shrink-0 text-accent-400" />
                  </motion.li>
                ))}
                </ol>
              </div>
            </Panel>
          </Reveal>

          <Reveal shape="settle" delay={0.06}>
            <Panel eyebrow="Upcoming" title="Suggested next actions">
              <Stagger className="space-y-2" each={0.06}>
                {TASKS.map((task) => (
                  <StaggerItem
                    key={task.title}
                    shape="slideIn"
                    className="flex items-center justify-between gap-3 rounded-xl2 border border-line bg-white px-4 py-3 transition-colors duration-150 hover:border-accent-200 hover:bg-accent-50/50"
                  >
                    <span className="text-[13.5px] font-semibold text-ink-2">{task.title}</span>
                    <Chip tone={task.status === 'In progress' ? 'blue' : 'gray'}>{task.status}</Chip>
                  </StaggerItem>
                ))}
              </Stagger>
            </Panel>
          </Reveal>
        </div>

        {/* ===== Journey, risk, compliance, checklist ===== */}
        <Reveal className="mt-14">
          <SectionHeading eyebrow="Detail" title="Everything else we are tracking" />
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <Reveal shape="settle">
            <Panel eyebrow="Journey" title="Progress tracker" aside={<Chip tone="blue">Live</Chip>}>
              <div className="relative">
                <span className="absolute bottom-4 left-4 top-4 w-px bg-line" aria-hidden="true" />
                <ol className="space-y-4 pl-11">
                {HANDOFF_STAGES.map((stage, index) => (
                  <li key={stage.id} className="relative">
                    <span
                      className={`absolute -left-11 grid h-8 w-8 place-items-center rounded-xl2 text-[12.5px] font-extrabold ring-4 ring-white ${
                        index <= 1 ? 'bg-ok-bg text-ok' : 'bg-panel text-muted'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="text-[13.5px] font-bold text-ink">{stage.label}</div>
                    <div className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{stage.detail}</div>
                  </li>
                ))}
                </ol>
              </div>
            </Panel>
          </Reveal>

          <Reveal shape="settle" delay={0.05}>
            <Panel eyebrow="Risk heatmap" title="Exposure by category">
              <Stagger className="space-y-1.5" each={0.05}>
                {riskSignals.map((signal) => {
                  const weight = signal.level === 'High' ? 100 : signal.level === 'Medium' ? 62 : 26
                  return (
                    <StaggerItem
                      key={signal.label}
                      shape="fade"
                      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl2 px-3 py-2.5 transition-colors duration-150 hover:bg-panel"
                    >
                      <div>
                        <div className="text-[13.5px] font-semibold text-ink-2">{signal.label}</div>
                        <MeterBar
                          value={weight}
                          className="mt-2"
                          height={5}
                          barClassName={
                            signal.level === 'High' ? 'bg-bad' : signal.level === 'Medium' ? 'bg-warn' : 'bg-ok'
                          }
                          label={`${signal.label} risk`}
                        />
                      </div>
                      <span className={`chip ${signal.tone}`}>{signal.level}</span>
                    </StaggerItem>
                  )
                })}
              </Stagger>
            </Panel>
          </Reveal>

          <Reveal shape="settle" delay={0.1}>
            <Panel eyebrow="Compliance radar" title="Certainty by framework" aside={<Chip tone="green">95%+</Chip>}>
              <Stagger className="space-y-4" each={0.06}>
                {complianceRatings.map((item) => (
                  <StaggerItem key={item.label} shape="fade">
                    <div className="mb-1.5 flex items-center justify-between text-[13px]">
                      <span className="text-ink-2">{item.label}</span>
                      <span className="mono font-bold text-ink">
                        <Counter to={item.value} suffix="%" />
                      </span>
                    </div>
                    <MeterBar value={item.value} height={6} barClassName="bg-accent-500" label={item.label} />
                  </StaggerItem>
                ))}
              </Stagger>
            </Panel>
          </Reveal>

          <Reveal shape="settle">
            <Panel eyebrow="Smart checklist" title="Section completion" aside={<Chip tone="blue">24 sections</Chip>}>
              <Stagger className="space-y-1.5" each={0.04}>
                {checklistItems.map((item) => (
                  <StaggerItem
                    key={item.title}
                    shape="fade"
                    className="flex items-center justify-between gap-3 rounded-xl2 px-3 py-2.5 transition-colors duration-150 hover:bg-panel"
                  >
                    <span className="min-w-0 truncate text-[13.5px] text-ink-2">{item.title}</span>
                    <Chip tone={item.status === 'Done' ? 'green' : item.status === 'Pending' ? 'amber' : 'gray'}>
                      {item.status}
                    </Chip>
                  </StaggerItem>
                ))}
              </Stagger>
            </Panel>
          </Reveal>

          <Reveal shape="settle" delay={0.05} className="lg:col-span-2 xl:col-span-1">
            <Panel eyebrow="AI section generator" title="Draft content from a prompt">
              <div className="rounded-2xl2 border border-line bg-panel/70 p-4">
                <div className="mono text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Input</div>
                <div className="mt-2 rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-[13.5px] text-ink">
                  Manufacturing LED Lights
                </div>
                <div className="mono mt-4 text-[11px] font-bold uppercase tracking-[0.1em] text-muted">Output</div>
                <div className="mt-2 rounded-xl2 border border-accent-100 bg-white px-3.5 py-3 text-[13px] leading-[1.65] text-ink-2">
                  Our company is engaged in manufacturing energy efficient LED lighting solutions with a focus
                  on sustainable products, strong supply chain reliability and growing modern trade channels.
                </div>
                <button
                  onClick={() => showToast('Example section generated and saved to the draft.')}
                  className="btn btn-navy btn-sm mt-4 w-full justify-center"
                >
                  Generate draft
                </button>
              </div>

              <div className="mt-4 flex gap-3 rounded-2xl2 border border-accent-100 bg-accent-50 p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-600 text-white">
                  <Sparkles size={15} />
                </span>
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-accent-700">
                    AI IPO co-pilot
                  </div>
                  <p className="mt-1 text-[13px] leading-[1.6] text-ink-2">Hi Khushi. {aiMessage}</p>
                </div>
              </div>

              <button onClick={handleGenerate} className="btn btn-gold btn-sm mt-4 w-full justify-center">
                Generate section
              </button>
            </Panel>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

/* ---------- shared panel chrome ---------- */

function Panel({
  eyebrow,
  title,
  aside,
  children,
}: {
  eyebrow: string
  title: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="card flex h-full flex-col p-6">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2 className="mt-1.5 text-[18px] font-bold tracking-[-0.02em]">{title}</h2>
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  )
}

function StatusCard({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string
  value: string
  icon: typeof Bell
  tone?: 'neutral' | 'ok' | 'warn' | 'bad'
}) {
  const toneClass =
    tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : tone === 'ok' ? 'text-ok' : 'text-accent-600'

  return (
    <div className="bg-white px-5 py-5 transition-colors duration-150 hover:bg-panel/60">
      <div className="flex items-center gap-2 text-[12.5px] font-semibold text-muted">
        <Icon size={16} className={toneClass} />
        <span>{label}</span>
      </div>
      <div className="mono mt-3 text-[26px] font-extrabold leading-none tracking-[-0.035em] text-ink">{value}</div>
    </div>
  )
}

function ReadinessRow({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <StaggerItem
      shape="fade"
      className={`grid grid-cols-[1fr_auto] items-center gap-4 rounded-xl2 px-3.5 py-3 ${
        accent ? 'border border-accent-100 bg-accent-50' : 'hover:bg-panel'
      } transition-colors duration-150`}
    >
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <span className={`truncate text-[13.5px] ${accent ? 'font-extrabold text-ink' : 'font-semibold text-ink-2'}`}>
            {label}
          </span>
          <span className="mono text-[13px] font-bold text-ink">{value}%</span>
        </div>
        <MeterBar
          value={value}
          className="mt-2"
          height={6}
          barClassName={accent ? 'bg-accent-600' : value >= 90 ? 'bg-ok' : value >= 60 ? 'bg-accent-400' : 'bg-warn'}
          trackClassName={accent ? 'bg-white' : ''}
          label={`${label} readiness`}
        />
      </div>
      <span className="w-0" />
    </StaggerItem>
  )
}

function ValidationBadge({ label, value, tone }: { label: string; value: number; tone: 'bad' | 'amber' | 'blue' }) {
  const toneClasses =
    tone === 'bad'
      ? 'border-bad-line bg-bad-bg text-bad'
      : tone === 'amber'
        ? 'border-warn-line bg-warn-bg text-warn'
        : 'border-info-line bg-info-bg text-info'

  return (
    <div className={`rounded-2xl2 border px-4 py-4 ${toneClasses}`}>
      <div className="text-[12.5px] font-bold uppercase tracking-[0.07em]">{label}</div>
      <div className="mono mt-2 text-[28px] font-extrabold leading-none tracking-[-0.04em]">
        <Counter to={value} />
      </div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl2 border border-line bg-panel px-4 py-3">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-[13.5px] font-semibold text-ink-2">{value}</span>
    </div>
  )
}
