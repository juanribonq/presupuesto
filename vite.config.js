import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/presupuesto/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: false
      },
      manifest: {
        name: 'App Presupuesto Personal',
        short_name: 'Presupuesto',
        description: 'Gestiona tu presupuesto personal con sincronización a Google Sheets',
        theme_color: '#4A90E2',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/presupuesto/',
        scope: '/presupuesto/',
        icons: [
          {
            src: '/presupuesto/icons/icon-72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/presupuesto/icons/icon-96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/presupuesto/icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/presupuesto/icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/presupuesto/icons/icon-152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/presupuesto/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/presupuesto/icons/icon-384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/presupuesto/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
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
