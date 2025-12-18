import * as crypto from 'crypto';
import { CoverStatus, CoverStatusAndLinkResponse } from '@home-visit/common';
import { IConfigLoader } from '../configLoader/interfaces/IConfigLoader';
import { IHttpClient } from '../httpClient/interfaces/IHttpClient';
import { ICache } from '../cache/interfaces/ICache';
import { ISiteRepository } from '../../repositories/sites/interfaces/ISiteRepository';
import { ICoverStatusAndLinkService, CoverStatusAndLinkResult } from './interfaces/ICoverStatusAndLinkService';

export class CoverStatusAndLinkService implements ICoverStatusAndLinkService {
  constructor(
    private readonly configLoader: IConfigLoader,
    private readonly httpClient: IHttpClient,
    private readonly cache: ICache,
    private readonly siteRepository: ISiteRepository
  ) {}

  async getCoverStatusAndLink(
    groupName: string,
    sites: Array<{ siteName: string; geometry: string; refreshSeconds: number }>,
    timeRange: { from: Date; to: Date }
  ): Promise<CoverStatusAndLinkResult[]> {
    if (sites.length === 0) {
      return [];
    }

    const config = this.configLoader.loadConfig();
    const normalizedTimeRange = this.normalizeTimeRange(timeRange, config.cache.ttlSeconds);
    const cacheKey = this.generateCacheKey(groupName, normalizedTimeRange);

    // Check cache first
    const cachedResult = this.cache.get<CoverStatusAndLinkResult[]>(cacheKey);
    if (cachedResult) {
      // Filter cached results to return only requested sites
      return this.filterResultsForRequestedSites(cachedResult, sites);
    }

    // Cache miss - fetch all sites for the group
    const allSitesForGroup = await this.siteRepository.findByFilters({
      groupName: groupName,
    });

    const allSitesWithGeometry = allSitesForGroup
      .filter((site) => site.geometry !== null)
      .map((site) => ({
        siteName: site.siteName,
        geometry: site.geometry!,
        refreshSeconds: site.refreshSeconds ?? site.group.groupDefaultRefreshSeconds,
      }));

    if (allSitesWithGeometry.length === 0) {
      return this.createNoDataResults(sites);
    }

    try {
      const requestPayload = this.buildRequestPayload(allSitesWithGeometry, normalizedTimeRange, config);
      const url = config.service1.endpoint.startsWith('http')
        ? config.service1.endpoint
        : `${config.service1.url}${config.service1.endpoint.startsWith('/') ? '' : '/'}${config.service1.endpoint}`;
      const response = await this.httpClient.post<CoverStatusAndLinkResponse>(
        url,
        requestPayload,
        config.service1.headers
      );

      if (response.status !== 200) {
        return this.createNoDataResults(sites);
      }

      // Map response for all sites in group
      const allResults = this.mapResponseToResults(allSitesWithGeometry, response.data, config);
      
      // Cache the full result for the group
      this.cache.set(cacheKey, allResults, config.cache.ttlSeconds);
      
      // Filter to return only requested sites
      return this.filterResultsForRequestedSites(allResults, sites);
    } catch (error) {
      const cachedFallback = this.cache.get<CoverStatusAndLinkResult[]>(cacheKey);
      if (cachedFallback) {
        return this.filterResultsForRequestedSites(cachedFallback, sites);
      }
      return this.createNoDataResults(sites);
    }
  }

  private buildRequestPayload(
    sites: Array<{ siteName: string; geometry: string }>,
    timeRange: { from: Date; to: Date },
    config: ReturnType<IConfigLoader['loadConfig']>
  ): Record<string, unknown> {
    return {
      [config.service1.geometryOuterKey]: {
        [config.service1.geometryInnerKey]: sites.map((s) => s.geometry),
        [config.service1.siteNameKey]: sites.map((s) => s.siteName),
      },
      [config.service1.timeRangeOuterKey]: {
        [config.service1.timeRangeInnerKey]: {
          From: timeRange.from.toISOString(),
          To: timeRange.to.toISOString(),
        },
      },
    };
  }

  private normalizeTimeRange(timeRange: { from: Date; to: Date }, ttlSeconds: number): { from: Date; to: Date } {
    // Round to nearest cache TTL interval to ensure consistent cache keys
    // This prevents cache misses from minor time differences
    const ttlMs = ttlSeconds * 1000;
    const normalizedFrom = new Date(Math.floor(timeRange.from.getTime() / ttlMs) * ttlMs);
    const normalizedTo = new Date(Math.floor(timeRange.to.getTime() / ttlMs) * ttlMs);
    return { from: normalizedFrom, to: normalizedTo };
  }

  private generateCacheKey(groupName: string, timeRange: { from: Date; to: Date }): string {
    const keyString = `coverStatusAndLink:${groupName}:${timeRange.from.toISOString()}:${timeRange.to.toISOString()}`;
    return crypto.createHash('sha256').update(keyString).digest('hex');
  }

  private filterResultsForRequestedSites(
    allResults: CoverStatusAndLinkResult[],
    requestedSites: Array<{ siteName: string }>
  ): CoverStatusAndLinkResult[] {
    const resultMap = new Map(allResults.map((r) => [r.siteName, r]));
    
    return requestedSites.map((site) => {
      const result = resultMap.get(site.siteName);
      if (result) {
        return result;
      }
      return {
        siteName: site.siteName,
        coverStatus: 'no data available' as const,
        siteLink: 'no data available',
      };
    });
  }

  private mapResponseToResults(
    sites: Array<{ siteName: string }>,
    response: CoverStatusAndLinkResponse,
    config: ReturnType<IConfigLoader['loadConfig']>
  ): CoverStatusAndLinkResult[] {
    const responseKey = config.service1.responseKey;
    const responseItems = response[responseKey];

    if (!Array.isArray(responseItems)) {
      return this.createNoDataResults(sites);
    }

    const responseMap = new Map<string, { status: CoverStatus; projectLink: string }>();
    for (const item of responseItems) {
      if (item.siteName && item.status && item.projectLink) {
        responseMap.set(item.siteName, {
          status: item.status,
          projectLink: item.projectLink,
        });
      }
    }

    return sites.map((site) => {
      const responseItem = responseMap.get(site.siteName);
      if (responseItem) {
        return {
          siteName: site.siteName,
          coverStatus: responseItem.status,
          siteLink: responseItem.projectLink,
        };
      }
      return {
        siteName: site.siteName,
        coverStatus: 'no data available' as const,
        siteLink: 'no data available',
      };
    });
  }

  private createNoDataResults(sites: Array<{ siteName: string }>): CoverStatusAndLinkResult[] {
    return sites.map((site) => ({
      siteName: site.siteName,
      coverStatus: 'no data available' as const,
      siteLink: 'no data available',
    }));
  }
}

