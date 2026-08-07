import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie,
} from 'recharts'
import { ArrowRight, Check, FileText, Info } from 'lucide-react'
import { useStore } from '../../store'
import { Chip } from '../../components/ui'
import { COMPANY, FINANCIALS, RATIOS, CAP_TABLE, ISSUE } from '../../data/mock'
import { Reveal, Stagger, StaggerItem } from '../../components/motion'
import { useReducedMotion } from '../../lib/motion'

// Two series, validated: both clear 3:1 on white and separate under
// every CVD simulation. Identity is reinforced by the legend below.
const SERIES = { revenue: '#2E4E9C', pat: '#5B8DEF' }

export default function CompanyBase() {
  const goStep = useStore((s) => s.goStep)
  const reduced = useReducedMotion()
  const revData = FINANCIALS.map((f) => ({ fy: f.fy, Revenue: +(f.revenue / 100).toFixed(2), PAT: +(f.pat / 100).toFixed(2) }))

  return (
    <div>
      <Chip tone="blue" className="mb-3">
        <Info size={12} /> Auto-extracted · fully editable
      </Chip>
      <h2 className="text-[27px] font-extrabold tracking-[-0.03em]">Company base</h2>
      <p className="mt-2 max-w-[58ch] text-[14.5px] leading-[1.62] text-ink-3">
        The foundation every DRHP section builds on, assembled from your website and MCA master data.
        Confirm it and we carry it forward.
      </p>

      {/* Issuer banner */}
      <Reveal shape="settle" className="mt-6">
        <div
          className="flex flex-wrap items-center gap-6 rounded-3xl2 px-6 py-6 text-[#DCE6F6] shadow-lg2 sm:px-7"
          style={{ background: 'linear-gradient(148deg,#1C2C47,#16233A 55%,#1F3563)' }}
        >
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl2 text-[20px] font-extrabold text-white"
            style={{ background: 'linear-gradient(140deg,#5B8DEF,#2E4E9C)' }}
          >
            {COMPANY.logoLetters}
          </span>
          <div className="min-w-[240px] flex-1">
            <h3 className="text-[18px] font-bold text-white">{COMPANY.legalName}</h3>
            <p className="mt-1.5 max-w-[52ch] text-[13px] leading-[1.6] text-[#A7BCDD]">{COMPANY.about}</p>
          </div>
          <div className="flex shrink-0 gap-7">
            <div>
              <b className="mono block text-[22px] font-extrabold leading-none text-white">{RATIOS.revenueCagr}</b>
              <span className="text-[11px] text-[#8299BC]">Revenue CAGR</span>
            </div>
            <div>
              <b className="mono block text-[22px] font-extrabold leading-none text-white">₹{ISSUE.sizeCr} Cr</b>
              <span className="text-[11px] text-[#8299BC]">Fresh issue</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Identity + business */}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Reveal shape="settle">
          <FieldCard title="Corporate identity" src="Incorporation · MCA">
            {[
              ['Legal name', COMPANY.legalName],
              ['CIN', COMPANY.cin],
              ['Incorporated', COMPANY.incorporated],
              ['Registrar', COMPANY.roc],
              ['PAN', COMPANY.pan],
              ['GSTIN', COMPANY.gstin],
            ].map(([k, v]) => <Field key={k} k={k} v={v} />)}
          </FieldCard>
        </Reveal>
        <Reveal shape="settle" delay={0.06}>
          <FieldCard title="Business & offer" src="Website · Resolutions">
            {[
              ['Sector', COMPANY.sector],
              ['Registered office', COMPANY.regOffice],
              ['Employees', String(COMPANY.employees)],
              ['Target platform', COMPANY.targetExchange],
              ['Issue type', ISSUE.type],
              ['Price band', ISSUE.priceBand],
            ].map(([k, v]) => <Field key={k} k={k} v={v} />)}
          </FieldCard>
        </Reveal>
      </div>

      {/* Charts */}
      <div className="mt-4 grid gap-4 md:grid-cols-[1.35fr_1fr]">
        <Reveal shape="settle">
          <div className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <b className="text-[15px] font-bold">Revenue &amp; PAT</b>
                <p className="mt-0.5 text-[12px] text-muted">Three-year restated performance · ₹ crore</p>
              </div>
              <Chip tone="blue">
                <FileText size={11} /> Audited FY21–23
              </Chip>
            </div>

            {/* Legend — two series always get one. */}
            <div className="mt-3 flex items-center gap-4">
              {[
                { label: 'Revenue', color: SERIES.revenue },
                { label: 'PAT', color: SERIES.pat },
              ].map((s) => (
                <span key={s.label} className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-2">
                  <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: s.color }} />
                  {s.label}
                </span>
              ))}
            </div>

            <div className="mt-2">
              <ResponsiveContainer width="100%" height={196}>
                <BarChart data={revData} barGap={5} margin={{ left: -20, right: 6, top: 8, bottom: 0 }}>
                  <XAxis
                    dataKey="fy"
                    tickLine={false}
                    axisLine={{ stroke: '#E2EAF4' }}
                    tick={{ fontSize: 12, fill: '#6C809E', fontWeight: 600 }}
                    dy={4}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#93A5BF' }} width={46} />
                  <Tooltip
                    cursor={{ fill: 'rgba(91,141,239,.06)' }}
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E2EAF4',
                      boxShadow: '0 8px 24px rgba(22,35,58,.1)',
                      fontSize: 12.5,
                      fontFamily: 'Manrope, sans-serif',
                      padding: '8px 12px',
                    }}
                    labelStyle={{ fontWeight: 800, color: '#16233A', marginBottom: 2 }}
                    formatter={(v: any, n: any) => [`₹${v} Cr`, n]}
                  />
                  {/* 4px rounded data-ends, anchored to the baseline. */}
                  <Bar dataKey="Revenue" radius={[4, 4, 0, 0]} fill={SERIES.revenue} isAnimationActive={!reduced} />
                  <Bar dataKey="PAT" radius={[4, 4, 0, 0]} fill={SERIES.pat} isAnimationActive={!reduced} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Reveal>

        <Reveal shape="settle" delay={0.06}>
          <div className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <b className="text-[15px] font-bold">Shareholding</b>
                <p className="mt-0.5 text-[12px] text-muted">Pre-issue</p>
              </div>
              <Chip tone="blue">
                <FileText size={11} /> Cap table
              </Chip>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <ResponsiveContainer width={118} height={118}>
                <PieChart>
                  <Pie
                    data={CAP_TABLE}
                    dataKey="pct"
                    nameKey="holder"
                    innerRadius={35}
                    outerRadius={57}
                    paddingAngle={2}
                    stroke="#fff"
                    strokeWidth={2}
                    isAnimationActive={!reduced}
                  >
                    {CAP_TABLE.map((c) => <Cell key={c.holder} fill={c.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E2EAF4',
                      boxShadow: '0 8px 24px rgba(22,35,58,.1)',
                      fontSize: 12.5,
                      fontFamily: 'Manrope, sans-serif',
                    }}
                    formatter={(v: any) => `${v}%`}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* The legend carries identity; colour only carries order. */}
              <ul className="min-w-0 flex-1 space-y-1">
                {CAP_TABLE.map((c) => (
                  <li key={c.holder} className="flex items-center gap-2 text-[11.5px]">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: c.color }} />
                    <span className="min-w-0 flex-1 truncate text-ink-2">{c.holder}</span>
                    <b className="mono shrink-0 text-ink">{c.pct}%</b>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Ratios */}
      <Stagger className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3" each={0.05}>
        {[
          ['EBITDA margin', RATIOS.ebitdaMargin], ['PAT margin', RATIOS.patMargin], ['Return on equity', RATIOS.roe],
          ['Debt / equity', RATIOS.debtEquity], ['Current ratio', RATIOS.currentRatio], ['Revenue CAGR', RATIOS.revenueCagr],
        ].map(([k, v]) => (
          <StaggerItem key={k} shape="settle" className="card p-4">
            <div className="text-[11.5px] font-semibold text-muted">{k}</div>
            <div className="mono mt-1 text-[21px] font-extrabold tracking-[-0.03em] text-ink">{v}</div>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <span className="flex items-center gap-2 text-[13.5px] font-bold text-ok">
          <Check size={16} /> Base confirmed and saved
        </span>
        <button onClick={() => goStep('kyc')} className="btn btn-gold btn-lg">
          Start verification <ArrowRight size={17} />
        </button>
      </div>
    </div>
  )
}

function FieldCard({ title, src, children }: { title: string; src: string; children: React.ReactNode }) {
  return (
    <div className="card h-full p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <b className="text-[15px] font-bold">{title}</b>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-50 px-2 py-1 text-[11px] font-bold text-accent-700">
          <FileText size={11} /> {src}
        </span>
      </div>
      <dl>{children}</dl>
    </div>
  )
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-dashed border-line py-2.5 text-[13.5px] last:border-0">
      <dt className="shrink-0 text-muted">{k}</dt>
      <dd className="mono text-right font-bold text-ink">{v}</dd>
    </div>
  )
}
