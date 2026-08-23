import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import {
  ChevronLeft, ChevronRight, Download, ExternalLink, Loader2, Maximize2, Minus, Plus,
  ListTree, Search, X,
} from 'lucide-react'
import { renderPageToCanvas, renderTextLayer, type PdfSection } from '../lib/pdf'
import { EASE } from '../lib/motion'

// ============================================================
//  Document room viewer
//
//  The filed PDF, rendered page by page, with a rail of the document's
//  own sections beside it. Pages render lazily as they come near the
//  viewport — a two-hundred page prospectus should not cost two hundred
//  canvas rasterisations to open.
// ============================================================

const ZOOMS = [0.6, 0.75, 0.9, 1, 1.15, 1.35, 1.6, 2]
/** Widest a page is drawn at 100%, in CSS pixels. Beyond this it just blurs. */
const MAX_PAGE_WIDTH = 880

export default function DrhpViewer({
  doc,
  sections,
  ratio,
  fileUrl,
  fileName,
  onDownload,
}: {
  doc: PDFDocumentProxy
  sections: PdfSection[]
  ratio: number
  fileUrl: string
  fileName: string
  onDownload: () => void
}) {
  const paneRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const railRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const [paneWidth, setPaneWidth] = useState(0)
  const [zoomIdx, setZoomIdx] = useState(3) // 1.0
  const [current, setCurrent] = useState(1)
  const [query, setQuery] = useState('')
  const [railOpen, setRailOpen] = useState(false)

  const total = doc.numPages
  const zoom = ZOOMS[zoomIdx]
  const pageWidth = Math.max(220, Math.min(MAX_PAGE_WIDTH, paneWidth - 48) * zoom)

  // Track the reading pane's width so pages are drawn to fit it.
  useLayoutEffect(() => {
    const el = paneRef.current
    if (!el) return
    const measure = () => setPaneWidth(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Which page is being read. The rail follows this, so scrolling the
  // document moves the highlight without anyone clicking anything.
  useEffect(() => {
    const pane = paneRef.current
    if (!pane) return
    const observer = new IntersectionObserver(
      (entries) => {
        const seen = entries
          .filter((e) => e.isIntersecting)
          .map((e) => Number((e.target as HTMLElement).dataset.page))
          .filter((n) => Number.isFinite(n))
        if (seen.length) setCurrent(Math.min(...seen))
      },
      { root: pane, rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    pageRefs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [total])

  const scrollToPage = useCallback((n: number, smooth = true) => {
    const pane = paneRef.current
    const el = pageRefs.current.get(n)
    if (!pane || !el) return
    pane.scrollTo({ top: Math.max(0, el.offsetTop - 16), behavior: smooth ? 'smooth' : 'auto' })
    setCurrent(n)
    setRailOpen(false)
  }, [])

  /** Which rail entry covers the page being read. */
  const activeSectionId = useMemo(() => {
    let found: string | null = null
    for (const s of sections) {
      if (s.page <= current) found = s.id
      else break
    }
    return found ?? sections[0]?.id ?? null
  }, [sections, current])

  // Keep the highlighted rail entry in view as the reader scrolls.
  useEffect(() => {
    if (!activeSectionId) return
    railRefs.current.get(activeSectionId)?.scrollIntoView({ block: 'nearest' })
  }, [activeSectionId])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sections
    return sections.filter((s) => s.label.toLowerCase().includes(q))
  }, [sections, query])

  const rail = (
    <SectionRail
      sections={filtered}
      total={sections.length}
      activeId={activeSectionId}
      query={query}
      setQuery={setQuery}
      onPick={scrollToPage}
      register={(id, el) => {
        if (el) railRefs.current.set(id, el)
        else railRefs.current.delete(id)
      }}
    />
  )

  return (
    <div
      className="grid overflow-hidden rounded-3xl2 border border-line bg-white shadow-md2 lg:grid-cols-[272px_minmax(0,1fr)]"
      style={{ height: 'min(940px, max(560px, calc(100vh - 170px)))' }}
    >
      {/* ---- section rail (desktop) ---- */}
      <aside className="hidden min-h-0 flex-col border-r border-line bg-panel/45 lg:flex">{rail}</aside>

      {/* ---- document ---- */}
      <div className="flex min-h-0 min-w-0 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-white/90 px-3 py-2.5 backdrop-blur-xl">
          <button
            onClick={() => setRailOpen(true)}
            className="btn btn-ghost btn-sm lg:hidden"
            aria-label="Open section list"
          >
            <ListTree size={14} /> Sections
          </button>

          <div className="flex items-center gap-1">
            <IconBtn
              label="Previous page"
              disabled={current <= 1}
              onClick={() => scrollToPage(Math.max(1, current - 1))}
            >
              <ChevronLeft size={16} />
            </IconBtn>
            <PageJump current={current} total={total} onJump={scrollToPage} />
            <IconBtn
              label="Next page"
              disabled={current >= total}
              onClick={() => scrollToPage(Math.min(total, current + 1))}
            >
              <ChevronRight size={16} />
            </IconBtn>
          </div>

          <div className="mx-1 hidden h-5 w-px bg-line sm:block" />

          <div className="flex items-center gap-1">
            <IconBtn
              label="Zoom out"
              disabled={zoomIdx === 0}
              onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
            >
              <Minus size={15} />
            </IconBtn>
            <span className="w-[46px] text-center text-[12px] font-bold tabular-nums text-ink-2">
              {Math.round(zoom * 100)}%
            </span>
            <IconBtn
              label="Zoom in"
              disabled={zoomIdx === ZOOMS.length - 1}
              onClick={() => setZoomIdx((i) => Math.min(ZOOMS.length - 1, i + 1))}
            >
              <Plus size={15} />
            </IconBtn>
            <IconBtn label="Fit to width" onClick={() => setZoomIdx(3)}>
              <Maximize2 size={14} />
            </IconBtn>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-sm hidden sm:inline-flex"
            >
              <ExternalLink size={14} /> Open in new tab
            </a>
            <button onClick={onDownload} className="btn btn-ghost btn-sm">
              <Download size={14} /> Download
            </button>
          </div>
        </div>

        <div ref={paneRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-panel-2/70">
          <div ref={listRef} className="relative flex flex-col items-center gap-5 px-4 py-5">
            {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
              <PdfPage
                key={n}
                doc={doc}
                num={n}
                width={pageWidth}
                ratio={ratio}
                root={paneRef}
                register={(el) => {
                  if (el) pageRefs.current.set(n, el)
                  else pageRefs.current.delete(n)
                }}
              />
            ))}
            <div className="py-3 text-[11.5px] font-semibold text-muted">
              End of document · {fileName}
            </div>
          </div>
        </div>
      </div>

      {/* ---- section rail (mobile sheet) ---- */}
      <AnimatePresence>
        {railOpen && (
          <motion.div
            className="fixed inset-0 z-[140] bg-[#0E1828]/45 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRailOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="absolute inset-y-0 left-0 flex w-[85%] max-w-[320px] flex-col bg-white shadow-xl2"
            >
              <button
                onClick={() => setRailOpen(false)}
                className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-panel hover:text-ink"
                aria-label="Close section list"
              >
                <X size={17} />
              </button>
              {rail}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------- rail ----------

function SectionRail({
  sections,
  total,
  activeId,
  query,
  setQuery,
  onPick,
  register,
}: {
  sections: PdfSection[]
  total: number
  activeId: string | null
  query: string
  setQuery: (v: string) => void
  onPick: (page: number) => void
  register: (id: string, el: HTMLButtonElement | null) => void
}) {
  return (
    <>
      <div className="border-b border-line px-4 py-3.5">
        <div className="eyebrow">Document contents</div>
        <div className="mt-0.5 text-[12px] text-muted">
          {total} section{total === 1 ? '' : 's'} detected in the PDF
        </div>
        <div className="mt-2.5 flex items-center gap-2 rounded-xl2 border border-line bg-white px-2.5 py-1.5 focus-within:border-accent-300">
          <Search size={13} className="shrink-0 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a section"
            aria-label="Find a section in the document"
            className="min-w-0 flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-muted"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="shrink-0 text-muted hover:text-ink">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <nav
        aria-label="DRHP sections"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2.5"
      >
        {sections.length ? (
          <ol className="space-y-0.5">
            {sections.map((s) => {
              const on = s.id === activeId
              return (
                <li key={s.id}>
                  <button
                    ref={(el) => register(s.id, el)}
                    onClick={() => onPick(s.page)}
                    aria-current={on ? 'true' : undefined}
                    className={`group relative flex w-full items-start gap-2 rounded-lg py-1.5 pr-2 text-left transition-colors duration-200 ${
                      s.level > 0 ? 'pl-6' : 'pl-2.5'
                    } ${on ? 'text-accent-700' : 'text-ink-2 hover:bg-white'}`}
                  >
                    {/* Positioned, not negatively stacked: a -z-10 pill would
                        slide behind the rail's own background and vanish. */}
                    {on && (
                      <motion.span
                        layoutId="drhp-rail-pill"
                        className="absolute inset-0 rounded-lg bg-accent-50 ring-1 ring-inset ring-accent-200"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span
                      className={`relative min-w-0 flex-1 text-[12.5px] leading-[1.45] ${
                        s.level > 0 ? 'font-semibold' : 'font-bold'
                      }`}
                    >
                      {s.label}
                    </span>
                    <span
                      className={`relative mt-[1px] shrink-0 text-[11px] font-bold tabular-nums ${
                        on ? 'text-accent-600' : 'text-faint'
                      }`}
                    >
                      {s.page}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="px-3 py-6 text-center text-[12.5px] text-muted">No section matches that.</p>
        )}
      </nav>
    </>
  )
}

// ---------- page ----------

/**
 * One sheet. It reserves its space immediately from the document's
 * aspect ratio, then rasterises itself once it comes within a screen
 * or so of the viewport.
 */
function PdfPage({
  doc,
  num,
  width,
  ratio,
  root,
  register,
}: {
  doc: PDFDocumentProxy
  num: number
  width: number
  ratio: number
  root: React.RefObject<HTMLElement>
  register: (el: HTMLDivElement | null) => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  const [drawnAt, setDrawnAt] = useState(0)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    register(el)
    return () => register(null)
  }, [register])

  // Draw a screen ahead of the reader in both directions.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true)
      },
      { root: root.current, rootMargin: '700px 0px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [root])

  useEffect(() => {
    if (!near || !width) return
    // Re-rasterise on a real width change only; ignore sub-pixel reflow.
    if (drawnAt && Math.abs(drawnAt - width) < 2) return

    let cancelled = false

    const timer = window.setTimeout(async () => {
      try {
        const page = await doc.getPage(num)
        if (cancelled) return
        const canvas = canvasRef.current
        if (!canvas) return
        await renderPageToCanvas(page, canvas, width)
        if (cancelled) return
        setDrawnAt(width)
        // The selectable text goes on after the pixels, so the page appears
        // as soon as it is drawn rather than waiting on the text content.
        if (textRef.current) await renderTextLayer(page, textRef.current, width)
        page.cleanup()
      } catch {
        /* a cancelled render is not an error worth surfacing */
      }
    }, 40)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [near, width, num, doc, drawnAt])

  const drawn = drawnAt > 0

  return (
    <div
      ref={wrapRef}
      data-page={num}
      className="relative shrink-0"
      style={{ width, height: drawn ? undefined : Math.round(width * ratio) }}
    >
      <div className="relative overflow-hidden rounded-[3px] bg-white shadow-md2 ring-1 ring-line">
        <canvas ref={canvasRef} className="block" style={{ width, height: drawn ? undefined : Math.round(width * ratio) }} />
        {/* Not aria-hidden: these spans are the page's only real text, and
            they are what a screen reader and find-in-page work from. */}
        <div ref={textRef} className="textLayer" />
        {!drawn && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex flex-col items-center gap-2 text-muted">
              <Loader2 size={17} className="animate-spin" />
              <span className="text-[11px] font-semibold">Page {num}</span>
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-panel to-transparent animate-shimmer"
            />
          </div>
        )}
      </div>
      <span className="pointer-events-none absolute -bottom-4 right-0 text-[10.5px] font-semibold tabular-nums text-faint">
        {num}
      </span>
    </div>
  )
}

// ---------- toolbar bits ----------

function IconBtn({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-lg text-ink-2 transition-colors duration-200 hover:bg-panel hover:text-ink disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}

function PageJump({
  current,
  total,
  onJump,
}: {
  current: number
  total: number
  onJump: (n: number) => void
}) {
  const [draft, setDraft] = useState(String(current))
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!editing) setDraft(String(current))
  }, [current, editing])

  function commit() {
    setEditing(false)
    const n = Number.parseInt(draft, 10)
    if (Number.isFinite(n) && n >= 1 && n <= total) onJump(n)
    else setDraft(String(current))
  }

  return (
    <span className="flex items-center gap-1 text-[12px] font-semibold text-muted">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ''))}
        onFocus={() => setEditing(true)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          if (e.key === 'Escape') {
            setDraft(String(current))
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        aria-label={`Page number, ${total} pages total`}
        className="w-[46px] rounded-lg border border-line bg-white px-1.5 py-1 text-center text-[12px] font-bold tabular-nums text-ink outline-none transition-colors focus:border-accent-300"
      />
      <span className="tabular-nums">/ {total}</span>
    </span>
  )
}
