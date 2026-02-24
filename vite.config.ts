import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/runabake/',
  resolve: {
    alias: {
      '@domain': resolve(__dirname, './src/domain'),
      '@application': resolve(__dirname, './src/application'),
      '@infrastructure': resolve(__dirname, './src/infrastructure'),
      '@presentation': resolve(__dirname, './src/presentation'),
      '@shared': resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          babylonjs: ['@babylonjs/core', '@babylonjs/loaders', '@babylonjs/materials', '@babylonjs/gui'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['@babylonjs/havok'],
  },
});
