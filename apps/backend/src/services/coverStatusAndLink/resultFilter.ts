import { CoverStatusAndLinkResult } from './interfaces/ICoverStatusAndLinkService';
import { createNoDataResult } from './responseMapper';

export const filterResultsForRequestedSites = (
  allResults: CoverStatusAndLinkResult[],
  requestedSites: Array<{ siteName: string }>
): CoverStatusAndLinkResult[] => {
  const resultMap = new Map(allResults.map((result) => [result.siteName, result]));

  return requestedSites.map((site) => resultMap.get(site.siteName) ?? createNoDataResult(site.siteName));
};

