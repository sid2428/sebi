import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import {
  Download, Send, Check, ShieldCheck, X, Landmark, Clock, Scale, FileText, Copy,
  AlertTriangle, Loader2, FileCheck2, RefreshCw,
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
import { DRHP_PDF_URL, buildSections, openPdf, pageRatio, type PdfSection } from '../../lib/pdf'
import DrhpGeneration from '../../components/DrhpGeneration'
import DrhpViewer from '../../components/DrhpViewer'

// Clean, versioned export filename derived from the report metadata, e.g.
// "Satvik_Foods_Limited_Draft_DRHP_v1.0" — the extension is appended.
function reportFileName() {
  const slug = (s: string) => s.trim().replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '')
  const company = slug(cover.company.name)
  // Keep the dot/hyphen in the version (e.g. "v1.0"); only strip unsafe chars.
  const version = cover.version.trim().replace(/[^\p{L}\p{N}.\-]+/gu, '_').replace(/^_+|_+$/g, '')
  return `${company}_Draft_DRHP_${version}`
}

/** What the loaded PDF gives us, once it has been read and indexed. */
type LoadedDoc = {
  doc: PDFDocumentProxy
  sections: PdfSection[]
  ratio: number
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
  const drhpGenerated = useStore((s) => s.drhpGenerated)
  const setDrhpGenerated = useStore((s) => s.setDrhpGenerated)

  const [modal, setModal] = useState(false)
  const [scorecardOpen, setScorecardOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [blocked, setBlocked] = useState(false)

  // The offer document itself: loaded, indexed, and revealed once the
  // generation sequence has played through at least once this session.
  const [loaded, setLoaded] = useState<LoadedDoc | null>(null)
  const [indexProgress, setIndexProgress] = useState<{ done: number; total: number } | null>(null)
  const [attempt, setAttempt] = useState(0)
  /** Set only after the retries are spent — a transport problem, not a state. */
  const [unreachable, setUnreachable] = useState(false)
  const [revealed, setRevealed] = useState(drhpGenerated)

  const MAX_ATTEMPTS = 3

  const exec = executiveSummary()

  // Certification is the one genuinely gated action: the draft says
  // high-severity items must clear before a banker can certify it.
  const openHigh = GAPS.filter((g) => g.severity === 'high' && !gapResolutions[g.id])
  const canCertify = openHigh.length === 0

  // Read the PDF for real while the sequence plays. Page count, page
  // proportions and the section rail all come out of the file itself.
  useEffect(() => {
    let cancelled = false
    let opened: PDFDocumentProxy | null = null
    let retry = 0

    setIndexProgress(null)

    ;(async () => {
      try {
        const doc = await openPdf()
        opened = doc
        if (cancelled) return
        const ratio = await pageRatio(doc)
        const sections = await buildSections(doc, (done, total) => {
          if (!cancelled) setIndexProgress({ done, total })
        })
        if (cancelled) return
        setLoaded({ doc, sections, ratio })
      } catch {
        if (cancelled) return
        // Fetching the document can fail transiently. Retry quietly a
        // couple of times before admitting anything to the issuer.
        if (attempt + 1 < MAX_ATTEMPTS) {
          retry = window.setTimeout(() => setAttempt((n) => n + 1), 900)
        } else {
          setUnreachable(true)
        }
      }
    })()

    return () => {
      cancelled = true
      window.clearTimeout(retry)
      opened?.destroy().catch(() => {})
    }
  }, [attempt])

  const totalPages = loaded?.doc.numPages ?? null

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
    showToast(`Draft sent to ${ISSUE.leadManager} for certification`)
  }

  /** Download the filed PDF as it stands — the same bytes the viewer shows. */
  function downloadPdf() {
    const a = document.createElement('a')
    a.href = DRHP_PDF_URL
    a.download = `${reportFileName()}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    showToast('Draft DRHP downloaded')
  }

  /** The drafting record behind the document — sections, sources, open flags. */
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
      `Completeness: ${exec.completeness.mean}% across ${exec.completeness.total} sections`,
      `Open findings: ${GAPS.length - Object.keys(gapResolutions).length} of ${GAPS.length}`,
      `Lead manager: ${ISSUE.leadManager}`,
      `Certification: ${bankerReviewStarted ? 'in merchant-banker review' : canCertify ? 'ready to send' : 'blocked by high-severity findings'}`,
    ].join('\n')
    const ok = await copyText(summary)
    setCopied(ok)
    showToast(ok ? 'Status summary copied' : 'Copy blocked by the browser')
    window.setTimeout(() => setCopied(false), 2200)
  }

  // Bring the build — and later the document — up under the top bar, so
  // the sequence plays in view rather than below the fold.
  const docRef = useRef<HTMLDivElement>(null)
  function bringIntoView(delay: number) {
    window.setTimeout(() => {
      const el = docRef.current
      if (!el) return
      const bar = document.querySelector<HTMLElement>('[data-workspace-topbar]')
      const offset = (bar?.getBoundingClientRect().height ?? 0) + 14
      const top = el.getBoundingClientRect().top + window.scrollY - offset
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    }, delay)
  }

  useEffect(() => {
    bringIntoView(revealed ? 320 : 620)
    // Mount only: later scrolls are triggered by the reveal itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="max-w-none">
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
            Verification is signed off, so the offer document has been produced. This is the filed{' '}
            <Term term="DRHP">DRHP</Term> itself — the typeset, SEBI-format PDF, not a preview of it.
            Every figure in it traces back to a source document, and every open flag travels with it.
          </>
        }
        todo={
          bankerReviewStarted
            ? 'Your lead manager has the document and its provenance trail. You can keep reading, downloading or editing while they review.'
            : canCertify
              ? 'Read the document using the section rail, download a copy if you want one, then send it to your merchant banker for due diligence and certification.'
              : 'Read and download the document freely. Certification unlocks once the high-severity findings are resolved in the previous stage.'
        }
      />

      {/* ---- the document: generated, then shown ---- */}
      <div ref={docRef} className="mt-6 scroll-mt-24">
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div key="generating">
              <DrhpGeneration
                ready={!!loaded || unreachable}
                doc={loaded?.doc ?? null}
                sectionCount={loaded?.sections.length ?? null}
                indexProgress={indexProgress}
                onDone={() => {
                  setDrhpGenerated(true)
                  setRevealed(true)
                  showToast('Draft DRHP generated — ready for review')
                  bringIntoView(120)
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="document"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <DocumentActions
                pdfReady={!!loaded}
                onScorecard={() => setScorecardOpen(true)}
                onDownloadPdf={downloadPdf}
                onDownloadText={() => {
                  downloadTextFile(`${reportFileName()}.txt`, draftAsText())
                  showToast('Drafting record downloaded as a text file')
                }}
                onCopy={copySummary}
                copied={copied}
                onSend={openSendDialog}
                sent={bankerReviewStarted}
                canCertify={canCertify}
              />

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
                        {openHigh.length} high-severity finding{openHigh.length === 1 ? '' : 's'} must be
                        resolved before a merchant banker can certify this document:{' '}
                        {openHigh.map((g) => g.title).join('; ')}.
                      </span>
                      <button onClick={() => goStep('gaps')} className="btn btn-ghost btn-sm mt-3">
                        <AlertTriangle size={13} /> Go and resolve them
                      </button>
                    </ResultNote>
                  </motion.div>
                )}
              </AnimatePresence>

              {loaded ? (
                <DrhpViewer
                  doc={loaded.doc}
                  sections={loaded.sections}
                  ratio={loaded.ratio}
                  fileUrl={DRHP_PDF_URL}
                  fileName={`${reportFileName()}.pdf`}
                  onDownload={downloadPdf}
                />
              ) : (
                <ReopeningDocument
                  unreachable={unreachable}
                  onRetry={() => {
                    setUnreachable(false)
                    setAttempt((n) => n + 1)
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---- certification status ---- */}
      <div
        className={`card mt-5 flex flex-wrap items-center gap-4 p-4 ${
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
          {totalPages && (
            <span className="flex items-center gap-1.5">
              <FileCheck2 size={13} className="text-accent-600" /> {totalPages} pages ·{' '}
              {loaded?.sections.length ?? 0} sections
            </span>
          )}
        </div>
      </div>

      {bankerReviewStarted && (
        <ResultNote className="mt-6">
          Sent to {ISSUE.leadManager}. They run due diligence, edit where needed and certify. Their comments
          come back inline — nothing is filed with SEBI or the exchange until they sign off.
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
                  <dt className="text-muted">Document</dt>
                  <dd className="font-bold text-ink">
                    {totalPages ? `${totalPages}-page PDF` : 'Draft DRHP PDF'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 py-1">
                  <dt className="text-muted">Draft completeness</dt>
                  <dd className="font-bold text-ok">
                    {exec.completeness.mean}% · {exec.completeness.total} sections
                  </dd>
                </div>
                <div className="flex justify-between gap-3 py-1">
                  <dt className="text-muted">Open flags disclosed</dt>
                  <dd className="font-bold text-warn">{exec.findings.total} items</dd>
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

/** The action bar above the document. Staggered in behind the reveal. */
function DocumentActions({
  pdfReady,
  onScorecard,
  onDownloadPdf,
  onDownloadText,
  onCopy,
  copied,
  onSend,
  sent,
  canCertify,
}: {
  pdfReady: boolean
  onScorecard: () => void
  onDownloadPdf: () => void
  onDownloadText: () => void
  onCopy: () => void
  copied: boolean
  onSend: () => void
  sent: boolean
  canCertify: boolean
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.18 } } }}
      className="mb-4 flex flex-wrap items-center gap-2.5"
    >
      <Action>
        <button onClick={onScorecard} className="btn btn-ghost btn-sm">
          <Scale size={14} /> ICDR scorecard
        </button>
      </Action>
      <Action>
        <button onClick={onDownloadPdf} disabled={!pdfReady} className="btn btn-ghost btn-sm">
          <Download size={14} /> Download DRHP (PDF)
        </button>
      </Action>
      <Action>
        <button onClick={onDownloadText} className="btn btn-ghost btn-sm">
          <FileText size={14} /> Drafting record (.txt)
        </button>
      </Action>
      <Action>
        <button onClick={onCopy} className="btn btn-ghost btn-sm">
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy status'}
        </button>
      </Action>
      <Action className="ml-auto">
        <button
          onClick={onSend}
          disabled={sent}
          aria-disabled={!canCertify}
          className={`btn btn-gold btn-sm ${canCertify || sent ? '' : 'opacity-60'}`}
        >
          {sent ? (
            <>
              <Check size={14} /> Sent to banker
            </>
          ) : (
            <>
              <Send size={14} /> Send to banker
            </>
          )}
        </button>
      </Action>
    </motion.div>
  )
}

function Action({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.span
      variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.3, ease: EASE }}
      className={className}
    >
      {children}
    </motion.span>
  )
}

/**
 * Shown while the generated document is being re-opened — on a revisit to
 * this stage, or in the rare case the file could not be fetched. The
 * document exists either way; this is about reaching it.
 */
function ReopeningDocument({ unreachable, onRetry }: { unreachable: boolean; onRetry: () => void }) {
  return (
    <div className="card grid min-h-[320px] place-items-center p-8">
      {unreachable ? (
        <div className="max-w-[54ch] text-center">
          <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl2 bg-panel-2 text-ink-2">
            <RefreshCw size={19} />
          </span>
          <b className="block text-[15px] font-extrabold">Reconnecting to the document</b>
          <p className="mt-1.5 text-[13px] leading-[1.6] text-muted">
            The generated prospectus is saved, but the viewer could not fetch it just now. Your draft and
            everything attached to it are unaffected.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            <button onClick={onRetry} className="btn btn-ghost btn-sm">
              <RefreshCw size={13} /> Reload the document
            </button>
            <button onClick={downloadCopy} className="btn btn-ghost btn-sm">
              <Download size={13} /> Download instead
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-muted">
          <Loader2 size={20} className="animate-spin text-accent-500" />
          <span className="text-[12.5px] font-semibold">Opening the offer document…</span>
        </div>
      )}
    </div>
  )
}

/** Straight-to-disk copy, used when the in-page viewer cannot reach the file. */
function downloadCopy() {
  const a = document.createElement('a')
  a.href = DRHP_PDF_URL
  a.download = `${reportFileName()}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
}
