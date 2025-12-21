import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Site, Group, CoverStatus, SeenStatus } from '@home-visit/common';
import { sitesService } from '../services/sitesService';

interface SitesFilters {
  usernames?: string[];
  status?: SeenStatus[];
  coverStatus?: CoverStatus[];
  awaitingVisit?: boolean;
}

interface UseSitesDataProps {
  group: Group | null;
  currentTimeframe: Date;
  filters?: SitesFilters;
}

export const useSitesData = ({ group, currentTimeframe, filters }: UseSitesDataProps) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshSeconds = useMemo(() => {
    return group?.groupDefaultRefreshSeconds || 86400;
  }, [group]);

  const fetchSites = useCallback(async () => {
    if (!group) return;

    setLoading(true);
    try {
      const windowStart = new Date(currentTimeframe);

      const requestFilters: {
        group: string;
        usernames?: string[];
        status?: SeenStatus[];
        coverStatus?: CoverStatus[];
        dates: {
          From: Date;
          To: Date;
        };
      } = {
        group: group.groupName,
        dates: {
          From: windowStart,
          To: windowStart,
        },
      };

      if (filters?.usernames) {
        requestFilters.usernames = filters.usernames;
      }

      let sitesData: Site[];

      // Handle "awaiting visit" filter - send two separate requests:
      // 1. Not Seen AND (Full OR Partial)
      // 2. Partial Seen AND Full
      if (filters?.awaitingVisit) {
        // Request 1: Not Seen AND (Full OR Partial)
        const request1: {
          group: string;
          status: SeenStatus[];
          coverStatus: CoverStatus[];
          dates: { From: Date; To: Date };
          usernames?: string[];
        } = {
          group: group.groupName,
          status: ['Not Seen' as SeenStatus],
          coverStatus: ['Full' as CoverStatus, 'Partial' as CoverStatus],
          dates: {
            From: windowStart,
            To: windowStart,
          },
        };

        if (filters.usernames) {
          request1.usernames = filters.usernames;
        }

        // Request 2: Partial Seen AND Full
        const request2: {
          group: string;
          status: SeenStatus[];
          coverStatus: CoverStatus[];
          dates: { From: Date; To: Date };
          usernames?: string[];
        } = {
          group: group.groupName,
          status: ['Partial Seen' as SeenStatus],
          coverStatus: ['Full' as CoverStatus],
          dates: {
            From: windowStart,
            To: windowStart,
          },
        };

        if (filters.usernames) {
          request2.usernames = filters.usernames;
        }

        // Send both requests in parallel
        const [sites1, sites2] = await Promise.all([
          sitesService.getSitesByFilters(request1),
          sitesService.getSitesByFilters(request2),
        ]);

        // Combine and remove duplicates by siteId
        const siteMap = new Map<number, Site>();
        [...sites1, ...sites2].forEach((site) => {
          siteMap.set(site.siteId, site);
        });
        sitesData = Array.from(siteMap.values());
      } else {
        // Normal filters
        if (filters?.status) {
          requestFilters.status = filters.status;
        }

        if (filters?.coverStatus) {
          requestFilters.coverStatus = filters.coverStatus;
        }

        sitesData = await sitesService.getSitesByFilters(requestFilters);
      }

      setSites(sitesData);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    } finally {
      setLoading(false);
    }
  }, [group, currentTimeframe, refreshSeconds, filters]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  return { sites, loading, refreshSeconds, refreshSites: fetchSites };
};

