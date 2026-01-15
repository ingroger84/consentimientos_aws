import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Optimización de chunks para mejor caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar React y dependencias core
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Separar componentes UI y gráficos
          'vendor-ui': ['lucide-react', 'recharts'],
          // Separar utilidades de formularios y HTTP
          'vendor-forms': ['react-hook-form', 'axios'],
          // Separar gestión de estado
          'vendor-state': ['zustand', '@tanstack/react-query'],
        },
      },
    },
    // Aumentar límite de advertencia a 600kb (después de optimizaciones)
    chunkSizeWarningLimit: 600,
    // Source maps solo para errores
    sourcemap: false,
  },
  // Optimización de dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
});
