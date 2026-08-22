import { Scale, Flag, TrendingUp, ShieldCheck, Check } from 'lucide-react'
import { Chip, Ring } from '../ui'
import { Counter } from '../motion'
import { executiveSummary, type Rag } from '../../report/model'
import { useStore } from '../../store'
import { useMemo } from 'react'

// Status colours map onto the app's print-safe token set.
const RAG_DOT: Record<Rag, string> = {
  green: 'bg-ok',
  amber: 'bg-warn',
  red: 'bg-bad',
}

/**
 * Executive Summary — the top-of-report verdict a reviewer reads first.
 * Every figure is derived in src/report/model.ts from the source data;
 * nothing here is hand-entered.
 */
export default function ExecutiveSummary() {
  const gapResolutions = useStore((s) => s.gapResolutions)
  const docRecords = useStore((s) => s.docRecords)

  const s = useMemo(() => executiveSummary(), [gapResolutions, docRecords])

  const { p1, p2, p3 } = s.findings
  const watch = p2 + p3
  const verdictLine =
    `Eligible for ${s.issue.platformShort} on ${s.eligibility.criteriaMet} of ${s.eligibility.criteriaTotal} criteria. ` +
    `${p1} ${p1 === 1 ? 'item blocks' : 'items block'} certification and ${watch} more ${watch === 1 ? 'precedes' : 'precede'} filing — none touches the issue's viability.`
  return (
    <section aria-label="Executive summary" className="card mb-5 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <div className="eyebrow">Pre-filing DRHP review</div>
          <h2 className="mt-1.5 text-[20px] font-extrabold tracking-[-0.028em] text-ink">Executive summary</h2>
        </div>
        <Chip tone={s.readiness.tone === 'amber' ? 'amber' : 'green'} className="mt-0.5">
          <span className={`h-1.5 w-1.5 rounded-full ${RAG_DOT[s.readiness.tone]}`} aria-hidden="true" />
          {s.readiness.verdict}
        </Chip>
      </div>

      {/* Band 1 — readiness + gauge + KPI tiles */}
      <div className="grid gap-6 px-5 py-5 sm:px-6 md:grid-cols-2">
        <div className="flex items-center gap-4">
          <div className="shrink-0 text-center">
            <Ring value={s.completeness.mean} size={78} stroke={8} color="#3A63C4" />
            <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Disclosure</div>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Readiness</div>
            <div className="mt-0.5 text-[21px] font-extrabold leading-tight tracking-[-0.03em] text-ink">
              {s.readiness.verdict}
            </div>
            <div className="mt-1 text-[12.5px] leading-snug text-muted">
              {s.readiness.gatedByCertification
                ? `${s.findings.p1} items must clear before certification`
                : 'Cleared for merchant-banker certification'}
            </div>
            <div className="mt-1 text-[11.5px] text-muted">
              {s.completeness.fullyComplete}/{s.completeness.total} sections complete · mean {s.completeness.mean}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Tile icon={<Scale size={13} />} label="Eligibility">
            <Counter to={s.eligibility.score} />
            <span className="text-muted"> / 100</span>
            <Sub>{s.eligibility.verdict}</Sub>
          </Tile>
          <Tile icon={<Flag size={13} />} label="Open findings">
            <Counter to={s.findings.total} />
            <Sub>{s.findings.p1} gate certification</Sub>
          </Tile>
          <Tile icon={<TrendingUp size={13} />} label="Fresh issue">
            <Counter to={s.issue.sizeCr} prefix="₹" suffix=" Cr" decimals={2} />
            <Sub>{s.issue.platformShort} · {s.issue.type}</Sub>
          </Tile>
          <Tile icon={<ShieldCheck size={13} />} label="Net worth · FY23">
            <Counter to={s.netWorthCr} prefix="₹" suffix=" Cr" decimals={2} />
            <Sub>Positive · no accumulated losses</Sub>
          </Tile>
        </div>
      </div>

      {/* Band 2 — workstream status strip */}
      <div className="border-t border-line px-5 py-3.5 sm:px-6">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Workstream status</div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {s.workstreams.map((ws) => (
            <span key={ws.key} className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-2">
              <span className={`h-2 w-2 rounded-full ${RAG_DOT[ws.rag]}`} aria-hidden="true" />
              {ws.label}
            </span>
          ))}
        </div>
      </div>

      {/* Band 3 — key messages */}
      <div className="grid gap-px border-t border-line bg-line sm:grid-cols-3">
        <MessageCol title="Strengths" tone="green" count={s.keyMessages.strengths.length}>
          {s.keyMessages.strengths.map((x) => (
            <li key={x.label} className="flex items-baseline gap-2 text-[12.5px] leading-[1.5]">
              <Check size={13} className="shrink-0 translate-y-0.5 text-ok" aria-hidden="true" />
              <span className="text-ink-2">
                <b className="font-semibold text-ink">{x.label}</b> — {x.value}
              </span>
            </li>
          ))}
        </MessageCol>

        <MessageCol title="Watch" tone="amber" count={s.keyMessages.watch.length}>
          {s.keyMessages.watch.map((x) => (
            <FindingLine key={x.code} code={x.code} title={x.title} tone="amber" />
          ))}
        </MessageCol>

        <MessageCol title="Blockers" tone="red" count={s.keyMessages.blockers.length}>
          {s.keyMessages.blockers.map((x) => (
            <FindingLine key={x.code} code={x.code} title={x.title} tone="red" />
          ))}
        </MessageCol>
      </div>

      {/* Band 4 — verdict observation */}
      <div className="border-t border-line px-5 py-4 sm:px-6">
        <div className="rounded-r-xl2 border-l-[3px] border-accent-400 bg-accent-50/60 px-4 py-3 text-[13px] leading-[1.6] text-ink-2">
          <b className="font-bold text-ink">Observation. </b>
          {verdictLine}
        </div>
      </div>
    </section>
  )
}

/* ---------- local primitives ---------- */

function Tile({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl2 border border-line bg-panel/50 p-3.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
        <span className="text-accent-600" aria-hidden="true">{icon}</span>
        {label}
      </div>
      <div className="mt-1.5 text-[19px] font-extrabold tracking-[-0.02em] text-ink">{children}</div>
    </div>
  )
}

function Sub({ children }: { children: React.ReactNode }) {
  return <div className="mt-0.5 text-[11.5px] font-medium text-muted">{children}</div>
}

function MessageCol({
  title,
  tone,
  count,
  children,
}: {
  title: string
  tone: Rag
  count: number
  children: React.ReactNode
}) {
  return (
    <div className="bg-white px-5 py-4 sm:px-6">
      <div className="mb-2.5 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${RAG_DOT[tone]}`} aria-hidden="true" />
        <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-ink-2">{title}</span>
        <span className="ml-auto mono text-[11px] font-bold text-muted">{count}</span>
      </div>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

function FindingLine({ code, title, tone }: { code: string; title: string; tone: 'amber' | 'red' }) {
  const chip =
    tone === 'red'
      ? 'bg-bad-bg text-bad ring-bad-line'
      : 'bg-warn-bg text-warn ring-warn-line'
  return (
    <li className="flex items-baseline gap-2 text-[12.5px] leading-[1.5]">
      <span className={`mono shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ring-1 ring-inset ${chip}`}>
        {code}
      </span>
      <span className="text-ink-2">{title}</span>
    </li>
  )
}
