import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  assetsInclude: ['**/*.m4v']  // Permite que Vite trate .m4v como un asset
})
