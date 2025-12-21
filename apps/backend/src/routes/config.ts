import { Router, Request, Response } from 'express';
import { ConfigLoader } from '../services/configLoader/ConfigLoader';
import type { MapStyle } from '../services/configLoader/interfaces/IConfigLoader';

const router: Router = Router();
const configLoader = new ConfigLoader();

router.get('/map', (_req: Request, res: Response) => {
  try {
    const config = configLoader.loadConfig();
    const mapConfig = config.map || {
      mapStyle: 'https://demotiles.maplibre.org/style.json',
    };
    
    // If styleJson is provided, use it; otherwise use mapStyle
    const responseConfig: { mapStyle: MapStyle; flyToZoom?: number } = {
      mapStyle: mapConfig.styleJson || mapConfig.mapStyle || 'https://demotiles.maplibre.org/style.json',
      flyToZoom: mapConfig.flyToZoom,
    };
    
    res.json(responseConfig);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to load map configuration',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/frontend', (_req: Request, res: Response) => {
  try {
    const config = configLoader.loadConfig();
    const frontendConfig = config.frontend || {
      host: 'localhost',
      port: 5173,
      allowedHosts: ['localhost', '127.0.0.1'],
      apiBaseUrl: 'http://localhost:3001/api',
    };
    
    res.json({
      apiBaseUrl: frontendConfig.apiBaseUrl,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to load frontend configuration',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

