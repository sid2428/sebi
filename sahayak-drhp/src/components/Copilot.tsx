import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, AlertTriangle, Check, X, ArrowRight } from 'lucide-react'
import { useStore, type StepId, type ChatMsg } from '../store'
import { EASE } from '../lib/motion'

type CopilotProps = {
  className?: string
  mobile?: boolean
  onClose?: () => void
}

// Scripted co-pilot messages per workspace step
const SCRIPTS: Record<StepId, Omit<ChatMsg, 'id'>[]> = {
  base: [
    { role: 'ai', text: 'Hi! I’m your DRHP co-pilot. I’ve read satvikfoods.in and cross-checked it against MCA master data — your company base is ready.' },
    { role: 'ai', text: 'I found 42 attributes and mapped them to the sections they’ll feed later. Take a look, then hit Continue to start verification.', quicks: ['What did you extract?', 'How accurate is this?'] },
  ],
  documents: [
    { role: 'ai', text: 'Now the evidence. I’ve split what SEBI asks for into six chapter groups, in the order a DRHP is assembled — corporate records first, then financials, licences, people, legal and contracts.' },
  ],
  kyc: [
    { role: 'ai', text: 'Verification runs in six phases — like a guided KYC. Four are already green from what I could confirm automatically.' },
    { role: 'ai', text: 'Two need a quick human touch.', callout: { kind: 'warn', text: '1 independent director DIN and a ₹18.4L GST matter need your attention.' }, quicks: ['Fix the director DIN', 'Explain the GST matter'] },
  ],
  eligibility: [
    { role: 'ai', text: 'I ran Satvik against NSE Emerge eligibility norms. Good news — you clear the core thresholds.', callout: { kind: 'ok', text: 'Eligibility score 92 / 100 — Eligible for NSE Emerge.' } },
    { role: 'ai', text: 'One litigation item needs disclosure but isn’t disqualifying. I’ll carry it into the Legal section automatically.', quicks: ['Which criteria are borderline?'] },
  ],
  synthesis: [
    { role: 'ai', text: 'Now the core: I’m synthesising all 14 DRHP sections. Each one is stitched from several source documents — hover a section to see its provenance.' },
    { role: 'ai', text: 'Most sections are 90%+ complete. A few have gaps I’ve flagged in amber so nothing slips through.', quicks: ['Show me the provenance map', 'Which section needs work most?'] },
  ],
  gaps: [
    { role: 'ai', text: 'Before this goes to your merchant banker, here’s everything I’m not fully confident about — 5 items, ranked by severity.' },
    { role: 'ai', text: 'The two high-severity ones block certification. Want me to walk you through resolving them?', callout: { kind: 'warn', text: '2 high-severity items must be resolved before filing.' }, quicks: ['Resolve the FY22 PAT mismatch', 'Draft the GST counsel note'] },
  ],
  final: [
    { role: 'ai', text: 'Here’s your substantially complete Draft Red Herring Prospectus. Every figure traces back to a source document.', callout: { kind: 'ok', text: 'Draft ready for merchant-banker review & certification.' } },
    { role: 'ai', text: 'When you’re ready, send it to Meridian Capital Advisors — your lead manager stays in the certify loop.', quicks: ['What happens after I send it?'] },
  ],
}

const DOCUMENT_TRACK_SCRIPTS: Record<number, Omit<ChatMsg, 'id'>[]> = {
  0: [
    {
      role: 'ai',
      text: 'You are in **Group 1: Corporate Records & Capital**. In this group, the Shareholders\' Agreement (SHA) cannot be publicly obtained and must be manually uploaded from your private files.',
      quicks: [
        'How do I obtain the Shareholders\' Agreement?',
        'Where is the Shareholders\' Agreement kept?',
        'Why is the Shareholders\' Agreement flagged?',
        'How to resolve the special rights in the Shareholders\' Agreement?'
      ]
    }
  ],
  1: [
    {
      role: 'ai',
      text: 'You are in **Group 2: Financial Information**. In this group, the Restated Financial Statements are required from you and cannot be publicly fetched.',
      quicks: [
        'Where do we procure the Restated Financial Statements?',
        'Why is a peer-reviewed auditor required for restatement?',
        'What is the mismatch in our restated FY22 PAT?',
        'How do we resolve the financial narrative inconsistency?'
      ]
    }
  ],
  2: [
    {
      role: 'ai',
      text: 'You are in **Group 3: Registrations & Licences**. In this group, the FSSAI Central License and the Fire NOC must be obtained from municipal/state authorities.',
      quicks: [
        'Where is the FSSAI License found and how to retrieve it?',
        'Why is the FSSAI central license material for Satvik?',
        'How do we procure the pending Fire NOC?',
        'What are the consequences of a missing Fire NOC for the IPO?'
      ]
    }
  ],
  3: [
    {
      role: 'ai',
      text: 'You are in **Group 4: Promoters, Directors & Management**. In this group, the DIR-8 Non-Disqualification Declarations must be signed and uploaded by each director.',
      quicks: [
        'Where do directors obtain DIR-8 non-disqualification forms?',
        'How to execute and file the DIR-8 declarations?',
        'Why are DIR-8 declarations mandatory under SEBI ICDR?',
        'What should we do if Mr. Iyer\'s DIN verification fails?'
      ]
    }
  ],
  4: [
    {
      role: 'ai',
      text: 'You are in **Group 5: Legal, Litigation & Contingencies**. In this group, the Legal Counsel Opinion on your pending GST appeal is required.',
      quicks: [
        'Where do we get the legal counsel note on the GST appeal?',
        'How do we draft the disclosure for our GST appeal?',
        'What is the status of the ₹18.4L GST appeal before Commissioner?',
        'Why is a legal counsel note required for pending litigation?'
      ]
    }
  ],
  5: [
    {
      role: 'ai',
      text: 'You are in **Group 6: Material Contracts & Property**. In this group, the Factory Lease Deed for your Pune manufacturing unit is required.',
      quicks: [
        'Where do we find the Pune factory lease deed?',
        'How do we procure a certified lease deed copy?',
        'Why is the factory lease deed classified as material?',
        'What happens if the factory lease expires during the IPO?'
      ]
    }
  ]
}

// canned responses to quick-reply / free text
function reply(q: string): Omit<ChatMsg, 'id'> {
  const l = q.toLowerCase()
  // Group 1
  if (l.includes('obtain the shareholders') || l.includes('how do i obtain the shareholders')) return { role: 'ai', text: '● **Where to find**: In your internal venture capital/investor relation files or company secretarial drive.\n\n● **How to get**: Retrieve the signed execution copy of the Share Subscription and Shareholders\' Agreement (SSHA) dated 11 August 2021 executed with Saama Growth Fund II. You can also request it from your legal counsel or corporate repository.' }
  if (l.includes('shareholders\' agreement kept') || l.includes('shareholders agreement kept') || l.includes('where is the shareholders')) return { role: 'ai', text: '● **Location**: Typically stored in the company\'s registered office or a secured corporate database like [Google Drive](https://drive.google.com) or [Dropbox](https://www.dropbox.com).\n\n● **Sourcing**: It is part of the secretarial files managed by your Company Secretary.' }
  if (l.includes('shareholders\' agreement flagged') || l.includes('shareholders agreement flagged') || l.includes('why is the shareholders')) return { role: 'ai', text: '● **The Issue**: Under [SEBI (ICDR) Regulations](https://www.sebi.gov.in), special rights granted to pre-IPO investors (like board seats, veto rights, or anti-dilution) must terminate before listing.\n\n● **Action required**: The agreement is flagged because it does not contain a clause terminating these rights on the listing date.' }
  if (l.includes('resolve the special rights') || l.includes('special rights in the shareholders')) return { role: 'ai', text: '● **Resolution**: You must execute a **Termination Agreement** or an **Amendment Deed** with Saama Growth Fund II. This deed must explicitly state that all special investor rights will cease to exist once the shares list on [NSE Emerge](https://www.nseindia.com/emerge).' }

  // Group 2
  if (l.includes('procure the restated') || l.includes('where do we procure')) return { role: 'ai', text: '● **Where to find**: Prepared internally by your finance department/CFO.\n\n● **How to get**: Recast the audited financial statements of the last three years (FY21, FY22, and FY23) into the restated format. Ensure they are signed, dated, and accompanied by an Examination Report from an ICAI peer-reviewed auditor.' }
  if (l.includes('peer-reviewed auditor') || l.includes('why is a peer-reviewed')) return { role: 'ai', text: '● **Rule**: Under the [SEBI (ICDR) Regulations](https://www.sebi.gov.in), any financial statements included in the DRHP must be audited or certified by a chartered accountant who holds a valid peer-review certificate from the [ICAI Peer Review Board](https://www.icai.org).' }
  if (l.includes('mismatch in our restated') || l.includes('fy22 pat')) return { role: 'ai', text: '● **Details**: The restated audited profit for FY22 shows **₹2.58 Cr**, but the marketing and business narrative drafted by the team refers to **₹2.34 Cr**.\n\n● **Verification**: All narrative figures must exactly match the peer-reviewed audited financial figures to pass SEBI scrutiny.' }
  if (l.includes('resolve the financial narrative') || l.includes('narrative inconsistency')) return { role: 'ai', text: '● **Resolution**: Go to the **Gaps & Consistency** tab or edit the draft sections to update the FY22 PAT to **₹2.58 Cr** everywhere. You can also click **Yes, use the audited figure** in the co-pilot menu to propagate this change automatically.' }

  // Group 3
  if (l.includes('fssai license found') || l.includes('where is the fssai')) return { role: 'ai', text: '● **Where to find**: FSSAI\'s online [FoSCoS Portal](https://foscos.fssai.gov.in).\n\n● **How to get**: Log in to the [FoSCoS Portal](https://foscos.fssai.gov.in) using your operator credentials, go to "Issued Licenses", select your active central license, and download the Form C PDF.' }
  if (l.includes('fssai central license material') || l.includes('why is the fssai')) return { role: 'ai', text: '● **Materiality**: As a packaged food manufacturer (Satvik Foods), the FSSAI central license is your primary regulatory approval to operate. It is disclosed in **Government & Other Approvals** and referenced in **Our Business**.' }
  if (l.includes('procure the pending fire') || l.includes('how do we procure the pending')) return { role: 'ai', text: '● **Where to find**: Pune Municipal Corporation (PMC) Fire Department.\n\n● **How to get**: Submit the renewal application via the [Maharashtra Fire Services Portal](https://mahafireservice.gov.in) along with proof of equipment testing and pay the fee to schedule an inspection.' }
  if (l.includes('consequences of a missing fire') || l.includes('missing fire noc')) return { role: 'ai', text: '● **Impact**: A missing or expired Fire NOC is a critical operational risk. Under [SEBI (ICDR) Regulations](https://www.sebi.gov.in), it must be disclosed under "Key Pending Approvals" in the Risk Factors section, which can impact investor confidence.' }

  // Group 4
  if (l.includes('obtain dir-8') || l.includes('where do directors obtain')) return { role: 'ai', text: '● **Where to find**: Downloaded from the [MCA Portal](https://www.mca.gov.in) under the Companies Act Rules.\n\n● **How to get**: The Company Secretary prepares this form for each director at the end of the financial year. It must be filled out and signed by each director manually.' }
  if (l.includes('execute and file the dir-8') || l.includes('how to execute and file')) return { role: 'ai', text: '● **Execution**: Each director must sign a physical copy of the DIR-8 form declaring they are not disqualified under Section 164(2) of the Companies Act. These are then scanned and uploaded to the company records.' }
  if (l.includes('dir-8 declarations mandatory') || l.includes('why are dir-8')) return { role: 'ai', text: '● **Rule**: [SEBI (ICDR) Regulations](https://www.sebi.gov.in) require confirmation that none of the company\'s directors are disqualified from holding directorships under Section 164 of the Companies Act, 2013.' }
  if (l.includes('iyer\'s din verification') || l.includes('s. iyer') || l.includes('fails')) return { role: 'ai', text: '● **Action**: Log in to the [MCA Portal](https://www.mca.gov.in), check Mr. S. Iyer\'s DIN status (must be \'Active\'). If it is deactivated due to non-filing of DIR-3 KYC, file the form with the registrar to restore active status.' }

  // Group 5
  if (l.includes('counsel note on the gst') || l.includes('where do we get the legal')) return { role: 'ai', text: '● **Where to find**: From the external tax consultant or legal advisor handling your appeals.\n\n● **How to get**: Request the legal firm to issue an official opinion letter on the letterhead of the counsel representing Satvik Foods before the Commissioner (Appeals).' }
  if (l.includes('draft the disclosure for') || l.includes('how do we draft the disclosure')) return { role: 'ai', text: '● **Drafting**: The co-pilot has pre-drafted the counsel note under **Gaps & Consistency**. It details the ₹18.4L disputed input tax credit, the grounds of appeal, and the likelihood of success (classified as a contingent liability).' }
  if (l.includes('gst appeal before commissioner') || l.includes('status of the') || l.includes('appeal before commissioner')) return { role: 'ai', text: '● **Status**: The appeal was filed against the demand order issued for FY21. It is currently pending hearing. You can track its status on the [GST Portal](https://www.gst.gov.in) under services.' }
  if (l.includes('legal counsel note required') || l.includes('why is a legal counsel')) return { role: 'ai', text: '● **Objective**: To give merchant bankers and investors a professional assessment of the financial risk. Under [SEBI (ICDR) Regulations](https://www.sebi.gov.in), material pending litigations require disclosure of the financial implications.' }

  // Group 6
  if (l.includes('pune factory lease') || l.includes('where do we find the pune factory')) return { role: 'ai', text: '● **Where to find**: The physical locker at your corporate office or the sub-registrar office where it was registered.\n\n● **How to get**: Retrieve the registered lease deed executed between Satvik Foods and the industrial park landlord.' }
  if (l.includes('certified lease deed') || l.includes('how do we procure a certified lease')) return { role: 'ai', text: '● **Sourcing**: Apply to the local sub-registrar of assurances in Pune or download it via the [IGR Maharashtra Portal](https://igrmaharashtra.gov.in) by searching the index registers.' }
  if (l.includes('lease deed classified as material') || l.includes('why is the factory lease')) return { role: 'ai', text: '● **Materiality**: Your Pune manufacturing plant produces 100% of your D2C foods. Under [SEBI (ICDR) Regulations](https://www.sebi.gov.in), any contract lease covering the primary place of business is a "Material Contract".' }
  if (l.includes('lease expires during the ipo') || l.includes('what happens if the factory lease')) return { role: 'ai', text: '● **Risk**: If it expires, it presents a risk of business disruption. You must disclose it as a major risk factor under [SEBI (ICDR) Rules](https://www.sebi.gov.in) or initiate a renewal/extension agreement immediately.' }

  // Rest
  if (l.includes('incorporation') || l.includes('coi')) return { role: 'ai', text: '● **Where to find**: [Ministry of Corporate Affairs (MCA) Portal](https://www.mca.gov.in) under company filing records.\n\n● **How to get**: Log in to the [MCA V3 Portal](https://www.mca.gov.in) with user credentials, navigate to "MCA Services" > "View Public Documents", search for Satvik Foods by CIN/Name, pay the nominal document access fee, and download it directly. Alternatively, retrieve it from the Company Secretary’s legal archives.' }
  if (l.includes('board resolution') || l.includes('authorising')) return { role: 'ai', text: '● **Where to find**: Statutory Minutes Book of Board Meetings.\n\n● **How to get**: Request a Certified True Copy (CTC) from the Company Secretary (CS). The CS extracts the approved minutes from the board meeting held on 18 February 2026 (approving the Fresh Issue up to ₹32.00 Cr) and signs/stamps it.' }
  if (l.includes('gst')) return { role: 'ai', text: 'The ₹18.4 lakh GST demand (FY21 input-credit dispute) is under appeal before the Commissioner (Appeals). It’s a contingent liability — not a disqualifier — but SEBI ICDR needs it disclosed with a counsel note in Section XI. I’ve pre-drafted that note for your legal counsel to confirm.' }
  if (l.includes('din') || l.includes('director')) return { role: 'ai', text: 'I’ve queued an MCA DIN validation request for Mr. S. Iyer. Once it clears, the Management section (XII) will flip to green automatically. This is the only KYC item still open.' }
  if (l.includes('pat') || l.includes('mismatch')) return { role: 'ai', text: 'The narrative cited FY22 PAT of ₹2.34 Cr, but the restated audited figure is ₹2.58 Cr. I recommend adopting the audited figure everywhere. Shall I propagate ₹2.58 Cr across Sections III, VII and X?', quicks: ['Yes, use the audited figure'] }
  if (l.includes('fssai') || l.includes('licence') || l.includes('license')) return { role: 'ai', text: 'You manufacture and sell packaged food, so the FSSAI central licence is the single most material approval in your file — it goes into “Government and Other Approvals”, and it is also referenced from “Our Business” and “Key Regulations and Policies”. Yours runs to 30 September 2026, so it is valid through the filing window. The fire NOC is the one to watch: that renewal is still pending and will be disclosed as a pending approval.' }
  if (l.includes('mandatory') || l.includes('required document')) return { role: 'ai', text: 'Of the 42 documents, 40 are mandatory and 2 are conditional — the fire NOC and any regulatory correspondence, which only apply if they exist. The hardest gates are the restated financials with a peer-reviewed auditor’s examination report, the DIR-8 non-disqualification declarations, and the counsel note on your GST appeal. Without those three a merchant banker cannot certify the draft.' }
  if (l.includes('financial') && (l.includes('need') || l.includes('what'))) return { role: 'ai', text: 'Eight items in the Financial Information group: audited statements for FY21–FY23, the restated financial information with the examination report, the auditor’s report with its CARO annexure, a capitalisation statement, the accounting ratios behind your price band, the special tax benefits note, your sanction letters, and the working-capital assessment. Two need attention — the restated FY22 PAT of ₹2.58 Cr contradicts the ₹2.34 Cr in your narrative, and your lender’s no-objection for the listing has not arrived.' }
  if (l.includes('data room') || l.includes('attach all')) return { role: 'ai', text: '“Attach from data room” pulls everything still outstanding in the group you are on and reads each file in turn. In a live deployment that would connect to your virtual data room; here it replays against the sample set so you can see the whole flow without hunting for 42 files.' }
  if (l.includes('provenance') || l.includes('map')) return { role: 'ai', text: 'Switch to the “Provenance” tab in this step — it shows the full document → section matrix. For example, your Audited Financials feed Risk Factors, Financial Information, Objects and Basis for Issue Price all at once.' }
  if (l.includes('extract') || l.includes('accurate')) return { role: 'ai', text: 'I pulled identity (CIN, RoC, GSTIN), sector & product lines, funding history and press signals — 42 attributes in all, each traced to the page it came from. Anything I inferred is marked so your banker can verify it.' }
  if (l.includes('after') || l.includes('send')) return { role: 'ai', text: 'On send, the draft is packaged with its provenance trail and shared with Meridian Capital Advisors. They run due diligence, edit where needed, and certify. You’ll see their comments come back inline — nothing is filed with SEBI/NSE until they sign off.' }
  if (l.includes('yes')) return { role: 'ai', text: 'Done — I’ve propagated the audited FY22 PAT of ₹2.58 Cr across all three sections and cleared the inconsistency flag. ✔' }
  if (l.includes('borderline') || l.includes('criteria')) return { role: 'ai', text: 'Only “Material litigation” is amber — because of the disclosed GST appeal. Every other criterion (net tangible assets, track record, profitability, promoter holding) clears comfortably.' }
  if (l.includes('section') && l.includes('work')) return { role: 'ai', text: 'Section X — Basis for Issue Price — is lowest at 74%. It needs a fuller listed-peer comparison (P/E, P/B, RoNW). I’ve identified 3 candidate comparables; approve them and it’ll jump to ~95%.' }
  return { role: 'ai', text: 'Good question. In this prototype I can walk you through eligibility, the section provenance map, or any flagged gap — try one of the suggested prompts, or ask about a specific DRHP section.' }
}

function parseLinks(text: string) {
  const linkParts = text.split(/(\[[^\]]+\]\([^)]+\))/g)
  return linkParts.map((part, idx) => {
    const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/)
    if (match) {
      return (
        <a
          key={idx}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-600 hover:underline font-bold"
        >
          {match[1]}
        </a>
      )
    }
    return part
  })
}

function parseMessageText(text: string) {
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g)
  return boldParts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldContent = part.slice(2, -2)
      return (
        <strong key={idx} className="font-extrabold text-ink">
          {parseLinks(boldContent)}
        </strong>
      )
    }
    return <span key={idx}>{parseLinks(part)}</span>
  })
}

export default function Copilot({ className = '', mobile = false, onClose }: CopilotProps) {
  const { chat, typing, step, pushChat, setTyping } = useStore()
  const docTrackIndex = useStore((s) => s.docTrackIndex)
  const seeded = useRef<Set<string>>(new Set())
  const lastTrackIndex = useRef<number>(-1)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // seed scripted messages when a step is first visited
  useEffect(() => {
    if (seeded.current.has(step)) return
    seeded.current.add(step)
    const msgs = SCRIPTS[step]
    let delay = 350
    msgs.forEach((m, i) => {
      setTimeout(() => setTyping(true), delay)
      delay += 750
      setTimeout(() => { setTyping(false); pushChat(m) }, delay)
      delay += 250
    })
  }, [step]) // eslint-disable-line

  // seed group-specific messages when group/track index changes within documents step
  useEffect(() => {
    if (step !== 'documents') return
    if (lastTrackIndex.current === docTrackIndex) return
    lastTrackIndex.current = docTrackIndex

    const msgs = DOCUMENT_TRACK_SCRIPTS[docTrackIndex]
    if (!msgs) return

    let delay = 150
    msgs.forEach((m) => {
      setTimeout(() => setTyping(true), delay)
      delay += 550
      setTimeout(() => { setTyping(false); pushChat(m) }, delay)
      delay += 150
    })
  }, [docTrackIndex, step]) // eslint-disable-line

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [chat, typing])

  function ask(text: string) {
    if (!text.trim()) return
    pushChat({ role: 'user', text })
    setTyping(true)
    setTimeout(() => { setTyping(false); pushChat(reply(text)) }, 900)
  }

  return (
    <aside
      className={`flex min-h-0 flex-col border-line bg-white ${mobile ? 'h-full' : 'h-screen border-l'} ${className}`}
      aria-label="DRHP co-pilot"
    >
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-line px-5 py-3.5">
        <span
          className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl2"
          style={{ background: 'linear-gradient(145deg,#5B8DEF,#2E4E9C)' }}
        >
          <Sparkles size={17} className="text-white" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-ok" />
        </span>
        <div className="min-w-0 flex-1">
          <b className="block text-[14.5px] font-bold leading-tight">DRHP co-pilot</b>
          <span className="text-[11.5px] text-muted">Reads every step with you</span>
        </div>
        {mobile && onClose && (
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:bg-panel"
            aria-label="Close co-pilot"
          >
            <X size={18} />
          </button>
        )}
      </header>

      {/* Transcript */}
      <div
        ref={bodyRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
        tabIndex={0}
        role="log"
        aria-live="polite"
        aria-label="Co-pilot conversation"
      >
        <AnimatePresence initial={false}>
          {chat.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: EASE }}
              className={m.role === 'ai' ? 'max-w-[94%] self-start' : 'max-w-[88%] self-end'}
            >
              {m.role === 'ai' ? (
                <div className="rounded-[6px_16px_16px_16px] border border-line bg-panel/80 px-4 py-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-accent-700">
                    <Sparkles size={11} /> Co-pilot
                  </div>
                  <p className="text-[13.5px] leading-[1.62] text-ink-2 whitespace-pre-wrap">{parseMessageText(m.text)}</p>

                  {m.callout && (
                    <div
                      className={`mt-2.5 flex items-start gap-2 rounded-xl2 px-3 py-2.5 text-[12.5px] leading-[1.5] ${
                        m.callout.kind === 'warn'
                          ? 'bg-warn-bg text-warn ring-1 ring-inset ring-warn-line'
                          : 'bg-ok-bg text-ok ring-1 ring-inset ring-ok-line'
                      }`}
                    >
                      {m.callout.kind === 'warn' ? (
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                      ) : (
                        <Check size={14} className="mt-0.5 shrink-0" />
                      )}
                      <span className="font-semibold">{m.callout.text}</span>
                    </div>
                  )}

                  {m.quicks && (
                    <div className="mt-2.5 flex flex-col gap-1.5">
                      {m.quicks.map((q) => (
                        <button
                          key={q}
                          onClick={() => ask(q)}
                          className="group flex items-center justify-between gap-2 rounded-xl2 border border-line bg-white px-3 py-2 text-left text-[12.5px] font-bold text-accent-700 transition-colors duration-200 hover:border-accent-300 hover:bg-accent-50"
                        >
                          {q}
                          <ArrowRight
                            size={13}
                            className="shrink-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-[16px_6px_16px_16px] bg-ink px-4 py-3 text-[13.5px] leading-[1.62] text-white">
                  {m.text}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {typing && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-1.5 self-start rounded-[6px_16px_16px_16px] border border-line bg-panel/80 px-4 py-3.5"
          >
            <span className="sr-only">Co-pilot is typing</span>
            <i className="h-[7px] w-[7px] animate-blink rounded-full bg-accent-300" />
            <i className="h-[7px] w-[7px] animate-blink rounded-full bg-accent-300" style={{ animationDelay: '.2s' }} />
            <i className="h-[7px] w-[7px] animate-blink rounded-full bg-accent-300" style={{ animationDelay: '.4s' }} />
          </motion.div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2 rounded-2xl2 border border-line bg-panel/70 py-1.5 pl-4 pr-1.5 transition-colors duration-200 focus-within:border-accent-300 focus-within:bg-white">
          <input
            ref={inputRef}
            aria-label="Ask the DRHP co-pilot"
            placeholder="Ask about any section, gap or rule…"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                ask((e.target as HTMLInputElement).value)
                ;(e.target as HTMLInputElement).value = ''
              }
            }}
            className="min-w-0 flex-1 bg-transparent py-2 text-[13px] outline-none placeholder:text-muted"
          />
          <button
            onClick={() => {
              if (inputRef.current) {
                ask(inputRef.current.value)
                inputRef.current.value = ''
              }
            }}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent-600 text-white transition-colors duration-200 hover:bg-accent-700"
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
