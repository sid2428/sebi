import { C, Figure, TextBlock, type IllustrationProps } from './primitives'

// ============================================================
//  Onboarding scenes
//
//  One drawing per stage of the journey the product actually runs:
//  what you hand over, what gets checked, and who signs it off.
//  Same 200×140 stage and same stroke rules across all three so
//  they can sit in a row without re-balancing.
// ============================================================

/** Stage 1 — a public website becomes a structured company base. */
export function SceneIngest({ className, title, style }: IllustrationProps) {
  return (
    <Figure viewBox="0 0 200 140" className={className} title={title} style={style}>
      {(uid) => (
        <>
          <defs>
            <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={C.soft} />
              <stop offset="100%" stopColor={C.deep} />
            </linearGradient>
          </defs>

          {/* Browser chrome */}
          <rect x="10" y="16" width="96" height="76" rx="7" fill={C.surface} stroke={C.lineStrong} strokeWidth="1.5" />
          <path d="M10 30h96" stroke={C.lineStrong} strokeWidth="1.5" />
          <circle cx="20" cy="23" r="2.4" fill={C.lineStrong} />
          <circle cx="28" cy="23" r="2.4" fill={C.lineStrong} />
          <circle cx="36" cy="23" r="2.4" fill={C.soft} />
          <rect x="46" y="19.5" width="52" height="7" rx="3.5" fill={C.panel} />

          <rect x="20" y="38" width="34" height="22" rx="4" fill={C.pale} />
          <TextBlock x={60} y={40} w={36} lines={3} gap={7} h={3.5} />
          <TextBlock x={20} y={68} w={76} lines={2} gap={7} h={3.5} />

          {/* Extraction arc */}
          <path
            d="M108 56 C126 56 124 40 140 40"
            stroke={C.accent}
            strokeWidth="1.8"
            strokeDasharray="5 4"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="108" cy="56" r="3.4" fill={C.surface} stroke={C.accent} strokeWidth="2" />

          {/* Structured record */}
          <rect x="136" y="24" width="56" height="72" rx="6" fill={C.surface} stroke={C.accent} strokeWidth="1.8" />
          <rect x="136" y="24" width="56" height="4" rx="2" fill={`url(#${uid}-g)`} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(144 ${38 + i * 14})`}>
              <rect width="16" height="3.5" rx="1.75" fill={C.line} />
              <rect x="22" width="18" height="3.5" rx="1.75" fill={C.soft} />
              <path d="M0 8h40" stroke={C.line} strokeWidth="1" />
            </g>
          ))}
        </>
      )}
    </Figure>
  )
}

/** Stage 2 — particulars are cleared phase by phase. */
export function SceneVerify({ className, title, style }: IllustrationProps) {
  const rows = [
    { ok: true },
    { ok: true },
    { ok: false },
    { ok: true },
  ]
  return (
    <Figure viewBox="0 0 200 140" className={className} title={title} style={style}>
      {() => (
        <>
          <rect x="26" y="14" width="118" height="112" rx="8" fill={C.surface} stroke={C.lineStrong} strokeWidth="1.5" />
          <rect x="40" y="28" width="46" height="5" rx="2.5" fill={C.ink} />
          <path d="M26 44h118" stroke={C.line} strokeWidth="1.5" />

          {rows.map((r, i) => (
            <g key={i} transform={`translate(40 ${56 + i * 18})`}>
              <circle
                cx="7"
                cy="6"
                r="7.5"
                fill={r.ok ? C.okBg : C.warnBg}
                stroke={r.ok ? C.ok : C.warn}
                strokeWidth="1.6"
              />
              {r.ok ? (
                <path d="M3.5 6 L6 8.5 L10.5 3.5" stroke={C.ok} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              ) : (
                <path d="M7 2.6v4.6M7 9.6v.2" stroke={C.warn} strokeWidth="1.8" strokeLinecap="round" />
              )}
              <rect x="22" y="4" width={[62, 48, 70, 54][i]} height="4" rx="2" fill={r.ok ? C.line : C.warn} opacity={r.ok ? 1 : 0.5} />
            </g>
          ))}

          {/* Identity seal overlapping the sheet edge */}
          <circle cx="152" cy="96" r="26" fill={C.pale} stroke={C.deep} strokeWidth="2" />
          <circle cx="152" cy="96" r="19" stroke={C.accent} strokeWidth="1.4" opacity="0.5" fill="none" />
          <path
            d="M152 84c-5 0-8 3.4-8 7.6 0 5.6 3 9.8 8 12.4 5-2.6 8-6.8 8-12.4 0-4.2-3-7.6-8-7.6Z"
            fill={C.surface}
            stroke={C.deep}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M148 94.5 L151 97.5 L156.5 91.5" stroke={C.ok} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      )}
    </Figure>
  )
}

/** Stage 3 — the draft passes to the intermediary, then the regulator. */
export function SceneHandoff({ className, title, style }: IllustrationProps) {
  const stops = [
    { x: 30, label: 'issuer', fill: C.pale, stroke: C.deep },
    { x: 100, label: 'banker', fill: C.okBg, stroke: C.ok },
    { x: 170, label: 'regulator', fill: C.panel, stroke: C.faint },
  ]
  return (
    <Figure viewBox="0 0 200 140" className={className} title={title} style={style}>
      {() => (
        <>
          {/* The thread they all sit on */}
          <path d="M30 96 H170" stroke={C.lineStrong} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M30 96 H100" stroke={C.accent} strokeWidth="2.4" strokeLinecap="round" />

          {stops.map((s, i) => (
            <g key={s.label}>
              <circle cx={s.x} cy="96" r="8" fill={s.fill} stroke={s.stroke} strokeWidth="2" />
              {i < 2 && <circle cx={s.x} cy="96" r="3" fill={s.stroke} />}
              <rect x={s.x - 22} y="112" width="44" height="4" rx="2" fill={C.line} />
            </g>
          ))}

          {/* Draft in the issuer's hands */}
          <g transform="translate(12 24)">
            <rect width="36" height="46" rx="5" fill={C.surface} stroke={C.lineStrong} strokeWidth="1.5" />
            <rect width="36" height="3.5" rx="1.75" fill={C.accent} />
            <TextBlock x={8} y={12} w={20} lines={4} gap={7} h={3} />
          </g>

          {/* Certified copy at the banker */}
          <g transform="translate(82 20)">
            <rect width="36" height="46" rx="5" fill={C.surface} stroke={C.ok} strokeWidth="1.8" />
            <rect width="36" height="3.5" rx="1.75" fill={C.ok} />
            <TextBlock x={8} y={12} w={20} lines={3} gap={7} h={3} />
            <circle cx="28" cy="38" r="8" fill={C.okBg} stroke={C.ok} strokeWidth="1.6" />
            <path d="M24.5 38 L27 40.5 L31.5 35" stroke={C.ok} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>

          {/* Filing window at the regulator */}
          <g transform="translate(152 24)">
            <rect width="36" height="46" rx="5" fill={C.panel} stroke={C.lineStrong} strokeWidth="1.5" strokeDasharray="5 4" />
            <path d="M18 16v16M11 25l7 7 7-7" stroke={C.faint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        </>
      )}
    </Figure>
  )
}
