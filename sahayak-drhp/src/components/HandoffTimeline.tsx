import { Building2, Sparkles, Landmark, ShieldCheck, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { HANDOFF_STAGES } from '../data/mock'
import { Chip } from './ui'
import { EASE, inView, useReducedMotion } from '../lib/motion'

const ICONS = {
  promoter: Building2,
  copilot: Sparkles,
  banker: Landmark,
  filing: ShieldCheck,
}

/**
 * The certification chain, drawn as one continuous track.
 *
 * The track is the point: progress is a single line that stops where
 * the draft currently sits, so "we are not past the banker yet" is
 * legible without reading a word.
 */
export default function HandoffTimeline({
  currentStage,
  compact = false,
}: {
  currentStage: (typeof HANDOFF_STAGES)[number]['id']
  compact?: boolean
}) {
  const currentIndex = HANDOFF_STAGES.findIndex((stage) => stage.id === currentStage)
  const reduced = useReducedMotion()
  const progress = (currentIndex + 0.5) / HANDOFF_STAGES.length

  return (
    <div className={`card ${compact ? 'p-5' : 'p-6 sm:p-7'}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="eyebrow">Intermediary handoff</div>
          <h3 className="mt-1.5 text-[18px] font-bold tracking-[-0.02em]">
            Merchant-banker review remains mandatory
          </h3>
        </div>
        <Chip tone="amber">No filing before certification</Chip>
      </div>

      {/* The track */}
      <div className="relative mt-7">
        <div className="absolute left-0 right-0 top-[19px] hidden h-[2px] rounded-full bg-line md:block" aria-hidden="true">
          <motion.div
            className="h-full origin-left rounded-full"
            style={{ background: 'linear-gradient(90deg,#7DB7F8,#5B8DEF)' }}
            initial={reduced ? false : { scaleX: 0 }}
            whileInView={{ scaleX: progress }}
            viewport={inView}
            transition={{ duration: 1, ease: EASE }}
          />
        </div>

        <ol className={`relative grid gap-4 ${compact ? 'md:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
          {HANDOFF_STAGES.map((stage, index) => {
            const Icon = ICONS[stage.id]
            const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo'

            return (
              <motion.li
                key={stage.id}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={inView}
                transition={{ duration: 0.45, ease: EASE, delay: index * 0.09 }}
              >
                {/* Node sits on the track. */}
                <span
                  className={`relative z-10 grid h-10 w-10 place-items-center rounded-xl2 ring-4 ring-white ${
                    state === 'current'
                      ? 'bg-accent-600 text-white shadow-accent'
                      : state === 'done'
                        ? 'bg-ok-bg text-ok'
                        : 'bg-panel text-faint'
                  }`}
                >
                  {state === 'done' ? <Check size={18} strokeWidth={2.6} /> : <Icon size={18} />}
                  {state === 'current' && !reduced && (
                    <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-xl2 bg-accent-400" />
                  )}
                </span>

                <div
                  className={`mt-3.5 rounded-xl2 border p-4 ${
                    state === 'current'
                      ? 'border-accent-200 bg-accent-50'
                      : state === 'done'
                        ? 'border-ok-line bg-ok-bg/50'
                        : 'border-line bg-white'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <b className="text-[14px] font-bold text-ink">{stage.label}</b>
                    <span
                      className={`text-[10.5px] font-bold uppercase tracking-[0.09em] ${
                        state === 'current' ? 'text-accent-700' : state === 'done' ? 'text-ok' : 'text-faint'
                      }`}
                    >
                      {state === 'current' ? 'Now' : state === 'done' ? 'Done' : 'Next'}
                    </span>
                  </div>
                  <p className="mt-2 text-[12.5px] leading-[1.55] text-ink-3">{stage.detail}</p>
                </div>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
