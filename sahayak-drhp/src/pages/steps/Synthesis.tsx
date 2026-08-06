import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, GitMerge, AlertTriangle, Check, FileText, Layers, Grid3x3, Scale } from 'lucide-react'
import { useStore } from '../../store'
import { Ring } from '../../components/ui'
import { SECTIONS, DOCS } from '../../data/mock'
import DisclosureScorecard from '../../components/DisclosureScorecard'
import Term from '../../components/Term'

const docName = (id: string) => DOCS.find((d) => d.id === id)!.short

export default function Synthesis() {
  const goStep = useStore((s) => s.goStep)
  const showToast = useStore((s) => s.showToast)
  const jumpTarget = useStore((s) => s.jumpTarget)
  const setJumpTarget = useStore((s) => s.setJumpTarget)
  const [tab, setTab] = useState<'sections' | 'matrix'>('sections')
  const [scorecardOpen, setScorecardOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const avg = Math.round(SECTIONS.reduce((a, s) => a + s.complete, 0) / SECTIONS.length)
  const flagged = SECTIONS.filter((s) => s.flags.length).length
  const matrixHint = useMemo(() => 'Which document feeds which section', [])

  useEffect(() => {
    if (jumpTarget?.kind !== 'section') return
    setTab('sections')
    setActiveSection(jumpTarget.id)
    document.getElementById(`section-${jumpTarget.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setJumpTarget(null)
  }, [jumpTarget, setJumpTarget])

  return (
    <div>
      <div className="chip bg-navy-900 text-gold-soft mb-3"><GitMerge size={13} /> Document synthesis engine</div>
      <h2 className="text-[26px] tracking-[-0.02em] font-extrabold mb-1.5"><Term term="DRHP">DRHP</Term> Synthesis</h2>
      <p className="text-muted text-[15px] mb-6 max-w-[580px]">
        {/* Desired outcome 1 and 6: first-time issuers get plain-language help while staying inside the draft workflow. */}
        The offer document is a synthesis of many sources — one document feeds several sections, one
        section pulls from several documents. Here’s that mapping, built for you.
      </p>

      <div
        className="mb-5 flex flex-wrap items-center gap-6 rounded-[14px] px-7 py-5 text-[#eaf0fb] shadow-md2"
        style={{ background: 'linear-gradient(120deg,#0b1e3f,#0f2a54)' }}
      >
        <Ring value={avg} size={72} stroke={7} color="#d4af5f" track="rgba(255,255,255,.15)" />
        <div className="flex-1">
          <h3 className="mb-1 text-[18px] font-bold text-white">Draft is {avg}% complete</h3>
          <p className="max-w-[440px] text-[13.5px] text-[#adbfdd]">14 sections synthesised from 8 source documents. {flagged} sections have gaps flagged for review.</p>
        </div>
        <div className="flex gap-6 text-center shrink-0">
          <div><b className="block text-[22px] text-white mono">14</b><span className="text-[11.5px] text-[#93a6c6]">Sections</span></div>
          <div><b className="block text-[22px] text-white mono">8</b><span className="text-[11.5px] text-[#93a6c6]">Sources</span></div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-line bg-white p-1 shadow-sm2" role="tablist" aria-label="DRHP synthesis views">
          <button onClick={() => setTab('sections')} role="tab" aria-selected={tab === 'sections'} className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13.5px] font-semibold ${tab === 'sections' ? 'bg-navy-900 text-white' : 'text-muted'}`}>
            <Layers size={15} /> Sections
          </button>
          <button onClick={() => setTab('matrix')} role="tab" aria-selected={tab === 'matrix'} className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13.5px] font-semibold ${tab === 'matrix' ? 'bg-navy-900 text-white' : 'text-muted'}`}>
            <Grid3x3 size={15} /> Provenance map
          </button>
        </div>
        <button onClick={() => setScorecardOpen(true)} className="btn btn-ghost btn-sm">
          <Scale size={15} /> ICDR scorecard
        </button>
        <span className="text-[12.5px] text-muted">{tab === 'sections' ? 'Click a section to see how it was built' : matrixHint}</span>
      </div>

      {tab === 'sections' && (
        <div>
          {SECTIONS.map((s, i) => (
            <motion.button
              key={s.no}
              id={`section-${s.no}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              onClick={() => showToast(`Opening “${s.title}” — sources: ${s.sources.map(docName).join(', ')}`)}
              className={`mb-2.5 flex w-full scroll-mt-28 items-center gap-4 rounded-[14px] border px-5 py-4 text-left transition hover:-translate-y-px hover:shadow-md2 ${activeSection === s.no ? 'border-gold bg-[#fffdf7] shadow-sm2' : 'border-line bg-white'}`}
            >
              <span className="w-6 shrink-0 text-[12px] font-extrabold text-muted mono">{s.no}</span>
              <div className="min-w-0 flex-1">
                <b className="mb-1.5 block text-[15.5px]">{s.title}</b>
                <div className="flex flex-wrap items-center gap-1.5">
                  {s.sources.map((d) => (
                    <span key={d} className="inline-flex items-center gap-1 rounded-md bg-info-bg px-2 py-0.5 text-[11px] font-semibold text-info">
                      <FileText size={10} /> {docName(d)}
                    </span>
                  ))}
                  {s.flags.map((f) => (
                    <span
                      key={f.text}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11.5px] font-semibold"
                      style={{ color: f.type === 'inconsistency' ? '#b23428' : '#a5651a', background: f.type === 'inconsistency' ? '#fbe9e7' : '#fdf3e2' }}
                    >
                      <AlertTriangle size={11} /> {f.text}
                    </span>
                  ))}
                </div>
              </div>
              <Ring value={s.complete} size={46} stroke={5} color={s.complete === 100 ? '#159a62' : s.complete >= 85 ? '#d4af5f' : '#d9902a'} />
            </motion.button>
          ))}
        </div>
      )}

      {tab === 'matrix' && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-[12.5px]">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-paper px-3 py-2.5 text-left font-bold text-ink-2">Source document ↓ / Section →</th>
                {SECTIONS.map((s) => <th key={s.no} className="whitespace-nowrap bg-paper px-2 py-2.5 font-bold text-ink-2">{s.no}</th>)}
              </tr>
            </thead>
            <tbody>
              {DOCS.map((d) => (
                <tr key={d.id}>
                  <td className="sticky left-0 z-10 whitespace-nowrap border-r border-line bg-white px-3 py-2.5 text-left font-semibold text-ink">
                    <span className="inline-flex items-center gap-2">
                      <span className="grid h-5 w-5 place-items-center rounded bg-navy-900 text-[9px] font-extrabold text-gold-soft">{d.id}</span>
                      {d.short}
                    </span>
                  </td>
                  {SECTIONS.map((s) => (
                    <td key={s.no} className="border-b border-line px-2 py-2.5 text-center">
                      {s.sources.includes(d.id) ? (
                        <span className="mx-auto inline-grid h-[18px] w-[18px] place-items-center rounded-[5px] bg-navy-900"><Check size={11} className="text-gold-soft" /></span>
                      ) : <span className="text-line">·</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <div className="max-w-[430px] text-[13.5px] text-muted">
          Sections are drafted. Next, review everything we flagged before it reaches your banker.
        </div>
        <button onClick={() => goStep('gaps')} className="btn btn-gold btn-lg">Review gaps <ArrowRight size={18} /></button>
      </div>

      <DisclosureScorecard open={scorecardOpen} onClose={() => setScorecardOpen(false)} />
    </div>
  )
}
