import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { syncRouteFromLocation, useStore } from './store'
import { Toasts } from './components/ui'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Ingest from './pages/Ingest'
import Workspace from './pages/Workspace'

export default function App() {
  const screen = useStore((s) => s.screen)

  useEffect(() => {
    syncRouteFromLocation()
    window.addEventListener('popstate', syncRouteFromLocation)
    return () => window.removeEventListener('popstate', syncRouteFromLocation)
  }, [])

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {screen === 'landing' && <Landing />}
          {screen === 'dashboard' && <Dashboard />}
          {screen === 'ingest' && <Ingest />}
          {screen === 'workspace' && <Workspace />}
        </motion.div>
      </AnimatePresence>
      <Toasts />
    </>
  )
}
