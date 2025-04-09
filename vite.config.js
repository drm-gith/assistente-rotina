import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',  // Changed from '/assistente-rotina/' to '/'
  plugins: [react()]
})
