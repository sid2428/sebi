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

// canned responses to quick-reply / free text
function reply(q: string): Omit<ChatMsg, 'id'> {
  const l = q.toLowerCase()
  if (l.includes('gst')) return { role: 'ai', text: 'The ₹18.4 lakh GST demand (FY21 input-credit dispute) is under appeal before the Commissioner (Appeals). It’s a contingent liability — not a disqualifier — but SEBI ICDR needs it disclosed with a counsel note in Section XI. I’ve pre-drafted that note for your legal counsel to confirm.' }
  if (l.includes('din') || l.includes('director')) return { role: 'ai', text: 'I’ve queued an MCA DIN validation request for Mr. S. Iyer. Once it clears, the Management section (XII) will flip to green automatically. This is the only KYC item still open.' }
  if (l.includes('pat') || l.includes('mismatch')) return { role: 'ai', text: 'The narrative cited FY22 PAT of ₹2.34 Cr, but the restated audited figure is ₹2.58 Cr. I recommend adopting the audited figure everywhere. Shall I propagate ₹2.58 Cr across Sections III, VII and X?', quicks: ['Yes, use the audited figure'] }
  if (l.includes('provenance') || l.includes('map')) return { role: 'ai', text: 'Switch to the “Provenance” tab in this step — it shows the full document → section matrix. For example, your Audited Financials feed Risk Factors, Financial Information, Objects and Basis for Issue Price all at once.' }
  if (l.includes('extract') || l.includes('accurate')) return { role: 'ai', text: 'I pulled identity (CIN, RoC, GSTIN), sector & product lines, funding history and press signals — 42 attributes in all, each traced to the page it came from. Anything I inferred is marked so your banker can verify it.' }
  if (l.includes('after') || l.includes('send')) return { role: 'ai', text: 'On send, the draft is packaged with its provenance trail and shared with Meridian Capital Advisors. They run due diligence, edit where needed, and certify. You’ll see their comments come back inline — nothing is filed with SEBI/NSE until they sign off.' }
  if (l.includes('yes')) return { role: 'ai', text: 'Done — I’ve propagated the audited FY22 PAT of ₹2.58 Cr across all three sections and cleared the inconsistency flag. ✔' }
  if (l.includes('borderline') || l.includes('criteria')) return { role: 'ai', text: 'Only “Material litigation” is amber — because of the disclosed GST appeal. Every other criterion (net tangible assets, track record, profitability, promoter holding) clears comfortably.' }
  if (l.includes('section') && l.includes('work')) return { role: 'ai', text: 'Section X — Basis for Issue Price — is lowest at 74%. It needs a fuller listed-peer comparison (P/E, P/B, RoNW). I’ve identified 3 candidate comparables; approve them and it’ll jump to ~95%.' }
  return { role: 'ai', text: 'Good question. In this prototype I can walk you through eligibility, the section provenance map, or any flagged gap — try one of the suggested prompts, or ask about a specific DRHP section.' }
}

export default function Copilot({ className = '', mobile = false, onClose }: CopilotProps) {
  const { chat, typing, step, pushChat, setTyping } = useStore()
  const seeded = useRef<Set<string>>(new Set())
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
                  <p className="text-[13.5px] leading-[1.62] text-ink-2">{m.text}</p>

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
