import { useState, useEffect } from 'react';
import { mapConfigService } from '../services/mapConfigService';
import type { MapConfig } from '../services/mapConfigService';

export function useMapConfig(): MapConfig | null {
  const [config, setConfig] = useState<MapConfig | null>(null);

  useEffect(() => {
    mapConfigService.getMapConfig().then(setConfig);
  }, []);

  return config;
}

