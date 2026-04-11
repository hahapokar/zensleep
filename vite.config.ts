import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    // 强制写死仓库名路径，确保打包出来的 index.html 指向 /zensleep/assets/...
    base: '/zensleep/', 
    
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.AZURE_TTS_KEY': JSON.stringify(env.AZURE_TTS_KEY),
      'process.env.AZURE_TTS_REGION': JSON.stringify(env.AZURE_TTS_REGION),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});