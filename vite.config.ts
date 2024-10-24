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
        const url = `http://192.168.0.179:${address.port}`;
        exec(`open -a Safari ${url}`);
      });
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const commonPlugins = [
    react(),
    visualizer({
      filename: './dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    openSafariPlugin() // Agregar el plugin personalizado para abrir Safari
  ];

  if (command === 'serve' && mode === 'hot-reload') {
    // Development mode with hot-reloading
    return {
      plugins: commonPlugins,
      server: {
        port: 4005,
        open: false,  // Desactivar la apertura automática del navegador predeterminado
        host: '192.168.0.179',
      },
    };
  }

  if (command === 'serve' && mode === 'no-hot-reload') {
    // Production-like mode with no hot-reloading
    return {
      plugins: commonPlugins,
      server: {
        port: 4002, // Different port for the no-hot-reload version
        open: false,
        host: '192.168.0.179',
        hmr: false, // Disable hot module replacement (HMR)
      },
    };
  }

  // Default configuration (for build, etc.)
  return {
    plugins: commonPlugins,
  };
});
