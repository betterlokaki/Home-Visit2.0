import * as fs from 'fs';
import * as path from 'path';
import { IConfigLoader, AppConfig } from './interfaces/IConfigLoader';

export class ConfigLoader implements IConfigLoader {
  private readonly configPath: string;

  constructor(configPath?: string) {
    if (configPath) {
      this.configPath = configPath;
    } else {
      const cwd = process.cwd();
      if (cwd.endsWith('apps/backend') || cwd.endsWith('apps\\backend')) {
        this.configPath = path.join(cwd, '..', '..', 'config.json');
      } else if (cwd.endsWith('tests') || cwd.endsWith('tests/') || cwd.endsWith('tests\\')) {
        this.configPath = path.join(cwd, '..', 'config.json');
      } else {
        this.configPath = path.join(cwd, 'config.json');
      }
    }
  }

  loadConfig(): AppConfig {
    if (!fs.existsSync(this.configPath)) {
      throw new Error(`Configuration file not found at ${this.configPath}`);
    }

    try {
      const configContent = fs.readFileSync(this.configPath, 'utf-8');
      const config: AppConfig = JSON.parse(configContent);

      this.validateConfig(config);
      return config;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in configuration file: ${error.message}`);
      }
      throw new Error(`Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateConfig(config: AppConfig): void {
    if (!config.service1) {
      throw new Error('Configuration missing service1');
    }
    if (!config.service1.url) {
      throw new Error('Configuration missing service1.url');
    }
    if (!config.service1.geometryOuterKey) {
      throw new Error('Configuration missing service1.geometryOuterKey');
    }
    if (!config.service1.geometryInnerKey) {
      throw new Error('Configuration missing service1.geometryInnerKey');
    }
    if (!config.service1.siteNameKey) {
      throw new Error('Configuration missing service1.siteNameKey');
    }
    if (!config.service1.timeRangeOuterKey) {
      throw new Error('Configuration missing service1.timeRangeOuterKey');
    }
    if (!config.service1.timeRangeInnerKey) {
      throw new Error('Configuration missing service1.timeRangeInnerKey');
    }
    if (!config.service1.responseKey) {
      throw new Error('Configuration missing service1.responseKey');
    }
    if (!config.service1.endpoint) {
      throw new Error('Configuration missing service1.endpoint');
    }
    if (typeof config.service1.endpoint !== 'string' || config.service1.endpoint.trim() === '') {
      throw new Error('Configuration service1.endpoint must be a non-empty string');
    }

    if (!config.service2) {
      throw new Error('Configuration missing service2');
    }
    if (!config.service2.url) {
      throw new Error('Configuration missing service2.url');
    }
    if (!config.service2.geometryOuterKey) {
      throw new Error('Configuration missing service2.geometryOuterKey');
    }
    if (!config.service2.geometryInnerKey) {
      throw new Error('Configuration missing service2.geometryInnerKey');
    }
    if (!config.service2.secondsOuterKey) {
      throw new Error('Configuration missing service2.secondsOuterKey');
    }
    if (!config.service2.secondsInnerKey) {
      throw new Error('Configuration missing service2.secondsInnerKey');
    }
    if (!config.service2.responseKey) {
      throw new Error('Configuration missing service2.responseKey');
    }

    if (!config.cache) {
      throw new Error('Configuration missing cache');
    }
    if (typeof config.cache.ttlSeconds !== 'number' || config.cache.ttlSeconds <= 0) {
      throw new Error('Configuration cache.ttlSeconds must be a positive number');
    }

    if (config.map) {
      if (!config.map.mapStyle && !config.map.styleJson) {
        throw new Error('Configuration map must have either mapStyle or styleJson');
      }
      if (config.map.mapStyle) {
        if (typeof config.map.mapStyle !== 'string' && typeof config.map.mapStyle !== 'object') {
          throw new Error('Configuration map.mapStyle must be either a string (URL) or an object (JSON style)');
        }
        if (typeof config.map.mapStyle === 'string' && config.map.mapStyle.trim() === '') {
          throw new Error('Configuration map.mapStyle must be a non-empty string when provided as URL');
        }
        if (typeof config.map.mapStyle === 'object' && config.map.mapStyle === null) {
          throw new Error('Configuration map.mapStyle cannot be null');
        }
      }
      if (config.map.styleJson) {
        if (typeof config.map.styleJson !== 'string' && typeof config.map.styleJson !== 'object') {
          throw new Error('Configuration map.styleJson must be either a string (URL) or an object (JSON style)');
        }
        if (typeof config.map.styleJson === 'string' && config.map.styleJson.trim() === '') {
          throw new Error('Configuration map.styleJson must be a non-empty string when provided as URL');
        }
        if (typeof config.map.styleJson === 'object' && config.map.styleJson === null) {
          throw new Error('Configuration map.styleJson cannot be null');
        }
      }
      if (config.map.flyToZoom !== undefined && (typeof config.map.flyToZoom !== 'number' || config.map.flyToZoom <= 0)) {
        throw new Error('Configuration map.flyToZoom must be a positive number');
      }
    }

    if (!config.database) {
      throw new Error('Configuration missing database');
    }
    if (!config.database.url) {
      throw new Error('Configuration missing database.url');
    }
    if (typeof config.database.url !== 'string' || config.database.url.trim() === '') {
      throw new Error('Configuration database.url must be a non-empty string');
    }

    if (config.frontend) {
      if (typeof config.frontend.host !== 'string' || config.frontend.host.trim() === '') {
        throw new Error('Configuration frontend.host must be a non-empty string');
      }
      if (typeof config.frontend.port !== 'number' || config.frontend.port <= 0 || config.frontend.port > 65535) {
        throw new Error('Configuration frontend.port must be a number between 1 and 65535');
      }
      if (!Array.isArray(config.frontend.allowedHosts)) {
        throw new Error('Configuration frontend.allowedHosts must be an array');
      }
      if (config.frontend.allowedHosts.length === 0) {
        throw new Error('Configuration frontend.allowedHosts must contain at least one host');
      }
      for (const host of config.frontend.allowedHosts) {
        if (typeof host !== 'string' || host.trim() === '') {
          throw new Error('Configuration frontend.allowedHosts must contain only non-empty strings');
        }
      }
    }
  }
}

