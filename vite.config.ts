import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { exec } from 'child_process' 
import fs from 'fs'

const startNgrokPlugin = () => {
  let isNgrokStarted = false
  const url = 'https://matil.a.pinggy.link'

  // Función para verificar el estado del túnel
  const checkTunnelStatus = (url:string) => {
    return new Promise((resolve, reject) => {
      fetch(url)
        .then((response) => {
          if (response.ok) {
            resolve(true);
          } else {
            reject(new Error('El túnel no está disponible'));
          }
        })
        .catch((error) => reject(error));
    });
  };

  // Función para esperar un tiempo
  const delay = (ms:number) => new Promise(resolve => setTimeout(resolve, ms));

  // Función para esperar hasta que el túnel esté disponible
  const openInSafariWhenReady = async (url:String) => {
    let tunnelActive = false;

    await delay(5000)

    while (!tunnelActive) {
      try {
        console.log('Comprobando si el túnel está activo...');
        await checkTunnelStatus(url as string);
        tunnelActive = true;
        console.log('El túnel está activo. Abriendo Safari...');
        
        // Abre Safari una vez que el túnel está disponible
        exec(`open -a Safari ${url}`, (err, stdout, stderr) => {
          if (err) {
            console.error('Error al abrir Safari:', err);
          } else {
            console.log('Safari abierto con éxito.');
          }
        });
        
      } catch (error) {
        console.error('El túnel aún no está disponible, reintentando...');
        await delay(5000)
      }
    }
  };

  return {
    name: 'start-ngrok',
    configureServer(server:any) {
      if (!isNgrokStarted) {
        server.httpServer?.once('listening', () => {
          const ngrokCommand = 'ssh -p 443 -R0:localhost:4005 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -T 2XVitBWp4AU@eu.a.pinggy.io x:https x:localServerTls:localhost';
          exec(ngrokCommand, (error, stdout, stderr) => {
            if (error) console.error(`Error al iniciar ngrok: ${error.message}`);
            if (stderr) console.error(`stderr de ngrok: ${stderr}`);
            console.log(`ngrok stdout: ${stdout}`);
          });
          
          // Esperamos hasta que el túnel esté activo
          openInSafariWhenReady(url);
        });
      }
    }
  };
};

// Configuración de Vite
export default defineConfig(({ command, mode }) => {
  const commonPlugins = [
    react(),
    visualizer({
      filename: './dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    //startNgrokPlugin(),
  ];

  if (command === 'serve' && mode === 'hot-reload') {
    return {
      plugins: commonPlugins,
      server: {
        port: 4005,
        host: '192.168.0.227',
        open: false,
        cors: true
      }
    };
  }

  return { plugins: commonPlugins };
});
