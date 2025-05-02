import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    host: '0.0.0.0', // Permite que otros dispositivos accedan al servidor
    port: 5173,
  },
  assetsInclude: ['**/*.m4v']  // Permite que Vite trate .m4v como un asset
})
