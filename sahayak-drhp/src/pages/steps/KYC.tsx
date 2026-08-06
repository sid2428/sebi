import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, AlertTriangle, ChevronDown, ArrowRight, ShieldCheck, Fingerprint,
  Landmark, PieChart, Scale, FileSignature,
} from 'lucide-react'
import { useStore } from '../../store'
import { PHASES } from '../../data/mock'
import Term from '../../components/Term'

const ICONS: Record<string, any> = {
  identity: ShieldCheck,
  people: Fingerprint,
  financials: Landmark,
  capital: PieChart,
  legal: Scale,
  contracts: FileSignature,
}

export default function KYC() {
  const goStep = useStore((s) => s.goStep)
  const showToast = useStore((s) => s.showToast)
  const jumpTarget = useStore((s) => s.jumpTarget)
  const setJumpTarget = useStore((s) => s.setJumpTarget)
  const [open, setOpen] = useState<string | null>('people')

  const done = PHASES.filter((p) => p.status === 'done').length
  const attention = PHASES.filter((p) => p.status === 'attention').length

  useEffect(() => {
    if (jumpTarget?.kind !== 'phase') return
    setOpen(jumpTarget.id)
    document.getElementById(`phase-${jumpTarget.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setJumpTarget(null)
  }, [jumpTarget, setJumpTarget])

  return (
    <div>
      <div className="chip bg-navy-900 text-gold-soft mb-3"><Fingerprint size={13} /> Guided <Term term="KYC">KYC</Term> · 6 phases</div>
      <h2 className="text-[26px] tracking-[-0.02em] font-extrabold mb-1.5">Verification & KYC</h2>
      <p className="text-muted text-[15px] mb-6 max-w-[560px]">
        {/* Desired outcome 1 and 6: first-time issuers can decode diligence jargon inline instead of leaving the flow. */}
        We verify your particulars area by area — the way a <Term term="merchant_banker">merchant banker</Term>’s diligence checklist runs.
        Each phase turns green as it clears.
      </p>

      <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-3">
        <Stat n={done} label="Phases cleared" tone="ok" icon={Check} />
        <Stat n={attention} label="Need your input" tone="warn" icon={AlertTriangle} />
        <Stat n={PHASES.reduce((a, p) => a + p.items.length, 0)} label="Checks run" tone="navy" icon={ShieldCheck} />
      </div>

      {PHASES.map((p) => {
        const Icon = ICONS[p.id]
        const isOpen = open === p.id
        const doneCount = p.items.filter((i) => i.status === 'done').length
        const attn = p.status === 'attention'
        return (
          <div key={p.id} id={`phase-${p.id}`} className="card mb-3 overflow-hidden scroll-mt-28">
            <button onClick={() => setOpen(isOpen ? null : p.id)} aria-expanded={isOpen} className="w-full flex items-center gap-4 px-5 py-4 text-left">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${attn ? 'bg-warn-bg text-warn' : 'bg-ok-bg text-ok'}`}>
                <Icon size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <b className="block text-[16px]">{p.title}</b>
                <span className="text-[13px] text-muted">{p.sub}</span>
              </div>
              {attn
                ? <span className="chip mr-1 bg-warn-bg text-[#a5651a]"><AlertTriangle size={12} /> Needs input</span>
                : <span className="chip mr-1 bg-ok-bg text-[#0d6b43]"><Check size={12} /> Cleared</span>}
              <span className="mr-2 text-[13px] font-bold mono" style={{ color: attn ? '#a5651a' : '#159a62' }}>{doneCount}/{p.items.length}</span>
              <ChevronDown size={18} className={`text-muted transition ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-line"
                >
                  <div className="px-5 py-1">
                    {p.items.map((it) => (
                      <div key={it.label} className="flex items-center gap-3.5 border-b border-dashed border-line py-3 text-[14px] last:border-0">
                        <span className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full ${it.status === 'done' ? 'bg-ok-bg text-ok' : 'bg-warn-bg text-warn'}`}>
                          {it.status === 'done' ? <Check size={13} /> : <AlertTriangle size={12} />}
                        </span>
                        <div className="flex-1">
                          <div className={it.status === 'attention' ? 'font-semibold' : ''}>{it.label}</div>
                          {it.note && <small className="mt-0.5 block text-[12px] text-muted">{it.note}</small>}
                        </div>
                        {it.status === 'attention' && (
                          <button onClick={() => showToast('Resolution requested — co-pilot notified')} className="btn btn-ghost btn-sm">Resolve</button>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <div className="max-w-[430px] text-[13.5px] text-muted">
          Two items are flagged but non-blocking — the co-pilot will carry them into the right DRHP sections.
        </div>
        <button onClick={() => goStep('eligibility')} className="btn btn-gold btn-lg">Run eligibility check <ArrowRight size={18} /></button>
      </div>
    </div>
  )
}

function Stat({ n, label, tone, icon: Icon }: { n: number; label: string; tone: 'ok' | 'warn' | 'navy'; icon: any }) {
  const map = { ok: 'bg-ok-bg text-ok', warn: 'bg-warn-bg text-warn', navy: 'bg-navy-900 text-gold-soft' }
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${map[tone]}`}><Icon size={19} /></span>
      <div>
        <div className="text-[24px] font-extrabold mono leading-none">{n}</div>
        <div className="mt-1 text-[12px] text-muted">{label}</div>
      </div>
    </div>
  )
}
