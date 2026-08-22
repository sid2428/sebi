import { ArrowRight, Check, AlertTriangle } from 'lucide-react'
import { Chip } from '../ui'
import { governance as g, type CheckStatus } from '../../report/model'

const TH = 'px-3 py-2 text-[10px] font-bold uppercase tracking-[0.07em] text-muted'
const TD = 'px-3 py-2.5 align-top text-[12.5px]'

const DISC_TONE: Record<CheckStatus, 'green' | 'amber' | 'red' | 'gray'> = {
  pass: 'green',
  warning: 'amber',
  fail: 'red',
  na: 'gray',
}
const DISC_LABEL: Record<CheckStatus, string> = {
  pass: 'Complete',
  warning: 'Partial',
  fail: 'Missing',
  na: 'Pending',
}

/**
 * Governance & Regulatory Disclosures — promoters, board, shareholding,
 * litigation, related-party and regulatory disclosures, tracked by
 * completeness. Tables and status badges over narrative.
 */
export default function GovernanceDisclosures() {
  return (
    <section aria-label="Governance and regulatory disclosures" className="card mb-5 overflow-hidden">
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <div className="eyebrow">Governance &amp; regulatory</div>
        <h2 className="mt-1.5 text-[20px] font-extrabold tracking-[-0.028em] text-ink">
          Governance &amp; regulatory disclosures
        </h2>
        <p className="mt-1.5 max-w-[74ch] text-[13px] leading-[1.55] text-muted">
          Promoters, board, shareholding, litigation, related-party and regulatory disclosures — tracked by
          completeness, not narrative.
        </p>
      </div>

      {/* Promoters */}
      <Part title="Promoters">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-[12px]">
          <Stat label="Pre-issue" value={`${g.promoterPrePct}%`} />
          <ArrowRight size={14} className="text-muted" aria-hidden="true" />
          <Stat label="Post-issue" value={`${g.promoterPostPct}%`} />
          <span className="text-muted">Requirement: {g.lockIn}</span>
        </div>
        <Table head={['Promoter', 'Role', 'Pre-issue holding']}>
          {g.promoters.map((p) => (
            <tr key={p.name} className="border-b border-line last:border-b-0">
              <td className={`${TD} font-semibold text-ink`}>{p.name}</td>
              <td className={`${TD} text-ink-2`}>{p.role}</td>
              <td className={`${TD} mono text-right text-ink-2`}>{p.preIssuePct.toFixed(1)}%</td>
            </tr>
          ))}
        </Table>
      </Part>

      {/* Board of directors */}
      <Part
        title="Board of directors"
        aside={
          <span className="flex flex-wrap items-center gap-1.5">
            <Chip tone="gray">{g.board.executive} executive</Chip>
            <Chip tone="gray">{g.board.independent} independent</Chip>
            {g.board.dinPending > 0 && <Chip tone="amber">{g.board.dinPending} DIN pending</Chip>}
          </span>
        }
      >
        <Table head={['Name', 'Designation', 'On board', 'DIN']}>
          {g.board.rows.map((d) => (
            <tr key={d.name} className="border-b border-line last:border-b-0">
              <td className={`${TD} font-semibold text-ink`}>{d.name}</td>
              <td className={`${TD} text-ink-2`}>{d.role}</td>
              <td className={`${TD} text-muted`}>{d.since}</td>
              <td className={TD}>
                {d.dinVerified ? (
                  <Chip tone="green"><Check size={11} aria-hidden="true" /> Verified</Chip>
                ) : (
                  <Chip tone="amber"><AlertTriangle size={11} aria-hidden="true" /> Pending</Chip>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Part>

      {/* Shareholding */}
      <Part
        title="Shareholding (pre-issue)"
        aside={
          <span className="flex flex-wrap items-center gap-1.5">
            {g.shareholding.groups.map((gr) => (
              <Chip key={gr.group} tone="outline">
                {gr.group} {gr.pct}%
              </Chip>
            ))}
          </span>
        }
      >
        <Table head={['Holder', 'Category', 'Holding']}>
          {g.shareholding.rows.map((r) => (
            <tr key={r.holder} className="border-b border-line last:border-b-0">
              <td className={`${TD} font-semibold text-ink`}>{r.holder}</td>
              <td className={TD}>
                <span className="rounded-full bg-panel px-2 py-0.5 text-[10.5px] font-bold text-muted ring-1 ring-inset ring-line">
                  {r.group}
                </span>
              </td>
              <td className={TD}>
                <div className="flex items-center gap-2">
                  <span className="mono w-12 shrink-0 text-right font-semibold text-ink">{r.pct.toFixed(1)}%</span>
                  <span className="relative h-1.5 min-w-[56px] flex-1 overflow-hidden rounded-full bg-panel-2" aria-hidden="true">
                    <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                  </span>
                </div>
              </td>
            </tr>
          ))}
          <tr className="bg-panel/50 font-bold">
            <td className={`${TD} text-ink`}>Total</td>
            <td className={TD} />
            <td className={`${TD} mono text-ink`}>
              <span className="inline-block w-12 text-right">100.0%</span>
            </td>
          </tr>
        </Table>
      </Part>

      {/* Litigation */}
      <Part title="Litigation & regulatory actions" aside={<Chip tone="amber">1 live matter</Chip>}>
        <Table head={['Matter', 'Forum', 'Exposure', 'Status', 'Contingent liability']}>
          {g.litigation.map((l) => (
            <tr key={l.matter} className="border-b border-line last:border-b-0">
              <td className={`${TD} font-semibold text-ink`}>
                {l.matter}
                {l.ref && <span className="mono ml-1.5 text-[10px] font-bold text-accent-700">{l.ref}</span>}
              </td>
              <td className={`${TD} text-muted`}>{l.forum}</td>
              <td className={`${TD} mono text-ink-2`}>{l.exposure}</td>
              <td className={TD}>
                <Chip tone={DISC_TONE[l.status]}>{l.statusLabel}</Chip>
              </td>
              <td className={`${TD} text-ink-2`}>{l.contingent}</td>
            </tr>
          ))}
        </Table>
      </Part>

      {/* Related-party transactions */}
      <Part title="Related-party transactions">
        <DisclosureList rows={g.relatedParty} />
      </Part>

      {/* Regulatory disclosures */}
      <Part title="Regulatory disclosures">
        <DisclosureList rows={g.regulatory} />
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

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Disclosure table, scrollable">
      <table className="w-full min-w-[520px] border-collapse text-left">
        <thead>
          <tr className="border-b-2 border-line-strong">
            {head.map((h, i) => (
              <th key={h} className={`${TH} ${i === head.length - 1 && head.length === 3 ? 'text-right' : ''}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function DisclosureList({ rows }: { rows: { item: string; status: CheckStatus; note: string }[] }) {
  return (
    <div>
      {rows.map((r) => (
        <div key={r.item} className="flex items-start justify-between gap-3 border-b border-line py-2.5 last:border-b-0">
          <div className="min-w-0">
            <div className="text-[12.5px] font-semibold text-ink">{r.item}</div>
            <div className="mt-0.5 text-[11.5px] leading-snug text-muted">{r.note}</div>
          </div>
          <Chip tone={DISC_TONE[r.status]} className="shrink-0">
            {DISC_LABEL[r.status]}
          </Chip>
        </div>
      ))}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">{label}</span>
      <b className="mono text-[15px] font-extrabold tracking-[-0.02em] text-ink">{value}</b>
    </span>
  )
}
