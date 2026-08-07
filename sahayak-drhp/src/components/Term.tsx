import { useId, useState } from 'react'
import { HelpCircle } from 'lucide-react'
import { GLOSSARY } from '../data/mock'
import { useStore } from '../store'

/**
 * A capital-markets term that explains itself, but only for issuers
 * who asked for that. In expert mode the term renders as plain text so
 * the copy stays clean for readers who already know it.
 */
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
  const descId = `${useId()}-def`.replace(/:/g, '')

  if (issuerMode === 'expert') {
    return <>{label}</>
  }

  return (
    <span className={`group relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center gap-1 rounded-sm text-left text-inherit transition-colors duration-200 hover:text-accent-700"
        style={{
          textDecoration: 'underline',
          textDecorationStyle: 'dashed',
          textDecorationColor: '#7DB7F8',
          textUnderlineOffset: '3px',
          textDecorationThickness: '1.5px',
        }}
        aria-describedby={descId}
        aria-expanded={open}
      >
        <span>{label}</span>
        <HelpCircle size={13} className="shrink-0 text-accent-500" />
      </button>

      {/* The definition is always available to assistive tech; the
          popover below is the sighted presentation of the same text. */}
      <span id={descId} className="sr-only">
        {GLOSSARY[term]}
      </span>

      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-full z-30 mt-2 w-[240px] rounded-xl2 border border-line bg-white p-3.5 font-sans text-[12.5px] font-normal leading-[1.6] text-ink-2 shadow-lg2 transition-[opacity,transform] duration-200 ${
          open
            ? 'visible translate-y-0 opacity-100'
            : 'invisible translate-y-1 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100'
        }`}
      >
        <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-[0.11em] text-accent-700">
          In plain terms
        </span>
        {GLOSSARY[term]}
      </span>
    </span>
  )
}
