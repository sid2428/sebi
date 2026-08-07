import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Send, Check, ShieldCheck, X, Landmark, Clock, Scale } from 'lucide-react'
import { useStore } from '../../store'
import { COMPANY, ISSUE, FINANCIALS, CAP_TABLE, OBJECTS, BOARD } from '../../data/mock'
import DisclosureScorecard from '../../components/DisclosureScorecard'
import Provenance from '../../components/Provenance'
import Term from '../../components/Term'
import { EASE } from '../../lib/motion'
import { executiveSummary, cover } from '../../report/model'
import CoverPage from '../../components/report/CoverPage'
import ExecutiveSummary from '../../components/report/ExecutiveSummary'
import FindingsRegister from '../../components/report/FindingsRegister'
import ReadinessAssessment from '../../components/report/ReadinessAssessment'
import FinancialReview from '../../components/report/FinancialReview'
import GovernanceDisclosures from '../../components/report/GovernanceDisclosures'
import PathToFiling from '../../components/report/PathToFiling'

const TOC = [
  ['cover', 'Cover Page'],
  ['risk', 'III · Risk Factors'],
  ['business', 'VI · Our Business'],
  ['fin', 'VII · Financial Information'],
  ['capital', 'VIII · Capital Structure'],
  ['objects', 'IX · Objects of the Issue'],
  ['mgmt', 'XII · Our Management'],
]

export default function FinalDRHP() {
  const showToast = useStore((s) => s.showToast)
  const bankerReviewStarted = useStore((s) => s.bankerReviewStarted)
  const setBankerReviewStarted = useStore((s) => s.setBankerReviewStarted)
  const [active, setActive] = useState('cover')
  const [modal, setModal] = useState(false)
  const [scorecardOpen, setScorecardOpen] = useState(false)

  function scrollTo(id: string) {
    setActive(id)
    document.getElementById(`drhp-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function send() {
    setModal(false)
    setBankerReviewStarted(true)
    showToast('Draft sent to Meridian Capital Advisors for certification')
  }

  // Export = print to PDF. Wait for webfonts so the serif/tabular figures
  // render in the output, then hand off to the browser's print-to-PDF.
  async function handleDownload() {
    try {
      await document.fonts?.ready
    } catch {
      /* fonts API unavailable — print anyway */
    }
    window.print()
  }

  // Keep the contents list in step with what is actually on screen.
  useEffect(() => {
    const sections = TOC.map(([id]) => document.getElementById(`drhp-${id}`)).filter(Boolean) as HTMLElement[]
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActive(visible.target.id.replace('drhp-', ''))
      },
      { rootMargin: '-12% 0px -70% 0px', threshold: 0 }
    )
    sections.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Escape closes the send dialog.
  useEffect(() => {
    if (!modal) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setModal(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modal])

  return (
    <div className="max-w-none" data-report-root="true">
      {/* Running header/footer — visible only on printed pages. */}
      <div className="print-running-header" aria-hidden="true">
        <span>{cover.company.name} — {cover.title}</span>
        <span>Private &amp; Confidential</span>
      </div>
      <div className="print-running-footer" aria-hidden="true">
        <span>{cover.version} · {cover.generatedAt}</span>
        <span className="print-status">{cover.status}</span>
      </div>

      {/* Document actions. The report itself opens with the Cover Page below. */}
      <div className="mb-5 flex flex-wrap justify-end gap-2.5 print:hidden">
        <button onClick={() => setScorecardOpen(true)} className="btn btn-ghost btn-sm">
          <Scale size={14} /> ICDR scorecard
        </button>
        <button onClick={handleDownload} className="btn btn-ghost btn-sm">
          <Download size={14} /> Download
        </button>
        <button onClick={() => setModal(true)} disabled={bankerReviewStarted} className="btn btn-gold btn-sm">
          {bankerReviewStarted ? (
            <>
              <Check size={14} /> Sent to banker
            </>
          ) : (
            <>
              <Send size={14} /> Send to banker
            </>
          )}
        </button>
      </div>

      <CoverPage />

      <ExecutiveSummary />

      <ReadinessAssessment />

      <FindingsRegister />

      <FinancialReview />

      <GovernanceDisclosures />

      <PathToFiling />

      {/* Certification status */}
      <div
        className={`card mb-5 flex flex-wrap items-center gap-4 p-4 ${
          bankerReviewStarted ? 'border-ok-line bg-ok-bg/45' : ''
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`grid h-9 w-9 place-items-center rounded-xl2 ${
              bankerReviewStarted ? 'bg-ok text-white' : 'bg-ink text-white'
            }`}
          >
            {bankerReviewStarted ? <Check size={17} strokeWidth={2.6} /> : <Clock size={16} />}
          </span>
          <div>
            <b className="block text-[13.5px] font-bold">
              {bankerReviewStarted ? 'In merchant-banker review' : 'Awaiting your submission'}
            </b>
            <span className="text-[12px] text-muted">Lead manager · {ISSUE.leadManager}</span>
          </div>
        </div>
        <div className="mx-1 hidden h-8 w-px bg-line sm:block" />
        <div className="flex flex-wrap items-center gap-5 text-[12px] text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-ok" /> Human-in-loop certification
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={13} className="text-ok" /> Provenance trail attached
          </span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[204px_1fr]">
        {/* Contents */}
        <nav className="card hidden max-h-[calc(100vh-140px)] self-start overflow-y-auto p-3 lg:sticky lg:top-4 lg:block print:hidden" aria-label="Prospectus contents">
          <div className="px-2 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-[0.13em] text-muted">
            Contents
          </div>
          {TOC.map(([id, label]) => {
            const on = active === id
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                aria-current={on ? 'location' : undefined}
                className={`relative block w-full rounded-lg px-2.5 py-2 text-left text-[12.5px] leading-tight transition-colors duration-200 ${
                  on ? 'bg-accent-50 font-bold text-accent-700' : 'text-ink-2 hover:bg-panel'
                }`}
              >
                {on && (
                  <motion.span
                    layoutId="toc-marker"
                    className="absolute inset-y-1 left-0 w-[3px] rounded-r-full bg-accent-500"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                {label}
              </button>
            )
          })}
        </nav>

        {/* The prospectus surface */}
        <article className="overflow-hidden rounded-2xl2 border border-line bg-white font-serif text-[#1A2334] shadow-md2">
          <section
            id="drhp-cover"
            className="scroll-mt-4 px-8 py-12 text-center sm:px-14"
            style={{ background: 'linear-gradient(180deg,#FBFDFF,#FFF)', borderBottom: '3px double #C4DAFB' }}
          >
            <div className="font-sans text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-accent-700">
              Draft Red Herring Prospectus
            </div>
            <h2 className="my-4 text-[30px] font-semibold tracking-[-0.015em]">{COMPANY.proposedName}</h2>
            <div className="font-sans text-[12px] text-muted">
              CIN: {COMPANY.cin} · Incorporated {COMPANY.incorporated} · {COMPANY.roc}
            </div>
            <div className="mt-1 font-sans text-[12px] text-muted">
              Registered Office: <Provenance docs={['CI']}>{COMPANY.regOffice}</Provenance>
            </div>
            <p className="mx-auto mt-5 max-w-[52ch] font-sans text-[12.5px] leading-[1.7] text-ink-2">
              Initial Public Offering of Equity Shares of face value ₹{ISSUE.faceValue} each · {ISSUE.type}{' '}
              aggregating up to <b className="text-ink">₹{ISSUE.sizeCr} crore</b> · Proposed listing on the{' '}
              <b className="text-ink">{ISSUE.platform}</b>.
            </p>

            <div
              className="mt-6 inline-block rounded border-[1.5px] border-bad px-4 py-1.5 font-sans text-[11.5px] font-extrabold tracking-[0.11em] text-bad"
              style={{ transform: 'rotate(-1.2deg)' }}
            >
              DRAFT · FOR MERCHANT-BANKER CERTIFICATION
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 text-left font-sans sm:grid-cols-3">
              {[
                ['Lead Manager', ISSUE.leadManager],
                ['Registrar', ISSUE.registrar],
                ['Market Maker', ISSUE.marketMaker],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl2 border border-line bg-panel/70 p-3">
                  <div className="text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted">{k}</div>
                  <div className="mt-1 text-[12px] font-bold text-ink">{v}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="px-8 py-8 sm:px-14">
            <Sec id="risk" no="III" title="Risk Factors">
              <p>
                Prospective investors should carefully consider the risks described below, together with the
                other information in this Draft Red Herring Prospectus, before making an investment decision.
              </p>
              <Risk t="Revenue concentration">
                A substantial portion of revenue is derived from the modern-trade and quick-commerce channels.
                Loss of a key distribution arrangement could adversely affect operations.
              </Risk>
              <Risk t="Promoter concentration">
                Post-issue, the Promoters will collectively hold approximately 52.4% of paid-up equity,
                enabling significant influence over matters requiring shareholder approval.
              </Risk>
              <Risk t="Regulatory & tax matters">
                The Company has a pending indirect-tax matter of{' '}
                <Provenance docs={['LT']}>₹18.4 lakh GST demand</Provenance> under appeal. An adverse outcome,
                though not currently material, could result in additional{' '}
                <Term term="contingent liability">contingent liability</Term>. (Refer Section XI.)
              </Risk>
            </Sec>

            <Sec id="business" no="VI" title="Our Business">
              <p>{COMPANY.about}</p>
              <p>
                The Company operates an asset-light, brand-led model spanning its own D2C platform,{' '}
                <Provenance docs={['MC']}>quick-commerce partnerships</Provenance> and 4,200+ modern-trade
                outlets across western and southern India, supported by a leased manufacturing facility at
                Baner, Pune.
              </p>
              <ul className="my-3 ml-5 list-disc space-y-1 text-[14px] leading-[1.75] text-[#2A3547]">
                <li>Millet-based snacks and ready-to-cook health mixes</li>
                <li>Cold-pressed edible oils</li>
                <li>Own-brand distribution across 4 states and 14 quick-commerce cities</li>
              </ul>
            </Sec>

            <Sec id="fin" no="VII" title="Financial Information (Restated Summary)">
              <p>
                The restated summary statements below are derived from the{' '}
                <Provenance docs={['AF', 'AR']}>audited financial statements</Provenance> for FY21–FY23.
                Figures in ₹ lakh.
              </p>
              <DocTable label="Restated financial summary">
                <thead>
                  <tr>
                    <th scope="col" className={TH_LEFT}>Particulars</th>
                    {FINANCIALS.map((f) => (
                      <th key={f.fy} scope="col" className={TH_RIGHT}>{f.fy}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {([
                    ['Revenue from operations', 'revenue'],
                    ['EBITDA', 'ebitda'],
                    ['Profit after tax', 'pat'],
                    ['Net worth', 'netWorth'],
                    ['Net tangible assets', 'nta'],
                  ] as const).map(([label, key], idx) => (
                    <tr key={label} className={idx === 2 ? 'bg-accent-50/60 font-bold' : ''}>
                      <th scope="row" className={`${TD} text-left font-inherit`}>{label}</th>
                      {FINANCIALS.map((f) => (
                        <td key={f.fy} className={`${TD} mono text-right`}>
                          {(f[key] as number).toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </DocTable>
              <p className="font-sans text-[12px] text-muted">
                Revenue grew at a 49.2% CAGR over FY21–FY23 with PAT margin expanding to 8.7%.
              </p>
            </Sec>

            <Sec id="capital" no="VIII" title="Capital Structure (Pre-Issue Shareholding)">
              <DocTable label="Pre-issue shareholding">
                <thead>
                  <tr>
                    <th scope="col" className={TH_LEFT}>Category of shareholder</th>
                    <th scope="col" className={TH_RIGHT}>% holding</th>
                  </tr>
                </thead>
                <tbody>
                  {CAP_TABLE.map((c) => (
                    <tr key={c.holder}>
                      <td className={`${TD} text-left`}>
                        {c.holder} <span className="text-muted">· {c.role}</span>
                      </td>
                      <td className={`${TD} mono text-right`}>{c.pct.toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className="bg-panel/70 font-bold">
                    <td className={`${TD} text-left`}>Total</td>
                    <td className={`${TD} mono text-right`}>100.0%</td>
                  </tr>
                </tbody>
              </DocTable>
            </Sec>

            <Sec id="objects" no="IX" title="Objects of the Issue">
              <p>
                The net proceeds of the Fresh Issue are proposed to be deployed towards the following objects
                (₹ crore):
              </p>
              <DocTable label="Objects of the issue">
                <tbody>
                  {OBJECTS.map((o) => (
                    <tr key={o.purpose}>
                      <td className={`${TD} text-left`}>{o.purpose}</td>
                      <td className={`${TD} mono text-right`}>{o.amtCr.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-panel/70 font-bold">
                    <td className={`${TD} text-left`}>Total</td>
                    <td className={`${TD} mono text-right`}>
                      {OBJECTS.reduce((a, o) => a + o.amtCr, 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </DocTable>
            </Sec>

            <Sec id="mgmt" no="XII" title="Our Management (Board of Directors)">
              <DocTable label="Board of directors">
                <thead>
                  <tr>
                    <th scope="col" className={TH_LEFT}>Name</th>
                    <th scope="col" className={TH_LEFT}>Designation</th>
                    <th scope="col" className={TH_LEFT}>On board</th>
                  </tr>
                </thead>
                <tbody>
                  {BOARD.map((b) => (
                    <tr key={b.name}>
                      <td className={`${TD} text-left`}>{b.name}</td>
                      <td className={`${TD} text-left`}>{b.role}</td>
                      <td className={`${TD} text-left`}>{b.tenure}</td>
                    </tr>
                  ))}
                </tbody>
              </DocTable>
              <p className="font-sans text-[12px] text-muted">
                Note: <Provenance docs={['KY']}><Term term="DIN">DIN validation</Term></Provenance> for one
                Independent Director is pending — flagged for certification.
              </p>
            </Sec>
          </div>
        </article>
      </div>

      {/* Send dialog */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-[150] grid place-items-center p-4"
            style={{ background: 'rgba(14,24,40,.5)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setModal(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.96, y: 14, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, y: 8, opacity: 0 }}
              transition={{ duration: 0.26, ease: EASE }}
              className="w-full max-w-[480px] rounded-3xl2 bg-white p-7 shadow-xl2"
              role="dialog"
              aria-modal="true"
              aria-label="Send draft for certification"
            >
              <div className="mb-4 flex items-start justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl2 bg-ink text-white">
                  <Landmark size={22} />
                </span>
                <button
                  onClick={() => setModal(false)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-panel hover:text-ink"
                  aria-label="Close send confirmation"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-[20px] font-extrabold tracking-[-0.028em]">Send draft for certification</h3>
              <p className="mt-1.5 text-[13.5px] leading-[1.6] text-muted">
                The draft <Term term="DRHP">DRHP</Term> and its full provenance trail go to your lead manager
                for due diligence and certification. Nothing is filed with SEBI or the exchange until they
                sign off.
              </p>

              <dl className="mt-4 rounded-2xl2 border border-line bg-panel/70 p-4 text-[13px]">
                <div className="flex justify-between gap-3 py-1">
                  <dt className="text-muted">Recipient</dt>
                  <dd className="font-bold text-ink">{ISSUE.leadManager}</dd>
                </div>
                <div className="flex justify-between gap-3 py-1">
                  <dt className="text-muted">Draft completeness</dt>
                  <dd className="font-bold text-ok">
                    {executiveSummary.completeness.mean}% · {executiveSummary.completeness.total} sections
                  </dd>
                </div>
                <div className="flex justify-between gap-3 py-1">
                  <dt className="text-muted">Open flags disclosed</dt>
                  <dd className="font-bold text-warn">{executiveSummary.findings.total} items</dd>
                </div>
              </dl>

              <div className="mt-5 flex gap-3">
                <button onClick={() => setModal(false)} className="btn btn-ghost flex-1 justify-center">
                  Cancel
                </button>
                <button onClick={send} className="btn btn-gold flex-1 justify-center">
                  <Send size={15} /> Confirm &amp; send
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DisclosureScorecard open={scorecardOpen} onClose={() => setScorecardOpen(false)} />
    </div>
  )
}

/* ---------- prospectus primitives ---------- */

const TH_LEFT =
  'border-b-2 border-line-strong bg-panel/70 px-3 py-2.5 text-left font-sans text-[11px] font-extrabold uppercase tracking-[0.07em] text-muted'
const TH_RIGHT =
  'border-b-2 border-line-strong bg-panel/70 px-3 py-2.5 text-right font-sans text-[11px] font-extrabold uppercase tracking-[0.07em] text-muted'
const TD = 'border-b border-line px-3 py-2.5'

function DocTable({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    // Focusable so the table can be scrolled from the keyboard when it
    // overflows on a narrow pane. Each one is named, so the landmarks
    // stay distinguishable.
    <div className="my-4 overflow-x-auto" tabIndex={0} role="region" aria-label={`${label}, scrollable table`}>
      <table className="w-full min-w-[420px] border-collapse font-sans text-[13px] text-ink-2">{children}</table>
    </div>
  )
}

function Sec({ id, no, title, children }: { id: string; no: string; title: string; children: React.ReactNode }) {
  return (
    <section id={`drhp-${id}`} className="scroll-mt-4 border-b border-line py-6 last:border-0">
      <div className="flex items-baseline gap-2.5">
        <span className="numeral font-sans text-[11px] tracking-[0.1em]">SECTION {no}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <h3 className="mb-2 mt-2 font-sans text-[19px] font-extrabold tracking-[-0.024em] text-ink">{title}</h3>
      {/* A 68ch measure keeps long legal prose readable. */}
      <div className="[&>p]:my-3 [&>p]:max-w-[68ch] [&>p]:text-[14.5px] [&>p]:leading-[1.78] [&>p]:text-[#2A3547]">
        {children}
      </div>
    </section>
  )
}

function Risk({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <div className="my-3 max-w-[70ch] rounded-r-xl2 border-l-[3px] border-accent-400 bg-accent-50/70 px-4 py-3">
      <b className="mb-1 block font-sans text-[12.5px] font-extrabold text-accent-700">{t}</b>
      <span className="text-[13.5px] leading-[1.72] text-[#2A3547]">{children}</span>
    </div>
  )
}
