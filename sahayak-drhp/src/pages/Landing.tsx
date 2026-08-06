import { motion } from 'framer-motion'
import {
  ArrowRight, Check, FileText, ShieldCheck, Sparkles, Clock, Users, ScanLine,
  GitMerge, AlertTriangle, BadgeCheck, Landmark, Scale, Building2, TrendingDown,
} from 'lucide-react'
import { useStore } from '../store'
import { Brand } from '../components/ui'
import HandoffTimeline from '../components/HandoffTimeline'

const fade = (d = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, delay: d, ease: [0.2, 0.7, 0.2, 1] as const },
})

export default function Landing() {
  const go = useStore((s) => s.goScreen)
  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <div
        className="relative overflow-hidden text-[#eaf0fb]"
        style={{
          background:
            'radial-gradient(1100px 600px at 82% -8%,rgba(212,175,95,.16),transparent 60%),radial-gradient(900px 700px at 5% 110%,rgba(47,111,220,.12),transparent 55%),linear-gradient(180deg,#0a1a37 0%,#0b1e3f 46%,#0d244d 100%)',
        }}
      >
        <div className="absolute inset-0 hero-grid" />
        {/* nav */}
        <div className="relative max-w-[1220px] mx-auto px-7">
          <div className="flex items-center justify-between h-[70px]">
            <Brand light />
            <div className="hidden md:flex items-center gap-8 text-[14.5px] font-medium text-[#c3d0e6]">
              <a href="#how-it-works" className="hover:text-white">How it works</a>
              <a href="#disclosures" className="hover:text-white">Disclosures</a>
              <a href="#for-intermediaries" className="hover:text-white">For intermediaries</a>
              <button onClick={() => go('ingest')} className="btn btn-gold btn-sm">Launch app</button>
            </div>
          </div>
        </div>

        {/* hero main */}
        <div className="relative max-w-[1220px] mx-auto px-7 grid lg:grid-cols-[1.08fr_.92fr] gap-14 items-center pt-10 pb-24">
          <div>
            <motion.div {...fade(0)} className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[13px] font-semibold text-[#dbe6f7] border border-white/10 bg-white/[.06]">
              <span className="w-[7px] h-[7px] rounded-full bg-gold shadow-[0_0_12px_#d4af5f]" />
              Aligned to SEBI (ICDR) SME framework · NSE Emerge & BSE SME
            </motion.div>
            <motion.h1 {...fade(0.08)} className="text-[clamp(32px,4vw,52px)] leading-[1.08] tracking-[-0.025em] font-extrabold mt-5 mb-5">
              From your website to a{' '}
              <span style={{ background: 'linear-gradient(120deg,#e7d3a1,#d4af5f)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                disclosure-ready DRHP
              </span>
              <br />— in an afternoon, not months.
            </motion.h1>
            <motion.p {...fade(0.16)} className="text-[18.5px] leading-relaxed text-[#c4d2ea] max-w-[560px]">
              Sahayak lets a first-time SME promoter capture their business, financial and legal
              particulars and generate a substantially complete draft offer document — while the
              merchant banker stays in the review-and-certify loop.
            </motion.p>
            <motion.div {...fade(0.24)} className="flex gap-3.5 mt-8 flex-wrap">
              <button onClick={() => go('ingest')} className="btn btn-gold btn-lg">
                Start with your website <ArrowRight size={18} />
              </button>
              <button onClick={() => go('ingest')} className="btn btn-ghost btn-lg !text-[#dbe6f7] !border-white/15 hover:!bg-white/5">
                <FileText size={18} /> See a live draft
              </button>
            </motion.div>

            <motion.div {...fade(0.32)} className="flex gap-7 mt-9 flex-wrap">
              {[
                { icon: ScanLine, t: 'No forms to fear', s: 'We read your website & documents and pre-fill the draft.' },
                { icon: ShieldCheck, t: 'Compliance-first', s: 'Every field is traceable to a source document.' },
                { icon: Users, t: 'Banker in the loop', s: 'The intermediary reviews & certifies — you draft faster.' },
              ].map((t) => (
                <div key={t.t} className="flex gap-2.5 items-start max-w-[210px]">
                  <t.icon size={19} className="text-gold shrink-0 mt-0.5" />
                  <div>
                    <b className="block text-[14px] text-[#eaf0fb]">{t.t}</b>
                    <span className="text-[12.5px] text-[#93a6c6] leading-snug">{t.s}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* hero visual — document stack */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative h-[460px] hidden lg:block"
            style={{ perspective: 1600 }}
          >
            <div className="absolute bg-white rounded-2xl overflow-hidden" style={{ width: 340, height: 430, right: 24, top: 8, transform: 'rotate(6deg) scale(.94)', opacity: .5, boxShadow: '0 30px 70px rgba(3,10,25,.5)' }} />
            <div className="absolute bg-white rounded-2xl overflow-hidden" style={{ width: 340, height: 430, right: 60, top: 26, transform: 'rotate(-3deg) scale(.97)', opacity: .78, boxShadow: '0 30px 70px rgba(3,10,25,.5)' }} />
            <div className="absolute bg-white rounded-2xl overflow-hidden text-ink" style={{ width: 352, height: 452, right: 36, top: 0, transform: 'rotate(1.5deg)', boxShadow: '0 30px 70px rgba(3,10,25,.5)' }}>
              <div className="h-2" style={{ background: 'linear-gradient(90deg,#0f2a54,#d4af5f)' }} />
              <div className="p-6">
                <div className="flex justify-between items-center mb-3.5">
                  <span className="text-[10px] font-extrabold tracking-[0.14em] text-gold-deep">DRAFT RED HERRING PROSPECTUS</span>
                  <span className="text-[9px] font-extrabold tracking-wide text-[#b9c4d6] border border-[#dbe3ef] px-1.5 py-0.5 rounded">SME</span>
                </div>
                <div className="h-3 w-[56%] rounded bg-navy-800/85 my-3" />
                <div className="h-2 rounded my-2" style={{ background: 'linear-gradient(90deg,#dfe7f2,#eef2f8)' }} />
                <div className="h-2 rounded my-2 bg-[#eef2f8]" />
                <div className="h-2 rounded my-2 w-[80%] bg-[#eef2f8]" />
                <div className="mt-5 mb-3 text-[11px] font-bold text-gold-deep tracking-wide">AUTO-BUILT SECTIONS</div>
                {['Capital Structure reconciled', 'Financials restated (FY21–23)', 'Objects of the Issue', 'Risk Factors drafted'].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-[11.5px] text-ink-2 my-2 font-medium">
                    <span className="w-[17px] h-[17px] rounded-full bg-ok-bg text-ok grid place-items-center shrink-0"><Check size={11} /></span>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* floating badges */}
            <motion.div className="absolute z-10 bg-white rounded-xl shadow-lg2 px-4 py-3 flex items-center gap-3 text-ink"
              style={{ left: -18, top: 74 }} animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
              <span className="w-[34px] h-[34px] rounded-lg grid place-items-center bg-ok-bg text-ok shrink-0"><BadgeCheck size={19} /></span>
              <div><b className="text-[13.5px] block">92% eligible</b><span className="text-[11.5px] text-muted">NSE Emerge check</span></div>
            </motion.div>
            <motion.div className="absolute z-10 bg-white rounded-xl shadow-lg2 px-4 py-3 flex items-center gap-3 text-ink"
              style={{ left: -40, bottom: 64 }} animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}>
              <span className="w-[34px] h-[34px] rounded-lg grid place-items-center bg-warn-bg text-warn shrink-0"><AlertTriangle size={18} /></span>
              <div><b className="text-[13.5px] block">3 gaps flagged</b><span className="text-[11.5px] text-muted">before you file</span></div>
            </motion.div>
          </motion.div>
        </div>

        {/* stat strip */}
        <div className="relative border-t border-white/[.08] bg-black/[.14]">
          <div className="max-w-[1220px] mx-auto px-7 grid grid-cols-2 md:grid-cols-4 gap-5 py-7">
            {[
              { b: '4–6', u: ' months', s: 'Typical DRHP prep time today' },
              { b: '<1', u: ' day', s: 'To a substantially complete draft' },
              { b: '14', u: '', s: 'DRHP sections auto-synthesised' },
              { b: '100%', u: '', s: 'Fields traced to source documents' },
            ].map((st) => (
              <div key={st.s}>
                <b className="text-[30px] font-extrabold tracking-tight text-white block leading-none">
                  {st.b}<span className="text-[16px] text-gold-soft">{st.u}</span>
                </b>
                <span className="text-[13px] text-[#9fb2d0] mt-1.5 block">{st.s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== PROBLEM ===== */}
      <div className="py-[88px]">
        <div className="max-w-[1220px] mx-auto px-7">
          <motion.div {...fade()} className="text-center max-w-[660px] mx-auto mb-13">
            <div className="eyebrow">The barrier SEBI wants removed</div>
            <h2 className="text-[clamp(26px,3vw,38px)] tracking-[-0.02em] font-extrabold my-3.5">
              Why SMEs stay off the public markets
            </h2>
            <p className="text-[17px] text-muted">
              Preparing an offer document is slow, expensive and expertise-heavy. For the small amounts
              SMEs raise, the overhead is simply disproportionate.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5.5" style={{ gap: 22 }}>
            {[
              { icon: Clock, tone: 'warn', t: 'Months, not weeks', p: 'A DRHP is long and highly structured. Assembling it from scratch routinely takes an entire quarter or two.' },
              { icon: TrendingDown, tone: 'bad', t: 'Costs that don’t scale down', p: 'Merchant bankers, legal counsel and compliance professionals — priced for the main board, not a ₹30 Cr raise.' },
              { icon: Users, tone: 'info', t: 'Total dependence on intermediaries', p: 'Lean promoter teams with little capital-markets exposure lean on advisors from the very first step.' },
            ].map((c) => (
              <motion.div key={t(c.t)} {...fade(0.06)} className="card p-7">
                <div className={`w-[46px] h-[46px] rounded-xl grid place-items-center mb-4 ${c.tone === 'warn' ? 'bg-warn-bg text-warn' : c.tone === 'bad' ? 'bg-bad-bg text-bad' : 'bg-info-bg text-info'}`}>
                  <c.icon size={23} />
                </div>
                <h3 className="text-[18px] mb-2 tracking-tight font-bold">{c.t}</h3>
                <p className="text-[14.5px] text-ink-2 leading-relaxed">{c.p}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== HOW IT WORKS ===== */}
      <div id="how-it-works" className="py-[88px]" style={{ background: 'linear-gradient(180deg,#fff,#f5f8fc)' }}>
        <div className="max-w-[1220px] mx-auto px-7">
          <motion.div {...fade()} className="text-center max-w-[680px] mx-auto mb-12">
            <div className="eyebrow">The Sahayak method</div>
            <h2 className="text-[clamp(26px,3vw,38px)] tracking-[-0.02em] font-extrabold my-3.5">
              A guided path a non-expert can actually follow
            </h2>
            <p className="text-[17px] text-muted">
              The offer document is a synthesis of many source documents — one document feeds several
              sections, one section pulls from several documents. Sahayak handles that mapping for you.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-4 gap-4.5" style={{ gap: 18 }}>
            {[
              { n: 1, icon: ScanLine, t: 'Ingest', p: 'Paste your website or drop documents. We build a knowledge base about your company.' },
              { n: 2, icon: BadgeCheck, t: 'Verify & KYC', p: 'Identity, promoters, financials, cap table & legal — captured in phases, each confirmed by you.' },
              { n: 3, icon: GitMerge, t: 'Synthesise', p: 'We map source documents to all 14 DRHP sections and flag every gap or inconsistency.' },
              { n: 4, icon: FileText, t: 'Review & certify', p: 'A disclosure-ready draft goes to your merchant banker to review and certify.' },
            ].map((s) => (
              <motion.div key={s.n} {...fade(s.n * 0.05)} className="card p-6 relative">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-navy-900 text-gold-soft font-extrabold grid place-items-center text-[15px] mb-3.5">{s.n}</div>
                <div className="flex items-center gap-2 mb-1.5">
                  <s.icon size={17} className="text-gold-deep" />
                  <h4 className="text-[16px] font-bold">{s.t}</h4>
                </div>
                <p className="text-[13.5px] text-muted leading-snug">{s.p}</p>
                {s.n < 4 && <ArrowRight size={18} className="hidden md:block absolute -right-3.5 top-11 text-[#c6d2e4]" />}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-[40px]">
        <div className="max-w-[1220px] mx-auto px-7">
          <motion.div {...fade()} className="mb-6 text-center max-w-[760px] mx-auto">
            <div className="eyebrow">Review Handoff</div>
            <h2 className="text-[clamp(24px,3vw,34px)] tracking-[-0.02em] font-extrabold my-3">The intermediary step is mandatory, not optional</h2>
            <p className="text-[16px] text-muted">
              Satvik’s mock draft is currently in the co-pilot verification stage. It cannot move to any filing workflow until the merchant banker reviews and certifies it.
            </p>
          </motion.div>
          <motion.div {...fade(0.05)}>
            <HandoffTimeline currentStage="copilot" />
          </motion.div>
        </div>
      </div>

      {/* ===== ACTORS / HUMAN-IN-LOOP ===== */}
      <div id="for-intermediaries" className="py-[70px]">
        <div className="max-w-[1220px] mx-auto px-7">
          <motion.div {...fade()} className="grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-center rounded-[22px] p-12 text-[#eaf0fb] relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#0b1e3f,#0f2a54)' }}>
            <div className="absolute inset-0 hero-grid opacity-60" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 text-gold-soft text-[13px] font-semibold mb-3">
                <ShieldCheck size={16} /> Designed for trust, not to replace oversight
              </div>
              <h2 className="text-[30px] tracking-[-0.02em] font-extrabold mb-4">The intermediary stays in the loop</h2>
              <p className="text-[#b7c6e0] text-[16px] leading-relaxed mb-3.5">
                Sahayak lowers dependence on intermediaries at the <b className="text-white">early drafting stage</b> — where
                a first-time issuer is most stuck — without removing the professional review that protects investors.
              </p>
              <p className="text-[#b7c6e0] text-[16px] leading-relaxed">
                The promoter drafts. The merchant banker runs due diligence, reviews the traced draft, and certifies.
                SEBI and the exchange remain the regulator.
              </p>
            </div>
            <div className="relative flex flex-col gap-3.5">
              {[
                { i: Building2, n: 'SME Promoter', d: 'Owner · usually non-expert', c: '#2fae74' },
                { i: Landmark, n: 'Merchant Banker', d: 'Runs due diligence · certifies', c: '#d4af5f' },
                { i: Scale, n: 'Legal Counsel', d: 'Litigation & material contracts', c: '#7ba4e8' },
                { i: ShieldCheck, n: 'SEBI / Exchange', d: 'Regulator · NSE Emerge · BSE SME', c: '#e07a5f' },
              ].map((a) => (
                <div key={a.n} className="flex gap-3.5 items-center bg-white/[.05] border border-white/[.09] px-4 py-3.5 rounded-xl">
                  <div className="w-[42px] h-[42px] rounded-[11px] grid place-items-center shrink-0" style={{ background: a.c + '22', color: a.c }}>
                    <a.i size={20} />
                  </div>
                  <div><b className="text-[15px] block">{a.n}</b><span className="text-[12.5px] text-[#9fb2d0]">{a.d}</span></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ===== CTA ===== */}
      <div className="pb-[90px]">
        <div className="max-w-[1220px] mx-auto px-7">
          <motion.div {...fade()} className="text-center card p-12" style={{ background: 'radial-gradient(600px 300px at 50% -20%,rgba(212,175,95,.1),transparent)' }}>
            <div className="inline-flex items-center gap-2 chip bg-navy-900 text-gold-soft mb-4"><Sparkles size={14} /> Live interactive prototype</div>
            <h2 className="text-[clamp(26px,3vw,36px)] font-extrabold tracking-[-0.02em] mb-3">See a full DRHP built in front of you</h2>
            <p className="text-muted text-[17px] max-w-[560px] mx-auto mb-7">
              Walk the entire journey — from a website URL to a certified-ready draft — with our sample
              SME, Satvik Foods.
            </p>
            <button onClick={() => go('ingest')} className="btn btn-gold btn-lg">
              Launch the co-pilot <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <div id="disclosures" className="bg-navy-950 text-[#8ba2c6] py-10">
        <div className="max-w-[1220px] mx-auto px-7 flex flex-wrap justify-between items-center gap-3.5 text-[13.5px]">
          <div className="flex items-center gap-3"><Brand light /></div>
          <div>Prototype for SEBI Hackathon · Problem Statement 4 · Not affiliated with SEBI, NSE or BSE.</div>
        </div>
      </div>
    </div>
  )
}

// tiny helper so keys are stable strings
function t(s: string) { return s.replace(/\s+/g, '-').toLowerCase() }
