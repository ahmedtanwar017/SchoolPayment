import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: ".", // folder containing index.html
  build: {
    outDir: "dist",
    target: "esnext",
  },
});

