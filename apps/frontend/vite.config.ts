import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@home-visit/common': path.resolve(__dirname, '../../packages/common'),
      '@testing-library/react': path.resolve(__dirname, './node_modules/@testing-library/react'),
      '@testing-library/user-event': path.resolve(__dirname, './node_modules/@testing-library/user-event'),
      '@testing-library/jest-dom': path.resolve(__dirname, './node_modules/@testing-library/jest-dom'),
    },
    preserveSymlinks: false,
  },
  server: {
    fs: {
      allow: ['..'],
    },
  },
  // @ts-ignore - vitest types
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: [path.resolve(__dirname, './src/test/setup.ts')],
    css: true,
    include: [
      path.resolve(__dirname, '../../tests/frontend/**/*Tests.tsx'),
    ],
    root: __dirname,
    server: {
      deps: {
        inline: ['@testing-library/react', '@testing-library/user-event', '@testing-library/jest-dom'],
        moduleDirectories: [
          path.resolve(__dirname, './node_modules'),
          path.resolve(__dirname, '../../node_modules'),
        ],
      },
    },
  },
})
