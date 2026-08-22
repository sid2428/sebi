import { useId, useMemo } from 'react'
import { DOCS } from '../data/mock'
import { ProvenanceThread } from './illustrations'

const docName = (id: string) => DOCS.find((doc) => doc.id === id)?.short ?? id
const docKind = (id: string) => DOCS.find((doc) => doc.id === id)?.kind ?? ''

/**
 * Marks a value in the prospectus and names the file it came from.
 *
 * The accessible name stays the visible text; the source list is a
 * description, carried by an always-rendered visually-hidden span. The
 * popover itself is decorative — a `role="tooltip"` that is visually
 * hidden until hover has no accessible name to expose, and overriding
 * the trigger's label with the source would contradict what is on
 * screen (WCAG 2.5.3).
 */
export default function Provenance({
  docs,
  children,
  className = '',
}: {
  docs: string[]
  children: React.ReactNode
  className?: string
}) {
  const rawId = useId()
  const descId = `${rawId}-src`.replace(/:/g, '')
  const spoken = useMemo(
    () => `Source document${docs.length === 1 ? '' : 's'}: ${docs.map(docName).join(', ')}`,
    [docs]
  )

  return (
    <span className={`group relative inline-flex cursor-help items-baseline gap-1 ${className}`}>
      <button
        type="button"
        aria-describedby={descId}
        className="text-inherit transition-colors duration-200 group-hover:text-accent-700"
        style={{
          textDecoration: 'underline',
          textDecorationStyle: 'dotted',
          textDecorationColor: '#7DB7F8',
          textUnderlineOffset: '3px',
          textDecorationThickness: '1.5px',
        }}
      >
        {children}
      </button>
      <ProvenanceThread size={12} className="shrink-0 self-center text-accent-500" />

      {/* Always in the accessibility tree, never on screen. */}
      <span id={descId} className="sr-only">
        {spoken}
      </span>

      {/* Purely visual. */}
      <span
        aria-hidden="true"
        className="pointer-events-none invisible absolute left-1/2 top-full z-30 mt-2 w-[230px] -translate-x-1/2 translate-y-1 rounded-xl2 border border-line bg-white p-3 font-sans text-[12px] leading-[1.55] text-ink-2 opacity-0 shadow-lg2 transition-[opacity,transform] duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
      >
        <span className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-[0.11em] text-accent-700">
          Traced to
        </span>
        {docs.map((id) => (
          <span key={id} className="mt-1 flex items-baseline justify-between gap-2 first:mt-0">
            <b className="text-ink">{docName(id)}</b>
            <span className="shrink-0 text-[10.5px] text-muted">{docKind(id)}</span>
          </span>
        ))}
      </span>
    </span>
  )
}
