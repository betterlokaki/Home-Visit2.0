import { Router, Request, Response } from 'express';
import { ConfigLoader } from '../services/configLoader/ConfigLoader';

const router: Router = Router();
const configLoader = new ConfigLoader();

router.get('/map', (_req: Request, res: Response) => {
  try {
    const config = configLoader.loadConfig();
    const mapConfig = config.map || {
      mapStyle: 'https://demotiles.maplibre.org/style.json',
    };
    res.json(mapConfig);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to load map configuration',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;

