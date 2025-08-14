// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/upgrades': 'https://remedial-assignment-jochensunaert.onrender.com', 
      '/api': 'https://remedial-assignment-jochensunaert.onrender.com'
    },
  },
});
