import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: '가계로그',
        short_name: '가계로그',
        description: '나의 소비를 기록하는 따뜻한 모바일 웹서비스',
        theme_color: '#FFFDF7',
        background_color: '#FFFDF7',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],

  server: {
    host: true,

    proxy: {
      '/receipt': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/user': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/receipt/image': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/statis': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/history': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/challenge':{
        target:"http://localhost:8080",
        changeOrigin:true,
        secure:false,
      },
      '/budget': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
