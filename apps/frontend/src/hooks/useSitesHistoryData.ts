import { useState, useCallback } from 'react';
import type { Site, Group } from '@home-visit/common';
import { sitesService } from '../services/sitesService';

const ANCHOR_DATE = new Date('2025-01-12T00:00:00.000Z');

function calculateWindowStartTime(timestamp: Date, refreshSeconds: number): Date {
  const secondsSinceAnchor = Math.floor((timestamp.getTime() - ANCHOR_DATE.getTime()) / 1000);
  const windowNumber = Math.floor(secondsSinceAnchor / refreshSeconds);
  const windowStartSeconds = windowNumber * refreshSeconds;
  return new Date(ANCHOR_DATE.getTime() + windowStartSeconds * 1000);
}

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
        const timeframes: Date[] = [];
        for (let i = 0; i < numberOfTimeframes; i++) {
          const timeframeDate = new Date(
            currentTimeframe.getTime() - i * refreshSeconds * 1000
          );
          const windowStart = calculateWindowStartTime(timeframeDate, refreshSeconds);
          timeframes.push(windowStart);
        }

        timeframes.reverse();

        const sitesByTimeframe: SitesByTimeframe[] = [];
        const allSitesMap = new Map<number, Site>();

        for (const timeframe of timeframes) {
          const timeframeEnd = new Date(timeframe.getTime() + refreshSeconds * 1000);
          const sites = await sitesService.getSitesByFilters({
            group: group.groupName,
            dates: {
              From: timeframe,
              To: timeframeEnd,
            },
          });

          sites.forEach((site) => {
            if (!allSitesMap.has(site.siteId)) {
              allSitesMap.set(site.siteId, site);
            }
          });

          sitesByTimeframe.push({ timeframe, sites });
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

