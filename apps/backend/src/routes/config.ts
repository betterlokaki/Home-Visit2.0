import { Router, Request, Response } from 'express';
import { appConfig } from '../config/configLoader';
import type { MapStyle } from '@home-visit/common';

const router: Router = Router();

router.get('/map', (_req: Request, res: Response) => {
  const responseConfig: { mapStyle: MapStyle; flyToZoom?: number } = {
    mapStyle: appConfig.map.styleJson,
    flyToZoom: appConfig.map.flyToZoom,
  };

  res.json(responseConfig);
});

export default router;

