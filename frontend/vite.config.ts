import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    // Optimize bundle size
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['lucide-react'],
          auth: ['./src/utils/AuthContext.tsx'],
          'library-owner': [
            './src/pages/LibraryOwner/Dashboard.tsx',
            './src/pages/LibraryOwner/AddStudent.tsx',
            './src/pages/LibraryOwner/EditStudent.tsx',
            './src/pages/LibraryOwner/StudentsList.tsx'
          ],
          'student': [
            './src/pages/Student/Dashboard.tsx',
            './src/pages/Student/Books.tsx',
            './src/pages/Student/MyLibrary.tsx'
          ]
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 5173,
    open: true,
    // Enable HMR for faster development
    hmr: {
      overlay: false
    },
    // Fix source map issues
    sourcemap: false
  },
  preview: {
    port: 4173,
    host: true
  },
  // Enable compression and optimizations
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    sourcemap: false
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
  }
}));
