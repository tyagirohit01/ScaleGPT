import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    proxy: {
      "/api": "https://scaleai-production.up.railway.app/",
      "/uploads": "https://scaleai-production.up.railway.app/",  // ← ADD THIS
    },
  },
});