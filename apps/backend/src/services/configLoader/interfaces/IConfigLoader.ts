export interface Service1Config {
  url: string;
  geometryOuterKey: string;
  geometryInnerKey: string;
  siteNameKey: string;
  timeRangeOuterKey: string;
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
  mapStyle: MapStyle;
}

export interface AppConfig {
  service1: Service1Config;
  service2: Service2Config;
  cache: CacheConfig;
  map?: MapConfig;
}

export interface IConfigLoader {
  loadConfig(): AppConfig;
}

