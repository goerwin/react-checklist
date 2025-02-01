import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import pkgJson from './package.json';

// https://vite.dev/config/
export default defineConfig({
  define: {
    GLOBAL_APP_VERSION: JSON.stringify(pkgJson.version),
  },
  base: '/react-checklist/',
  plugins: [react(), tailwindcss()],
});
