import { ArrowRight, Building2, Sparkles, Landmark, ShieldCheck } from 'lucide-react'
import { HANDOFF_STAGES } from '../data/mock'

const ICONS = {
  promoter: Building2,
  copilot: Sparkles,
  banker: Landmark,
  filing: ShieldCheck,
}

export default function HandoffTimeline({
  currentStage,
  compact = false,
}: {
  currentStage: (typeof HANDOFF_STAGES)[number]['id']
  compact?: boolean
}) {
  const currentIndex = HANDOFF_STAGES.findIndex((stage) => stage.id === currentStage)

  return (
    <div className={`card ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="eyebrow">Intermediary Handoff</div>
          <h3 className="text-[18px] font-extrabold tracking-tight mt-1">Merchant-banker review remains mandatory</h3>
        </div>
        <span className="chip bg-warn-bg text-[#8a5514]">No filing before certification</span>
      </div>

      <div className={`mt-5 grid gap-3 ${compact ? 'md:grid-cols-4' : 'lg:grid-cols-4'}`}>
        {HANDOFF_STAGES.map((stage, index) => {
          const Icon = ICONS[stage.id]
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo'
          return (
            <div key={stage.id} className="relative">
              <div className={`h-full rounded-[14px] border p-4 ${state === 'current' ? 'border-gold bg-[#fffaf0] shadow-sm2' : state === 'done' ? 'border-[#cfe7db] bg-[#f5fbf8]' : 'border-line bg-white'}`}>
                <div className="flex items-center gap-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${state === 'current' ? 'bg-navy-900 text-gold-soft' : state === 'done' ? 'bg-ok-bg text-ok' : 'bg-paper text-muted'}`}>
                    <Icon size={18} />
                  </span>
                  <div>
                    <b className="block text-[14px]">{stage.label}</b>
                    <span className="text-[11.5px] text-muted">
                      {state === 'current' ? 'Current stage' : state === 'done' ? 'Completed' : 'Upcoming'}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-[12.5px] leading-relaxed text-ink-2">{stage.detail}</p>
              </div>
              {index < HANDOFF_STAGES.length - 1 && (
                <div className="hidden md:flex absolute right-[-18px] top-1/2 z-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white p-1.5">
                  <ArrowRight size={14} className="text-muted" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
