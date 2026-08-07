import { C, Figure, type IllustrationProps } from './primitives'

type Props = IllustrationProps & {
  /** Lens tint opacity. Keep low when composited over a document. */
  tint?: number
  /** Draw the reticle crosshair inside the lens. */
  reticle?: boolean
}

/**
 * The reading instrument.
 *
 * Composited over <DrhpDocument/> during the scan sequence, so the lens
 * is genuinely translucent: a glass fill at low alpha, a specular
 * streak across the upper-left, and a rim that darkens toward the
 * lower-right the way real glass does. The handle carries a ferrule
 * and knurl so it reads as an object rather than a search icon.
 */
export default function MagnifyingGlass({ className, title, style, tint = 0.14, reticle = true }: Props) {
  return (
    <Figure viewBox="0 0 168 168" className={className} title={title} style={style}>
      {(uid) => (
        <>
          <defs>
            <linearGradient id={`${uid}-rim`} x1="0.15" y1="0.05" x2="0.85" y2="0.95">
              <stop offset="0%" stopColor={C.soft} />
              <stop offset="42%" stopColor={C.accent} />
              <stop offset="100%" stopColor={C.deep} />
            </linearGradient>
            <linearGradient id={`${uid}-glass`} x1="0.2" y1="0.1" x2="0.8" y2="0.9">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
              <stop offset="52%" stopColor={C.soft} stopOpacity="0.34" />
              <stop offset="100%" stopColor={C.accent} stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id={`${uid}-handle`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2E4E9C" />
              <stop offset="100%" stopColor="#16233A" />
            </linearGradient>
            <linearGradient id={`${uid}-spec`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <filter id={`${uid}-glow`} x="-40%" y="-40%" width="180%" height="180%">
              <feDropShadow dy="6" stdDeviation="9" floodColor="#3A63C4" floodOpacity="0.26" />
            </filter>
          </defs>

          {/* Handle, drawn first so the barrel tucks under the rim. */}
          <g filter={`url(#${uid}-glow)`}>
            <path
              d="M105 105 L142 142"
              stroke={`url(#${uid}-handle)`}
              strokeWidth="17"
              strokeLinecap="round"
            />
            {/* Ferrule */}
            <path d="M108 108 L120 120" stroke={C.soft} strokeWidth="17" strokeLinecap="butt" opacity="0.75" />
            {/* Knurl */}
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M${124 + i * 5} ${118 + i * 5} L${118 + i * 5} ${124 + i * 5}`}
                stroke="#0E1828"
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.5"
              />
            ))}
          </g>

          {/* Lens */}
          <circle cx="68" cy="68" r="52" fill={`url(#${uid}-glass)`} opacity={tint} />
          <circle cx="68" cy="68" r="52" stroke={`url(#${uid}-rim)`} strokeWidth="9" />
          {/* Inner bevel */}
          <circle cx="68" cy="68" r="46.5" stroke="#FFFFFF" strokeWidth="2" opacity="0.55" />

          {/* Specular streak — the detail that makes it read as glass. */}
          <path
            d="M36 52a36 36 0 0 1 26-25c4-1 6 3 3 5a34 34 0 0 0-23 22c-1 4-7 2-6-2Z"
            fill={`url(#${uid}-spec)`}
          />
          <circle cx="96" cy="44" r="5" fill="#FFFFFF" opacity="0.5" />

          {reticle && (
            <g stroke={C.deep} strokeWidth="1.5" strokeLinecap="round" opacity="0.42">
              <path d="M68 44v10M68 82v10M44 68h10M82 68h10" />
              <circle cx="68" cy="68" r="4" strokeWidth="1.5" />
            </g>
          )}
        </>
      )}
    </Figure>
  )
}
