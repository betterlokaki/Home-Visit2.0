import { CoverStatus, CoverStatusAndLinkResponse } from '@home-visit/common';
import { CoverStatusAndLinkResult } from './interfaces/ICoverStatusAndLinkService';
import { SiteWithGeometry } from './payloadBuilder';

export const mapResponseToResults = (
  sites: SiteWithGeometry[],
  response: CoverStatusAndLinkResponse,
  responseKey: string
): CoverStatusAndLinkResult[] => {
  const responseItems = response[responseKey];

  if (!Array.isArray(responseItems)) {
    throw new Error(`Invalid response format: expected array at key '${responseKey}', got ${typeof responseItems}`);
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
    return createNoDataResult(site.siteName);
  });
};

export const createNoDataResults = (sites: Array<{ siteName: string }>): CoverStatusAndLinkResult[] =>
  sites.map((site) => createNoDataResult(site.siteName));

export const createNoDataResult = (siteName: string): CoverStatusAndLinkResult => ({
  siteName,
  coverStatus: 'no data available',
  siteLink: 'no data available',
});

