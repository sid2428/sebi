import { motion } from 'framer-motion'
import { C, Figure, type IllustrationProps } from './primitives'
import { EASE, useReducedMotion } from '../../lib/motion'

// ============================================================
//  Search indicators & compliance badges
// ============================================================

export type ComplianceLevel = 'pass' | 'partial' | 'fail' | 'pending'

const LEVEL = {
  pass: { ring: C.ok, bg: C.okBg, mark: C.ok },
  partial: { ring: C.warn, bg: C.warnBg, mark: C.warn },
  fail: { ring: C.bad, bg: C.badBg, mark: C.bad },
  pending: { ring: '#8FA3BF', bg: C.panel, mark: '#6C809E' },
} as const

/**
 * A certification seal.
 *
 * Scalloped edge and double rim, the way a statutory seal is struck —
 * not a plain shield with a tick in it. The mark inside states the
 * verdict; the scallop count is constant so the four states read as
 * one family.
 */
export function ComplianceBadge({
  level = 'pass',
  className,
  title,
  style,
  ribbon = true,
}: IllustrationProps & { level?: ComplianceLevel; ribbon?: boolean }) {
  const c = LEVEL[level]
  const scallops = 24

  return (
    <Figure viewBox="0 0 96 108" className={className} title={title} style={style}>
      {(uid) => (
        <>
          <defs>
            <linearGradient id={`${uid}-face`} x1="0.2" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor={c.bg} />
            </linearGradient>
          </defs>

          {ribbon && (
            <g>
              <path d="M30 74 L30 104 L48 94 L66 104 L66 74 Z" fill={c.bg} stroke={c.ring} strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M38 78v18M58 78v18" stroke={c.ring} strokeWidth="1.4" opacity="0.35" strokeLinecap="round" />
            </g>
          )}

          {/* Scalloped rim */}
          <g fill={c.ring} opacity="0.9">
            {Array.from({ length: scallops }, (_, i) => {
              const a = (i / scallops) * Math.PI * 2
              return <circle key={i} cx={48 + Math.cos(a) * 40} cy={48 + Math.sin(a) * 40} r="4.2" />
            })}
          </g>

          <circle cx="48" cy="48" r="39" fill={`url(#${uid}-face)`} />
          <circle cx="48" cy="48" r="35.5" stroke={c.ring} strokeWidth="2.2" />
          <circle cx="48" cy="48" r="30" stroke={c.ring} strokeWidth="1.2" opacity="0.4" />

          {/* Verdict mark */}
          <g stroke={c.mark} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
            {level === 'pass' && <path d="M36 48.5 L44.5 57 L61 40" />}
            {level === 'partial' && <path d="M48 35v16M48 60.5v.2" />}
            {level === 'fail' && <path d="M38 38 L58 58M58 38 L38 58" />}
            {level === 'pending' && <path d="M48 34v14l9 6" strokeWidth="3.6" />}
          </g>
        </>
      )}
    </Figure>
  )
}

/**
 * The scan reticle.
 *
 * Corner brackets plus a sweeping trace line, sized to sit over a
 * document surface. Used both as an overlay during extraction and,
 * at small sizes, as the "still searching" affordance next to a query.
 */
export function SearchIndicator({
  className,
  title,
  style,
  active = true,
}: IllustrationProps & { active?: boolean }) {
  const reduced = useReducedMotion()
  const run = active && !reduced

  return (
    <Figure viewBox="0 0 120 120" className={className} title={title} style={style}>
      {(uid) => (
        <>
          <defs>
            <linearGradient id={`${uid}-sweep`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={C.accent} stopOpacity="0" />
              <stop offset="50%" stopColor={C.accent} stopOpacity="1" />
              <stop offset="100%" stopColor={C.accent} stopOpacity="0" />
            </linearGradient>
            <clipPath id={`${uid}-frame`}>
              <rect x="14" y="14" width="92" height="92" rx="8" />
            </clipPath>
          </defs>

          <rect x="14" y="14" width="92" height="92" rx="8" fill={C.panel} opacity="0.6" />

          {/* Corner brackets */}
          <g stroke={C.accent} strokeWidth="2.6" strokeLinecap="round" fill="none">
            <path d="M14 36V22a8 8 0 0 1 8-8h14" />
            <path d="M84 14h14a8 8 0 0 1 8 8v14" />
            <path d="M106 84v14a8 8 0 0 1-8 8H84" />
            <path d="M36 106H22a8 8 0 0 1-8-8V84" />
          </g>

          {/* Measurement ticks — a scanner counts. */}
          <g stroke={C.soft} strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
            {Array.from({ length: 7 }, (_, i) => (
              <path key={i} d={`M${26 + i * 12} 14v${i % 2 ? 5 : 8}`} />
            ))}
          </g>

          <g clipPath={`url(#${uid}-frame)`}>
            <motion.g
              initial={false}
              animate={run ? { y: [-4, 84, -4] } : { y: 40 }}
              transition={{ duration: 2.8, repeat: run ? Infinity : 0, ease: 'easeInOut' }}
            >
              <rect x="14" y="18" width="92" height="2.5" fill={`url(#${uid}-sweep)`} />
              <rect x="14" y="20.5" width="92" height="16" fill={C.accent} opacity="0.09" />
            </motion.g>
          </g>

          <circle cx="60" cy="60" r="5" stroke={C.deep} strokeWidth="2" fill="none" opacity="0.5" />
        </>
      )}
    </Figure>
  )
}

/**
 * A highlighted clause tied back to the document that substantiates it.
 *
 * This is the provenance thread at its smallest: the marked passage,
 * the margin rule, the drawn tie-line, and the source chip. Every
 * larger provenance visual in the app is a scale-up of this.
 */
export function DocumentHighlight({
  className,
  title,
  style,
  animate = true,
}: IllustrationProps & { animate?: boolean }) {
  const reduced = useReducedMotion()
  const run = animate && !reduced

  return (
    <Figure viewBox="0 0 220 140" className={className} title={title} style={style}>
      {(uid) => (
        <>
          <defs>
            <filter id={`${uid}-sh`} x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dy="4" stdDeviation="6" floodColor="#16233A" floodOpacity="0.09" />
            </filter>
          </defs>

          {/* Page fragment */}
          <g filter={`url(#${uid}-sh)`}>
            <rect x="8" y="10" width="120" height="120" rx="7" fill={C.surface} stroke={C.lineStrong} strokeWidth="1.5" />
          </g>
          <rect x="20" y="24" width="46" height="5" rx="2.5" fill={C.ink} />
          {[0, 1].map((i) => (
            <rect key={i} x="20" y={38 + i * 9} width={i ? 74 : 96} height="3.5" rx="1.75" fill={C.line} />
          ))}

          {/* The marked passage */}
          <rect x="14" y="58" width="108" height="30" rx="4" fill={C.pale} />
          <rect x="14" y="58" width="3" height="30" rx="1.5" fill={C.accent} />
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x="24"
              y={65 + i * 9}
              width={[88, 92, 58][i]}
              height="3.5"
              rx="1.75"
              fill={i === 1 ? C.accent : C.soft}
              opacity={i === 1 ? 0.9 : 0.55}
            />
          ))}

          {[0, 1].map((i) => (
            <rect key={i} x="20" y={98 + i * 9} width={i ? 62 : 96} height="3.5" rx="1.75" fill={C.line} />
          ))}

          {/* The thread */}
          <motion.path
            d="M124 73 C146 73 148 46 170 46"
            stroke={C.accent}
            strokeWidth="1.8"
            strokeDasharray="4 4"
            fill="none"
            strokeLinecap="round"
            initial={run ? { pathLength: 0 } : false}
            animate={run ? { pathLength: 1 } : undefined}
            transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
          />
          <circle cx="124" cy="73" r="3.5" fill={C.surface} stroke={C.accent} strokeWidth="2" />

          {/* Source chip */}
          <motion.g
            initial={run ? { opacity: 0, x: 8 } : false}
            animate={run ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.4, ease: EASE, delay: 1.05 }}
          >
            <rect x="168" y="30" width="46" height="32" rx="6" fill={C.surface} stroke={C.accent} strokeWidth="1.8" />
            <rect x="176" y="38" width="12" height="15" rx="2" fill={C.pale} stroke={C.deep} strokeWidth="1.4" />
            <path d="M194 42h12M194 47h9M194 52h12" stroke={C.soft} strokeWidth="1.6" strokeLinecap="round" />
          </motion.g>

          {/* Margin flag on the page edge */}
          <g transform="translate(128 62)">
            <rect width="7" height="22" rx="2" fill={C.accent} opacity="0.16" />
          </g>
        </>
      )}
    </Figure>
  )
}
