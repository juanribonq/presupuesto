import { defineConfig } from 'vite'

export default defineConfig({
  base: '/presupuesto/',
  plugins: [],
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false
  },
  server: {
    port: 5173,
    open: true
  }
})
