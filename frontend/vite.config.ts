import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: 'localhost',
    port: 5173,
    // hmr: false, // ← Mantener esto
    // watch: {
    //   ignored: ['**/.git/**', '**/node_modules/**'], // ← Ignorar archivos
    // },
  },
  // Deshabilitar también el cliente de HMR
  // define: {
  //   __VITE_HMR__: false,
  // },
});