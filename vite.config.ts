import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    // Development server configuration
    server: {
      port: 3000,
      host: true, // Allow external connections
      open: true, // Auto-open browser
      strictPort: false, // Try next port if 3000 is busy
    },

    // Preview server (for production builds)
    preview: {
      port: 4173,
      host: true,
    },

    // Path resolution aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@/components': path.resolve(__dirname, './components'),
        '@/lib': path.resolve(__dirname, './lib'),
        '@/services': path.resolve(__dirname, './services'),
      },
    },

    // Environment variables exposed to the client
    // Only VITE_ prefixed vars are exposed by default
    define: {
      // Legacy support for process.env (some libraries expect this)
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'esbuild' : false,
      target: 'esnext',

      // Rollup options
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks for better caching
            vendor: ['react', 'react-dom'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },

      // Chunk size warning limit (in kB)
      chunkSizeWarningLimit: 1000,
    },

    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', '@supabase/supabase-js', 'zod'],
    },

    // CSS configuration
    css: {
      devSourcemap: true,
    },

    // Environment directory
    envDir: '.',
  };
});
