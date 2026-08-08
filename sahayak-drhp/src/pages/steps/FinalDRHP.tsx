import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download, Send, Check, ShieldCheck, X, Landmark, Clock, Scale, FileText, Copy, AlertTriangle,
} from 'lucide-react'
import { useStore } from '../../store'
import { COMPANY, ISSUE, GAPS, SECTIONS } from '../../data/mock'
import DisclosureScorecard from '../../components/DisclosureScorecard'
import Term from '../../components/Term'
import { Chip } from '../../components/ui'
import { ResultNote, StageFooter, StageHeader } from '../../components/stage'
import { copyText, downloadTextFile } from '../../lib/actions'
import { EASE } from '../../lib/motion'
import { executiveSummary, cover } from '../../report/model'
import CoverPage from '../../components/report/CoverPage'
import ExecutiveSummary from '../../components/report/ExecutiveSummary'
import FindingsRegister from '../../components/report/FindingsRegister'
import ReadinessAssessment from '../../components/report/ReadinessAssessment'
import FinancialReview from '../../components/report/FinancialReview'
import GovernanceDisclosures from '../../components/report/GovernanceDisclosures'
import PathToFiling from '../../components/report/PathToFiling'

// Clean, versioned export filename derived from the report metadata, e.g.
// "Satvik_Foods_Limited_Draft_DRHP_v1.0" — the browser appends ".pdf".
function reportFileName() {
  const slug = (s: string) => s.trim().replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '')
  const company = slug(cover.company.name)
  // Keep the dot/hyphen in the version (e.g. "v1.0"); only strip unsafe chars.
  const version = cover.version.trim().replace(/[^\p{L}\p{N}.\-]+/gu, '_').replace(/^_+|_+$/g, '')
  return `${company}_Draft_DRHP_${version}`
}

export default function FinalDRHP() {
  const showToast = useStore((s) => s.showToast)
  const goStep = useStore((s) => s.goStep)
  const goScreen = useStore((s) => s.goScreen)
  const completeStep = useStore((s) => s.completeStep)
  const bankerReviewStarted = useStore((s) => s.bankerReviewStarted)
  const setBankerReviewStarted = useStore((s) => s.setBankerReviewStarted)
  const gapResolutions = useStore((s) => s.gapResolutions)
  const sectionDrafts = useStore((s) => s.sectionDrafts)
  const [modal, setModal] = useState(false)
  const [scorecardOpen, setScorecardOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [blocked, setBlocked] = useState(false)

  // Certification is the one genuinely gated action: the draft says
  // high-severity items must clear before a banker can certify it.
  const openHigh = GAPS.filter((g) => g.severity === 'high' && !gapResolutions[g.id])
  const canCertify = openHigh.length === 0

  function openSendDialog() {
    if (!canCertify) {
      setBlocked(true)
      return
    }
    setBlocked(false)
    setModal(true)
  }

  function send() {
    setModal(false)
    setBankerReviewStarted(true)
    completeStep('final')
    showToast('Draft sent to Meridian Capital Advisors for certification')
  }

  /** The whole draft as plain text — the non-PDF export path. */
  function draftAsText() {
    const open = GAPS.filter((g) => !gapResolutions[g.id])
    return [
      `${COMPANY.proposedName}`,
      'DRAFT RED HERRING PROSPECTUS — FOR MERCHANT-BANKER CERTIFICATION',
      `${cover.version} · generated ${cover.generatedAt}`,
      `CIN ${COMPANY.cin} · ${COMPANY.roc}`,
      `Fresh Issue up to ₹${ISSUE.sizeCr} crore · ${ISSUE.platform}`,
      `Lead Manager: ${ISSUE.leadManager} · Registrar: ${ISSUE.registrar}`,
      '',
      '--- SECTIONS ---',
      ...SECTIONS.map((s) => {
        const draft = sectionDrafts[s.no]
        return [
          `Section ${s.no} · ${s.title} (${draft?.complete ?? s.complete}% complete)`,
          `Sources: ${s.sources.join(', ')}`,
          draft ? draft.body : '[Not drafted in this session]',
          '',
        ].join('\n')
      }),
      '--- OPEN FLAGS DISCLOSED ---',
      open.length ? open.map((g) => `[${g.severity.toUpperCase()}] ${g.title} — ${g.location}`).join('\n') : 'None',
      '',
      'Nothing in this document is filed with SEBI or any exchange until a merchant banker certifies it.',
    ].join('\n')
  }

  async function copySummary() {
    const summary = [
      `${COMPANY.proposedName} — draft DRHP status`,
      `Completeness: ${executiveSummary.completeness.mean}% across ${executiveSummary.completeness.total} sections`,
      `Open findings: ${GAPS.length - Object.keys(gapResolutions).length} of ${GAPS.length}`,
      `Lead manager: ${ISSUE.leadManager}`,
      `Certification: ${bankerReviewStarted ? 'in merchant-banker review' : canCertify ? 'ready to send' : 'blocked by high-severity findings'}`,
    ].join('\n')
    const ok = await copyText(summary)
    setCopied(ok)
    showToast(ok ? 'Status summary copied' : 'Copy blocked by the browser')
    window.setTimeout(() => setCopied(false), 2200)
  }

  // Export = print to PDF. Wait for webfonts so the serif/tabular figures
  // render in the output, then hand off to the browser's print-to-PDF.
  // Browsers seed the "Save as PDF" filename from document.title (and append
  // .pdf), so we swap in a clean, versioned name for the export and restore
  // the original title once the print dialog closes.
  async function handleDownload() {
    try {
      await document.fonts?.ready
    } catch {
      /* fonts API unavailable — print anyway */
    }
    const previousTitle = document.title
    const restoreTitle = () => {
      document.title = previousTitle
      window.removeEventListener('afterprint', restoreTitle)
    }
    document.title = reportFileName()
    window.addEventListener('afterprint', restoreTitle)
    window.print()
  }

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

      <div className="print:hidden">
        <StageHeader
          step="final"
          eyebrow={
            <Chip tone={bankerReviewStarted ? 'green' : canCertify ? 'blue' : 'amber'}>
              {bankerReviewStarted
                ? 'In merchant-banker review'
                : canCertify
                  ? 'Ready for certification'
                  : `${openHigh.length} high-severity item${openHigh.length === 1 ? '' : 's'} open`}
            </Chip>
          }
          why={
            <>
              This is your draft <Term term="DRHP">DRHP</Term>, assembled from everything you confirmed in the
              earlier stages. Every figure traces back to a source document, and every open flag travels with it.
            </>
          }
          todo={
            bankerReviewStarted
              ? 'Your lead manager has the draft and its provenance trail. You can keep reading, exporting or editing while they review.'
              : canCertify
                ? 'Read the draft, export a copy if you want one, then send it to your merchant banker for due diligence and certification.'
                : 'Read the draft and export it freely. Certification unlocks once the high-severity findings are resolved in the previous stage.'
          }
        />

        {/* Document actions. The report itself opens with the Cover Page below. */}
        <div className="mb-5 mt-6 flex flex-wrap items-center gap-2.5">
          <button onClick={() => setScorecardOpen(true)} className="btn btn-ghost btn-sm">
            <Scale size={14} /> ICDR scorecard
          </button>
          <button onClick={handleDownload} className="btn btn-ghost btn-sm">
            <Download size={14} /> Save as PDF
          </button>
          <button
            onClick={() => {
              downloadTextFile(`${reportFileName()}.txt`, draftAsText())
              showToast('Draft downloaded as a text file')
            }}
            className="btn btn-ghost btn-sm"
          >
            <FileText size={14} /> Download .txt
          </button>
          <button onClick={copySummary} className="btn btn-ghost btn-sm">
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy status'}
          </button>
          <button
            onClick={openSendDialog}
            disabled={bankerReviewStarted}
            aria-disabled={!canCertify}
            className={`btn btn-gold btn-sm ml-auto ${canCertify || bankerReviewStarted ? '' : 'opacity-60'}`}
          >
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

        <AnimatePresence>
          {blocked && !canCertify && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="mb-5"
            >
              <ResultNote tone="warn">
                <span className="block">
                  {openHigh.length} high-severity finding{openHigh.length === 1 ? '' : 's'} must be resolved before
                  a merchant banker can certify this draft: {openHigh.map((g) => g.title).join('; ')}.
                </span>
                <button onClick={() => goStep('gaps')} className="btn btn-ghost btn-sm mt-3">
                  <AlertTriangle size={13} /> Go and resolve them
                </button>
              </ResultNote>
            </motion.div>
          )}
        </AnimatePresence>
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

      <div className="print:hidden">
        {bankerReviewStarted && (
          <ResultNote className="mt-6">
            Sent to {ISSUE.leadManager}. They run due diligence, edit where needed and certify. Their comments come
            back inline — nothing is filed with SEBI or the exchange until they sign off.
          </ResultNote>
        )}

        <StageFooter
          step="final"
          continueLabel="Finish and open dashboard"
          note={
            bankerReviewStarted
              ? 'Draft handed over. The dashboard tracks the review from here.'
              : 'You can leave and come back — nothing is lost.'
          }
          extra={
            <button onClick={() => goStep('synthesis')} className="btn btn-quiet btn-sm">
              Edit a section
            </button>
          }
          onContinue={() => {
            completeStep('final')
            goScreen('dashboard')
          }}
        />
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
