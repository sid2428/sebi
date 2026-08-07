import { Clock } from 'lucide-react'
import { Mark } from '../ui'
import { cover as c } from '../../report/model'

/**
 * Cover Page — the title page of the report. Identity and provenance up
 * front, with the draft/confidentiality status stated plainly.
 */
export default function CoverPage() {
  return (
    <section aria-label="Report cover" className="card mb-5 overflow-hidden">
      <div className="px-6 py-10 sm:px-10 sm:py-14">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
          Strictly private &amp; confidential
        </div>

        {/* Issuer identity */}
        <div className="mt-8 flex items-center gap-4">
          <span
            className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl2 text-[20px] font-extrabold text-white"
            style={{ background: 'linear-gradient(140deg,#5B8DEF,#2E4E9C)' }}
            aria-hidden="true"
          >
            {c.company.logoLetters}
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent-700">{c.company.sector}</div>
            <h1 className="mt-1 text-[30px] font-extrabold leading-tight tracking-[-0.03em] text-ink">
              {c.company.name}
            </h1>
            <div className="mt-0.5 text-[12.5px] text-muted">
              {c.company.legalName} · <span className="mono">CIN {c.company.cin}</span>
            </div>
          </div>
        </div>

        {/* Report title */}
        <div className="mt-10">
          <div className="h-[3px] w-16 rounded-full bg-accent-500" />
          <h2 className="mt-4 font-serif text-[26px] font-semibold tracking-[-0.015em] text-ink">{c.title}</h2>
          <div className="mt-1 text-[15px] text-ink-3">{c.subtitle}</div>
          <div className="mt-3 text-[13px] text-muted">
            {c.issue.type} · <b className="text-ink-2">₹{c.issue.sizeCr} Cr</b> · {c.issue.platformShort}
          </div>
        </div>

        {/* Draft status */}
        <div className="mt-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-warn-line bg-warn-bg px-3.5 py-1.5 text-[12px] font-bold text-warn">
            <Clock size={13} aria-hidden="true" /> {c.status}
          </span>
        </div>

        {/* Control block */}
        <dl className="mt-9 grid gap-x-8 gap-y-4 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <Meta k="Report">{c.title}</Meta>
          <Meta k="Version">{c.version}</Meta>
          <Meta k="Generated">{c.generatedAt}</Meta>
          <Meta k="Prepared by">{c.preparedBy}</Meta>
        </dl>

        {/* Confidentiality + attribution */}
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-line pt-5">
          <p className="max-w-[62ch] text-[11px] leading-[1.55] text-muted">{c.confidentiality}</p>
          <div className="flex shrink-0 items-center gap-2">
            <Mark size={26} />
            <span className="text-[12.5px] font-bold text-ink">Prepared by {c.preparedBy}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function Meta({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">{k}</dt>
      <dd className="mt-1 text-[13px] font-semibold text-ink">{children}</dd>
    </div>
  )
}
