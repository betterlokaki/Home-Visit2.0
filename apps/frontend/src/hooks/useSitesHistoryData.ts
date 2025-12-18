import { useState, useCallback } from 'react';
import type { Site, Group } from '@home-visit/common';
import { sitesService } from '../services/sitesService';
import { calculateStartTime, navigateTimeframe } from '../utils/timeframeCalculator';

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
        const endTimes: Date[] = [];
        let currentEndTime = new Date(currentTimeframe);
        
        for (let i = 0; i < numberOfTimeframes; i++) {
          endTimes.push(new Date(currentEndTime));
          if (i < numberOfTimeframes - 1) {
            currentEndTime = navigateTimeframe(currentEndTime, 'prev', refreshSeconds);
          }
        }

        endTimes.reverse();

        const sitesByTimeframe: SitesByTimeframe[] = [];
        const allSitesMap = new Map<number, Site>();

        for (const endTime of endTimes) {
          const startTime = calculateStartTime(endTime, refreshSeconds);
          const sites = await sitesService.getSitesByFilters({
            group: group.groupName,
            dates: {
              From: startTime,
              To: endTime,
            },
          });

          sites.forEach((site) => {
            if (!allSitesMap.has(site.siteId)) {
              allSitesMap.set(site.siteId, site);
            }
          });

          sitesByTimeframe.push({ timeframe: endTime, sites });
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

