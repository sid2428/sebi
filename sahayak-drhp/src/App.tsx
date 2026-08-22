import { Suspense, lazy, useEffect } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import { syncRouteFromLocation, useStore } from './store'
import { Toasts, Mark } from './components/ui'
import { DUR, EASE } from './lib/motion'

// Each screen is its own chunk. The charting library then only travels
// with the workspace, which is the only screen that plots anything.
const Landing = lazy(() => import('./pages/Landing'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Ingest = lazy(() => import('./pages/Ingest'))
const Workspace = lazy(() => import('./pages/Workspace'))

export default function App() {
  const screen = useStore((s) => s.screen)

  useEffect(() => {
    syncRouteFromLocation()
    window.addEventListener('popstate', syncRouteFromLocation)
    return () => window.removeEventListener('popstate', syncRouteFromLocation)
  }, [])

  return (
    // One place decides how the whole app treats `prefers-reduced-motion`.
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-[13px] focus:font-bold focus:text-white"
      >
        Skip to content
      </a>

      <Suspense fallback={<ScreenFallback />}>
        <AnimatePresence mode="wait">
          {/* The one main landmark for the app, and the skip link's target.
              Screens must not nest another <main> inside this. */}
          <motion.main
            key={screen}
            id="main"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: DUR.base, ease: EASE }}
          >
            {screen === 'landing' && <Landing />}
            {screen === 'dashboard' && <Dashboard />}
            {screen === 'ingest' && <Ingest />}
            {screen === 'workspace' && <Workspace />}
          </motion.main>
        </AnimatePresence>
      </Suspense>

      <Toasts />
    </MotionConfig>
  )
}

/** Shown only while a screen chunk is in flight. */
function ScreenFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas" role="status" aria-label="Loading">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Mark size={44} />
        </motion.div>
        <span className="text-[12.5px] font-semibold text-muted">Loading</span>
      </div>
    </div>
  )
}
