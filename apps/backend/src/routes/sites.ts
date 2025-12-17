import { Router } from 'express';
import { SitesController } from '../controllers/sites/SitesController';
import { SitesService } from '../services/sites/SitesService';
import { SiteRepository } from '../repositories/sites/SiteRepository';
import { ConfigLoader } from '../services/configLoader/ConfigLoader';
import { HttpClient } from '../services/httpClient/HttpClient';
import { Cache } from '../services/cache/Cache';
import { CoverStatusAndLinkService } from '../services/coverStatusAndLink/CoverStatusAndLinkService';

const router: Router = Router();
const siteRepository = new SiteRepository();
const configLoader = new ConfigLoader();
const httpClient = new HttpClient();
const cache = new Cache();
const coverStatusAndLinkService = new CoverStatusAndLinkService(
  configLoader,
  httpClient,
  cache
);
const sitesService = new SitesService(siteRepository, coverStatusAndLinkService);
const sitesController = new SitesController(sitesService);

router.post('/', (req, res, next) => {
  sitesController.getSitesByFilters(req, res).catch(next);
});

router.put('/status/update', (req, res, next) => {
  sitesController.updateStatus(req, res).catch(next);
});

export default router;

