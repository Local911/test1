import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx']
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  server: {
    port: 5173,
    host: true
  }
});
