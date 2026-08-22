import { C, Figure, type IllustrationProps } from './primitives'

export type EmptyVariant = 'no-results' | 'all-clear' | 'nothing-yet' | 'awaiting-review'

/**
 * Empty-state drawings.
 *
 * Each one states a different fact — nothing matched, nothing is
 * wrong, nothing has arrived, or something is with someone else — so
 * the copy beside it never has to carry the whole message alone.
 */
export default function EmptyStateArt({
  variant = 'nothing-yet',
  className,
  title,
  style,
}: IllustrationProps & { variant?: EmptyVariant }) {
  return (
    <Figure viewBox="0 0 180 132" className={className} title={title} style={style}>
      {(uid) => (
        <>
          <defs>
            <linearGradient id={`${uid}-p`} x1="0" y1="0" x2="0.5" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FBFDFF" />
            </linearGradient>
          </defs>

          {/* Shared ground line — keeps the set feeling like one family. */}
          <ellipse cx="90" cy="118" rx="58" ry="6" fill={C.pale} opacity="0.7" />

          {variant === 'no-results' && (
            <>
              <rect x="42" y="20" width="76" height="86" rx="7" fill={`url(#${uid}-p)`} stroke={C.lineStrong} strokeWidth="1.5" />
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x="54" y={36 + i * 13} width={[52, 40, 48, 30][i]} height="4" rx="2" fill={C.line} />
              ))}
              {/* An empty lens — searched, found nothing. */}
              <circle cx="118" cy="82" r="22" fill={C.surface} fillOpacity="0.9" stroke={C.accent} strokeWidth="4" />
              <path d="M134 98 L148 112" stroke={C.deep} strokeWidth="7" strokeLinecap="round" />
              <path d="M110 82h16" stroke={C.faint} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
            </>
          )}

          {variant === 'all-clear' && (
            <>
              <rect x="46" y="18" width="76" height="88" rx="7" fill={`url(#${uid}-p)`} stroke={C.lineStrong} strokeWidth="1.5" />
              <rect x="46" y="18" width="76" height="4" rx="2" fill={C.ok} opacity="0.5" />
              {[0, 1, 2].map((i) => (
                <rect key={i} x="58" y={36 + i * 12} width={[48, 34, 44][i]} height="4" rx="2" fill={C.line} />
              ))}
              <circle cx="112" cy="86" r="24" fill={C.okBg} stroke={C.ok} strokeWidth="2.4" />
              <path d="M100 86.5 L108.5 95 L125 78" stroke={C.ok} strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </>
          )}

          {variant === 'nothing-yet' && (
            <>
              {/* An open tray waiting on a page. */}
              <path
                d="M40 62 h100 a4 4 0 0 1 4 4 v34 a6 6 0 0 1-6 6 H42 a6 6 0 0 1-6-6 V66 a4 4 0 0 1 4-4Z"
                fill={C.panel}
                stroke={C.lineStrong}
                strokeWidth="1.5"
              />
              <path d="M36 82h30l6 10h36l6-10h30" fill={C.surface} stroke={C.lineStrong} strokeWidth="1.5" strokeLinejoin="round" />
              <rect
                x="62"
                y="14"
                width="56"
                height="52"
                rx="6"
                fill={C.surface}
                stroke={C.accent}
                strokeWidth="1.8"
                strokeDasharray="6 5"
              />
              <path d="M90 30v22M79 41h22" stroke={C.accent} strokeWidth="3" strokeLinecap="round" />
            </>
          )}

          {variant === 'awaiting-review' && (
            <>
              <rect x="30" y="26" width="66" height="80" rx="7" fill={`url(#${uid}-p)`} stroke={C.lineStrong} strokeWidth="1.5" />
              {[0, 1, 2].map((i) => (
                <rect key={i} x="42" y={42 + i * 12} width={[42, 30, 38][i]} height="4" rx="2" fill={C.line} />
              ))}
              {/* Handed across */}
              <path d="M100 66 C118 66 118 52 134 52" stroke={C.accent} strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" fill="none" />
              <circle cx="100" cy="66" r="3.5" fill={C.surface} stroke={C.accent} strokeWidth="2" />
              <circle cx="140" cy="52" r="19" fill={C.pale} stroke={C.deep} strokeWidth="2" />
              <path d="M140 41v11l7 5" stroke={C.deep} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </>
          )}
        </>
      )}
    </Figure>
  )
}
