import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'Logo_Blanco.png',
        'icons/Edunova-192x192-blue.png',
        'icons/Edunova-512x512-blue.png'
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg,ico,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 🔧 Aumenta límite a 5MB
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.origin.includes('firestore.googleapis.com') ||
              url.origin.includes('firebase.googleapis.com') ||
              url.origin.includes('firebaseio.com'),
            handler: 'NetworkOnly',
            options: {
              cacheName: 'firebase-excluded'
            }
          }
        ]
      }
    })
  ],
  base: '/',
  build: {
    outDir: 'dist',
  },
  server: {
    host: '0.0.0.0', // Permite que otros dispositivos accedan al servidor
    port: 5173,
  },
  assetsInclude: ['**/*.m4v']  // Permite que Vite trate .m4v como un asset
})
