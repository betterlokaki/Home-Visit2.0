import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { appConfigSchema } from '@home-visit/common';

const configPath = path.resolve(__dirname, '../../config.json');
const configContent = fs.readFileSync(configPath, 'utf-8');
const config = appConfigSchema.parse(JSON.parse(configContent));

const { host, port, allowedHosts, apiBaseUrl } = config.frontend;

if (!config.otel) {
  throw new Error('Configuration missing otel section');
}

if (!config.otel.logsEndpoint) {
  throw new Error('Configuration missing otel.logsEndpoint');
}

const logsEndpoint = config.otel.logsEndpoint;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __API_BASE_URL__: JSON.stringify(apiBaseUrl),
    __LOGS_ENDPOINT__: JSON.stringify(logsEndpoint),
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
    host,
    port,
    allowedHosts,
    fs: {
      allow: ['..'],
    },
  },
  preview: {
    host,
    port,
    allowedHosts,
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
      path.resolve(__dirname, '../../tests/frontend/unit-tests/**/*Tests.tsx'),
      path.resolve(__dirname, '../../tests/frontend/unit-tests/**/*Tests.ts'),
      path.resolve(__dirname, '../../tests/frontend/integration-tests/**/*Tests.tsx'),
      path.resolve(__dirname, '../../tests/frontend/integration-tests/**/*Tests.ts'),
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
