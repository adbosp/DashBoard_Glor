import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  publicDir: 'public' // Thư mục này sẽ được copy vào dist/
});
