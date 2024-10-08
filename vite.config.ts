import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { exec } from 'child_process'  // Importar el módulo para ejecutar comandos de terminal

// Plugin personalizado para abrir Safari automáticamente
const openSafariPlugin = () => {
  return {
    name: 'open-safari',
    configureServer(server:any) {
      server.httpServer?.once('listening', () => {
        const address = server.httpServer?.address();
        const url = `http://localhost:${address.port}`;
        exec(`open -a Safari ${url}`);
      });
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: './dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    openSafariPlugin() // Agregar el plugin personalizado para abrir Safari
  ],

  resolve: {
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
  },

  server: {
    port: 4001,
    open: false,  // Desactivar la apertura automática del navegador predeterminado
    host: '192.168.0.179',
  },
})
