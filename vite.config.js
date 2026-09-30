import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { resolve } from 'path';

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base = process.env.VITE_BASE || (repoName ? `/${repoName}/` : '/');

export default defineConfig(({ command }) => ({
  base,
  plugins: command === 'serve' ? [basicSsl()] : [],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        recorrido: resolve(__dirname, 'recorrido.html'),
      },
    },
  },
}));
