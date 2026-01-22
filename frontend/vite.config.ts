import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // Optimizacion de React en produccion
      babel: {
        plugins: [
          // Eliminar propTypes en produccion (si se usan)
          // ['babel-plugin-transform-react-remove-prop-types', { removeImport: true }],
        ],
      },
    }),
  ],
  
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
    // Optimizacion de chunks para mejor caching
    rollupOptions: {
      output: {
        manualChunks: {
          // React core - mantener junto
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI components
          'vendor-ui': ['lucide-react', 'recharts'],
          // Forms y validacion
          'vendor-forms': ['react-hook-form', 'axios'],
          // State management
          'vendor-state': ['zustand', '@tanstack/react-query'],
        },
        // Nombres de archivo con hash para cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    // Aumentar limite de advertencia
    chunkSizeWarningLimit: 600,
    
    // Source maps solo en desarrollo
    sourcemap: false,
    
    // Minificacion agresiva
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en produccion
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      format: {
        comments: false, // Eliminar comentarios
      },
    },
    
    // Optimizacion de CSS
    cssCodeSplit: true,
    cssMinify: true,
    
    // Reportar tamaño comprimido
    reportCompressedSize: true,
    
    // Target moderno para mejor optimizacion
    target: 'es2020',
  },
  
  // Optimizacion de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
      '@tanstack/react-query',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  
  // Configuracion de preview
  preview: {
    port: 4173,
    host: true,
  },
});
