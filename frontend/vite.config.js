import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Puerto 3001: propuesta para el Express de Codex (ver docs/TAREAS.md).
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:3001' } },
});
