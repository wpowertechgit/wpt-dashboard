import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  server: {
    historyApiFallback: true,
  },
  optimizeDeps: {
    include: ['exceljs', 'chart.js'],
    rolldownOptions: {
      define: { global: 'globalThis' },
    },
  },
  build: {
    commonjsOptions: {
      include: [/exceljs/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
})