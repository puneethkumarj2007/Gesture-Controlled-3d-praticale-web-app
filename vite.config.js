import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    host: true,
    open: false,
    watch: {
      ignored: ['**/.chrome-temp*/**', '**/test/**', '**/*.png', '**/dist/**', '**/*.lnk']
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['three', '@mediapipe/tasks-vision']
  }
});
