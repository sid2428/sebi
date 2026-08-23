// ============================================================
//  PDF layer
//
//  The final stage shows the real, legally formatted DRHP — the PDF
//  itself, not a React re-creation of it. This module owns everything
//  that talks to pdf.js: loading the file, rendering a page to a
//  canvas, and working out what the document's sections are so the
//  side rail can jump to them.
//
//  Section discovery runs three strategies, best first:
//    1. the PDF's own bookmarks (outline), if the file carries any;
//    2. known DRHP chapter titles matched against each page's text;
//    3. the capitalised heading a page opens with, which is how offer
//       documents mark a new chapter — usually at body point size.
//  Bookmarks win outright; otherwise 2 and 3 are merged, so a properly
//  bookmarked prospectus gets a perfect rail and an unbookmarked one
//  still gets a full one.
// ============================================================

import * as pdfjs from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { SECTIONS } from '../data/mock'

// pdf.js does its parsing off the main thread; Vite hands us the URL of
// the worker bundle so it is fetched separately from the app chunk.
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

// pdf.js 4 uses Promise.withResolvers, which older Safari/Chrome lack.
// Cheaper to shim it than to pin the library back a major version.
if (typeof (Promise as any).withResolvers !== 'function') {
  ;(Promise as any).withResolvers = function withResolvers<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void
    let reject!: (reason?: unknown) => void
    const promise = new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })
    return { promise, resolve, reject }
  }
}

/** The filed document, served from /public so it keeps its own URL. */
export const DRHP_PDF_URL = `${import.meta.env.BASE_URL}Main_DRHP.pdf`

/** One entry in the document rail. `page` is 1-based. */
export type PdfSection = {
  id: string
  label: string
  page: number
  /** 0 for a chapter, 1+ for anything nested under it. */
  level: number
}

export async function openPdf(url: string = DRHP_PDF_URL): Promise<PDFDocumentProxy> {
  return pdfjs.getDocument({ url }).promise
}

/** Page proportions (height / width), so unrendered pages reserve the right box. */
export async function pageRatio(doc: PDFDocumentProxy): Promise<number> {
  const page = await doc.getPage(1)
  const vp = page.getViewport({ scale: 1 })
  page.cleanup()
  return vp.height / vp.width
}

// ---------- section discovery ----------

/** Collapse case, punctuation and runs of whitespace so titles compare cleanly. */
function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

/**
 * Chapter titles a SEBI-format offer document is expected to carry. The
 * app's own section list is the spine; the rest cover the wording
 * variations different drafters use for the same chapter.
 */
const KNOWN_TITLES: string[] = [
  ...SECTIONS.map((s) => s.title),
  'Table of Contents',
  'Definitions and Abbreviations',
  'Certain Conventions, Presentation of Financial, Industry and Market Data',
  'Forward-Looking Statements',
  'Summary of the Offer Document',
  'The Issue',
  'Summary of Financial Information',
  'General Information',
  'Capital Structure',
  'Objects of the Issue',
  'Basis for Issue Price',
  'Statement of Special Tax Benefits',
  'Industry Overview',
  'Our Business',
  'Key Regulations and Policies',
  'History and Certain Corporate Matters',
  'Our Management',
  'Our Promoters and Promoter Group',
  'Our Group Companies',
  'Dividend Policy',
  'Financial Statements',
  'Restated Financial Statements',
  'Management Discussion and Analysis of Financial Condition and Results of Operations',
  'Capitalisation Statement',
  'Financial Indebtedness',
  'Outstanding Litigation and Material Developments',
  'Government and Other Approvals',
  'Other Regulatory and Statutory Disclosures',
  'Terms of the Issue',
  'Issue Structure',
  'Issue Procedure',
  'Restrictions on Foreign Ownership of Indian Securities',
  'Main Provisions of the Articles of Association',
  'Material Contracts and Documents for Inspection',
  'Declaration',
  'Risk Factors',
]

const KNOWN_LOOKUP = new Map(KNOWN_TITLES.map((t) => [norm(t), t]))

/** A dotted table-of-contents row, a page number, a bare roman numeral. */
function looksLikeNoise(line: string) {
  if (line.length < 4 || line.length > 110) return true
  if (/\.{4,}/.test(line)) return true
  if (/^[\divxlcIVXLC\s.\-–—|]+$/.test(line)) return true
  if (!/[a-zA-Z]/.test(line)) return true
  return false
}

type ScannedPage = { page: number; lines: { text: string; size: number }[] }

/** Flatten the PDF's bookmark tree into rail entries, resolving each destination. */
async function fromOutline(doc: PDFDocumentProxy): Promise<PdfSection[]> {
  let outline: any[] | null = null
  try {
    outline = await doc.getOutline()
  } catch {
    return []
  }
  if (!outline?.length) return []

  const out: PdfSection[] = []

  async function pageOf(dest: any): Promise<number | null> {
    try {
      const resolved = typeof dest === 'string' ? await doc.getDestination(dest) : dest
      const ref = resolved?.[0]
      if (!ref) return null
      // An explicit destination points at a page ref; a numeric one is an index.
      if (typeof ref === 'number') return ref + 1
      return (await doc.getPageIndex(ref)) + 1
    } catch {
      return null
    }
  }

  async function walk(items: any[], level: number) {
    for (const item of items) {
      const page = await pageOf(item.dest)
      const label = String(item.title ?? '').replace(/\s+/g, ' ').trim()
      if (page && label) {
        out.push({ id: `outline-${out.length}`, label, page, level })
      }
      // Two levels is as deep as a navigation rail stays readable.
      if (item.items?.length && level < 1) await walk(item.items, level + 1)
    }
  }

  await walk(outline, 0)
  return out
}

/**
 * One page's text, grouped into lines and tagged with the type size each
 * line was set in. pdf.js gives us positioned glyph runs; we bucket them
 * by baseline to get lines back.
 */
async function pageLines(page: PDFPageProxy) {
  const content = await page.getTextContent()
  const rows = new Map<number, { size: number; parts: string[]; y: number }>()

  for (const item of content.items as any[]) {
    const text = String(item.str ?? '')
    if (!text.trim()) continue
    const size = Math.abs(item.transform?.[3] ?? item.height ?? 0) || 0
    const y = Math.round((item.transform?.[5] ?? 0) / 2) * 2 // 2pt baseline buckets
    const row = rows.get(y)
    if (row) {
      row.parts.push(text)
      row.size = Math.max(row.size, size)
    } else {
      rows.set(y, { size, parts: [text], y })
    }
  }

  return [...rows.values()]
    .sort((a, b) => b.y - a.y) // PDF y grows upward, so top of page first
    .map((r) => ({
      // An unmapped glyph in a subset font comes through as U+FFFD; in
      // running prose it is nearly always a curly apostrophe.
      text: r.parts.join(' ').replace(/�/g, '’').replace(/\s+/g, ' ').trim(),
      size: r.size,
    }))
    .filter((r) => r.text)
}

/**
 * Walk every page once and collect its text lines. `onPage` reports
 * progress so the generation sequence can show real work happening.
 */
async function scanPages(
  doc: PDFDocumentProxy,
  onPage?: (done: number, total: number) => void
): Promise<ScannedPage[]> {
  const total = doc.numPages
  const scanned: ScannedPage[] = []

  for (let n = 1; n <= total; n++) {
    const page = await doc.getPage(n)
    scanned.push({ page: n, lines: await pageLines(page) })
    page.cleanup()
    onPage?.(n, total)
  }
  return scanned
}

/** Strategy 2 — a page whose opening lines carry a chapter title we recognise. */
function fromKnownTitles(scanned: ScannedPage[]): PdfSection[] {
  const seen = new Set<string>()
  const out: PdfSection[] = []

  for (const { page, lines } of scanned) {
    // A chapter opener states its title near the top, in large type.
    const sizes = lines.map((l) => l.size).filter(Boolean).sort((a, b) => a - b)
    const median = sizes.length ? sizes[Math.floor(sizes.length / 2)] : 0
    for (const line of lines.slice(0, 8)) {
      if (median && line.size < median * 1.12) continue
      const cleaned = line.text.replace(/^(section\s+[ivxlc]+\s*[:.\-–—]?\s*)/i, '').trim()
      const key = norm(cleaned)
      if (!key || seen.has(key)) continue
      const known = KNOWN_LOOKUP.get(key)
      if (!known) continue
      seen.add(key)
      out.push({ id: `known-${out.length}`, label: known, page, level: 0 })
      break
    }
  }
  return out
}

/** Is this line set entirely in capitals? */
function isCaps(text: string) {
  const letters = text.replace(/[^A-Za-z]/g, '')
  return letters.length >= 3 && letters === letters.toUpperCase()
}

/** "OBJECTS OF THE ISSUE" -> "Objects of the Issue", for a readable rail. */
function titleCase(text: string) {
  const known = KNOWN_LOOKUP.get(norm(text))
  if (known) return known
  const small = new Set(['of', 'the', 'and', 'to', 'for', 'in', 'on', 'a', 'an', 'or', 'our'])
  return text
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => (i > 0 && small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

/**
 * Strategy 3 — a page that opens with a heading starts a section.
 *
 * Offer documents rarely set their chapter titles in larger type: they use
 * bold capitals at the top of a fresh page, at the same point size as the
 * body. So the signal is position and case, not size — with size kept as a
 * second way in for documents that do scale their headings up.
 */
function fromPageOpeners(scanned: ScannedPage[]): PdfSection[] {
  const out: PdfSection[] = []
  let last = ''

  const push = (label: string, page: number, level: number) => {
    const clean = label.replace(/\s*[.·|]\s*\d+\s*$/, '').trim()
    if (looksLikeNoise(clean)) return
    // Running heads repeat on every page of a chapter; only the first counts.
    if (level === 0 && norm(clean) === last) return
    if (level === 0) last = norm(clean)
    out.push({ id: `head-${out.length}`, label: titleCase(clean), page, level })
  }

  for (const { page, lines } of scanned) {
    if (!lines.length) continue
    const sizes = lines.map((l) => l.size).filter(Boolean).sort((a, b) => a - b)
    const median = sizes.length ? sizes[Math.floor(sizes.length / 2)] : 0

    // Take the run of heading-ish lines at the very top of the page. The
    // first line that reads as body text ends the run — and if the page
    // opens with body text, it is a continuation, not a new section.
    const opener: string[] = []
    for (const line of lines.slice(0, 3)) {
      const text = line.text.trim()
      if (!text || looksLikeNoise(text)) continue
      const bigger = median > 0 && line.size >= median * 1.25
      if (!isCaps(text) && !bigger) break
      opener.push(text)
    }
    if (!opener.length) continue

    // A heading that wrapped onto a second line ends on a joining word;
    // stitch it back together rather than shipping half a title.
    while (opener.length > 1 && /\b(of|and|the|for|in|to|on|our)$/i.test(opener[0])) {
      opener.splice(0, 2, `${opener[0]} ${opener[1]}`)
    }

    // "SECTION III: INTRODUCTION" names the part; the caps line under it
    // names the chapter, and both are worth a rail entry.
    const numbered = opener[0].match(/^SECTION\s+([IVXLC]+)\s*[:.\-–—]?\s*(.*)$/i)
    if (numbered) {
      const rest = numbered[2].trim()
      push(rest || `Section ${numbered[1].toUpperCase()}`, page, 0)
      if (opener[1]) push(opener[1], page, 1)
    } else {
      push(opener[0], page, 0)
    }
  }
  return out
}

/**
 * Build the document rail. Bookmarks win outright; otherwise we read the
 * pages. Returns at least one entry for any document that opened.
 */
export async function buildSections(
  doc: PDFDocumentProxy,
  onProgress?: (done: number, total: number) => void
): Promise<PdfSection[]> {
  const outline = await fromOutline(doc)
  if (outline.length >= 3) {
    onProgress?.(doc.numPages, doc.numPages)
    return outline
  }

  const scanned = await scanPages(doc, onProgress)

  // Neither text strategy is complete on its own: the known-title matcher
  // labels chapters well but only recognises the ones it has heard of, and
  // the type-size heuristic finds every opener but names some of them
  // clumsily. Merge them by page, letting a recognised title win the label.
  const known = fromKnownTitles(scanned)
  const headings = fromPageOpeners(scanned)

  const byPage = new Map<string, PdfSection>()
  for (const h of headings) byPage.set(`${h.page}-${h.level}`, h)
  // A recognised chapter title is a better label than a guessed one.
  for (const k of known) byPage.set(`${k.page}-0`, k)

  const merged = [...byPage.values()]
    .sort((a, b) => a.page - b.page || a.level - b.level)
    // "SECTION III: THE ISSUE" over "THE ISSUE" yields the same title twice
    // on one page; keep the parent and drop the echo.
    .filter((s, _i, all) =>
      s.level === 0 || !all.some((o) => o.page === s.page && o.level === 0 && norm(o.label) === norm(s.label))
    )
    .map((s, i) => ({ ...s, id: `sec-${i}` }))

  // A very long list stops being navigation, so cap it.
  if (merged.length >= 3) return merged.slice(0, 80)

  if (outline.length) return outline
  if (merged.length) return merged

  // Nothing legible to key off — fall back to plain pagination.
  return Array.from({ length: doc.numPages }, (_, i) => ({
    id: `page-${i + 1}`,
    label: `Page ${i + 1}`,
    page: i + 1,
    level: 0,
  }))
}

/**
 * Lay the page's real text over the rasterised canvas: invisible, correctly
 * positioned spans. The document is then selectable, copyable and findable
 * with the browser's own search — the difference between reading a document
 * and looking at a picture of one.
 */
export async function renderTextLayer(
  page: PDFPageProxy,
  container: HTMLElement,
  cssWidth: number
) {
  const base = page.getViewport({ scale: 1 })
  const scale = cssWidth / base.width
  const viewport = page.getViewport({ scale })

  container.replaceChildren()
  container.style.width = `${Math.floor(viewport.width)}px`
  container.style.height = `${Math.floor(viewport.height)}px`
  // pdf.js sizes every span off this custom property.
  container.style.setProperty('--scale-factor', String(scale))

  const layer = new pdfjs.TextLayer({
    textContentSource: page.streamTextContent(),
    container,
    viewport,
  })
  await layer.render()
}

/** Render one page into a canvas at `cssWidth` device-independent pixels. */
export async function renderPageToCanvas(
  page: PDFPageProxy,
  canvas: HTMLCanvasElement,
  cssWidth: number
) {
  const base = page.getViewport({ scale: 1 })
  const scale = cssWidth / base.width
  // Cap the multiplier: a 3x retina render of an A4 page is 2k+ per side
  // and costs more than the extra sharpness is worth.
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const viewport = page.getViewport({ scale: scale * dpr })

  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  canvas.style.width = `${Math.floor(viewport.width / dpr)}px`
  canvas.style.height = `${Math.floor(viewport.height / dpr)}px`

  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  await page.render({ canvasContext: ctx, viewport }).promise
}
