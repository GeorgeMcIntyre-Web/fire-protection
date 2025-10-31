import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh for better development experience
      fastRefresh: true,
      // Optimize babel transformations
      babel: {
        plugins: [
          // Add plugins for optimization if needed
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable source maps in production for smaller bundle
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info'], // Remove specific console methods
      },
    },
    rollupOptions: {
      output: {
        // Improved code splitting strategy
        manualChunks: (id) => {
          // Vendor chunk for core React libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            
            // Supabase in separate chunk
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            
            // Icons in separate chunk
            if (id.includes('@heroicons')) {
              return 'vendor-icons';
            }
            
            // Other node_modules
            return 'vendor-other';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name || '';
          // Organize assets by type
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(info)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(info)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (/\.css$/i.test(info)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize dependencies
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 5173,
    open: true,
    // Enable CORS for development
    cors: true,
    // Optimize HMR
    hmr: {
      overlay: true,
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@heroicons/react',
    ],
    // Exclude large dependencies that don't need pre-bundling
    exclude: [],
  },
  // Performance optimizations
  esbuild: {
    // Drop console and debugger in production
    drop: ['console', 'debugger'],
    legalComments: 'none',
  },
})



