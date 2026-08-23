import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { host: true },
  build: {
    // Split the heavy, rarely-changing libraries out of the app chunk so
    // a code change doesn't invalidate 700 kB of vendor code, and so the
    // charting bundle is only fetched by the screen that draws charts.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
          gsap: ['gsap'],
          charts: ['recharts'],
          // The PDF engine is only needed by the final stage's document
          // room, and it is bigger than the rest of the app put together.
          pdf: ['pdfjs-dist'],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
})
