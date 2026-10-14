import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:5001",
      "/uploads": "http://localhost:5001",  // ← ADD THIS
    },
  },
});