import { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from './motion'

/**
 * Smooth document scrolling.
 *
 * Only mount this on screens that scroll the document itself — the
 * landing page, ingest and dashboard. The workspace scrolls an inner
 * pane and a hijacked window scroll would fight it.
 *
 * Skipped entirely under `prefers-reduced-motion`, and on touch, where
 * native momentum scrolling is already better than anything we'd apply.
 */
export function useLenis(enabled = true) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!enabled || reduced) return
    if (typeof window === 'undefined') return

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Native touch scrolling stays native.
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    })

    let frame = 0
    function raf(time: number) {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    // In-page anchors keep working, and keep the easing.
    function onAnchorClick(event: MouseEvent) {
      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]')
      if (!anchor) return
      const id = anchor.getAttribute('href')
      if (!id || id === '#') return
      const target = document.querySelector(id)
      if (!target) return
      event.preventDefault()
      lenis.scrollTo(target as HTMLElement, { offset: -72 })
    }
    document.addEventListener('click', onAnchorClick)

    return () => {
      document.removeEventListener('click', onAnchorClick)
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [enabled, reduced])
}
