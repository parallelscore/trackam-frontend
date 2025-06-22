import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    allowedHosts: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('framer-motion') || id.includes('@radix-ui')) {
              return 'ui';
            }
            if (id.includes('recharts')) {
              return 'charts';
            }
            if (id.includes('leaflet')) {
              return 'maps';
            }
            if (id.includes('react-hook-form')) {
              return 'forms';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('react-hot-toast')) {
              return 'toast';
            }
            if (id.includes('socket.io-client')) {
              return 'websocket';
            }
            return 'vendors';
          }
          // App-specific chunks
          if (id.includes('src/context/') || id.includes('src/services/')) {
            return 'core';
          }
          if (id.includes('src/utils/')) {
            return 'utils';
          }
          if (id.includes('src/components/vendor/')) {
            return 'vendor-components';
          }
          if (id.includes('src/components/')) {
            return 'components';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable sourcemaps in production for smaller build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})