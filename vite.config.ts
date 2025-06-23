import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',
      
      // Use our custom service worker
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      
      // PWA Configuration
      includeAssets: ['favicon.png', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'TrackAm - Delivery Tracking',
        short_name: 'TrackAm',
        description: 'Nigeria\'s premier delivery tracking application',
        theme_color: '#0CAA41',
        background_color: '#FFFFFF',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'favicon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      
      // Workbox configuration for service worker
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        globIgnores: ['**/sw.js', '**/workbox-*.js'],
        maximumFileSizeToCacheInBytes: 5000000, // 5MB
      },
      
      // Development configuration - DISABLE in dev to prevent reload loops
      devOptions: {
        enabled: false,
        type: 'module'
      }
    })
  ],
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
        manualChunks: {
          // Core React must be loaded first as a separate chunk
          'react-core': ['react', 'react-dom'],
          // React-dependent libraries
          'react-libs': [
            'react-router-dom',
            '@radix-ui/react-slot',
            '@radix-ui/react-dialog', 
            'react-hook-form',
            'react-hot-toast',
            'lucide-react'
          ],
          // Non-React libraries
          'animation': ['framer-motion'],
          'charts': ['recharts'],
          'maps': ['leaflet'],
          'websocket': ['socket.io-client']
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