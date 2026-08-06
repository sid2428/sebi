import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, Send, Check, FileCheck2, ShieldCheck, X, Landmark, Clock, Scale,
} from 'lucide-react'
import { useStore } from '../../store'
import { COMPANY, ISSUE, FINANCIALS, CAP_TABLE, OBJECTS, BOARD } from '../../data/mock'
import DisclosureScorecard from '../../components/DisclosureScorecard'
import Provenance from '../../components/Provenance'
import Term from '../../components/Term'

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

  return (
    <div className="max-w-none">
      <div className="chip bg-navy-900 text-gold-soft mb-3"><FileCheck2 size={13} /> Substantially complete draft</div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="mb-1.5 text-[26px] font-extrabold tracking-[-0.02em]">Draft Red Herring Prospectus</h2>
          <p className="max-w-[520px] text-[15px] text-muted">Every figure below traces to a source document. Ready for your merchant banker to review and certify.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button onClick={() => setScorecardOpen(true)} className="btn btn-ghost btn-sm"><Scale size={15} /> ICDR scorecard</button>
          <button onClick={() => showToast('Downloaded DRHP draft (mock PDF)')} className="btn btn-ghost btn-sm"><Download size={15} /> Download</button>
          <button onClick={() => setModal(true)} disabled={bankerReviewStarted} className="btn btn-gold btn-sm">
            {bankerReviewStarted ? <><Check size={15} /> Sent to banker</> : <><Send size={15} /> Send to banker</>}
          </button>
        </div>
      </div>

      <div className="card mb-5 flex flex-wrap items-center gap-4 p-4" style={{ background: bankerReviewStarted ? 'linear-gradient(120deg,#e6f6ee,#fff)' : undefined }}>
        <div className="flex items-center gap-2.5">
          <span className={`grid h-9 w-9 place-items-center rounded-xl ${bankerReviewStarted ? 'bg-ok text-white' : 'bg-navy-900 text-gold-soft'}`}>
            {bankerReviewStarted ? <Check size={18} /> : <Clock size={17} />}
          </span>
          <div>
            <b className="block text-[14px]">{bankerReviewStarted ? 'In merchant-banker review' : 'Awaiting your submission'}</b>
            <span className="text-[12.5px] text-muted">Lead manager · {ISSUE.leadManager}</span>
          </div>
        </div>
        <div className="mx-2 hidden h-8 w-px bg-line sm:block" />
        <div className="flex flex-wrap items-center gap-6 text-[12.5px] text-muted">
          <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-ok" /> Human-in-loop certification</span>
          <span className="flex items-center gap-1.5"><Check size={14} className="text-ok" /> Provenance trail attached</span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[210px_1fr]">
        <div className="card hidden max-h-[calc(100vh-160px)] self-start overflow-y-auto p-4 lg:sticky lg:top-4 lg:block">
          <div className="mb-2.5 text-[11px] font-extrabold uppercase tracking-wide text-muted">Contents</div>
          {TOC.map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`block w-full rounded-lg px-2.5 py-2 text-left text-[13px] leading-tight ${active === id ? 'bg-navy-900 text-white' : 'text-ink-2 hover:bg-paper'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-line bg-white font-serif text-[#1a2334] shadow-md2">
          <section id="drhp-cover" className="px-10 py-12 text-center sm:px-14" style={{ background: 'linear-gradient(180deg,#fbfcfe,#fff)', borderBottom: '3px double #c9b688' }}>
            <div className="font-sans text-[11px] font-bold uppercase tracking-[0.24em] text-gold-deep">Draft Red Herring Prospectus</div>
            <h1 className="my-4 text-[30px] font-bold tracking-tight">{COMPANY.proposedName}</h1>
            <div className="font-sans text-[12.5px] text-muted">CIN: {COMPANY.cin} · Incorporated {COMPANY.incorporated} · {COMPANY.roc}</div>
            <div className="mt-1 font-sans text-[12.5px] text-muted">Registered Office: <Provenance docs={['CI']}>{COMPANY.regOffice}</Provenance></div>
            <div className="mx-auto mt-5 max-w-[440px] text-[12.5px] leading-relaxed font-sans text-ink-2">
              Initial Public Offering of Equity Shares of face value ₹{ISSUE.faceValue} each · {ISSUE.type} aggregating up to
              <b> ₹{ISSUE.sizeCr} crore</b> · Proposed listing on the <b>{ISSUE.platform}</b>.
            </div>
            <div className="mt-5 inline-block rounded border-[1.5px] border-[#d4493f] px-4 py-1.5 font-sans text-[12px] font-extrabold tracking-[0.12em] text-[#d4493f]" style={{ transform: 'rotate(-1deg)', opacity: 0.85 }}>
              DRAFT · FOR MERCHANT-BANKER CERTIFICATION
            </div>
            <div className="mt-7 grid grid-cols-1 gap-3 text-left font-sans sm:grid-cols-3">
              {[['Lead Manager', ISSUE.leadManager], ['Registrar', ISSUE.registrar], ['Market Maker', ISSUE.marketMaker]].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-line bg-paper p-3">
                  <div className="text-[10px] uppercase tracking-wide text-muted">{k}</div>
                  <div className="mt-0.5 text-[12.5px] font-semibold">{v}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="px-10 py-8 sm:px-14">
            <Sec id="risk" no="III" title="Risk Factors">
              <p>Prospective investors should carefully consider the risks described below, together with the other information in this Draft Red Herring Prospectus, before making an investment decision.</p>
              <Risk t="Revenue concentration">A substantial portion of revenue is derived from the modern-trade and quick-commerce channels. Loss of a key distribution arrangement could adversely affect operations.</Risk>
              <Risk t="Promoter concentration">Post-issue, the Promoters will collectively hold approximately 52.4% of paid-up equity, enabling significant influence over matters requiring shareholder approval.</Risk>
              <Risk t="Regulatory & tax matters">The Company has a pending indirect-tax matter of <Provenance docs={['LT']}>₹18.4 lakh GST demand</Provenance> under appeal. An adverse outcome, though not currently material, could result in additional <Term term="contingent liability">contingent liability</Term>. (Refer Section XI.)</Risk>
            </Sec>

            <Sec id="business" no="VI" title="Our Business">
              <p>{COMPANY.about}</p>
              <p>The Company operates an asset-light, brand-led model spanning its own D2C platform, <Provenance docs={['MC']}>quick-commerce partnerships</Provenance> and 4,200+ modern-trade outlets across western and southern India, supported by a leased manufacturing facility at Baner, Pune.</p>
              <ul className="my-2 ml-5 list-disc">
                <li>Millet-based snacks and ready-to-cook health mixes</li>
                <li>Cold-pressed edible oils</li>
                <li>Own-brand distribution across 4 states and 14 quick-commerce cities</li>
              </ul>
            </Sec>

            <Sec id="fin" no="VII" title="Financial Information (Restated Summary)">
              <p>The restated summary statements below are derived from the <Provenance docs={['AF', 'AR']}>audited financial statements</Provenance> for FY21–FY23. Figures in ₹ lakh.</p>
              <table className="my-3 w-full border-collapse font-sans text-[13px]">
                <thead>
                  <tr>
                    <th className="border-b-2 border-[#d9e0ec] bg-paper px-3 py-2 text-left font-bold text-ink-2">Particulars</th>
                    {FINANCIALS.map((f) => <th key={f.fy} className="border-b-2 border-[#d9e0ec] bg-paper px-3 py-2 text-right font-bold text-ink-2">{f.fy}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {([['Revenue from operations', 'revenue'], ['EBITDA', 'ebitda'], ['Profit after tax', 'pat'], ['Net worth', 'netWorth'], ['Net tangible assets', 'nta']] as const).map(([label, key], idx) => (
                    <tr key={label} className={idx === 2 ? 'font-bold' : ''}>
                      <td className={`border-b border-[#e6eaf1] px-3 py-2 text-left ${idx === 2 ? 'bg-[#fbfcfe]' : ''}`}>{label}</td>
                      {FINANCIALS.map((f) => (
                        <td key={f.fy} className={`border-b border-[#e6eaf1] px-3 py-2 text-right mono ${idx === 2 ? 'bg-[#fbfcfe]' : ''}`}>
                          {(f[key] as number).toLocaleString('en-IN')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="font-sans text-[12.5px] text-muted">Revenue grew at a 49.2% CAGR over FY21–FY23 with PAT margin expanding to 8.7%.</p>
            </Sec>

            <Sec id="capital" no="VIII" title="Capital Structure (Pre-Issue Shareholding)">
              <table className="my-3 w-full border-collapse font-sans text-[13px]">
                <thead>
                  <tr>
                    <th className="border-b-2 border-[#d9e0ec] bg-paper px-3 py-2 text-left font-bold text-ink-2">Category of shareholder</th>
                    <th className="border-b-2 border-[#d9e0ec] bg-paper px-3 py-2 text-right font-bold text-ink-2">% holding</th>
                  </tr>
                </thead>
                <tbody>
                  {CAP_TABLE.map((c) => (
                    <tr key={c.holder}>
                      <td className="border-b border-[#e6eaf1] px-3 py-2 text-left">{c.holder} <span className="text-muted">· {c.role}</span></td>
                      <td className="border-b border-[#e6eaf1] px-3 py-2 text-right mono">{c.pct.toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="bg-[#fbfcfe] px-3 py-2 text-left">Total</td>
                    <td className="bg-[#fbfcfe] px-3 py-2 text-right mono">100.0%</td>
                  </tr>
                </tbody>
              </table>
            </Sec>

            <Sec id="objects" no="IX" title="Objects of the Issue">
              <p>The net proceeds of the Fresh Issue are proposed to be deployed towards the following objects (₹ crore):</p>
              <table className="my-3 w-full border-collapse font-sans text-[13px]">
                <tbody>
                  {OBJECTS.map((o) => (
                    <tr key={o.purpose}>
                      <td className="border-b border-[#e6eaf1] px-3 py-2 text-left">{o.purpose}</td>
                      <td className="border-b border-[#e6eaf1] px-3 py-2 text-right mono">{o.amtCr.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="bg-[#fbfcfe] px-3 py-2 text-left">Total</td>
                    <td className="bg-[#fbfcfe] px-3 py-2 text-right mono">{OBJECTS.reduce((a, o) => a + o.amtCr, 0).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </Sec>

            <Sec id="mgmt" no="XII" title="Our Management (Board of Directors)">
              <table className="my-3 w-full border-collapse font-sans text-[13px]">
                <thead>
                  <tr>
                    <th className="border-b-2 border-[#d9e0ec] bg-paper px-3 py-2 text-left font-bold text-ink-2">Name</th>
                    <th className="border-b-2 border-[#d9e0ec] bg-paper px-3 py-2 text-left font-bold text-ink-2">Designation</th>
                    <th className="border-b-2 border-[#d9e0ec] bg-paper px-3 py-2 text-left font-bold text-ink-2">On board</th>
                  </tr>
                </thead>
                <tbody>
                  {BOARD.map((b) => (
                    <tr key={b.name}>
                      <td className="border-b border-[#e6eaf1] px-3 py-2 text-left">{b.name}</td>
                      <td className="border-b border-[#e6eaf1] px-3 py-2 text-left">{b.role}</td>
                      <td className="border-b border-[#e6eaf1] px-3 py-2 text-left">{b.tenure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="font-sans text-[12.5px] text-muted">Note: <Provenance docs={['KY']}><Term term="DIN">DIN validation</Term></Provenance> for one Independent Director is pending — flagged for certification.</p>
            </Sec>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 z-[150] grid place-items-center p-4"
            style={{ background: 'rgba(8,20,40,.55)', backdropFilter: 'blur(3px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-[460px] rounded-2xl2 bg-white p-7 shadow-lg2"
              style={{ borderRadius: 20 }}
              role="dialog"
              aria-modal="true"
              aria-label="Send draft for certification"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-navy-900 text-gold-soft"><Landmark size={24} /></div>
                <button onClick={() => setModal(false)} className="text-muted hover:text-ink" aria-label="Close send confirmation"><X size={20} /></button>
              </div>
              <h3 className="mb-1.5 text-[20px] font-extrabold tracking-tight">Send draft for certification</h3>
              <p className="mb-4 text-[14px] leading-relaxed text-muted">
                The draft <Term term="DRHP">DRHP</Term> and its full provenance trail will be shared with your lead manager for
                due diligence and certification. Nothing is filed with SEBI or the exchange until they sign off.
              </p>
              <div className="card mb-4 bg-paper p-4">
                <div className="flex justify-between py-1 text-[13px]"><span className="text-muted">Recipient</span><b>{ISSUE.leadManager}</b></div>
                <div className="flex justify-between py-1 text-[13px]"><span className="text-muted">Draft completeness</span><b className="text-ok">90% · 14 sections</b></div>
                <div className="flex justify-between py-1 text-[13px]"><span className="text-muted">Open flags disclosed</span><b className="text-warn">5 items</b></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setModal(false)} className="btn btn-ghost flex-1 justify-center">Cancel</button>
                <button onClick={send} className="btn btn-gold flex-1 justify-center"><Send size={16} /> Confirm & send</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DisclosureScorecard open={scorecardOpen} onClose={() => setScorecardOpen(false)} />
    </div>
  )
}

function Sec({ id, no, title, children }: { id: string; no: string; title: string; children: React.ReactNode }) {
  return (
    <section id={`drhp-${id}`} className="scroll-mt-4 border-b border-[#edf0f5] py-5 last:border-0">
      <div className="font-sans text-[11px] font-bold tracking-wide text-gold-deep">SECTION {no}</div>
      <h3 className="mb-1 text-[19px] font-bold tracking-tight text-navy-900">{title}</h3>
      <div className="[&>p]:my-2.5 [&>p]:text-[14.5px] [&>p]:leading-[1.72] [&>p]:text-[#2a3547]">{children}</div>
    </section>
  )
}

function Risk({ t, children }: { t: string; children: React.ReactNode }) {
  return (
    <div className="my-2.5 rounded-r-lg border-l-[3px] border-gold bg-[#fdf8f0] px-4 py-3">
      <b className="mb-0.5 block font-sans text-[13px] text-gold-deep">{t}</b>
      <span className="text-[13.5px] leading-relaxed text-[#2a3547]">{children}</span>
    </div>
  )
}
