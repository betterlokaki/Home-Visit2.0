import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import * as fs from 'fs'

// Read config.json for frontend host and port
let frontendHost = 'localhost';
let frontendPort = 5173;

try {
  const configPath = path.resolve(__dirname, '../../config.json');
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    if (config.frontend) {
      if (config.frontend.host) {
        frontendHost = config.frontend.host;
      }
      if (config.frontend.port) {
        frontendPort = config.frontend.port;
      }
    }
  }
} catch (error) {
  console.warn('Failed to read config.json for frontend settings, using defaults:', error);
}

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
    host: frontendHost,
    port: frontendPort,
    allowedHosts: [frontendHost],
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
