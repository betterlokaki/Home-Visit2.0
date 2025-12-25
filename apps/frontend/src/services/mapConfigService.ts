import { apiClient } from './apiClient';
import type { StyleSpecification } from 'maplibre-gl';

export interface MapConfig {
  mapStyle: string | StyleSpecification;
  flyToZoom?: number;
}

let cachedConfig: MapConfig | null = null;

export const mapConfigService = {
  async getMapConfig(): Promise<MapConfig> {
    if (cachedConfig) {
      return cachedConfig;
    }

    const response = await apiClient.get<MapConfig>('/config/map');
    cachedConfig = response.data;
    return cachedConfig;
  },
};

