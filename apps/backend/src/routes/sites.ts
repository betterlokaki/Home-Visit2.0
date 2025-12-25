import { Router } from 'express';
import { SitesController } from '../controllers/sites/SitesController';
import { SitesService } from '../services/sites/SitesService';
import { SiteRepository } from '../repositories/sites/SiteRepository';
import { HttpClient } from '../services/httpClient/HttpClient';
import { Cache } from '../services/cache/Cache';
import { CacheRefreshQueue } from '../services/cacheRefreshQueue/CacheRefreshQueue';
import { CoverStatusAndLinkService } from '../services/coverStatusAndLink/CoverStatusAndLinkService';
import { appConfig } from '../config/configLoader';

const router: Router = Router();
const siteRepository = new SiteRepository();
const httpClient = new HttpClient();
const cache = new Cache();
const refreshQueue = new CacheRefreshQueue(appConfig.cache.maxConcurrentRefreshes);
const coverStatusAndLinkService = new CoverStatusAndLinkService(
  appConfig,
  httpClient,
  cache,
  siteRepository,
  refreshQueue
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

