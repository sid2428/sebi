import { useId } from 'react'

// ============================================================
//  Illustration primitives
//
//  Every illustration in this folder is drawn to one set of rules:
//    · hairlines are 1.5 at native scale, joins and caps are round
//    · corner radii come from the 2 / 4 / 8 family
//    · colour comes from the six tokens below and nowhere else
//    · gradient + clip ids are namespaced per instance, so the same
//      illustration can appear several times on a page without the
//      later copies stealing the first one's defs
// ============================================================

export const C = {
  ink: '#16233A',
  ink2: '#3A4C69',
  line: '#E2EAF4',
  lineStrong: '#CFDCEC',
  faint: '#93A5BF',
  panel: '#F3F7FB',
  surface: '#FFFFFF',
  accent: '#5B8DEF',
  soft: '#7DB7F8',
  deep: '#3A63C4',
  pale: '#DFEAFD',
  ok: '#0F7052',
  okBg: '#E7F5EF',
  warn: '#8A5A12',
  warnBg: '#FDF4E4',
  bad: '#A93A31',
  badBg: '#FDEDEB',
} as const

export type IllustrationProps = {
  className?: string
  /**
   * Supplying a title promotes the drawing to `role="img"` and names it.
   * Leave it off for decoration — the default is correctly hidden.
   */
  title?: string
  style?: React.CSSProperties
}

/**
 * Wraps an illustration with the right accessibility semantics and
 * hands the body a per-instance id prefix for its `defs`.
 */
export function Figure({
  viewBox,
  className,
  title,
  style,
  children,
}: IllustrationProps & { viewBox: string; children: (uid: string) => React.ReactNode }) {
  const raw = useId()
  const uid = raw.replace(/[:]/g, '')
  const titleId = `${uid}-title`

  return (
    <svg
      viewBox={viewBox}
      className={className}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-labelledby={title ? titleId : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title id={titleId}>{title}</title>}
      {children(uid)}
    </svg>
  )
}

/** A ruled text line. Body copy stand-in across every illustration. */
export function TextLine({
  x,
  y,
  w,
  h = 4,
  fill = C.line,
  opacity = 1,
}: {
  x: number
  y: number
  w: number
  h?: number
  fill?: string
  opacity?: number
}) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} opacity={opacity} />
}

/** Repeating body copy with a natural ragged right edge. */
export function TextBlock({
  x,
  y,
  w,
  lines = 4,
  gap = 9,
  h = 4,
  fill = C.line,
  widths,
}: {
  x: number
  y: number
  w: number
  lines?: number
  gap?: number
  h?: number
  fill?: string
  widths?: number[]
}) {
  // Deterministic ragged edge — a real paragraph never ends flush.
  const ratios = widths ?? [1, 0.94, 0.98, 0.72, 0.96, 0.88, 0.64]
  return (
    <>
      {Array.from({ length: lines }, (_, i) => (
        <TextLine key={i} x={x} y={y + i * gap} w={w * ratios[i % ratios.length]} h={h} fill={fill} />
      ))}
    </>
  )
}
