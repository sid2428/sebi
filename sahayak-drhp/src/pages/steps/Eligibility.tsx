import { motion } from 'framer-motion'
import { Check, AlertTriangle, ArrowRight, ScanSearch, ShieldCheck } from 'lucide-react'
import { useStore } from '../../store'
import { Ring } from '../../components/ui'
import { ELIGIBILITY, ISSUE } from '../../data/mock'
import Term from '../../components/Term'

export default function Eligibility() {
  const goStep = useStore((s) => s.goStep)
  const passed = ELIGIBILITY.criteria.filter((c) => c.ok).length

  return (
    <div>
      <div className="chip bg-navy-900 text-gold-soft mb-3"><ScanSearch size={13} /> Rule engine · {ISSUE.platform}</div>
      <h2 className="text-[26px] tracking-[-0.02em] font-extrabold mb-1.5">Eligibility Check</h2>
      <p className="text-muted text-[15px] mb-6 max-w-[560px]">
        {/* Desired outcome 1 and 6: first-time issuers get plain-language help for listing-rule jargon. */}
        We tested Satvik against the SME-platform listing norms. Here’s where you stand on each criterion,
        with the exact figure behind every verdict for <Term term="SEBI ICDR">SEBI ICDR</Term> review.
      </p>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6 flex items-center gap-6 rounded-[14px] px-7 py-6 text-white shadow-md2"
        style={{ background: 'linear-gradient(120deg,#0e7a4d,#159a62)' }}
      >
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/[.16]"><ShieldCheck size={34} /></div>
        <div className="flex-1">
          <h3 className="mb-1 text-[22px] font-bold">{ELIGIBILITY.verdict}</h3>
          <p className="max-w-[520px] text-[14.5px] opacity-95">{ELIGIBILITY.summary}</p>
        </div>
        <div className="shrink-0 grid place-items-center">
          <Ring value={ELIGIBILITY.score} size={92} stroke={8} color="#fff" track="rgba(255,255,255,.25)" label={`${ELIGIBILITY.score}`} />
          <span className="text-[11px] opacity-85 -mt-1">Eligibility score</span>
        </div>
      </motion.div>

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="card flex items-center gap-2.5 px-4 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ok-bg text-ok"><Check size={17} /></span>
          <div><b className="block text-[17px] mono leading-none">{passed}</b><span className="block text-[12px] text-muted">criteria cleared</span></div>
        </div>
        <div className="card flex items-center gap-2.5 px-4 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-warn-bg text-warn"><AlertTriangle size={16} /></span>
          <div><b className="block text-[17px] mono leading-none">{ELIGIBILITY.criteria.length - passed}</b><span className="block text-[12px] text-muted">needs disclosure</span></div>
        </div>
      </div>

      <div className="card mb-7 overflow-hidden">
        {ELIGIBILITY.criteria.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-start gap-4 border-b border-line px-5 py-4 last:border-0"
          >
            <span className={`grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg ${c.ok ? 'bg-ok-bg text-ok' : 'bg-warn-bg text-warn'}`}>
              {c.ok ? <Check size={16} /> : <AlertTriangle size={15} />}
            </span>
            <div className="flex-1">
              <b className="mb-0.5 block text-[14.5px]">{c.title}</b>
              <span className="text-[13px] leading-snug text-muted">{c.note}</span>
              <div className="mt-1.5 text-[12px] text-muted">Requirement: <b className="text-ink-2">{c.req}</b></div>
            </div>
            <div className="shrink-0 text-right">
              <div className={`text-[15px] font-bold mono ${c.ok ? 'text-ink' : 'text-warn'}`}>{c.val}</div>
              <div className="text-[11px] text-muted">{c.ok ? 'meets norm' : 'disclose'}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <div className="max-w-[430px] text-[13.5px] text-muted">
          Eligible to proceed. The one disclosure item is carried into Section XI automatically.
        </div>
        <button onClick={() => goStep('synthesis')} className="btn btn-gold btn-lg">Synthesise the <Term term="DRHP">DRHP</Term> <ArrowRight size={18} /></button>
      </div>
    </div>
  )
}
