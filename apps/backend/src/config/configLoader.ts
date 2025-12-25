import fs from 'fs';
import path from 'path';
import { appConfigSchema, AppConfig } from './configSchema';

function getConfigPath(): string {
  const cwd = process.cwd();
  if (cwd.endsWith('apps/backend') || cwd.endsWith('apps\\backend')) {
    return path.resolve(cwd, '..', '..', 'config.json');
  }
  if (cwd.endsWith('tests') || cwd.endsWith('tests/') || cwd.endsWith('tests\\')) {
    return path.resolve(cwd, '..', 'config.json');
  }
  return path.resolve(cwd, 'config.json');
}

const configPath = getConfigPath();

if (!fs.existsSync(configPath)) {
  throw new Error(`Configuration file not found at ${configPath}`);
}

const configContent = fs.readFileSync(configPath, 'utf-8');
let parsed: unknown;

try {
  parsed = JSON.parse(configContent);
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  throw new Error(`Invalid JSON in configuration file: ${message}`);
}

const appConfig: AppConfig = appConfigSchema.parse(parsed);

export { appConfig };

