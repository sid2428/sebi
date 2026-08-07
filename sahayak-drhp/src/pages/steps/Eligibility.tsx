import { motion } from 'framer-motion'
import { Check, AlertTriangle, ArrowRight, ScanSearch } from 'lucide-react'
import { useStore } from '../../store'
import { Chip, Ring } from '../../components/ui'
import { ELIGIBILITY, ISSUE } from '../../data/mock'
import Term from '../../components/Term'
import { Counter, Reveal } from '../../components/motion'
import { ComplianceBadge } from '../../components/illustrations'
import { EASE } from '../../lib/motion'

export default function Eligibility() {
  const goStep = useStore((s) => s.goStep)
  const passed = ELIGIBILITY.criteria.filter((c) => c.ok).length

  return (
    <div>
      <Chip tone="accent" className="mb-3">
        <ScanSearch size={12} /> Rule engine · {ISSUE.platform}
      </Chip>
      <h2 className="text-[27px] font-extrabold tracking-[-0.03em]">Eligibility check</h2>
      <p className="mt-2 max-w-[58ch] text-[14.5px] leading-[1.62] text-ink-3">
        {/* Desired outcome 1 and 6: first-time issuers get plain-language help for listing-rule jargon. */}
        We tested Satvik against the SME-platform listing norms. Here is where you stand on each criterion,
        with the exact figure behind every verdict for <Term term="SEBI ICDR">SEBI ICDR</Term> review.
      </p>

      {/* Verdict */}
      <Reveal shape="settle" className="mt-6">
        <div
          className="flex flex-wrap items-center gap-6 rounded-3xl2 px-6 py-6 text-white shadow-lg2 sm:px-7"
          style={{ background: 'linear-gradient(140deg,#0F7052 0%,#12805E 55%,#149A6F 100%)' }}
        >
          <ComplianceBadge level="pass" className="h-16 w-auto shrink-0" />
          <div className="min-w-[220px] flex-1">
            <h3 className="text-[21px] font-bold tracking-[-0.02em]">{ELIGIBILITY.verdict}</h3>
            <p className="mt-1.5 max-w-[54ch] text-[13.5px] leading-[1.6] text-white/90">{ELIGIBILITY.summary}</p>
          </div>
          <div className="grid shrink-0 place-items-center">
            <Ring
              value={ELIGIBILITY.score}
              size={88}
              stroke={8}
              color="#fff"
              track="rgba(255,255,255,.22)"
              label={`${ELIGIBILITY.score}`}
              labelColor="#FFFFFF"
            />
            <span className="-mt-0.5 text-[11px] text-white/80">Eligibility score</span>
          </div>
        </div>
      </Reveal>

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="card flex items-center gap-3 px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl2 bg-ok-bg text-ok">
            <Check size={17} strokeWidth={2.6} />
          </span>
          <div>
            <b className="mono block text-[19px] font-extrabold leading-none">
              <Counter to={passed} />
            </b>
            <span className="text-[12px] text-muted">criteria cleared</span>
          </div>
        </div>
        <div className="card flex items-center gap-3 px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl2 bg-warn-bg text-warn">
            <AlertTriangle size={16} />
          </span>
          <div>
            <b className="mono block text-[19px] font-extrabold leading-none">
              <Counter to={ELIGIBILITY.criteria.length - passed} />
            </b>
            <span className="text-[12px] text-muted">needs disclosure</span>
          </div>
        </div>
      </div>

      <div className="card mt-5 overflow-hidden">
        <ul>
          {ELIGIBILITY.criteria.map((c, i) => (
            <motion.li
              key={c.title}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.38, ease: EASE }}
              className={`flex items-start gap-4 border-b border-line px-5 py-4 transition-colors duration-150 last:border-0 hover:bg-panel/50 ${
                c.ok ? '' : 'bg-warn-bg/35'
              }`}
            >
              <span
                className={`mt-0.5 grid h-[30px] w-[30px] shrink-0 place-items-center rounded-xl2 ${
                  c.ok ? 'bg-ok-bg text-ok' : 'bg-warn-bg text-warn'
                }`}
              >
                {c.ok ? <Check size={16} strokeWidth={2.6} /> : <AlertTriangle size={15} />}
              </span>

              <div className="min-w-0 flex-1">
                <b className="block text-[14.5px] font-bold">{c.title}</b>
                <p className="mt-0.5 text-[12.5px] leading-[1.55] text-ink-3">{c.note}</p>
                <p className="mono mt-1.5 text-[11.5px] text-muted">
                  Requirement · <b className="font-bold text-ink-2">{c.req}</b>
                </p>
              </div>

              <div className="shrink-0 text-right">
                <div className={`mono text-[15px] font-extrabold ${c.ok ? 'text-ink' : 'text-warn'}`}>{c.val}</div>
                <div className="mt-0.5 text-[10.5px] font-bold uppercase tracking-[0.07em] text-muted">
                  {c.ok ? 'meets norm' : 'disclose'}
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <p className="max-w-[46ch] text-[13.5px] leading-relaxed text-muted">
          Eligible to proceed. The one disclosure item is carried into Section XI automatically.
        </p>
        <button onClick={() => goStep('synthesis')} className="btn btn-gold btn-lg">
          Synthesise the <Term term="DRHP">DRHP</Term> <ArrowRight size={17} />
        </button>
      </div>
    </div>
  )
}
