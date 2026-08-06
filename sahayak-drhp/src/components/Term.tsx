import { useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { GLOSSARY } from '../data/mock'
import { useStore } from '../store'

export default function Term({
  term,
  children,
  className = '',
}: {
  term: keyof typeof GLOSSARY
  children?: React.ReactNode
  className?: string
}) {
  const issuerMode = useStore((s) => s.issuerMode)
  const [open, setOpen] = useState(false)
  const label = children ?? term

  if (issuerMode === 'expert') {
    return <>{label}</>
  }

  return (
    <span className={`group relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center gap-1 rounded-sm border-b border-dashed border-gold-deep/60 text-left text-inherit underline-offset-2 hover:text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold/35"
        aria-label={`Explain ${term}`}
        aria-expanded={open}
      >
        <span>{label}</span>
        <HelpCircle size={13} className="shrink-0 text-gold-deep" />
      </button>
      <span
        className={`pointer-events-none absolute left-0 top-full z-20 mt-2 w-[220px] rounded-xl border border-line bg-white p-3 text-[12px] font-normal leading-relaxed text-ink shadow-md2 transition ${open ? 'visible opacity-100' : 'invisible opacity-0 group-hover:visible group-hover:opacity-100'}`}
        role="tooltip"
      >
        {GLOSSARY[term]}
      </span>
    </span>
  )
}
