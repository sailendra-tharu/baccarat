import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Tauri expects a fixed port, fail if that port is not available
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },
  // prevent vite from obscuring rust errors
  clearScreen: false,
  // to make use of `TAURI_DEBUG` and other env variables
  envPrefix: ["VITE_", "TAURI_"],
})
