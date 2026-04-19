import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const pu1 = env.VITE_PU1_URL || 'http://localhost:8081'
  const pu2 = env.VITE_PU2_URL || 'http://localhost:8082'
  const pu3 = env.VITE_PU3_URL || 'http://localhost:8083'
  const pu4 = env.VITE_PU4_URL || 'http://localhost:8084'

  return {
    plugins: [react()],
    envDir: '../',
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        '/api/products': { target: pu1, changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/products/, '/products') },
        '/api/cart':     { target: pu2, changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/cart/, '/cart') },
        '/api/checkout': { target: pu3, changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/checkout/, '/checkout') },
        '/api/stock':    { target: pu4, changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/stock/, '/stock') },
      },
    },
  }
})