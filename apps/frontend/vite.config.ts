import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import * as fs from 'fs'

// Read config.json for frontend host, port, and allowedHosts
const configPath = path.resolve(__dirname, '../../config.json');
if (!fs.existsSync(configPath)) {
  console.error('FATAL: Configuration file not found at', configPath);
  process.exit(1);
}

const configContent = fs.readFileSync(configPath, 'utf-8');
const config = JSON.parse(configContent);

if (!config.frontend) {
  console.error('FATAL: Configuration missing frontend section in config.json');
  process.exit(1);
}

if (!config.frontend.apiBaseUrl) {
  console.error('FATAL: Configuration missing frontend.apiBaseUrl in config.json');
  process.exit(1);
}
const frontendHost = config.frontend.host || 'localhost';
const frontendPort = config.frontend.port || 5173;
const allowedHosts = config.frontend.allowedHosts && Array.isArray(config.frontend.allowedHosts) 
  ? config.frontend.allowedHosts 
  : ['localhost'];


const apiBaseUrl = config.frontend.apiBaseUrl;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __API_BASE_URL__: JSON.stringify(apiBaseUrl),
  },
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
    allowedHosts: allowedHosts,
    fs: {
      allow: ['..'],
    },
  },
  preview:{
    host: frontendHost,
    port: frontendPort,
    allowedHosts: allowedHosts
  },
  optimizeDeps: {
    esbuildOptions:{
      target: 'es2023'
    }
  },
  build:{
    target: 'es2023'
  },
  // @ts-expect-error - vitest types
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
