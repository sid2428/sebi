import { useState, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, FileText, Target, Sparkles, Wrench, Scale, type LucideIcon } from 'lucide-react'
import { Chip } from '../ui'
import { register, type Priority, type RegisterFinding } from '../../report/model'
import { useStore } from '../../store'
import { EASE } from '../../lib/motion'

type Status = 'open' | 'in-review' | 'resolved'
type FieldIcon = LucideIcon

const SEV: Record<Priority, { label: string; chip: 'red' | 'amber' | 'blue'; border: string }> = {
  P1: { label: 'Filing blocker', chip: 'red', border: 'border-l-bad' },
  P2: { label: 'Material', chip: 'amber', border: 'border-l-warn' },
  P3: { label: 'Advisory', chip: 'blue', border: 'border-l-info' },
}

// Compact code badge, coloured by severity.
const SEV_BADGE: Record<Priority, string> = {
  P1: 'bg-bad-bg text-bad ring-1 ring-inset ring-bad-line',
  P2: 'bg-warn-bg text-warn ring-1 ring-inset ring-warn-line',
  P3: 'bg-info-bg text-info ring-1 ring-inset ring-info-line',
}

const STAT: Record<Status, { label: string; chip: 'gray' | 'blue' | 'green' }> = {
  open: { label: 'Open', chip: 'gray' },
  'in-review': { label: 'In review', chip: 'blue' },
  resolved: { label: 'Resolved', chip: 'green' },
}

const STATUS_COLS: Status[] = ['open', 'in-review', 'resolved']
const PRIORITY_ROWS: Priority[] = ['P1', 'P2', 'P3']

/**
 * Findings Register — the centrepiece of the review. Every finding joins
 * a source fact to the reviewer's assessment; status is read live from
 * the existing resolve / send-to-banker workflow, never duplicated.
 */
export default function FindingsRegister() {
  const gapResolutions = useStore((s) => s.gapResolutions)
  const bankerReviewStarted = useStore((s) => s.bankerReviewStarted)
  const docRecords = useStore((s) => s.docRecords)

  const activeRegister = useMemo(() => register(), [gapResolutions, docRecords])

  const count = (p: Priority) => activeRegister.filter((f) => f.priority === p).length

  const statusOf = (id: string): Status =>
    gapResolutions[id] ? 'resolved' : bankerReviewStarted ? 'in-review' : 'open'

  // P1 findings open by default — the blockers lead.
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(activeRegister.filter((f) => f.priority === 'P1').map((f) => [f.id, true]))
  )
  const toggle = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }))

  return (
    <section aria-label="Findings register" className="card mb-5 overflow-hidden">
      {/* Header */}
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="eyebrow">Diligence findings register</div>
            <h2 className="mt-1.5 text-[20px] font-extrabold tracking-[-0.028em] text-ink">Findings register</h2>
          </div>
          <div className="flex items-center gap-1.5">
            {PRIORITY_ROWS.map((p) => (
              <span key={p} className={`mono rounded-md px-2 py-1 text-[11px] font-bold ${SEV_BADGE[p]}`}>
                {p} · {count(p)}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-2 max-w-[72ch] text-[13px] leading-[1.55] text-muted">
          {activeRegister.length} items to resolve before filing — {count('P1')} block certification. Ranked by
          priority, each traced to source. Select a finding for the full assessment.
        </p>
      </div>

      {/* Priority × Status matrix */}
      <Matrix statusOf={statusOf} activeRegister={activeRegister} />

      {/* Register */}
      <div className="divide-y divide-line">
        {activeRegister.map((f) => (
          <FindingRow key={f.id} f={f} status={statusOf(f.id)} open={!!expanded[f.id]} onToggle={() => toggle(f.id)} />
        ))}
      </div>
    </section>
  )
}

/* ---------- Priority × Status matrix ---------- */

function Matrix({ statusOf, activeRegister }: { statusOf: (id: string) => Status; activeRegister: RegisterFinding[] }) {
  return (
    <div className="border-b border-line bg-panel/40 px-5 py-4 sm:px-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Priority × status</div>
        <div className="flex items-center gap-3 text-[10.5px] font-semibold text-muted">
          {PRIORITY_ROWS.map((p) => (
            <span key={p} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${p === 'P1' ? 'bg-bad' : p === 'P2' ? 'bg-warn' : 'bg-info'}`} aria-hidden="true" />
              {SEV[p].label}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Priority by status matrix, scrollable">
        <table className="w-full min-w-[440px] border-collapse text-left">
          <thead>
            <tr>
              <th className="w-[34%] pb-2 pr-3 text-[10px] font-bold uppercase tracking-[0.08em] text-muted">Priority</th>
              {STATUS_COLS.map((col) => (
                <th key={col} className="pb-2 pl-3 text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                  {STAT[col].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRIORITY_ROWS.map((p) => (
              <tr key={p} className="border-t border-line/70">
                <th scope="row" className="py-2.5 pr-3 align-top">
                  <span className="flex items-center gap-2">
                    <span className={`mono rounded px-1.5 py-0.5 text-[10px] font-bold ${SEV_BADGE[p]}`}>{p}</span>
                    <span className="text-[12px] font-semibold text-ink-2">{SEV[p].label}</span>
                  </span>
                </th>
                {STATUS_COLS.map((col) => {
                  const items = activeRegister.filter((f) => f.priority === p && statusOf(f.id) === col)
                  const danger = p === 'P1' && col === 'open' && items.length > 0
                  return (
                    <td key={col} className={`py-2.5 pl-3 align-top ${danger ? 'bg-bad-bg/60' : ''}`}>
                      {items.length ? (
                        <span className="flex flex-wrap gap-1">
                          {items.map((f) => (
                            <span key={f.id} className={`mono rounded px-1.5 py-0.5 text-[10.5px] font-bold ${SEV_BADGE[f.priority]}`}>
                              {f.code}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-[13px] text-faint">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ---------- Finding row (expandable evidence card) ---------- */

function FindingRow({
  f,
  status,
  open,
  onToggle,
}: {
  f: RegisterFinding
  status: Status
  open: boolean
  onToggle: () => void
}) {
  const sev = SEV[f.priority]
  return (
    <div className={`border-l-[3px] ${sev.border} bg-white`}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`finding-${f.id}`}
        className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors duration-200 hover:bg-panel/40 sm:px-6"
      >
        <span className={`mono mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10.5px] font-bold ${SEV_BADGE[f.priority]}`}>
          {f.code}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
            <span>{f.section}</span>
            <span className="text-faint">·</span>
            <span>{f.type}</span>
          </div>
          <div className="mt-0.5 text-[14px] font-bold leading-snug text-ink">{f.title}</div>
          <div className="mt-0.5 text-[11.5px] text-muted">{f.category}</div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Chip tone={sev.chip}>{sev.label}</Chip>
            <Chip tone={STAT[status].chip}>{STAT[status].label}</Chip>
            <ConfidenceMini value={f.confidence} />
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`ml-1 mt-1 shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`finding-${f.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="border-t border-line bg-panel/25 px-5 py-4 sm:px-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Field icon={Target} label="Business impact">{f.businessImpact}</Field>
                <Field icon={FileText} label="Evidence">
                  <ul className="space-y-1.5">
                    {f.evidence.map((e, i) => (
                      <li key={i} className="rounded-lg border border-line bg-white px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12.5px] font-semibold text-ink">{e.doc}</span>
                          <span className="shrink-0 rounded-full bg-panel px-2 py-0.5 text-[10px] font-bold text-muted ring-1 ring-inset ring-line">
                            {e.kind}
                          </span>
                        </div>
                        <div className="mono mt-0.5 text-[11px] text-muted">Ref: {e.ref}</div>
                      </li>
                    ))}
                  </ul>
                </Field>
                <Field icon={Sparkles} label="AI observation">{f.aiObservation}</Field>
                <Field icon={Wrench} label="Recommendation">{f.recommendation}</Field>
              </div>
              <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 border-t border-line pt-3 text-[11.5px]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink-2">
                  <Scale size={13} className="text-accent-600" aria-hidden="true" /> Regulatory anchor
                </span>
                <span className="text-muted">{f.regulatoryAnchor}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- local primitives ---------- */

function Field({ icon: Icon, label, children }: { icon: FieldIcon; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
        <Icon size={12} className="text-accent-600" /> {label}
      </div>
      <div className="text-[13px] leading-[1.55] text-ink-2">{children}</div>
    </div>
  )
}

function ConfidenceMini({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-panel px-2 py-0.5 ring-1 ring-inset ring-line">
      <span className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-muted">Conf</span>
      <span className="mono text-[11px] font-bold text-ink">{value}%</span>
      <span className="relative h-1 w-8 overflow-hidden rounded-full bg-panel-2" aria-hidden="true">
        <span className="absolute inset-y-0 left-0 rounded-full bg-accent-500" style={{ width: `${value}%` }} />
      </span>
    </span>
  )
}
