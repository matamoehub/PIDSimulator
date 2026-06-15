import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During dev, proxy /api to the FastAPI server so the frontend can call the
// API on the same origin (mirrors the nginx production setup).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8700',
    },
  },
  build: {
    outDir: 'dist',
  },
})
