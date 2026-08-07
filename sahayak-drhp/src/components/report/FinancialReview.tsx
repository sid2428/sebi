import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { Check, FileText, AlertTriangle } from 'lucide-react'
import { Chip } from '../ui'
import { useReducedMotion } from '../../lib/motion'
import { financialReview as fr, type CheckStatus } from '../../report/model'

// Series colours share the app's validated chart palette.
const SERIES = {
  revenue: '#2E4E9C',
  ebitda: '#7DB7F8',
  margin: '#0F7052',
  netWorth: '#2E4E9C',
  debt: '#A93A31',
}

const TOOLTIP = {
  cursor: { fill: 'rgba(91,141,239,.06)' },
  contentStyle: {
    borderRadius: 12,
    border: '1px solid #E2EAF4',
    boxShadow: '0 8px 24px rgba(22,35,58,.1)',
    fontSize: 12.5,
    fontFamily: 'Manrope, sans-serif',
    padding: '8px 12px',
  },
  labelStyle: { fontWeight: 800, color: '#16233A', marginBottom: 2 },
}

const CHECK_TONE: Record<CheckStatus, 'green' | 'amber' | 'red' | 'gray'> = {
  pass: 'green',
  warning: 'amber',
  fail: 'red',
  na: 'gray',
}
const CHECK_LABEL: Record<CheckStatus, string> = {
  pass: 'Verified',
  warning: 'Attention',
  fail: 'Fail',
  na: 'At source',
}

/**
 * Financial Review — an IPO-readiness read of the restated financials.
 * Every value derives from the audited figures in the model; ratios are
 * recomputed there and confirmed, and the one open inconsistency (F-01)
 * is shown plainly.
 */
export default function FinancialReview() {
  const reduced = useReducedMotion()

  return (
    <section aria-label="Financial review" className="card mb-5 overflow-hidden">
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <div className="eyebrow">Financial review</div>
        <h2 className="mt-1.5 text-[20px] font-extrabold tracking-[-0.028em] text-ink">
          Financial readiness — restated {fr.period}
        </h2>
        <p className="mt-1.5 max-w-[74ch] text-[13px] leading-[1.55] text-muted">
          Figures in {fr.currency}, from the restated audited statements. Ratios are recomputed from source;
          the single open item is a narrative-vs-audited mismatch.
        </p>
      </div>

      {/* Headline metrics */}
      <Part title="Headline metrics" aside={<Chip tone="blue"><FileText size={11} /> Audited {fr.period}</Chip>}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {fr.kpis.map((k) => (
            <div key={k.label} className="rounded-xl2 border border-line bg-panel/40 p-3.5">
              <div className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted">{k.label}</div>
              <div className="mono mt-1 text-[19px] font-extrabold tracking-[-0.02em] text-ink">{k.value}</div>
              <div className="mt-0.5 text-[11.5px] font-medium text-muted">{k.context}</div>
            </div>
          ))}
        </div>
      </Part>

      {/* Trends */}
      <Part title={`Trends · ${fr.period}`}>
        <div className="grid gap-4 md:grid-cols-2">
          <ChartCard
            title="Revenue & EBITDA"
            legend={[
              { label: 'Revenue', color: SERIES.revenue },
              { label: 'EBITDA', color: SERIES.ebitda },
              { label: 'EBITDA margin', color: SERIES.margin, line: true },
            ]}
          >
            <ComposedChart data={fr.trend} barGap={5} margin={{ left: -20, right: 6, top: 8, bottom: 0 }}>
              <XAxis dataKey="fy" tickLine={false} axisLine={{ stroke: '#E2EAF4' }} tick={{ fontSize: 12, fill: '#6C809E', fontWeight: 600 }} dy={4} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#93A5BF' }} width={44} />
              <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#93A5BF' }} width={34} unit="%" />
              <Tooltip {...TOOLTIP} formatter={(v: any, n: any) => (n === 'EBITDA margin' ? [`${v}%`, n] : [`₹${v} Cr`, n])} />
              <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]} fill={SERIES.revenue} isAnimationActive={!reduced} />
              <Bar dataKey="ebitda" name="EBITDA" radius={[4, 4, 0, 0]} fill={SERIES.ebitda} isAnimationActive={!reduced} />
              <Line yAxisId="right" type="monotone" dataKey="ebitdaMargin" name="EBITDA margin" stroke={SERIES.margin} strokeWidth={2} dot={{ r: 3, fill: SERIES.margin }} isAnimationActive={!reduced} />
            </ComposedChart>
          </ChartCard>

          <ChartCard
            title="Net worth & debt"
            legend={[
              { label: 'Net worth', color: SERIES.netWorth },
              { label: 'Debt', color: SERIES.debt, line: true },
            ]}
          >
            <ComposedChart data={fr.trend} margin={{ left: -20, right: 6, top: 8, bottom: 0 }}>
              <XAxis dataKey="fy" tickLine={false} axisLine={{ stroke: '#E2EAF4' }} tick={{ fontSize: 12, fill: '#6C809E', fontWeight: 600 }} dy={4} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#93A5BF' }} width={44} />
              <Tooltip {...TOOLTIP} formatter={(v: any, n: any) => [`₹${v} Cr`, n]} />
              <Bar dataKey="netWorth" name="Net worth" radius={[4, 4, 0, 0]} fill={SERIES.netWorth} isAnimationActive={!reduced} />
              <Line type="monotone" dataKey="debt" name="Debt" stroke={SERIES.debt} strokeWidth={2} dot={{ r: 3, fill: SERIES.debt }} isAnimationActive={!reduced} />
            </ComposedChart>
          </ChartCard>
        </div>
      </Part>

      {/* Key ratios */}
      <Part title="Key ratios">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {fr.ratios.map((r) => (
            <div key={r.label} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-white px-3 py-2.5">
              <div className="min-w-0">
                <div className="truncate text-[11px] text-muted">{r.label}</div>
                <div className="mono text-[16px] font-extrabold tracking-[-0.02em] text-ink">{r.value}</div>
              </div>
              {r.check === 'yes' ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-ok" title="Recomputed from audited figures">
                  <Check size={12} aria-hidden="true" /> Verified
                </span>
              ) : (
                <span className="shrink-0 text-[10px] font-bold text-muted">At source</span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-snug text-muted">
          “Verified” ratios recompute from the restated audited figures. “At source” items lack the
          underlying components in the dataset and must be confirmed against the audited accounts.
        </p>
      </Part>

      {/* Consistency checks */}
      <Part title="Consistency checks" aside={<Chip tone="amber">1 item to reconcile</Chip>}>
        <div className="mb-3 rounded-xl2 border border-warn-line bg-warn-bg/60 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <AlertTriangle size={14} className="text-warn" aria-hidden="true" />
            <b className="text-[13px] text-ink">{fr.inconsistency.title}</b>
            <span className="mono text-[10px] font-bold text-accent-700">{fr.inconsistency.code}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-[12px]">
            <span className="text-muted">Narrative <b className="mono text-ink">{fr.inconsistency.narrative}</b></span>
            <span className="text-muted">Restated audited <b className="mono text-ink">{fr.inconsistency.audited}</b></span>
            <span className="text-muted">Difference <b className="mono text-bad">{fr.inconsistency.deltaCr} ({fr.inconsistency.deltaPct})</b></span>
          </div>
          <p className="mt-1.5 text-[11.5px] leading-snug text-muted">
            Reconcile the §VII narrative to the audited figure, and refresh any ratios that cite it, before
            merchant-banker review.
          </p>
        </div>

        <div>
          {fr.checks.map((c) => (
            <div key={c.label} className="flex items-start justify-between gap-3 border-b border-line py-2.5 last:border-b-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-semibold text-ink">{c.label}</span>
                  {c.ref && <span className="mono text-[10px] font-bold text-accent-700">{c.ref}</span>}
                </div>
                <div className="mt-0.5 text-[11.5px] leading-snug text-muted">{c.detail}</div>
              </div>
              <Chip tone={CHECK_TONE[c.status]} className="shrink-0">
                {CHECK_LABEL[c.status]}
              </Chip>
            </div>
          ))}
        </div>
      </Part>
    </section>
  )
}

/* ---------- local primitives ---------- */

function Part({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="border-b border-line px-5 py-5 last:border-b-0 sm:px-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-ink-2">{title}</h3>
        {aside}
      </div>
      {children}
    </div>
  )
}

function ChartCard({
  title,
  legend,
  children,
}: {
  title: string
  legend: { label: string; color: string; line?: boolean }[]
  children: React.ReactElement
}) {
  return (
    <div className="rounded-xl2 border border-line bg-white p-4">
      <b className="text-[13px] font-bold text-ink">{title}</b>
      <div className="mt-2 flex flex-wrap items-center gap-4">
        {legend.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-2">
            <span className={s.line ? 'h-0.5 w-3.5 rounded' : 'h-2.5 w-2.5 rounded-[2px]'} style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <div className="mt-2">
        <ResponsiveContainer width="100%" height={200}>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
