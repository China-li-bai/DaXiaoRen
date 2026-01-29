import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Detect if using custom domain (set in GitHub Actions)
    const isCustomDomain = env.CUSTOM_DOMAIN === 'true';
    
    return {
      // Use '/' for custom domain, '/DaXiaoRen/' for GitHub Pages default
      base: isCustomDomain ? '/' : '/DaXiaoRen/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor': ['react', 'react-dom'],
              'services': ['./services/optimizedGeminiService']
            }
          }
        },
        chunkSizeWarningLimit: 500
      },
      optimizeDeps: {
        include: ['react', 'react-dom']
      }
    };
});
