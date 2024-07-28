import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    visualizer({
      filename: './dist/bundle-analysis.html',
      open: true, 
      gzipSize: true,
      brotliSize: true,
    })],
    
  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
  },
  server: {
    port: 4000, 
    open: true,
    //host:'192.168.0.163'
  },
})