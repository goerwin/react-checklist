import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import pkgJson from './package.json';

// https://vite.dev/config/
export default defineConfig({
  define: {
    GLOBAL_APP_VERSION: JSON.stringify(pkgJson.version),
  },
  base: '/react-checklist/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      manifest: {
        name: 'Checklist',
        short_name: 'Checklist',
        background_color: '#242424',
        theme_color: '#242424',
        icons: [
          {
            src: '/icon-chicken/web/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-chicken/web/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-chicken/web/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-chicken/web/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});
