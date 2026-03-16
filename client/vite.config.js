import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    proxy: {
      "/api": "https://scalegpt-production-c429.up.railway.app/",
      "/uploads": "https://scalegpt-production-c429.up.railway.app/",  // ← ADD THIS
    },
  },
});