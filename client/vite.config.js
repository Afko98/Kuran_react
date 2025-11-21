import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // 👈 koristi relativne putanje (radi i na mobitelu)
  server: {
    host: '0.0.0.0', // 👈 dozvoli pristup sa drugih uređaja u mreži
  },
})
