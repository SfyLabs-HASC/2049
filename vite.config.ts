import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Questo è necessario per far funzionare alcune dipendenze di thirdweb con Vite
    "global": "globalThis",
  },
})
