import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),       // Enable React and JSX support
    tailwindcss(), // Tailwind plugin
  ],
  build: {
    target: 'esnext', // Allow modern JS features including dynamic import expressions
  },
});
