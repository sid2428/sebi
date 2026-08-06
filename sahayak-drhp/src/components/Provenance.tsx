import { useMemo } from 'react'
import { Info } from 'lucide-react'
import { DOCS } from '../data/mock'

const docName = (id: string) => DOCS.find((doc) => doc.id === id)?.short ?? id

export default function Provenance({
  docs,
  children,
  className = '',
}: {
  docs: string[]
  children: React.ReactNode
  className?: string
}) {
  const names = useMemo(() => docs.map(docName).join(', '), [docs])

  return (
    <span className={`group relative inline-flex cursor-help items-center ${className}`}>
      <span className="border-b border-dashed border-slate-300 text-slate-900 hover:text-slate-900">
        {children}
      </span>
      <span className="ml-1 text-[11px] text-slate-500">
        <Info size={12} />
      </span>
      <span
        className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-normal rounded-xl border border-line bg-white p-3 text-[12px] leading-relaxed text-ink shadow-md2 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100"
        role="tooltip"
      >
        Source document{docs.length === 1 ? '' : 's'}: {names}
      </span>
    </span>
  )
}
