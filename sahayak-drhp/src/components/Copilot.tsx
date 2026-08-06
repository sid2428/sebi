import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, AlertTriangle, Check, X } from 'lucide-react'
import { useStore, type StepId, type ChatMsg } from '../store'

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
    <div className={`bg-white border-line flex flex-col min-h-0 ${mobile ? 'h-full border-l' : 'h-screen border-l'} ${className}`}>
      <div className="px-5 py-4 border-b border-line flex items-center gap-3">
        <div className="w-[38px] h-[38px] rounded-[11px] grid place-items-center shrink-0 relative"
          style={{ background: 'linear-gradient(145deg,#0f2a54,#081428)' }}>
          <Sparkles size={19} className="text-gold" />
          <span className="absolute -bottom-0.5 -right-0.5 w-[11px] h-[11px] bg-ok rounded-full border-2 border-white" />
        </div>
        <div>
          <b className="text-[15px] block leading-tight">DRHP Co-pilot</b>
          <span className="text-[12px] text-muted">Guiding you · always here</span>
        </div>
        {mobile && onClose && (
          <button onClick={onClose} className="ml-auto w-9 h-9 rounded-lg border border-line grid place-items-center text-muted hover:bg-paper" aria-label="Close co-pilot">
            <X size={18} />
          </button>
        )}
      </div>

      <div ref={bodyRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-3.5">
        <AnimatePresence initial={false}>
          {chat.map((m) => (
            <motion.div key={m.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={m.role === 'ai' ? 'self-start max-w-[90%]' : 'self-end max-w-[88%]'}>
              {m.role === 'ai' ? (
                <div className="bg-paper border border-line px-4 py-3 rounded-[4px_15px_15px_15px] text-[13.8px] leading-relaxed">
                  <div className="text-[11px] font-bold text-gold-deep mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={12} /> Co-pilot
                  </div>
                  {m.text}
                  {m.callout && (
                    <div className={`mt-2.5 px-3 py-2.5 rounded-lg text-[12.8px] flex gap-2 items-start ${m.callout.kind === 'warn' ? 'bg-warn-bg text-[#8a5514]' : 'bg-ok-bg text-[#0d6b43]'}`}>
                      {m.callout.kind === 'warn' ? <AlertTriangle size={15} className="shrink-0 mt-0.5" /> : <Check size={15} className="shrink-0 mt-0.5" />}
                      {m.callout.text}
                    </div>
                  )}
                  {m.quicks && (
                    <div className="flex flex-col gap-1.5 mt-2.5">
                      {m.quicks.map((q) => (
                        <button key={q} onClick={() => ask(q)}
                          className="text-left text-[12.8px] font-semibold px-3 py-2 rounded-lg bg-white border border-line text-navy-800 hover:border-gold hover:bg-[#fffdf7] transition">
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-navy-900 text-[#eaf0fb] px-4 py-3 rounded-[15px_4px_15px_15px] text-[13.8px] leading-relaxed">{m.text}</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {typing && (
          <div className="self-start flex gap-1 px-4 py-3.5 bg-paper border border-line rounded-[4px_15px_15px_15px]">
            <i className="w-[7px] h-[7px] rounded-full bg-[#a9b8cf] animate-blink" />
            <i className="w-[7px] h-[7px] rounded-full bg-[#a9b8cf] animate-blink" style={{ animationDelay: '.2s' }} />
            <i className="w-[7px] h-[7px] rounded-full bg-[#a9b8cf] animate-blink" style={{ animationDelay: '.4s' }} />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-line">
        <div className="flex items-center gap-2.5 bg-paper border border-line rounded-xl pl-4 pr-2 py-2">
          <input ref={inputRef} aria-label="Ask the DRHP co-pilot" placeholder="Ask about any section, gap or rule…"
            onKeyDown={(e) => { if (e.key === 'Enter') { ask((e.target as HTMLInputElement).value); (e.target as HTMLInputElement).value = '' } }}
            className="flex-1 bg-transparent outline-none text-[13.5px]" />
          <button onClick={() => { if (inputRef.current) { ask(inputRef.current.value); inputRef.current.value = '' } }}
            className="w-[34px] h-[34px] rounded-[9px] bg-navy-900 text-gold-soft grid place-items-center hover:bg-navy-700 transition shrink-0">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
