import { motion } from 'framer-motion'
import { C, Figure, type IllustrationProps } from './primitives'
import { useReducedMotion } from '../../lib/motion'

type Props = IllustrationProps & {
  /** Run the trace pulses and core rotation. */
  active?: boolean
}

// Four routing traces leaving the die — one per source-document family.
const TRACES = [
  'M80 34 L80 16 L28 16 L28 44',
  'M126 80 L146 80 L146 132 L112 132',
  'M80 126 L80 146 L34 146 L34 118',
  'M34 80 L14 80 L14 34 L52 34',
]

/**
 * The extraction engine.
 *
 * A processor die, not a brain or a sparkle: square package, contact
 * pins on all four edges, a concentric core, and routing traces that
 * carry pulses outward to the four source-document families. The
 * metaphor is deterministic machinery, which is what a compliance
 * audience needs to believe about an extraction step.
 */
export default function AiProcessor({ className, title, style, active = true }: Props) {
  const reduced = useReducedMotion()
  const run = active && !reduced

  return (
    <Figure viewBox="0 0 160 160" className={className} title={title} style={style}>
      {(uid) => (
        <>
          <defs>
            <linearGradient id={`${uid}-die`} x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="#F7FAFE" />
              <stop offset="100%" stopColor="#E4EDFA" />
            </linearGradient>
            <linearGradient id={`${uid}-core`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={C.soft} />
              <stop offset="100%" stopColor={C.deep} />
            </linearGradient>
            <radialGradient id={`${uid}-halo`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor={C.accent} stopOpacity="0.22" />
              <stop offset="100%" stopColor={C.accent} stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx="80" cy="80" r="66" fill={`url(#${uid}-halo)`} />

          {/* Routing traces + travelling pulses */}
          <g stroke={C.lineStrong} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {TRACES.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
          {TRACES.map((d, i) => (
            <g key={`p-${i}`}>
              <circle r="3" fill={C.accent}>
                {run && (
                  <animateMotion
                    dur={`${2.4 + i * 0.35}s`}
                    repeatCount="indefinite"
                    path={d}
                    keyPoints="1;0"
                    keyTimes="0;1"
                    calcMode="linear"
                    begin={`${i * 0.45}s`}
                  />
                )}
              </circle>
            </g>
          ))}
          {/* Trace terminals */}
          {[
            [28, 44],
            [112, 132],
            [34, 118],
            [52, 34],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4.5" fill={C.surface} stroke={C.accent} strokeWidth="2" />
          ))}

          {/* Contact pins */}
          <g fill={C.lineStrong}>
            {[0, 1, 2, 3].map((side) =>
              [0, 1, 2].map((n) => {
                const off = 62 + n * 13
                const k = `${side}-${n}`
                if (side === 0) return <rect key={k} rx={1.5} x={off} y="26" width="7" height="9" />
                if (side === 1) return <rect key={k} rx={1.5} x="125" y={off} width="9" height="7" />
                if (side === 2) return <rect key={k} rx={1.5} x={off} y="125" width="7" height="9" />
                return <rect key={k} rx={1.5} x="26" y={off} width="9" height="7" />
              })
            )}
          </g>

          {/* Package */}
          <rect
            x="34"
            y="34"
            width="92"
            height="92"
            rx="10"
            fill={`url(#${uid}-die)`}
            stroke={C.lineStrong}
            strokeWidth="1.5"
          />
          {/* Pin-1 notch — the small correctness detail. */}
          <circle cx="46" cy="46" r="3.5" stroke={C.accent} strokeWidth="1.5" />

          {/* Die traces */}
          <rect x="47" y="47" width="66" height="66" rx="7" stroke={C.pale} strokeWidth="1.5" />
          <rect x="55" y="55" width="50" height="50" rx="5" stroke={C.line} strokeWidth="1.5" />

          {/* Core */}
          <motion.g
            style={{ originX: '80px', originY: '80px' }}
            animate={run ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 18, repeat: run ? Infinity : 0, ease: 'linear' }}
          >
            <rect x="64" y="64" width="32" height="32" rx="9" fill={`url(#${uid}-core)`} />
            <rect x="70" y="70" width="20" height="20" rx="6" fill="#FFFFFF" opacity="0.24" />
          </motion.g>

          {/* Activity ring */}
          <motion.circle
            cx="80"
            cy="80"
            r="26"
            stroke={C.accent}
            strokeWidth="1.5"
            strokeDasharray="4 8"
            opacity="0.6"
            style={{ originX: '80px', originY: '80px' }}
            animate={run ? { rotate: -360 } : { rotate: 0 }}
            transition={{ duration: 9, repeat: run ? Infinity : 0, ease: 'linear' }}
          />
        </>
      )}
    </Figure>
  )
}
