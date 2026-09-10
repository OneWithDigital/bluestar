import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

const project = path.dirname(fileURLToPath(import.meta.url));

// A separate static build reuses the complete demo without changing its Sites
// Worker configuration or introducing a production backend.
export default defineConfig({
  root: path.join(project, 'hostinger'),
  publicDir: path.join(project, 'public'),
  resolve: {
    alias: [
      { find: 'next/navigation', replacement: path.join(project, 'hostinger/navigation.ts') },
      { find: '@', replacement: project },
    ],
  },
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [
    react(),
    {
      name: 'hostinger-route-fallback',
      writeBundle() {
        fs.copyFileSync(path.join(project, 'hostinger/.htaccess'), path.join(project, 'dist-hostinger/.htaccess'));
      },
    },
  ],
  build: {
    outDir: path.join(project, 'dist-hostinger'),
    emptyOutDir: true,
  },
});
