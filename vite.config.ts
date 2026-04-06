import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) return 'react-vendor';
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) return 'd3-charts';
            if (id.includes('node_modules/react-force-graph')) return 'force-graph';
        }
      }
    }
  }
})
