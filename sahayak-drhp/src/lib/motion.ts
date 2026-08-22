import { useEffect, useState } from 'react'
import type { Transition, Variants } from 'framer-motion'

// ============================================================
//  Motion vocabulary
//
//  One easing family, three durations, four reveal shapes. Anything
//  that needs a bespoke curve is a signature moment, not a default.
//  Every variant here animates transform/opacity only.
// ============================================================

export const EASE = [0.16, 1, 0.3, 1] as const // --ease-out
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

export const DUR = {
  /** Micro-feedback: hover, press, toggle. */
  fast: 0.18,
  /** The default. Reveals, panel swaps, accordions. */
  base: 0.42,
  /** Deliberate: page transitions, hero entrances. */
  slow: 0.72,
} as const

export const spring: Transition = { type: 'spring', stiffness: 340, damping: 32, mass: 0.9 }
export const springSoft: Transition = { type: 'spring', stiffness: 190, damping: 26, mass: 1 }

/** Rise into place — the workhorse reveal. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
}

/** Settle — for cards that should feel placed rather than thrown. */
export const settle: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: DUR.slow, ease: EASE } },
}

/** Slide from the leading edge — list rows, table rows. */
export const slideIn: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: DUR.base, ease: EASE } },
}

/** Plain fade — anything where movement would be noise. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: DUR.base, ease: EASE } },
}

/** Parent container that staggers its children. */
export const stagger = (each = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: each, delayChildren: delay } },
})

/** Standard viewport trigger — fire once, slightly before the edge. */
export const inView = { once: true, margin: '-12% 0px -8% 0px' } as const

/**
 * Draws an SVG path on. Pair with `pathLength`/`opacity` on a
 * motion.path — this is the provenance thread's primitive.
 */
export const drawPath: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: (i: number = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.1, ease: EASE, delay: i * 0.12 },
      opacity: { duration: 0.2, delay: i * 0.12 },
    },
  }),
}

/**
 * Live `prefers-reduced-motion`. Components use this to swap an
 * animation for its end state rather than to skip rendering.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}
