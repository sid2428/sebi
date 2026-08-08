import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie,
} from 'recharts'
import { Check, FileText, Info, Pencil, Save, X, Paperclip } from 'lucide-react'
import { useStore } from '../../store'
import { Chip } from '../../components/ui'
import { ActionButton, Disclose, ResultNote, StageBlock, StageFooter, StageHeader } from '../../components/stage'
import { COMPANY, FINANCIALS, RATIOS, CAP_TABLE, ISSUE } from '../../data/mock'
import { Reveal, StaggerItem, Stagger } from '../../components/motion'
import { useSimulatedAction, formatBytes } from '../../lib/actions'
import { useReducedMotion } from '../../lib/motion'

// Two series, validated: both clear 3:1 on white and separate under
// every CVD simulation. Identity is reinforced by the legend below.
const SERIES = { revenue: '#2E4E9C', pat: '#5B8DEF' }

type Field = { key: string; label: string; value: string; hint?: string }

const IDENTITY_FIELDS: Field[] = [
  { key: 'legalName', label: 'Legal name', value: COMPANY.legalName },
  { key: 'cin', label: 'CIN', value: COMPANY.cin, hint: 'The registration number issued when the company was incorporated.' },
  { key: 'incorporated', label: 'Incorporated', value: COMPANY.incorporated },
  { key: 'roc', label: 'Registrar', value: COMPANY.roc },
  { key: 'pan', label: 'PAN', value: COMPANY.pan },
  { key: 'gstin', label: 'GSTIN', value: COMPANY.gstin },
]

const BUSINESS_FIELDS: Field[] = [
  { key: 'sector', label: 'Sector', value: COMPANY.sector },
  { key: 'regOffice', label: 'Registered office', value: COMPANY.regOffice },
  { key: 'employees', label: 'Employees', value: String(COMPANY.employees) },
  { key: 'targetExchange', label: 'Target platform', value: COMPANY.targetExchange },
  { key: 'issueType', label: 'Issue type', value: ISSUE.type },
  { key: 'priceBand', label: 'Price band', value: ISSUE.priceBand, hint: 'The indicative range investors may bid within.' },
]

export default function CompanyBase() {
  const goStep = useStore((s) => s.goStep)
  const completeStep = useStore((s) => s.completeStep)
  const baseConfirmed = useStore((s) => s.baseConfirmed)
  const setBaseConfirmed = useStore((s) => s.setBaseConfirmed)
  const companyEdits = useStore((s) => s.companyEdits)
  const uploadedDocs = useStore((s) => s.uploadedDocs)
  const showToast = useStore((s) => s.showToast)
  const reduced = useReducedMotion()
  const confirm = useSimulatedAction({ ms: 900 })

  const editedCount = Object.keys(companyEdits).length
  const revData = FINANCIALS.map((f) => ({
    fy: f.fy,
    Revenue: +(f.revenue / 100).toFixed(2),
    PAT: +(f.pat / 100).toFixed(2),
  }))

  return (
    <div>
      <StageHeader
        step="base"
        eyebrow={
          <Chip tone="blue">
            <Info size={12} /> Auto-extracted from your website and MCA data
          </Chip>
        }
        why="Everything the draft says about your company is built on these details, so they have to be right before anything else runs."
        todo="Read through the two detail cards. Correct anything that is wrong using Edit, then confirm the base to unlock verification."
      />

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
            <h2 className="text-[18px] font-bold text-white">
              {companyEdits.legalName ?? COMPANY.legalName}
            </h2>
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

      {/* ===== Main task ===== */}
      <StageBlock
        title="Check these details"
        hint="Each card names the document it came from. Edit anything that does not match your records."
        aside={
          editedCount > 0 ? (
            <Chip tone="blue">
              {editedCount} field{editedCount === 1 ? '' : 's'} edited
            </Chip>
          ) : undefined
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <EditableCard title="Corporate identity" src="Incorporation · MCA" fields={IDENTITY_FIELDS} />
          <EditableCard title="Business & offer" src="Website · Resolutions" fields={BUSINESS_FIELDS} />
        </div>
      </StageBlock>

      {/* ===== Supporting detail, folded away by default ===== */}
      <StageBlock
        title="Supporting information"
        hint="Already extracted and carried into the draft. Open a panel only if you want to check it."
      >
        <div className="space-y-3">
          <Disclose
            summary="Financial performance, FY21 to FY23"
            meta="Revenue and profit after tax from your audited statements"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <b className="text-[15px] font-bold">Revenue &amp; PAT</b>
                <p className="mt-0.5 text-[12px] text-muted">Three-year restated performance · ₹ crore</p>
              </div>
              <Chip tone="blue">
                <FileText size={11} /> Audited FY21–23
              </Chip>
            </div>

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
                  <Bar dataKey="Revenue" radius={[4, 4, 0, 0]} fill={SERIES.revenue} isAnimationActive={!reduced} />
                  <Bar dataKey="PAT" radius={[4, 4, 0, 0]} fill={SERIES.pat} isAnimationActive={!reduced} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Disclose>

          <Disclose summary="Who owns the company today" meta="Pre-issue shareholding across six holders">
            <div className="flex flex-wrap items-center gap-4">
              {/* Recharts gives each sector role="img" with no name. The
                  legend beside it already states every holder and their
                  percentage, so the donut is the redundant presentation. */}
              <div aria-hidden="true" className="shrink-0">
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
              </div>

              <ul className="min-w-[220px] flex-1 space-y-1.5">
                {CAP_TABLE.map((c) => (
                  <li key={c.holder} className="flex items-center gap-2 text-[12.5px]">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: c.color }} />
                    <span className="min-w-0 flex-1 truncate text-ink-2">
                      {c.holder} <span className="text-muted">· {c.role}</span>
                    </span>
                    <b className="mono shrink-0 text-ink">{c.pct}%</b>
                  </li>
                ))}
              </ul>
            </div>
          </Disclose>

          <Disclose summary="Key ratios" meta="Six figures the eligibility check will test against">
            <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-3" each={0.04}>
              {[
                ['EBITDA margin', RATIOS.ebitdaMargin], ['PAT margin', RATIOS.patMargin], ['Return on equity', RATIOS.roe],
                ['Debt / equity', RATIOS.debtEquity], ['Current ratio', RATIOS.currentRatio], ['Revenue CAGR', RATIOS.revenueCagr],
              ].map(([k, v]) => (
                <StaggerItem key={k} shape="fade" className="rounded-xl2 border border-line bg-panel/60 p-3.5">
                  <div className="text-[11.5px] font-semibold text-muted">{k}</div>
                  <div className="mono mt-1 text-[20px] font-extrabold tracking-[-0.03em] text-ink">{v}</div>
                </StaggerItem>
              ))}
            </Stagger>
          </Disclose>

          {uploadedDocs.length > 0 && (
            <Disclose
              summary={`Documents you supplied (${uploadedDocs.length})`}
              meta="Used as source files behind the sections they feed"
            >
              <ul className="space-y-2">
                {uploadedDocs.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center gap-3 rounded-xl2 border border-line bg-white px-3.5 py-2.5 text-[13px]"
                  >
                    <Paperclip size={14} className="shrink-0 text-accent-600" />
                    <span className="min-w-0 flex-1 truncate font-semibold text-ink-2">{doc.name}</span>
                    <span className="mono shrink-0 text-[11.5px] text-muted">{formatBytes(doc.size)}</span>
                    <Chip tone="green">Read</Chip>
                  </li>
                ))}
              </ul>
            </Disclose>
          )}
        </div>
      </StageBlock>

      {/* ===== Confirmation gate ===== */}
      <StageBlock title="Confirm the base">
        <div
          className={`card flex flex-wrap items-center gap-4 p-5 ${
            baseConfirmed ? 'border-ok-line bg-ok-bg/40' : ''
          }`}
        >
          <div className="min-w-[240px] flex-1">
            <b className="block text-[14.5px] font-bold">
              {baseConfirmed ? 'Base confirmed and saved' : 'Is everything above correct?'}
            </b>
            <p className="mt-1 max-w-[58ch] text-[13px] leading-[1.6] text-muted">
              {baseConfirmed
                ? 'These details are now the foundation for every DRHP section. You can still come back and edit them.'
                : 'Confirming locks these details in as the foundation for the draft. You can change them later if something moves.'}
            </p>
          </div>
          {baseConfirmed ? (
            <button
              onClick={() => {
                setBaseConfirmed(false)
                confirm.reset()
                showToast('Base unlocked for editing')
              }}
              className="btn btn-ghost shrink-0"
            >
              Reopen for editing
            </button>
          ) : (
            <ActionButton
              state={confirm.state}
              idle="Confirm these details"
              running="Saving…"
              done="Confirmed"
              icon={<Check size={16} />}
              className="btn btn-gold shrink-0"
              onClick={() =>
                confirm.run({
                  onComplete: () => {
                    setBaseConfirmed(true)
                    showToast('Company base confirmed')
                  },
                })
              }
            />
          )}
        </div>
      </StageBlock>

      <StageFooter
        step="base"
        canContinue={baseConfirmed}
        blockedReason="Confirm the company base first — verification runs against these details."
        continueLabel="Start verification"
        note={baseConfirmed ? 'Next: we verify your particulars area by area.' : undefined}
        onContinue={() => {
          completeStep('base')
          goStep('kyc')
        }}
      />
    </div>
  )
}

/* ============================================================
   An editable detail card
   ============================================================ */

function EditableCard({ title, src, fields }: { title: string; src: string; fields: Field[] }) {
  const companyEdits = useStore((s) => s.companyEdits)
  const setCompanyField = useStore((s) => s.setCompanyField)
  const showToast = useStore((s) => s.showToast)
  const save = useSimulatedAction({ ms: 700, holdMs: 2400 })

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const current = (field: Field) => companyEdits[field.key] ?? field.value

  function startEditing() {
    setDraft(Object.fromEntries(fields.map((f) => [f.key, current(f)])))
    setErrors({})
    setEditing(true)
  }

  function commit() {
    const next: Record<string, string> = {}
    fields.forEach((f) => {
      if (!draft[f.key]?.trim()) next[f.key] = `${f.label} cannot be empty.`
    })
    setErrors(next)
    if (Object.keys(next).length) return

    save.run({
      onComplete: () => {
        fields.forEach((f) => {
          const value = draft[f.key].trim()
          if (value !== current(f)) setCompanyField(f.key, value)
        })
        setEditing(false)
        showToast(`${title} saved`)
      },
    })
  }

  return (
    <div className="card flex h-full flex-col p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <b className="text-[15px] font-bold">{title}</b>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-50 px-2 py-1 text-[11px] font-bold text-accent-700">
            <FileText size={11} /> {src}
          </span>
          {!editing && (
            <button onClick={startEditing} className="btn btn-ghost btn-sm">
              <Pencil size={13} /> Edit
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="flex flex-1 flex-col">
          <div className="space-y-3">
            {fields.map((f) => {
              const errorId = `${f.key}-error`
              return (
                <div key={f.key}>
                  <label htmlFor={f.key} className="block text-[12px] font-semibold text-muted">
                    {f.label}
                  </label>
                  <input
                    id={f.key}
                    value={draft[f.key] ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                    aria-invalid={!!errors[f.key]}
                    aria-describedby={errors[f.key] ? errorId : undefined}
                    className={`mt-1 w-full rounded-xl2 border bg-white px-3 py-2 text-[13.5px] outline-none transition-colors duration-200 focus:border-accent-400 ${
                      errors[f.key] ? 'border-bad' : 'border-line-strong'
                    }`}
                  />
                  {errors[f.key] && (
                    <p id={errorId} role="alert" className="mt-1 text-[11.5px] font-semibold text-bad">
                      {errors[f.key]}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <ActionButton
              state={save.state}
              idle="Save changes"
              running="Saving…"
              done="Saved"
              icon={<Save size={14} />}
              className="btn btn-gold btn-sm"
              onClick={commit}
            />
            <button
              onClick={() => {
                setEditing(false)
                setErrors({})
              }}
              className="btn btn-ghost btn-sm"
            >
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <dl className="flex-1">
            {fields.map((f) => {
              const edited = companyEdits[f.key] !== undefined
              return (
                <div
                  key={f.key}
                  className="flex justify-between gap-4 border-b border-dashed border-line py-2.5 text-[13.5px] last:border-0"
                >
                  <dt className="shrink-0 text-muted">
                    {f.label}
                    {f.hint && (
                      <span className="mt-0.5 block max-w-[24ch] text-[11px] leading-snug text-faint">{f.hint}</span>
                    )}
                  </dt>
                  <dd className="mono text-right font-bold text-ink">
                    {current(f)}
                    {edited && (
                      <span className="ml-2 rounded bg-accent-50 px-1.5 py-0.5 text-[10px] font-bold text-accent-700">
                        edited
                      </span>
                    )}
                  </dd>
                </div>
              )
            })}
          </dl>
          {save.state === 'done' && (
            <ResultNote className="mt-3" tone="ok">
              Changes saved to the draft.
            </ResultNote>
          )}
        </>
      )}
    </div>
  )
}
