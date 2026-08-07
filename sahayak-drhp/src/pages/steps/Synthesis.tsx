import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, GitMerge, AlertTriangle, Check, FileText, Layers, Grid3x3, Scale } from 'lucide-react'
import { useStore } from '../../store'
import { Chip, Ring } from '../../components/ui'
import { SECTIONS, DOCS } from '../../data/mock'
import DisclosureScorecard from '../../components/DisclosureScorecard'
import Term from '../../components/Term'
import { Counter, Reveal } from '../../components/motion'
import { EASE } from '../../lib/motion'

const docName = (id: string) => DOCS.find((d) => d.id === id)!.short

export default function Synthesis() {
  const goStep = useStore((s) => s.goStep)
  const showToast = useStore((s) => s.showToast)
  const jumpTarget = useStore((s) => s.jumpTarget)
  const setJumpTarget = useStore((s) => s.setJumpTarget)
  const [tab, setTab] = useState<'sections' | 'matrix'>('sections')
  const [scorecardOpen, setScorecardOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [hoverCell, setHoverCell] = useState<{ doc: string; sec: string } | null>(null)

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
      <Chip tone="accent" className="mb-3">
        <GitMerge size={12} /> Document synthesis engine
      </Chip>
      <h1 className="text-[27px] font-extrabold tracking-[-0.03em]">
        <Term term="DRHP">DRHP</Term> synthesis
      </h1>
      <p className="mt-2 max-w-[60ch] text-[14.5px] leading-[1.62] text-ink-3">
        {/* Desired outcome 1 and 6: first-time issuers get plain-language help while staying inside the draft workflow. */}
        The offer document is a synthesis of many sources — one document feeds several sections, one section
        pulls from several documents. Here is that mapping, built for you.
      </p>

      {/* Summary */}
      <Reveal shape="settle" className="mt-6">
        <div
          className="flex flex-wrap items-center gap-6 rounded-3xl2 px-6 py-5 text-[#DCE6F6] shadow-lg2 sm:px-7"
          style={{ background: 'linear-gradient(148deg,#1C2C47,#16233A 55%,#1F3563)' }}
        >
          <Ring value={avg} size={72} stroke={7} color="#7DB7F8" track="rgba(255,255,255,.16)" labelColor="#FFFFFF" />
          <div className="min-w-[220px] flex-1">
            <h2 className="text-[17.5px] font-bold text-white">Draft is {avg}% complete</h2>
            <p className="mt-1 max-w-[48ch] text-[13px] leading-[1.6] text-[#A7BCDD]">
              14 sections synthesised from 8 source documents. {flagged} sections carry a flag for review.
            </p>
          </div>
          <div className="flex shrink-0 gap-7">
            <div>
              <b className="mono block text-[21px] font-extrabold leading-none text-white">
                <Counter to={14} />
              </b>
              <span className="text-[11px] text-[#8299BC]">Sections</span>
            </div>
            <div>
              <b className="mono block text-[21px] font-extrabold leading-none text-white">
                <Counter to={8} />
              </b>
              <span className="text-[11px] text-[#8299BC]">Sources</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Controls */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative inline-flex rounded-xl2 bg-panel p-1" role="tablist" aria-label="DRHP synthesis views">
          {([
            ['sections', 'Sections', Layers],
            ['matrix', 'Provenance map', Grid3x3],
          ] as const).map(([id, label, Icon]) => {
            const active = tab === id
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                role="tab"
                aria-selected={active}
                className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-bold transition-colors duration-200 ${
                  active ? 'text-white' : 'text-ink-3 hover:text-ink'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="synthesis-tab"
                    className="absolute inset-0 rounded-lg bg-ink"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
                <Icon size={14} className="relative" />
                <span className="relative">{label}</span>
              </button>
            )
          })}
        </div>

        <button onClick={() => setScorecardOpen(true)} className="btn btn-ghost btn-sm">
          <Scale size={14} /> ICDR scorecard
        </button>
        <span className="text-[12.5px] text-muted">
          {tab === 'sections' ? 'Select a section to see how it was built' : matrixHint}
        </span>
      </div>

      {/* Sections */}
      {tab === 'sections' && (
        <ol className="mt-5 space-y-2.5">
          {SECTIONS.map((s, i) => (
            <motion.li
              key={s.no}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.025, 0.3), duration: 0.36, ease: EASE }}
            >
              <button
                id={`section-${s.no}`}
                onClick={() => showToast(`Opening “${s.title}” — sources: ${s.sources.map(docName).join(', ')}`)}
                className={`lift-on-hover flex w-full scroll-mt-28 items-center gap-4 rounded-2xl2 border px-5 py-4 text-left ${
                  activeSection === s.no ? 'border-accent-300 bg-accent-50' : 'border-line bg-white'
                }`}
              >
                {/* The Roman numeral is the section's real name. */}
                <span className="numeral w-9 shrink-0 text-[13px]">{s.no}</span>

                <span className="min-w-0 flex-1">
                  <b className="mb-1.5 block text-[15px] font-bold">{s.title}</b>
                  <span className="flex flex-wrap items-center gap-1.5">
                    {s.sources.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5 text-[11px] font-bold text-accent-700 ring-1 ring-inset ring-accent-100"
                      >
                        <FileText size={10} /> {docName(d)}
                      </span>
                    ))}
                    {s.flags.map((f) => (
                      <span
                        key={f.text}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ring-1 ring-inset ${
                          f.type === 'inconsistency'
                            ? 'bg-bad-bg text-bad ring-bad-line'
                            : 'bg-warn-bg text-warn ring-warn-line'
                        }`}
                      >
                        <AlertTriangle size={10} /> {f.text}
                      </span>
                    ))}
                  </span>
                </span>

                <Ring
                  value={s.complete}
                  size={44}
                  stroke={5}
                  color={s.complete === 100 ? '#0F7052' : s.complete >= 85 ? '#3A63C4' : '#8A5A12'}
                />
              </button>
            </motion.li>
          ))}
        </ol>
      )}

      {/* Provenance matrix */}
      {tab === 'matrix' && (
        <Reveal shape="fade" className="mt-5">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Provenance matrix, scrollable">
              <table className="w-full min-w-[820px] border-collapse text-[12.5px]">
                <caption className="sr-only">
                  Which source document feeds which DRHP section
                </caption>
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="sticky left-0 z-10 border-b border-line bg-panel px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted"
                    >
                      Source ↓ / Section →
                    </th>
                    {SECTIONS.map((s) => (
                      <th
                        key={s.no}
                        scope="col"
                        title={s.title}
                        className={`numeral whitespace-nowrap border-b border-line px-2 py-3 text-[11.5px] transition-colors duration-150 ${
                          hoverCell?.sec === s.no ? 'bg-accent-50' : 'bg-panel'
                        }`}
                      >
                        {s.no}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DOCS.map((d) => (
                    <tr key={d.id} className={hoverCell?.doc === d.id ? 'bg-accent-50/40' : ''}>
                      <th
                        scope="row"
                        className="sticky left-0 z-10 whitespace-nowrap border-b border-r border-line bg-white px-4 py-2.5 text-left font-bold text-ink"
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="mono grid h-5 w-5 place-items-center rounded bg-ink text-[9px] font-extrabold text-white">
                            {d.id}
                          </span>
                          {d.short}
                        </span>
                      </th>
                      {SECTIONS.map((s) => {
                        const feeds = s.sources.includes(d.id)
                        const lit = hoverCell?.doc === d.id || hoverCell?.sec === s.no
                        return (
                          <td
                            key={s.no}
                            onMouseEnter={() => setHoverCell({ doc: d.id, sec: s.no })}
                            onMouseLeave={() => setHoverCell(null)}
                            className={`border-b border-line px-2 py-2.5 text-center transition-colors duration-150 ${
                              lit ? 'bg-accent-50' : ''
                            }`}
                          >
                            {feeds ? (
                              <span
                                className="mx-auto inline-grid h-[19px] w-[19px] place-items-center rounded-[5px] bg-accent-600"
                                title={`${d.name} feeds ${s.title}`}
                              >
                                <Check size={11} className="text-white" strokeWidth={3} />
                                <span className="sr-only">{`${d.short} feeds section ${s.no}`}</span>
                              </span>
                            ) : (
                              <span className="text-line-strong" aria-hidden="true">
                                ·
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <p className="max-w-[46ch] text-[13.5px] leading-relaxed text-muted">
          Sections are drafted. Next, review everything we flagged before it reaches your banker.
        </p>
        <button onClick={() => goStep('gaps')} className="btn btn-gold btn-lg">
          Review gaps <ArrowRight size={17} />
        </button>
      </div>

      <DisclosureScorecard open={scorecardOpen} onClose={() => setScorecardOpen(false)} />
    </div>
  )
}
