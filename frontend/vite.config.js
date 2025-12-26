import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['skydeck.live'],
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react-dom')) {
            return 'vendor-react-dom';
          }
          if (id.includes('node_modules/react/') || id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          // React Router
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
            return 'vendor-router';
          }
          // HLS.js - video streaming
          if (id.includes('node_modules/hls.js')) {
            return 'vendor-hls';
          }
          // Framer Motion - animations
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer';
          }
          // Lucide icons
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // Drag and drop
          if (id.includes('node_modules/@dnd-kit')) {
            return 'vendor-dnd';
          }
          // TanStack Query
          if (id.includes('node_modules/@tanstack')) {
            return 'vendor-query';
          }
          // State management
          if (id.includes('node_modules/zustand')) {
            return 'vendor-zustand';
          }
          // HTTP client
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios';
          }
          // Socket.io
          if (id.includes('node_modules/socket.io')) {
            return 'vendor-socket';
          }
          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-date';
          }
          // Other small utilities
          if (id.includes('node_modules/clsx') || id.includes('node_modules/react-hot-toast')) {
            return 'vendor-utils';
          }
          // App components - split by feature
          if (id.includes('/components/posts/')) {
            return 'app-posts';
          }
          if (id.includes('/components/feed/')) {
            return 'app-feed';
          }
          if (id.includes('/components/settings/') || id.includes('/components/theme/')) {
            return 'app-settings';
          }
          if (id.includes('/stores/')) {
            return 'app-stores';
          }
        },
      },
    },
  },
});
