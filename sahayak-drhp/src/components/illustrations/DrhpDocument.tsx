import { motion } from 'framer-motion'
import { C, Figure, TextBlock, TextLine, type IllustrationProps } from './primitives'
import { EASE } from '../../lib/motion'

type Props = IllustrationProps & {
  /** Back sheets behind the cover page. */
  stack?: boolean
  /** Section clauses that glow, by index 0–3. Drives the scan sequence. */
  highlight?: number[]
  /** Draw the red certification band across the cover. */
  stamp?: boolean
  /** Roman-numeral index tabs down the fore-edge. */
  tabs?: boolean
}

const TAB_LABELS = ['III', 'VII', 'XI', 'XIV']

/**
 * The offer document itself — the anchor object of the whole product.
 *
 * Drawn as a real cover page rather than a generic "file" glyph: rule
 * under the masthead, issue block, restated-figures table, fore-edge
 * tabs carrying the Roman section numerals, and the draft band that
 * every uncertified DRHP carries.
 */
export default function DrhpDocument({
  className,
  title,
  style,
  stack = true,
  highlight = [],
  stamp = true,
  tabs = true,
}: Props) {
  return (
    <Figure viewBox="0 0 248 320" className={className} title={title} style={style}>
      {(uid) => (
        <>
          <defs>
            <linearGradient id={`${uid}-page`} x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FBFDFF" />
            </linearGradient>
            <linearGradient id={`${uid}-mast`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={C.deep} />
              <stop offset="55%" stopColor={C.accent} />
              <stop offset="100%" stopColor={C.soft} />
            </linearGradient>
            <filter id={`${uid}-shadow`} x="-30%" y="-14%" width="160%" height="140%">
              <feDropShadow dy="10" stdDeviation="12" floodColor="#16233A" floodOpacity="0.1" />
            </filter>
          </defs>

          {/* Back sheets. The document is never a single page. */}
          {stack && (
            <g opacity="0.85">
              <rect
                x="42"
                y="20"
                width="176"
                height="286"
                rx="7"
                fill="#EEF4FB"
                stroke={C.line}
                strokeWidth="1.5"
                transform="rotate(3.2 130 163)"
              />
              <rect
                x="34"
                y="15"
                width="176"
                height="290"
                rx="7"
                fill="#F7FAFE"
                stroke={C.line}
                strokeWidth="1.5"
                transform="rotate(-1.6 122 160)"
              />
            </g>
          )}

          {/* Fore-edge index tabs, carrying the real section numerals. */}
          {tabs &&
            TAB_LABELS.map((label, i) => (
              <g key={label} transform={`translate(196 ${74 + i * 46})`}>
                <rect
                  width="26"
                  height="34"
                  rx="4"
                  fill={i === 2 ? C.pale : C.panel}
                  stroke={i === 2 ? C.soft : C.lineStrong}
                  strokeWidth="1.5"
                />
                <text
                  x="13"
                  y="22"
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="800"
                  letterSpacing="0.4"
                  fill={i === 2 ? C.deep : '#7E92AE'}
                  fontFamily="Manrope, system-ui, sans-serif"
                >
                  {label}
                </text>
              </g>
            ))}

          {/* Cover page */}
          <g filter={`url(#${uid}-shadow)`}>
            <rect
              x="26"
              y="10"
              width="172"
              height="296"
              rx="8"
              fill={`url(#${uid}-page)`}
              stroke={C.lineStrong}
              strokeWidth="1.5"
            />
          </g>

          {/* Masthead rule — the one saturated stroke on the page. */}
          <rect x="26" y="10" width="172" height="5" rx="2.5" fill={`url(#${uid}-mast)`} />

          {/* Document kind + platform badge */}
          <text
            x="42"
            y="38"
            fontSize="6.6"
            fontWeight="800"
            letterSpacing="1.15"
            fill={C.deep}
            fontFamily="Manrope, system-ui, sans-serif"
          >
            DRAFT RED HERRING PROSPECTUS
          </text>
          <rect x="164" y="30" width="20" height="11" rx="3" fill={C.panel} stroke={C.lineStrong} strokeWidth="1.2" />
          <text
            x="174"
            y="38"
            textAnchor="middle"
            fontSize="6"
            fontWeight="800"
            letterSpacing="0.5"
            fill="#7E92AE"
            fontFamily="Manrope, system-ui, sans-serif"
          >
            SME
          </text>

          {/* Issuer name */}
          <rect x="42" y="48" width="94" height="9" rx="3" fill={C.ink} />
          <rect x="42" y="62" width="60" height="5" rx="2.5" fill={C.lineStrong} />

          <line x1="42" y1="76" x2="182" y2="76" stroke={C.line} strokeWidth="1.5" />

          {/* Four clauses. `highlight` lights these for the scan sequence. */}
          {[0, 1, 2, 3].map((i) => {
            const on = highlight.includes(i)
            const y = 86 + i * 40
            return (
              <g key={i}>
                <motion.rect
                  x="36"
                  y={y - 5}
                  width="152"
                  height="34"
                  rx="5"
                  fill={C.pale}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0 }}
                  transition={{ duration: 0.32, ease: EASE }}
                />
                <motion.rect
                  x="36"
                  y={y - 5}
                  width="3"
                  height="34"
                  rx="1.5"
                  fill={C.accent}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, scaleY: on ? 1 : 0.4 }}
                  style={{ originY: 0.5 }}
                  transition={{ duration: 0.32, ease: EASE }}
                />
                <TextLine x={44} y={y} w={44} h={4} fill={on ? C.deep : '#B9CADF'} />
                <TextBlock
                  x={44}
                  y={y + 10}
                  w={132}
                  lines={2}
                  gap={8}
                  h={3.5}
                  fill={on ? C.soft : C.line}
                  widths={i % 2 ? [0.96, 0.62] : [1, 0.78]}
                />
              </g>
            )
          })}

          {/* Restated-figures table. Every DRHP has one. */}
          <g transform="translate(42 250)">
            <line x1="0" y1="0" x2="140" y2="0" stroke={C.lineStrong} strokeWidth="1.5" />
            {[0, 1, 2].map((r) => (
              <g key={r} transform={`translate(0 ${8 + r * 12})`}>
                <rect width="52" height="3.5" rx="1.75" fill={C.line} />
                <rect x="74" width="26" height="3.5" rx="1.75" fill={r === 1 ? C.soft : C.lineStrong} />
                <rect x="112" width="28" height="3.5" rx="1.75" fill={r === 1 ? C.accent : C.lineStrong} />
                <line x1="0" y1="7" x2="140" y2="7" stroke={C.line} strokeWidth="1" />
              </g>
            ))}
          </g>

          {/* Certification band. Slight rotation so it reads as applied, not printed. */}
          {stamp && (
            <g transform="rotate(-2.4 112 296)">
              <rect
                x="52"
                y="286"
                width="120"
                height="19"
                rx="3"
                fill={C.badBg}
                stroke={C.bad}
                strokeWidth="1.5"
                opacity="0.92"
              />
              <text
                x="112"
                y="298.5"
                textAnchor="middle"
                fontSize="6.4"
                fontWeight="800"
                letterSpacing="1"
                fill={C.bad}
                fontFamily="Manrope, system-ui, sans-serif"
              >
                AWAITING CERTIFICATION
              </text>
            </g>
          )}
        </>
      )}
    </Figure>
  )
}
