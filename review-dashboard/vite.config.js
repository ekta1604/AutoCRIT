import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/review-dashboard/',
  plugins: [react()],
});

