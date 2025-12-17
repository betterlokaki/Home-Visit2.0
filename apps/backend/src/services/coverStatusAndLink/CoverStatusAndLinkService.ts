import * as crypto from 'crypto';
import { CoverStatus, CoverStatusAndLinkResponse } from '@home-visit/common';
import { IConfigLoader } from '../configLoader/interfaces/IConfigLoader';
import { IHttpClient } from '../httpClient/interfaces/IHttpClient';
import { ICache } from '../cache/interfaces/ICache';
import { ICoverStatusAndLinkService, CoverStatusAndLinkResult } from './interfaces/ICoverStatusAndLinkService';

export class CoverStatusAndLinkService implements ICoverStatusAndLinkService {
  constructor(
    private readonly configLoader: IConfigLoader,
    private readonly httpClient: IHttpClient,
    private readonly cache: ICache
  ) {}

  async getCoverStatusAndLink(
    sites: Array<{ siteName: string; geometry: string; refreshSeconds: number }>,
    timeRange: { from: Date; to: Date }
  ): Promise<CoverStatusAndLinkResult[]> {
    if (sites.length === 0) {
      return [];
    }

    const config = this.configLoader.loadConfig();
    const requestPayload = this.buildRequestPayload(sites, timeRange, config);
    const cacheKey = this.generateCacheKey(requestPayload);

    const cachedResult = this.cache.get<CoverStatusAndLinkResult[]>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const response = await this.httpClient.post<CoverStatusAndLinkResponse>(
        `${config.service1.url}/service1/current-status`,
        requestPayload,
        config.service1.headers
      );

      if (response.status !== 200) {
        return this.createNoDataResults(sites);
      }

      const result = this.mapResponseToResults(sites, response.data, config);
      this.cache.set(cacheKey, result, config.cache.ttlSeconds);
      return result;
    } catch (error) {
      const cachedFallback = this.cache.get<CoverStatusAndLinkResult[]>(cacheKey);
      if (cachedFallback) {
        return cachedFallback;
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
        From: timeRange.from.toISOString(),
        To: timeRange.to.toISOString(),
      },
    };
  }

  private generateCacheKey(payload: Record<string, unknown>): string {
    const payloadString = JSON.stringify(payload);
    return crypto.createHash('sha256').update(payloadString).digest('hex');
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

