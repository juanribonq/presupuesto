import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'splash/*.png'],
      manifest: {
        name: 'App Presupuesto Personal',
        short_name: 'Presupuesto',
        description: 'Gestiona tu presupuesto personal con sincronización a Google Sheets',
        theme_color: '#4A90E2',
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          {
            src: './icons/icon-72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: './icons/icon-96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: './icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: './icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: './icons/icon-152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: './icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: './icons/icon-384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: './icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/apis\.google\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'google-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 24 horas
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/sheets\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sheets-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 minutos
              }
            }
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
