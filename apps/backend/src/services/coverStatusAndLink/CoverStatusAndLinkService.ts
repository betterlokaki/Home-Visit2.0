import { IHttpClient } from '../httpClient/interfaces/IHttpClient';
import { ICache } from '../cache/interfaces/ICache';
import { ISiteRepository } from '../../repositories/sites/interfaces/ISiteRepository';
import { ICoverStatusAndLinkService, CoverStatusAndLinkResult } from './interfaces/ICoverStatusAndLinkService';
import { ICacheRefreshQueue } from '../cacheRefreshQueue/interfaces/ICacheRefreshQueue';
import { AppConfig } from '@home-visit/common';
import { buildRequestPayload, SiteWithGeometry } from './payloadBuilder';
import { generateCacheKey, normalizeTimeRange, TimeRange } from './timeWindowUtils';
import { filterResultsForRequestedSites } from './resultFilter';
import { mapResponseToResults, createNoDataResults } from './responseMapper';
import { resolveService1Url } from './urlBuilder';
import { CoverStatusAndLinkResponse } from '@home-visit/common';

type SiteWithRefresh = SiteWithGeometry & { refreshSeconds: number };

export class CoverStatusAndLinkService implements ICoverStatusAndLinkService {
  constructor(
    private readonly config: AppConfig,
    private readonly httpClient: IHttpClient,
    private readonly cache: ICache,
    private readonly siteRepository: ISiteRepository,
    private readonly refreshQueue: ICacheRefreshQueue
  ) {}

  async getCoverStatusAndLink(
    groupName: string,
    sites: Array<{ siteName: string; geometry: string; refreshSeconds: number }>,
    timeRange: TimeRange
  ): Promise<CoverStatusAndLinkResult[]> {
    if (sites.length === 0) {
      return [];
    }

    const normalizedTimeRange = normalizeTimeRange(timeRange, this.config.cache.ttlSeconds);
    const cacheKey = generateCacheKey(groupName, normalizedTimeRange);
    const cachedResult = this.cache.get<CoverStatusAndLinkResult[]>(cacheKey);
    
    if (cachedResult) {
      const threshold = this.config.cache.refreshThresholdPercentage ?? 0.8;
      if (this.cache.isExpiringSoon(cacheKey, threshold)) {
        this.refreshQueue.enqueueRefresh(cacheKey, () =>
          this.createRefreshTask(cacheKey, groupName, normalizedTimeRange)
        );
      }
      return filterResultsForRequestedSites(cachedResult, sites);
    }

    const allSitesWithGeometry = await this.loadSitesWithGeometry(groupName);
    if (allSitesWithGeometry.length === 0) {
      return createNoDataResults(sites);
    }

    const response = await this.httpClient.post(
      resolveService1Url(this.config),
      buildRequestPayload(allSitesWithGeometry, normalizedTimeRange, this.config),
      this.config.service1.headers
    );

    if (response.status !== 200) {
      return createNoDataResults(sites);
    }

    const allResults = mapResponseToResults(
      allSitesWithGeometry,
      response.data as CoverStatusAndLinkResponse,
      this.config.service1.responseKey
    );

    this.cache.set(cacheKey, allResults, this.config.cache.ttlSeconds);
    return filterResultsForRequestedSites(allResults, sites);
  }

  private async createRefreshTask(
    cacheKey: string,
    groupName: string,
    normalizedTimeRange: TimeRange
  ): Promise<void> {
    const allSitesWithGeometry = await this.loadSitesWithGeometry(groupName);
    if (allSitesWithGeometry.length === 0) {
      return;
    }

    const response = await this.httpClient.post(
      resolveService1Url(this.config),
      buildRequestPayload(allSitesWithGeometry, normalizedTimeRange, this.config),
      this.config.service1.headers
    );

    if (response.status !== 200) {
      return;
    }

    const allResults = mapResponseToResults(
      allSitesWithGeometry,
      response.data as CoverStatusAndLinkResponse,
      this.config.service1.responseKey
    );

    this.cache.set(cacheKey, allResults, this.config.cache.ttlSeconds);
  }

  private async loadSitesWithGeometry(groupName: string): Promise<SiteWithRefresh[]> {
    const allSites = await this.siteRepository.findByFilters({ groupName });
    return allSites
      .filter((site) => site.geometry !== null)
      .map((site) => ({
        siteName: site.siteName,
        geometry: site.geometry as string,
        refreshSeconds: site.refreshSeconds ?? site.group.groupDefaultRefreshSeconds,
      }));
  }
}

