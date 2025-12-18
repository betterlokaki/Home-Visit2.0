export interface Service1Config {
  url: string;
  endpoint: string;
  geometryOuterKey: string;
  geometryInnerKey: string;
  siteNameKey: string;
  timeRangeOuterKey: string;
  timeRangeInnerKey: string;
  responseKey: string;
  headers?: Record<string, string>;
}

export interface Service2Config {
  url: string;
  geometryOuterKey: string;
  geometryInnerKey: string;
  secondsOuterKey: string;
  secondsInnerKey: string;
  responseKey: string;
  headers?: Record<string, string>;
}

export interface CacheConfig {
  ttlSeconds: number;
}

export type MapStyle = string | Record<string, unknown>;

export interface MapConfig {
  mapStyle?: MapStyle;
  styleJson?: MapStyle;
  flyToZoom?: number;
}

export interface DatabaseConfig {
  url: string;
}

export interface FrontendConfig {
  host: string;
  port: number;
  allowedHosts: string[];
}

export interface AppConfig {
  service1: Service1Config;
  service2: Service2Config;
  cache: CacheConfig;
  map?: MapConfig;
  database: DatabaseConfig;
  frontend?: FrontendConfig;
}

export interface IConfigLoader {
  loadConfig(): AppConfig;
}

