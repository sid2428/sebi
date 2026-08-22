import { AlertTriangle, CheckSquare, Square, ClipboardList } from 'lucide-react'
import { Chip, Ring } from '../ui'
import { MeterBar } from '../motion'
import { useStore } from '../../store'
import {
  buildEligibilityRules,
  buildDisclosureDashboard,
  buildActionChecklist,
  buildReadiness,
  type CheckStatus,
  type SectionBucket,
} from '../../report/model'

// Static, deterministic — built once from the domain data.

const CHECK: Record<CheckStatus, { label: string; cls: string; dot: string }> = {
  pass: { label: 'Pass', cls: 'bg-ok-bg text-ok ring-ok-line', dot: 'bg-ok' },
  warning: { label: 'Warning', cls: 'bg-warn-bg text-warn ring-warn-line', dot: 'bg-warn' },
  fail: { label: 'Fail', cls: 'bg-bad-bg text-bad ring-bad-line', dot: 'bg-bad' },
  na: { label: 'N/A', cls: 'bg-panel text-muted ring-line', dot: 'bg-faint' },
}

const BUCKET: Record<SectionBucket, { label: string; dot: string; bar: string; borderL: string }> = {
  completed: { label: 'Completed', dot: 'bg-ok', bar: 'bg-ok', borderL: 'border-l-ok' },
  partial: { label: 'Partially completed', dot: 'bg-info', bar: 'bg-info', borderL: 'border-l-info' },
  review: { label: 'Needs review', dot: 'bg-warn', bar: 'bg-warn', borderL: 'border-l-warn' },
  missing: { label: 'Missing', dot: 'bg-bad', bar: 'bg-bad', borderL: 'border-l-bad' },
}

const TH = 'px-3 py-2 text-[10px] font-bold uppercase tracking-[0.07em] text-muted'
const TD = 'px-3 py-2.5 align-top'

/**
 * IPO Readiness Assessment — helps a first-time SME promoter see whether
 * the draft is ready for merchant-banker review. Deterministic throughout;
 * no legal or listing-eligibility conclusions.
 */
export default function ReadinessAssessment() {
  const gapResolutions = useStore((s) => s.gapResolutions)
  const bankerReviewStarted = useStore((s) => s.bankerReviewStarted)
  const docRecords = useStore((s) => s.docRecords)

  const RULES = buildEligibilityRules()
  const DASHBOARD = buildDisclosureDashboard()
  const CHECKLIST = buildActionChecklist()
  const READINESS = buildReadiness()

  return (
    <section aria-label="IPO readiness assessment" className="card mb-5 overflow-hidden">
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <div className="eyebrow">IPO readiness assessment</div>
        <h2 className="mt-1.5 text-[20px] font-extrabold tracking-[-0.028em] text-ink">
          Is the draft ready for merchant-banker review?
        </h2>
        <p className="mt-1.5 max-w-[74ch] text-[13px] leading-[1.55] text-muted">
          Deterministic checks against NSE Emerge parameters and disclosure completeness — a readiness view
          for the issuer, not a legal opinion or an approval for listing.
        </p>
      </div>

      {/* A — Eligibility */}
      <Block
        tag="A"
        title="SME IPO eligibility"
        aside={
          <Chip tone="outline">
            {READINESS.checks.clear} of {READINESS.checks.applicable} clear · {READINESS.checks.attention} to
            address
          </Chip>
        }
      >
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Eligibility checks, scrollable">
          <table className="w-full min-w-[640px] border-collapse text-left text-[12.5px]">
            <thead>
              <tr className="border-b-2 border-line-strong">
                <th className={TH}>Rule</th>
                <th className={TH}>Current</th>
                <th className={TH}>Required</th>
                <th className={TH}>Status</th>
                <th className={TH}>Action required</th>
              </tr>
            </thead>
            <tbody>
              {RULES.map((r) => (
                <tr key={r.rule} className="border-b border-line">
                  <td className={TD}>
                    <div className="font-semibold text-ink">{r.rule}</div>
                    <div className="mt-0.5 text-[11px] leading-snug text-muted">{r.reason}</div>
                  </td>
                  <td className={`${TD} mono whitespace-nowrap text-ink-2`}>{r.current}</td>
                  <td className={`${TD} whitespace-nowrap text-muted`}>{r.threshold}</td>
                  <td className={TD}>
                    <StatusPill status={r.status} />
                  </td>
                  <td className={`${TD} text-ink-2`}>
                    {r.action === 'None required' || r.action === 'Not applicable' ? (
                      <span className="text-faint">{r.action === 'Not applicable' ? 'Not applicable' : '—'}</span>
                    ) : (
                      r.action
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>

      {/* B — Disclosure completeness */}
      <Block tag="B" title="Disclosure completeness" aside={<Chip tone="outline">Mean {READINESS.disclosure.mean}%</Chip>}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(['completed', 'partial', 'review', 'missing'] as SectionBucket[]).map((b) => (
            <div key={b} className="rounded-xl2 border border-line bg-panel/40 p-3">
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${BUCKET[b].dot}`} aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted">{BUCKET[b].label}</span>
              </div>
              <div className="mono mt-1 text-[22px] font-extrabold tracking-[-0.02em] text-ink">
                {DASHBOARD.counts[b]}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {DASHBOARD.sections.map((s) => (
            <div
              key={s.no}
              className={`flex items-start gap-3 rounded-lg border border-l-[3px] border-line bg-white px-3 py-2 ${BUCKET[s.bucket].borderL}`}
            >
              <span className="numeral mt-0.5 w-8 shrink-0 text-[12px]">{s.no}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[12px] font-semibold text-ink">{s.title}</span>
                  <span className="mono shrink-0 text-[11px] text-muted">{s.complete}%</span>
                </div>
                <MeterBar value={s.complete} height={5} barClassName={BUCKET[s.bucket].bar} className="mt-1.5" />
                {s.flag && (
                  <div className="mt-1 flex items-center gap-1 text-[10.5px] text-warn">
                    <AlertTriangle size={11} aria-hidden="true" /> {s.flag}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Block>

      {/* C — Missing information */}
      <Block tag="C" title="Missing information">
        <div className="rounded-xl2 border border-line bg-panel/30 p-4">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardList size={15} className="text-accent-600" aria-hidden="true" />
            <h4 className="text-[13px] font-extrabold text-ink">
              Information required before merchant-banker review
            </h4>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {CHECKLIST.map((g) => (
              <div key={g.key}>
                <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">{g.title}</div>
                <ul className="space-y-1.5">
                  {g.items.length === 0 && <li className="text-[12px] text-faint">None outstanding</li>}
                  {g.items.map((it, i) => {
                    const done = it.id ? !!gapResolutions[it.id] : it.done
                    return (
                      <li key={it.id ?? i} className="flex items-start gap-2 text-[12.5px] leading-snug">
                        {done ? (
                          <CheckSquare size={15} className="mt-0.5 shrink-0 text-ok" aria-hidden="true" />
                        ) : (
                          <Square size={15} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
                        )}
                        <span className={done ? 'text-muted line-through' : 'text-ink-2'}>
                          {it.code && <span className="mono mr-1 text-[11px] font-bold text-accent-700">{it.code}</span>}
                          {it.text}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Block>

      {/* D — Readiness recommendation */}
      <Block tag="D" title="Readiness recommendation">
        <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex items-center gap-4">
            <Ring value={READINESS.index} size={84} stroke={9} color="#3A63C4" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">Current readiness</div>
              <div className="text-[13px] font-semibold text-ink">Draft vs submission-ready</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {READINESS.components.map((c) => (
                  <span
                    key={c.label}
                    className="rounded-md bg-panel px-2 py-0.5 text-[10.5px] font-semibold text-muted ring-1 ring-inset ring-line"
                  >
                    {c.label} <b className="mono text-ink">{c.value}%</b>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl2 border-l-[3px] border-accent-400 bg-accent-50/50 px-4 py-3">
            <div className="mb-1.5">
              {bankerReviewStarted ? (
                <Chip tone="green">In merchant-banker review</Chip>
              ) : (
                <Chip tone="amber">
                  <AlertTriangle size={12} aria-hidden="true" /> Action required before review
                </Chip>
              )}
            </div>
            <p className="text-[13px] leading-[1.55] text-ink-2">{READINESS.recommendation}</p>
            <p className="mt-2 text-[11px] italic text-muted">
              Deterministic readiness assessment — not a legal opinion or an approval for listing.
            </p>
          </div>
        </div>
      </Block>
    </section>
  )
}

/* ---------- local primitives ---------- */

function Block({
  tag,
  title,
  aside,
  children,
}: {
  tag: string
  title: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-line px-5 py-5 last:border-b-0 sm:px-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.08em] text-ink-2">
          <span className="grid h-5 w-5 place-items-center rounded bg-accent-600 text-[11px] font-bold text-white">
            {tag}
          </span>
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </div>
  )
}

function StatusPill({ status }: { status: CheckStatus }) {
  const m = CHECK[status]
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset ${m.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} aria-hidden="true" />
      {m.label}
    </span>
  )
}
