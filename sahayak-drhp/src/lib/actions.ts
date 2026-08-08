import { useCallback, useEffect, useRef, useState } from 'react'

// ============================================================
//  Frontend action primitives
//
//  There is no backend in this prototype, so every "long" operation
//  is a front-end simulation. These helpers keep that simulation
//  honest: one place decides how an action moves through its states,
//  and one place decides how a file leaves the browser.
// ============================================================

export type ActionState = 'idle' | 'running' | 'done' | 'error'

type RunOptions = {
  /** How long the simulated work should take. */
  ms?: number
  /** How long the success state lingers before returning to idle. 0 = stay. */
  holdMs?: number
  /** Runs when the simulated work finishes — this is where state changes go. */
  onComplete?: () => void
}

/**
 * Drives a button through idle → running → done (→ idle).
 *
 * Deliberately short: 500–2000ms is long enough to read as work and
 * short enough that nobody waits on a demo.
 */
export function useSimulatedAction(defaults: { ms?: number; holdMs?: number } = {}) {
  const [state, setState] = useState<ActionState>('idle')
  const timers = useRef<number[]>([])
  const running = useRef(false)

  const clear = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }, [])

  useEffect(() => () => clear(), [clear])

  const run = useCallback(
    (options: RunOptions = {}) => {
      if (running.current) return
      const ms = options.ms ?? defaults.ms ?? 1100
      const holdMs = options.holdMs ?? defaults.holdMs ?? 0

      clear()
      running.current = true
      setState('running')

      timers.current.push(
        window.setTimeout(() => {
          running.current = false
          options.onComplete?.()
          setState('done')
          if (holdMs > 0) {
            timers.current.push(window.setTimeout(() => setState('idle'), holdMs))
          }
        }, ms)
      )
    },
    [clear, defaults.ms, defaults.holdMs]
  )

  const reset = useCallback(() => {
    clear()
    running.current = false
    setState('idle')
  }, [clear])

  return { state, run, reset, isRunning: state === 'running', isDone: state === 'done' }
}

/**
 * Steps a label through a list of progress lines while an action runs,
 * so a two-second wait still explains itself.
 */
export function useProgressNarration(lines: string[], active: boolean, stepMs = 600) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!active) {
      setIndex(0)
      return
    }
    const id = window.setInterval(() => {
      setIndex((i) => Math.min(i + 1, lines.length - 1))
    }, stepMs)
    return () => window.clearInterval(id)
  }, [active, lines.length, stepMs])

  return lines[Math.min(index, lines.length - 1)]
}

/** Turns on-screen content into a file the browser actually downloads. */
export function downloadTextFile(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  if (typeof document === 'undefined') return
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Safe filename fragment: letters, numbers and underscores only. */
export function slugify(value: string) {
  return value
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * Clipboard write with a document.execCommand fallback, because the
 * async clipboard API is unavailable outside secure contexts.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the legacy path */
  }

  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}

/** "142 KB" / "1.4 MB" — used by the upload flow. */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Stable timestamp string for "saved at" / "generated at" labels. */
export function nowStamp() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
