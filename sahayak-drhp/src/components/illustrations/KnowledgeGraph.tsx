import { motion } from 'framer-motion'
import { C, Figure, type IllustrationProps } from './primitives'
import { EASE, useReducedMotion } from '../../lib/motion'

type Props = IllustrationProps & {
  /** Draw the edges on rather than showing them already built. */
  animate?: boolean
}

// Typed nodes. Square = source document, circle = extracted entity,
// diamond = a disclosure obligation the entity triggers. Radius
// encodes degree, so the hub reads as the hub without a label.
type Node = { id: string; x: number; y: number; r: number; kind: 'doc' | 'entity' | 'duty' }

const NODES: Node[] = [
  { id: 'a', x: 36, y: 52, r: 9, kind: 'doc' },
  { id: 'b', x: 30, y: 120, r: 7, kind: 'doc' },
  { id: 'c', x: 86, y: 28, r: 6, kind: 'entity' },
  { id: 'd', x: 98, y: 86, r: 15, kind: 'entity' },
  { id: 'e', x: 76, y: 144, r: 8, kind: 'entity' },
  { id: 'f', x: 152, y: 52, r: 11, kind: 'entity' },
  { id: 'g', x: 160, y: 118, r: 8, kind: 'doc' },
  { id: 'h', x: 208, y: 36, r: 6, kind: 'entity' },
  { id: 'i', x: 212, y: 94, r: 7, kind: 'entity' },
  { id: 'j', x: 198, y: 150, r: 6, kind: 'duty' },
  { id: 'k', x: 122, y: 160, r: 5, kind: 'duty' },
]

const EDGES: [string, string][] = [
  ['a', 'd'], ['b', 'd'], ['c', 'd'], ['a', 'c'], ['d', 'e'],
  ['d', 'f'], ['d', 'g'], ['f', 'h'], ['f', 'i'], ['g', 'i'],
  ['g', 'j'], ['e', 'k'], ['e', 'g'],
]

// The provenance thread: one document, through the issuer, to the
// section it substantiates. Highlighted so the eye has a route.
const THREAD: [string, string][] = [['a', 'd'], ['d', 'f'], ['f', 'i']]

const at = (id: string) => NODES.find((n) => n.id === id)!

/** Gentle arc between two nodes — bowed perpendicular to the chord. */
function edgePath([from, to]: [string, string]) {
  const a = at(from)
  const b = at(to)
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const bow = Math.min(16, len * 0.14)
  return `M${a.x} ${a.y} Q${mx - (dy / len) * bow} ${my + (dx / len) * bow} ${b.x} ${b.y}`
}

const isThread = (e: [string, string]) =>
  THREAD.some(([x, y]) => (x === e[0] && y === e[1]) || (x === e[1] && y === e[0]))

/**
 * The knowledge graph built during extraction.
 *
 * Not an abstract node cloud — the shapes are typed and the sizes
 * carry degree, so it reads as a specific claim: source documents
 * resolve into entities, and entities trigger disclosure duties.
 */
export default function KnowledgeGraph({ className, title, style, animate = true }: Props) {
  const reduced = useReducedMotion()
  const run = animate && !reduced

  return (
    <Figure viewBox="0 0 244 184" className={className} title={title} style={style}>
      {(uid) => (
        <>
          <defs>
            <radialGradient id={`${uid}-hub`} cx="0.35" cy="0.3" r="0.75">
              <stop offset="0%" stopColor={C.soft} />
              <stop offset="100%" stopColor={C.deep} />
            </radialGradient>
            <filter id={`${uid}-lift`} x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dy="2" stdDeviation="3" floodColor="#16233A" floodOpacity="0.14" />
            </filter>
          </defs>

          {/* Edges */}
          <g fill="none" strokeLinecap="round">
            {EDGES.map((e, i) => {
              const lit = isThread(e)
              return (
                <motion.path
                  key={`${e[0]}-${e[1]}`}
                  d={edgePath(e)}
                  stroke={lit ? C.accent : C.lineStrong}
                  strokeWidth={lit ? 2 : 1.5}
                  opacity={lit ? 1 : 0.85}
                  initial={run ? { pathLength: 0, opacity: 0 } : false}
                  animate={run ? { pathLength: 1, opacity: lit ? 1 : 0.85 } : undefined}
                  // The whole graph must finish building inside one act.
                  transition={{ duration: 0.42, ease: EASE, delay: 0.08 + i * 0.028 }}
                />
              )
            })}
          </g>

          {/* A pulse running the length of the provenance thread. */}
          {run && (
            <circle r="3.2" fill={C.accent}>
              <animateMotion
                dur="2.6s"
                repeatCount="indefinite"
                begin="0.75s"
                path={`M${at('a').x} ${at('a').y} Q${(at('a').x + at('d').x) / 2 - 6} ${
                  (at('a').y + at('d').y) / 2 + 6
                } ${at('d').x} ${at('d').y} Q${(at('d').x + at('f').x) / 2} ${
                  (at('d').y + at('f').y) / 2 - 10
                } ${at('f').x} ${at('f').y} Q${(at('f').x + at('i').x) / 2 + 8} ${
                  (at('f').y + at('i').y) / 2
                } ${at('i').x} ${at('i').y}`}
              />
            </circle>
          )}

          {/* Nodes */}
          {NODES.map((n, i) => {
            const onThread = THREAD.some(([x, y]) => x === n.id || y === n.id)
            const stroke = onThread ? C.accent : C.lineStrong
            const fill = n.id === 'd' ? `url(#${uid}-hub)` : C.surface

            const body =
              n.kind === 'doc' ? (
                <rect
                  x={-n.r}
                  y={-n.r}
                  width={n.r * 2}
                  height={n.r * 2}
                  rx={Math.max(2, n.r * 0.32)}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="2"
                />
              ) : n.kind === 'duty' ? (
                <rect
                  x={-n.r}
                  y={-n.r}
                  width={n.r * 2}
                  height={n.r * 2}
                  rx="2"
                  transform="rotate(45)"
                  fill={C.warnBg}
                  stroke={C.warn}
                  strokeWidth="1.8"
                />
              ) : (
                <circle r={n.r} fill={fill} stroke={stroke} strokeWidth="2" />
              )

            // Position lives on a plain <g> and the animation on an inner
            // <motion.g>. Putting both on one node lets Motion's CSS
            // transform (for scale) override the translate attribute,
            // which collapses every node onto the origin.
            return (
              <g key={n.id} transform={`translate(${n.x} ${n.y})`} filter={`url(#${uid}-lift)`}>
                <motion.g
                  initial={run ? { opacity: 0, scale: 0.4 } : false}
                  animate={run ? { opacity: 1, scale: 1 } : undefined}
                  transition={{ duration: 0.3, ease: EASE, delay: i * 0.028 }}
                >
                  {body}
                  {n.id === 'd' && <circle r="5" fill="#FFFFFF" opacity="0.32" />}
                  {n.kind === 'doc' && n.r >= 8 && (
                    <g stroke={onThread ? C.deep : '#A9BDD6'} strokeWidth="1.4" strokeLinecap="round">
                      <path d={`M${-n.r * 0.44} ${-n.r * 0.3}h${n.r * 0.88}`} />
                      <path d={`M${-n.r * 0.44} ${n.r * 0.1}h${n.r * 0.6}`} />
                    </g>
                  )}
                </motion.g>
              </g>
            )
          })}
        </>
      )}
    </Figure>
  )
}
