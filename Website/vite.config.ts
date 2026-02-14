import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(__dirname, '..'), '')

  return {
    base: '/SaintValentin_Event',
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: 'index.html',
          profile: 'profile.html',
          leaderboard: 'leaderboard.html'
        }
      }
    },
  }
})