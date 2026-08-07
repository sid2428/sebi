// ============================================================
//  Domain glyphs
//
//  Icons for the handful of concepts Lucide has no honest match for.
//  Drawn on Lucide's grid — 24×24, 2px stroke, round caps and joins,
//  currentColor — so they mix into a row of Lucide icons invisibly.
// ============================================================

type GlyphProps = {
  size?: number
  className?: string
  strokeWidth?: number
}

function glyph(path: React.ReactNode, displayName: string) {
  const Comp = ({ size = 24, className, strokeWidth = 2 }: GlyphProps) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  )
  Comp.displayName = displayName
  return Comp
}

/** A fact tied back to its source file — the app's core promise. */
export const ProvenanceThread = glyph(
  <>
    <path d="M3 6h6M3 11h4" />
    <path d="M9 8.5c4.5 0 3.5 8 8 8" strokeDasharray="2.5 2.5" />
    <circle cx="9" cy="8.5" r="1.6" />
    <rect x="15" y="13" width="6.5" height="8" rx="1.5" />
    <path d="M3 17h5" />
  </>,
  'ProvenanceThread'
)

/** A clause that is present but not yet sufficient. */
export const GapFlag = glyph(
  <>
    <path d="M5 21V4" />
    <path d="M5 4.5h11l-2.2 3.7L16 12H5" strokeDasharray="3 2.2" />
    <path d="M19 15v3.5M19 21v.01" />
  </>,
  'GapFlag'
)

/** Restated financial information. */
export const Ledger = glyph(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2.5" />
    <path d="M3 8.5h18M9 8.5V21" />
    <path d="M12.5 12.5h5.5M12.5 16.5h3.5" />
  </>,
  'Ledger'
)

/** Struck certification, as opposed to a generic shield. */
export const Seal = glyph(
  <>
    <circle cx="12" cy="9.5" r="6.5" />
    <circle cx="12" cy="9.5" r="3" />
    <path d="M8 15.5 6.5 22l5.5-2.6L17.5 22 16 15.5" />
  </>,
  'Seal'
)

/** The offer document, distinct from a generic file. */
export const OfferDocument = glyph(
  <>
    <path d="M5.5 3h9L19 7.5V21H5.5z" />
    <path d="M14 3v5h5" />
    <path d="M8.5 12.5h7M8.5 16h4.5" />
    <path d="M8.5 9h3" />
  </>,
  'OfferDocument'
)

/** Reading a document under scrutiny. */
export const ScanDocument = glyph(
  <>
    <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8" />
    <path d="M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
    <path d="M4 12h16" />
    <path d="M8 8.5h5" />
  </>,
  'ScanDocument'
)
