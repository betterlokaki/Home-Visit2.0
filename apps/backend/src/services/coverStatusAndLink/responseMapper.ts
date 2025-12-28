import { CoverStatus, CoverStatusAndLinkResponse } from '@home-visit/common';
import { CoverStatusAndLinkResult } from './interfaces/ICoverStatusAndLinkService';
import { SiteWithGeometry } from './payloadBuilder';

/**
 * Maps external service response to internal result format.
 * 
 * @param sites - Sites to map results for
 * @param response - External service response
 * @param responseKey - Key in response object containing the array of items
 * @returns Array of mapped results, one per site
 * @throws Error if response format is invalid (not an array)
 */
export const mapResponseToResults = (
  sites: SiteWithGeometry[],
  response: CoverStatusAndLinkResponse,
  responseKey: string
): CoverStatusAndLinkResult[] => {
  const responseItems = response[responseKey];

  if (!Array.isArray(responseItems)) {
    throw new Error(
      `Invalid response format: expected array at key '${responseKey}', got ${typeof responseItems}. ` +
      `Response structure: ${JSON.stringify(Object.keys(response))}`
    );
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

/**
 * Creates "no data available" results for multiple sites.
 * 
 * @param sites - Sites to create results for
 * @returns Array of results with "no data available" status
 */
export const createNoDataResults = (sites: Array<{ siteName: string }>): CoverStatusAndLinkResult[] =>
  sites.map((site) => createNoDataResult(site.siteName));

/**
 * Creates a "no data available" result for a single site.
 * 
 * @param siteName - Name of the site
 * @returns Result object with "no data available" status and link
 */
export const createNoDataResult = (siteName: string): CoverStatusAndLinkResult => ({
  siteName,
  coverStatus: 'no data available',
  siteLink: 'no data available',
});

