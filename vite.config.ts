import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {},
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'globals.environment': JSON.stringify(process.env.NODE_ENV)
  },
  server: {
    proxy: {
      // Proxy API requests to backend
      '/entries': 'http://localhost:3001',
      '/entry': 'http://localhost:3001',
      '/removed': 'http://localhost:3001',
      '/health': 'http://localhost:3001',
      // Proxy music files to backend
      '/music': 'http://localhost:3001',
    }
  }
})
