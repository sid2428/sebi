import { useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useStore } from '../store'
import { DUR, EASE, useReducedMotion } from '../lib/motion'

// ---------- Brand mark ----------
/**
 * The mark is the product's thesis in 24px: a page, and a thread
 * leaving it toward the source that substantiates it.
 */
export function Mark({ size = 36 }: { size?: number }) {
  const raw = useId()
  const uid = raw.replace(/[:]/g, '')
  return (
    <div
      className="grid shrink-0 place-items-center rounded-[10px]"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(145deg,#5B8DEF 0%,#3A63C4 58%,#2E4E9C 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.34), 0 2px 8px rgba(46,78,156,.32)',
      }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={`${uid}-c`}>
            <rect width="24" height="24" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${uid}-c)`} stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 3.5h8L17 8v12.5H4.5z" opacity="0.95" />
          <path d="M12.5 3.5V8H17" opacity="0.7" />
          <path d="M7.5 11.5h5M7.5 15h3" opacity="0.85" />
          <path d="M17 13.5c3 0 2 5 4.5 5" strokeDasharray="2 2.4" opacity="0.9" />
        </g>
        <circle cx="17" cy="13.5" r="1.9" fill="#fff" />
      </svg>
    </div>
  )
}

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Mark />
      <div className="leading-tight">
        <div className={`font-display text-[17px] font-extrabold tracking-[-0.02em] ${light ? 'text-white' : 'text-ink'}`}>
          Sahayak<span className={light ? 'text-accent-300' : 'text-accent-600'}> DRHP</span>
        </div>
        <div
          className={`whitespace-nowrap text-[9.5px] font-bold uppercase ${light ? 'text-[#93A9CC]' : 'text-muted'}`}
          style={{ letterSpacing: '0.13em' }}
        >
          SME IPO co-pilot
        </div>
      </div>
    </div>
  )
}

// ---------- Progress ring ----------
export function Ring({
  value,
  size = 54,
  stroke = 6,
  color = '#3A63C4',
  track = '#E2EAF4',
  showLabel = true,
  label,
  labelColor = '#16233A',
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  showLabel?: boolean
  label?: string
  /** Must be set explicitly when the ring sits on a dark surface. */
  labelColor?: string
}) {
  const reduced = useReducedMotion()
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c - (Math.max(0, Math.min(100, value)) / 100) * c

  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg className="progress-ring" width={size} height={size} aria-hidden="true" focusable="false">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} style={{ stroke: track }} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{ stroke: color }}
          strokeDasharray={c}
          initial={reduced ? false : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: reduced ? 0 : 1.05, ease: EASE }}
        />
      </svg>
      {showLabel && (
        <div
          className="absolute font-display font-extrabold mono"
          style={{ fontSize: size * 0.27, letterSpacing: '-0.02em', color: labelColor }}
        >
          {label ?? `${value}%`}
        </div>
      )}
    </div>
  )
}

// ---------- Chip ----------
const chipStyles = {
  green: 'bg-ok-bg text-ok ring-1 ring-inset ring-ok-line',
  amber: 'bg-warn-bg text-warn ring-1 ring-inset ring-warn-line',
  red: 'bg-bad-bg text-bad ring-1 ring-inset ring-bad-line',
  blue: 'bg-info-bg text-info ring-1 ring-inset ring-info-line',
  gray: 'bg-panel text-muted ring-1 ring-inset ring-line',
  navy: 'bg-ink text-white',
  accent: 'bg-accent-600 text-white',
  outline: 'bg-white text-ink-2 ring-1 ring-inset ring-line-strong',
} as const

export function Chip({
  tone = 'gray',
  children,
  className = '',
}: {
  tone?: keyof typeof chipStyles
  children: React.ReactNode
  className?: string
}) {
  return <span className={`chip ${chipStyles[tone]} ${className}`}>{children}</span>
}

// ---------- Eyebrow + heading pair ----------
/**
 * Section headings across the app share one rhythm: a small label, a
 * display-weight line, and optional supporting copy at a fixed measure.
 */
export function SectionHeading({
  eyebrow,
  title,
  children,
  align = 'left',
  className = '',
}: {
  eyebrow?: string
  title: React.ReactNode
  children?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <div className={`${align === 'center' ? 'mx-auto text-center' : ''} ${className}`}>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h2 className="mt-2.5 text-[clamp(24px,2.6vw,34px)] font-extrabold leading-[1.12] tracking-[-0.028em]">
        {title}
      </h2>
      {children && (
        <p
          className={`mt-3 text-[16px] leading-[1.62] text-ink-3 ${align === 'center' ? 'mx-auto' : ''}`}
          style={{ maxWidth: '62ch' }}
        >
          {children}
        </p>
      )}
    </div>
  )
}

// ---------- Toast ----------
export function Toasts() {
  const toast = useStore((s) => s.toast)
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: DUR.base, ease: EASE }}
            className="pointer-events-auto flex items-center gap-3 rounded-xl2 bg-ink px-4 py-3 text-[13.5px] font-semibold text-white shadow-xl2"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-accent-400/25">
              <Sparkles size={14} className="text-accent-300" />
            </span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
