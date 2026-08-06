import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie,
} from 'recharts'
import { ArrowRight, Check, FileText, Info } from 'lucide-react'
import { useStore } from '../../store'
import { Chip } from '../../components/ui'
import { COMPANY, FINANCIALS, RATIOS, CAP_TABLE, ISSUE } from '../../data/mock'

export default function CompanyBase() {
  const goStep = useStore((s) => s.goStep)
  const revData = FINANCIALS.map((f) => ({ fy: f.fy, Revenue: +(f.revenue / 100).toFixed(2), PAT: +(f.pat / 100).toFixed(2) }))

  return (
    <div>
      <div className="chip bg-info-bg text-[#1e56b8] mb-3"><Info size={13} /> Auto-extracted · fully editable</div>
      <h2 className="text-[26px] tracking-[-0.02em] font-extrabold mb-1.5">Company Base</h2>
      <p className="text-muted text-[15px] mb-6 max-w-[560px]">
        This is the foundation every DRHP section builds on. We assembled it from your website and MCA
        master data — verify it and we’ll carry it forward.
      </p>

      {/* overview banner */}
      <div className="flex items-center gap-6 rounded-[14px] px-7 py-6 text-[#eaf0fb] mb-6 shadow-md2"
        style={{ background: 'linear-gradient(120deg,#0b1e3f,#0f2a54)' }}>
        <div className="w-16 h-16 rounded-2xl grid place-items-center text-white font-extrabold text-2xl shrink-0"
          style={{ background: 'linear-gradient(135deg,#1e6f4e,#2fae74)' }}>{COMPANY.logoLetters}</div>
        <div className="flex-1">
          <h3 className="text-[19px] text-white font-bold">{COMPANY.legalName}</h3>
          <p className="text-[#adbfdd] text-[13.5px] max-w-[460px] mt-1 leading-relaxed">{COMPANY.about}</p>
        </div>
        <div className="flex gap-6 text-center shrink-0">
          <div><b className="text-[24px] text-white block leading-none mono">{RATIOS.revenueCagr}</b><span className="text-[11.5px] text-[#93a6c6]">Rev. CAGR</span></div>
          <div><b className="text-[24px] text-white block leading-none mono">₹{ISSUE.sizeCr}Cr</b><span className="text-[11.5px] text-[#93a6c6]">Fresh issue</span></div>
        </div>
      </div>

      {/* identity + business grid */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Card title="Corporate Identity" src="Incorp. · MCA">
          {[
            ['Legal name', COMPANY.legalName],
            ['CIN', COMPANY.cin],
            ['Incorporated', COMPANY.incorporated],
            ['Registrar', COMPANY.roc],
            ['PAN', COMPANY.pan],
            ['GSTIN', COMPANY.gstin],
          ].map(([k, v]) => <Field key={k} k={k} v={v} />)}
        </Card>
        <Card title="Business & Offer" src="Website · Resolutions">
          {[
            ['Sector', COMPANY.sector],
            ['Registered office', COMPANY.regOffice],
            ['Employees', String(COMPANY.employees)],
            ['Target platform', COMPANY.targetExchange],
            ['Issue type', ISSUE.type],
            ['Price band', ISSUE.priceBand],
          ].map(([k, v]) => <Field key={k} k={k} v={v} />)}
        </Card>
      </div>

      {/* charts */}
      <div className="grid md:grid-cols-[1.4fr_1fr] gap-4 mb-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <b className="text-[15px]">Revenue & PAT · ₹ Cr</b>
            <Chip tone="blue"><FileText size={12} /> Audited FY21–23</Chip>
          </div>
          <p className="text-[12.5px] text-muted mb-3">Three-year restated performance</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={revData} barGap={6} margin={{ left: -18, right: 4, top: 6 }}>
              <XAxis dataKey="fy" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6b7c96' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#6b7c96' }} />
              <Tooltip cursor={{ fill: 'rgba(15,42,84,.05)' }} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f2', fontSize: 12 }} />
              <Bar dataKey="Revenue" radius={[5, 5, 0, 0]} fill="#0f2a54" />
              <Bar dataKey="PAT" radius={[5, 5, 0, 0]} fill="#d4af5f" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <b className="text-[15px]">Shareholding</b>
            <Chip tone="blue"><FileText size={12} /> Cap Table</Chip>
          </div>
          <p className="text-[12.5px] text-muted mb-2">Pre-issue</p>
          <div className="flex items-center gap-3">
            <ResponsiveContainer width={128} height={128}>
              <PieChart>
                <Pie data={CAP_TABLE} dataKey="pct" nameKey="holder" innerRadius={38} outerRadius={62} paddingAngle={2} stroke="none">
                  {CAP_TABLE.map((c) => <Cell key={c.holder} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f2', fontSize: 12 }} formatter={(v: any) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1">
              {CAP_TABLE.map((c) => (
                <div key={c.holder} className="flex items-center gap-2 text-[11.5px]">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: c.color }} />
                  <span className="flex-1 truncate text-ink-2">{c.holder}</span>
                  <b className="mono">{c.pct}%</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ratios */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-7">
        {[
          ['EBITDA margin', RATIOS.ebitdaMargin], ['PAT margin', RATIOS.patMargin], ['Return on equity', RATIOS.roe],
          ['Debt / equity', RATIOS.debtEquity], ['Current ratio', RATIOS.currentRatio], ['Revenue CAGR', RATIOS.revenueCagr],
        ].map(([k, v]) => (
          <div key={k} className="card p-4">
            <div className="text-[12px] text-muted">{k}</div>
            <div className="text-[20px] font-extrabold mono mt-0.5">{v}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center flex-wrap gap-3 border-t border-line pt-6">
        <div className="flex items-center gap-2 text-[13.5px] text-ok font-semibold"><Check size={16} /> Base confirmed & saved</div>
        <button onClick={() => goStep('kyc')} className="btn btn-gold btn-lg">Start verification <ArrowRight size={18} /></button>
      </div>
    </div>
  )
}

function Card({ title, src, children }: { title: string; src: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <b className="text-[15px]">{title}</b>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-info bg-info-bg px-2 py-1 rounded-md">
          <FileText size={11} /> {src}
        </span>
      </div>
      {children}
    </div>
  )
}
function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 py-2 border-b border-dashed border-line last:border-0 text-[14px]">
      <span className="text-muted">{k}</span>
      <span className="font-semibold text-right mono">{v}</span>
    </div>
  )
}
