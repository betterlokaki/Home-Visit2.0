import { apiClient } from './apiClient';

export interface MapConfig {
  mapStyleUrl: string;
}

const DEFAULT_MAP_STYLE = 'https://demotiles.maplibre.org/style.json';

let cachedConfig: MapConfig | null = null;

export const mapConfigService = {
  async getMapConfig(): Promise<MapConfig> {
    if (cachedConfig) {
      return cachedConfig;
    }

    try {
      const response = await apiClient.get<MapConfig>('/config/map');
      cachedConfig = response.data;
      return cachedConfig;
    } catch (error) {
      console.warn('Failed to load map config from server, using default:', error);
      return {
        mapStyleUrl: DEFAULT_MAP_STYLE,
      };
    }
  },
};

