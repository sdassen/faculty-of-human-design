import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Split vendor chunk so React isn't re-downloaded on every deploy
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
    // Warn if any chunk exceeds 500 kB
    chunkSizeWarningLimit: 500,
  },
})
