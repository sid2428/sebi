import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  animate,
  type Variants,
} from 'framer-motion'
import { DUR, EASE, fade, inView, rise, settle, slideIn, stagger, useReducedMotion } from '../../lib/motion'

// ============================================================
//  Motion primitives
//
//  Four building blocks the whole app composes from, so that motion
//  stays a system rather than a per-file decision. All of them fall
//  back to the finished state under `prefers-reduced-motion`.
// ============================================================

const SHAPES: Record<string, Variants> = { rise, settle, slideIn, fade }

type RevealProps = {
  children: React.ReactNode
  /** Which of the four reveal shapes to use. */
  shape?: keyof typeof SHAPES
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article' | 'header'
  style?: React.CSSProperties
  id?: string
}

/** Reveals its children once, as they cross into the viewport. */
export function Reveal({ children, shape = 'rise', delay = 0, className, as = 'div', style, id }: RevealProps) {
  const reduced = useReducedMotion()
  const Tag = motion[as]

  if (reduced) {
    const Plain = as as React.ElementType
    return (
      <Plain className={className} style={style} id={id}>
        {children}
      </Plain>
    )
  }

  return (
    <Tag
      id={id}
      className={className}
      style={style}
      variants={SHAPES[shape]}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      transition={{ delay }}
    >
      {children}
    </Tag>
  )
}

/**
 * Staggers direct children that are <StaggerItem/>.
 * One shared timeline beats N independent delays — the rhythm holds
 * even when the list length changes.
 */
export function Stagger({
  children,
  each = 0.06,
  delay = 0,
  className,
  as = 'div',
  style,
}: {
  children: React.ReactNode
  each?: number
  delay?: number
  className?: string
  as?: 'div' | 'ul' | 'section'
  style?: React.CSSProperties
}) {
  const reduced = useReducedMotion()
  const Tag = motion[as]

  if (reduced) {
    const Plain = as as React.ElementType
    return (
      <Plain className={className} style={style}>
        {children}
      </Plain>
    )
  }

  return (
    <Tag
      className={className}
      style={style}
      variants={stagger(each, delay)}
      initial="hidden"
      whileInView="show"
      viewport={inView}
    >
      {children}
    </Tag>
  )
}

export function StaggerItem({
  children,
  shape = 'rise',
  className,
  as = 'div',
  style,
  id,
}: Omit<RevealProps, 'delay'>) {
  const reduced = useReducedMotion()
  const Tag = motion[as]

  if (reduced) {
    const Plain = as as React.ElementType
    return (
      <Plain className={className} style={style} id={id}>
        {children}
      </Plain>
    )
  }

  return (
    <Tag id={id} className={className} style={style} variants={SHAPES[shape]}>
      {children}
    </Tag>
  )
}

/**
 * Counts a number up when it scrolls into view, and re-counts when the
 * value changes afterwards. Renders the final value immediately for
 * reduced-motion users and for anything that never enters the viewport.
 */
export function Counter({
  to,
  from = 0,
  decimals = 0,
  duration = 1.1,
  prefix = '',
  suffix = '',
  className = '',
  locale = 'en-IN',
}: {
  to: number
  from?: number
  decimals?: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  locale?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const visible = useInView(ref, { once: true, margin: '-8%' })
  const reduced = useReducedMotion()
  const [display, setDisplay] = useState(reduced ? to : from)

  useEffect(() => {
    if (reduced) {
      setDisplay(to)
      return
    }
    if (!visible) return
    const controls = animate(from, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [visible, to, from, duration, reduced])

  const text = display.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span ref={ref} className={`mono ${className}`}>
      {prefix}
      {text}
      {suffix}
    </span>
  )
}

/** Hairline read-progress bar, pinned to the top of the document. */
export function ScrollProgress({ className = '' }: { className?: string }) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      aria-hidden="true"
      className={`fixed inset-x-0 top-0 z-[120] h-[2px] origin-left ${className}`}
      style={{
        scaleX,
        background: 'linear-gradient(90deg,#7DB7F8,#5B8DEF 45%,#3A63C4)',
      }}
    />
  )
}

/**
 * Subtle parallax for a decorative layer.
 * `distance` is the total travel in px across the element's pass
 * through the viewport — keep it under ~60 or it reads as a glitch.
 */
export function Parallax({
  children,
  distance = 40,
  className,
}: {
  children: React.ReactNode
  distance?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [distance / 2, -distance / 2])

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="gpu">
        {children}
      </motion.div>
    </div>
  )
}

/** Loading placeholder that matches the surface it replaces. */
export function Shimmer({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-panel ${className}`} aria-hidden="true">
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer"
        style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.8),transparent)' }}
      />
    </div>
  )
}

/**
 * Animates a bar's width from zero when it enters view.
 * Uses scaleX rather than width so it never triggers layout.
 */
export function MeterBar({
  value,
  className = '',
  barClassName = '',
  trackClassName = '',
  height = 6,
  label,
}: {
  value: number
  className?: string
  barClassName?: string
  trackClassName?: string
  height?: number
  label?: string
}) {
  const reduced = useReducedMotion()
  const pct = Math.max(0, Math.min(100, value))

  return (
    <div
      className={`overflow-hidden rounded-full bg-panel-2 ${trackClassName} ${className}`}
      style={{ height }}
      role="meter"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <motion.div
        className={`h-full origin-left rounded-full ${barClassName}`}
        style={{ width: '100%' }}
        initial={reduced ? false : { scaleX: 0 }}
        whileInView={reduced ? undefined : { scaleX: pct / 100 }}
        animate={reduced ? { scaleX: pct / 100 } : undefined}
        viewport={inView}
        transition={{ duration: DUR.slow, ease: EASE }}
      />
    </div>
  )
}

/** Re-export the raw vocabulary for components that need it directly. */
export { fade, rise, settle, slideIn, stagger, inView, EASE, DUR, useReducedMotion, useMotionValue }
