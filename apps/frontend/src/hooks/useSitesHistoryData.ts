import { useState, useCallback } from 'react';
import type { Site, Group } from '@home-visit/common';
import { sitesService } from '../services/sitesService';
import { navigateTimeframe } from '../utils/timeframeCalculator';

interface SitesByTimeframe {
  timeframe: Date;
  sites: Site[];
}

export function useSitesHistoryData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSitesHistory = useCallback(
    async (
      group: Group,
      currentTimeframe: Date,
      refreshSeconds: number,
      numberOfTimeframes: number = 30
    ): Promise<{ sitesByTimeframe: SitesByTimeframe[]; allSites: Site[] }> => {
      setLoading(true);
      setError(null);

      try {
        const windowStarts: Date[] = [];
        let currentWindowStart = new Date(currentTimeframe);
        
        for (let i = 0; i < numberOfTimeframes; i++) {
          windowStarts.push(new Date(currentWindowStart));
          if (i < numberOfTimeframes - 1) {
            currentWindowStart = navigateTimeframe(currentWindowStart, 'prev', refreshSeconds);
          }
        }

        windowStarts.reverse();

        const sitesByTimeframe: SitesByTimeframe[] = [];
        const allSitesMap = new Map<number, Site>();

        for (const windowStart of windowStarts) {
          const sites = await sitesService.getSitesByFilters({
            group: group.groupName,
            dates: {
              From: windowStart,
              To: windowStart,
            },
          });

          sites.forEach((site) => {
            if (!allSitesMap.has(site.siteId)) {
              allSitesMap.set(site.siteId, site);
            }
          });

          sitesByTimeframe.push({ timeframe: windowStart, sites });
        }

        const allSites = Array.from(allSitesMap.values());

        return { sitesByTimeframe, allSites };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sites history';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetchSitesHistory, loading, error };
}

