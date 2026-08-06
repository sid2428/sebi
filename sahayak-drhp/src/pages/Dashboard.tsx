import { useMemo, useState } from 'react'
import { Bell, CalendarDays, ChevronRight, FileText, ShieldCheck, TrendingUp } from 'lucide-react'
import { useStore } from '../store'
import { Brand, Chip, Ring } from '../components/ui'
import { COMPANY, ISSUE, HANDOFF_STAGES, SECTIONS, TIME_TO_DRAFT, REQUIREMENTS } from '../data/mock'

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
    <div className="min-h-screen bg-[#f5f7fb]">
      <div className="border-b border-line bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Brand />
          <button onClick={() => go('workspace')} className="btn btn-navy btn-sm">
            Continue your IPO journey <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <main className="mx-auto grid max-w-[1240px] gap-6 px-6 py-8 lg:grid-cols-[1.4fr_0.95fr]">
        <section className="space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="eyebrow">IPO Readiness</div>
                <div className="mt-3 flex items-center gap-3">
                  <h1 className="text-[48px] font-extrabold tracking-tight">83%</h1>
                  <span className="inline-flex items-center rounded-full bg-info-bg px-3 py-1 text-sm font-semibold text-[#1e56b8]">IPO Health Check</span>
                </div>
                <p className="mt-3 max-w-[620px] text-[15px] text-muted">A snapshot of your current offer document readiness. Resolve any critical issues to move closer to banker review.</p>
              </div>
              <Ring value={83} size={108} stroke={10} color="#0fa389" track="#e2f5f1" />
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatusCard label="Estimated Time Remaining" value={`${timeRemaining} Days`} icon={CalendarDays} />
              <StatusCard label="Critical Issues" value={critical.toString()} icon={Bell} />
              <StatusCard label="Warnings" value={warnings.toString()} icon={ShieldCheck} />
              <StatusCard label="Ready Sections" value={`${readySections}/24`} icon={FileText} />
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[22px] border border-line bg-[#f8fbff] p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="eyebrow">Smart Validation Center</div>
                    <h3 className="text-[18px] font-bold">Critical, warnings, suggestions</h3>
                  </div>
                  <span className="text-[12px] text-muted">TurboTax-style guidance</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <ValidationBadge label="Critical" value={critical} tone="bad" />
                  <ValidationBadge label="Warnings" value={warnings} tone="amber" />
                  <ValidationBadge label="Suggestions" value={suggestions} tone="blue" />
                </div>
                <div className="mt-5 rounded-[18px] bg-white p-4 shadow-sm2">
                  <div className="text-[13px] text-muted">Top issue</div>
                  <div className="mt-3 text-[15px] font-semibold">No litigation disclosed</div>
                  <div className="mt-2 text-[13px] leading-relaxed text-muted">Possible reasons: no litigation exists, information missing, or supporting document pending.</div>
                  <div className="mt-4 space-y-2 text-[13px]">
                    <div className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-line text-navy-900" /> No litigation exists</div>
                    <div className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-line text-navy-900" /> Information missing</div>
                    <div className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded border-line text-navy-900" /> Supporting document pending</div>
                  </div>
                  <button onClick={() => showToast('Opening Legal Proceedings guidance...')} className="mt-4 btn btn-navy btn-sm">Review legal section</button>
                </div>
              </div>

              <div className="rounded-[22px] border border-line bg-white p-5 shadow-sm2">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="eyebrow">IPO Readiness Simulator</div>
                    <h3 className="text-[18px] font-bold">Forecast the impact of issue changes</h3>
                  </div>
                  <Chip tone="blue">Interactive</Chip>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[13px] text-muted">Issue size (₹ Crore)</div>
                    <input
                      type="range"
                      min={10}
                      max={60}
                      value={simulatorSize}
                      onChange={(event) => setSimulatorSize(Number(event.target.value))}
                      className="mt-3 w-full accent-[#0fa389]"
                    />
                    <div className="mt-2 flex items-center justify-between text-[13px] text-muted">
                      <span>₹10 Cr</span>
                      <span>₹{simulatorSize} Cr</span>
                      <span>₹60 Cr</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['Fresh Issue', 'Offer for Sale'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSimulatorMode(mode as typeof simulatorMode)}
                        className={`rounded-2xl border px-3 py-2 text-[13px] font-semibold ${simulatorMode === mode ? 'border-navy-900 bg-navy-900 text-white' : 'border-line bg-white text-ink'}`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-[#eef4f9] p-4">
                    <div className="text-[13px] text-muted">Readiness score</div>
                    <div className="mt-2 flex items-end gap-3">
                      <div className="text-[36px] font-extrabold text-ink">{simulatorScore}%</div>
                      <div className="text-[13px] text-muted">Estimated after simulation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="card p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="eyebrow">IPO Readiness Score</div>
                  <h2 className="mt-3 text-[22px] font-bold">Section progress by readiness</h2>
                </div>
                <button onClick={() => { go('workspace'); goStep('synthesis'); showToast('Opening DRHP synthesis for detail review.') }} className="btn btn-ghost btn-sm">View details</button>
              </div>

              <div className="mt-6 space-y-4">
                <ReadinessRow label="Company Details" value={readiness.companyDetails} />
                <ReadinessRow label="Promoters" value={readiness.promoters} />
                <ReadinessRow label="Financials" value={readiness.financials} />
                <ReadinessRow label="Issue Structure" value={readiness.issueStructure} />
                <ReadinessRow label="Risk Factors" value={readiness.riskFactors} />
                <ReadinessRow label="Legal" value={readiness.legal} />
                <ReadinessRow label="Overall" value={readiness.overall} accent />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="eyebrow">IPO Health Check</div>
                  <h2 className="mt-3 text-[20px] font-bold">Weakest area: Risk Factors</h2>
                </div>
                <Chip tone="amber">Action needed</Chip>
              </div>
              <div className="mt-6 space-y-4 rounded-[18px] bg-[#f3f7fb] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[14px] text-muted">Overall score</div>
                    <div className="text-[32px] font-extrabold">83%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] text-muted">Status</div>
                    <div className="text-[16px] font-semibold">IPO Ready</div>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm2">
                  <div className="text-[13px] text-muted">Recommended next step</div>
                  <div className="mt-2 text-[15px] font-semibold">Complete Legal Proceedings</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="card p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="eyebrow">Recent Activity</div>
                  <h2 className="mt-3 text-[20px] font-bold">What happened last</h2>
                </div>
                <button onClick={() => { go('workspace'); goStep('final'); showToast('Opening audit log and final draft review.') }} className="btn btn-ghost btn-sm">Audit log</button>
              </div>
              <div className="mt-6 space-y-4">
                {ACTIVITIES.map((item) => (
                  <div key={item.time} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-[#f8f9fb] px-4 py-3">
                    <div>
                      <div className="text-[13px] font-semibold text-ink-2">{item.text}</div>
                      <div className="text-[12px] text-muted">{item.time}</div>
                    </div>
                    <TrendingUp size={18} className="text-[#4b6aa2]" />
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <div className="eyebrow">Upcoming tasks</div>
              <h2 className="mt-3 text-[20px] font-bold">AI suggestions for next actions</h2>
              <div className="mt-6 space-y-3">
                {TASKS.map((task) => (
                  <div key={task.title} className="rounded-2xl border border-line bg-[#f8f9fb] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[14px] font-semibold text-ink-2">{task.title}</div>
                      <span className="text-[12px] text-muted">{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="eyebrow">IPO Journey Timeline</div>
                <h2 className="mt-3 text-[20px] font-bold">Progress tracker</h2>
              </div>
              <Chip tone="blue">Live</Chip>
            </div>
            <div className="mt-6 space-y-4">
              {HANDOFF_STAGES.map((stage, index) => (
                <div key={stage.id} className="flex items-start gap-4">
                  <div className="mt-1 grid h-9 w-9 place-items-center rounded-2xl bg-[#e7f7f4] text-[#0f8e62] font-semibold">{index + 1}</div>
                  <div>
                    <div className="text-[14px] font-semibold text-ink-2">{stage.label}</div>
                    <div className="text-[13px] text-muted">{stage.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="eyebrow">Risk Heatmap</div>
                <h2 className="mt-3 text-[20px] font-bold">Exposure by category</h2>
              </div>
              <Chip tone="amber">Interactive</Chip>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {riskSignals.map((signal) => (
                <div key={signal.label} className="rounded-2xl border border-line bg-[#f8f9fb] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[14px] font-semibold text-ink-2">{signal.label}</div>
                    <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${signal.tone}`}>{signal.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="eyebrow">Compliance Radar</div>
                <h2 className="mt-3 text-[20px] font-bold">Certainty by framework</h2>
              </div>
              <Chip tone="green">95%+</Chip>
            </div>
            <div className="mt-6 space-y-3">
              {complianceRatings.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-[13px] text-muted mb-1">
                    <span>{item.label}</span>
                    <span className="font-semibold text-ink-2">{item.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#eef3fa] overflow-hidden">
                    <div className="h-full rounded-full bg-[#0fa389]" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="eyebrow">Smart Checklist</div>
                <h2 className="mt-3 text-[20px] font-bold">Section completion</h2>
              </div>
              <Chip tone="blue">24 sections</Chip>
            </div>
            <div className="mt-6 space-y-3">
              {checklistItems.map((item) => (
                <div key={item.title} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-[#f8f9fb] px-4 py-3">
                  <div className="text-[14px] text-ink-2">{item.title}</div>
                  <Chip tone={item.status === 'Done' ? 'green' : item.status === 'Pending' ? 'amber' : 'gray'}>{item.status}</Chip>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="eyebrow">AI Section Generator</div>
                <h2 className="mt-3 text-[20px] font-bold">Generate draft content instantly</h2>
              </div>
            </div>
            <div className="mt-6 rounded-[22px] bg-[#f3f6fb] p-4">
              <div className="text-[14px] text-muted">Enter a prompt and let the assistant draft your business description or risk factor.</div>
              <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm2">
                <p className="text-[13px] text-muted">Input</p>
                <div className="mt-2 rounded-2xl border border-line bg-[#f8f9fb] px-4 py-3 text-[14px] text-ink">Manufacturing LED Lights</div>
                <p className="mt-3 text-[13px] text-muted">Output</p>
                <div className="mt-2 rounded-2xl border border-line bg-white px-4 py-4 text-[14px] leading-relaxed text-ink-2">Our company is engaged in manufacturing energy efficient LED lighting solutions with a focus on sustainable products, strong supply chain reliability and growing modern trade channels.</div>
                <button onClick={() => showToast('Example section generated and saved to the draft.')} className="mt-4 btn btn-navy btn-sm w-full">Generate draft</button>
              </div>
            </div>
            <div className="mt-6 rounded-[18px] border border-line bg-white p-4">
              <div className="text-[13px] uppercase tracking-[0.18em] text-teal-200">AI IPO Copilot</div>
              <div className="mt-3 text-sm leading-snug">Hi Khushi. {aiMessage}</div>
            </div>
            <button onClick={handleGenerate} className="mt-6 w-full btn btn-gold btn-sm">Generate section</button>
          </div>
        </aside>
      </main>
    </div>
  )
}

function StatusCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Bell }) {
  return (
    <div className="rounded-[18px] border border-line bg-white px-4 py-5 shadow-sm2">
      <div className="flex items-center gap-3 text-[13px] text-muted">
        <Icon size={18} />
        <span>{label}</span>
      </div>
      <div className="mt-4 text-[28px] font-extrabold text-ink">{value}</div>
    </div>
  )
}

function ReadinessRow({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_96px] items-center rounded-2xl border border-line bg-white px-4 py-3">
      <div>
        <div className="text-[14px] font-semibold text-ink-2">{label}</div>
      </div>
      <div className="space-y-2">
        <div className="text-right text-[15px] font-semibold text-ink">{value}%</div>
        <div className="h-2 rounded-full bg-[#eef3fa] overflow-hidden">
          <div className={`h-full rounded-full ${accent ? 'bg-teal-500' : 'bg-[#5d87c6]'}`} style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  )
}

function ValidationBadge({ label, value, tone }: { label: string; value: number; tone: 'bad' | 'amber' | 'blue' }) {
  const toneClasses = tone === 'bad'
    ? 'bg-[#fde8e6] text-[#9c2d25]'
    : tone === 'amber'
      ? 'bg-[#fff4e5] text-[#9b6c1f]'
      : 'bg-[#eef8ff] text-[#1b538f]'

  return (
    <div className={`rounded-[18px] border border-line px-4 py-4 ${toneClasses}`}>
      <div className="text-[13px] font-semibold text-ink-2">{label}</div>
      <div className="mt-2 text-[28px] font-extrabold">{value}</div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-[#f8f9fb] px-4 py-3">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-[14px] font-semibold text-ink-2">{value}</span>
    </div>
  )
}
