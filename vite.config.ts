import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // 改进逻辑：如果是生产环境构建（npm run build），就自动使用 /zensleep/ 路径
  // 这样你就不需要手动设置 DEPLOY_ENV 环境变量了
  const isProduction = mode === 'production';

  return {
    // 关键修改：本地开发用 '/'，生产环境打包用 '/zensleep/'
    base: isProduction ? '/zensleep/' : '/',
    
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