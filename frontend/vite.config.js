import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/ES47B-Fullstack/",
  build: {
    // Otimizações de build
    minify: 'terser',
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar bibliotecas grandes em chunks separados
          vendor: ['react', 'react-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom']
        }
      }
    },
    // Compressão de assets
    cssCodeSplit: true,
    sourcemap: false, // Desabilitar sourcemaps em produção
    chunkSizeWarningLimit: 1000
  },
  server: {
    // Configurações do servidor de desenvolvimento
    port: 5173,
    strictPort: true,
    proxy: {
      // Proxy para o backend durante desenvolvimento
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  preview: {
    port: 4173,
    strictPort: true
  }
})
