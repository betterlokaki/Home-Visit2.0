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
    return group?.groupDefaultRefreshSeconds || 300;
  }, [group]);

  const fetchSites = useCallback(async () => {
    if (!group) return;

    setLoading(true);
    try {
      const timeframeEnd = new Date(currentTimeframe);
      const timeframeStart = new Date(
        currentTimeframe.getTime() - refreshSeconds * 1000
      );

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
          From: timeframeStart,
          To: timeframeEnd,
        },
      };

      if (filters?.usernames) {
        requestFilters.usernames = filters.usernames;
      }

      // Handle "awaiting visit" filter - requires AND logic (Not Seen AND Full/Partial)
      // So we need to fetch sites with both conditions and filter on frontend
      if (filters?.awaitingVisit) {
        // Add status filter for "Not Seen" if not already present
        if (!requestFilters.status) {
          requestFilters.status = ['Not Seen' as SeenStatus];
        } else if (!requestFilters.status.includes('Not Seen' as SeenStatus)) {
          requestFilters.status = [...requestFilters.status, 'Not Seen' as SeenStatus];
        }

        // Add coverStatus filter for "Full" and "Partial" if not already present
        if (!requestFilters.coverStatus) {
          requestFilters.coverStatus = ['Full' as CoverStatus, 'Partial' as CoverStatus];
        } else {
          const coverStatusSet = new Set(requestFilters.coverStatus);
          if (!coverStatusSet.has('Full' as CoverStatus)) {
            requestFilters.coverStatus.push('Full' as CoverStatus);
          }
          if (!coverStatusSet.has('Partial' as CoverStatus)) {
            requestFilters.coverStatus.push('Partial' as CoverStatus);
          }
        }
      } else {
        // Normal filters
        if (filters?.status) {
          requestFilters.status = filters.status;
        }

        if (filters?.coverStatus) {
          requestFilters.coverStatus = filters.coverStatus;
        }
      }

      let sitesData = await sitesService.getSitesByFilters(requestFilters);

      // Apply "awaiting visit" filter on frontend (requires AND logic: Not Seen AND Full/Partial)
      if (filters?.awaitingVisit) {
        const awaitingVisitSites = sitesData.filter(
          (site) =>
            site.status?.seenStatus === 'Not Seen' &&
            (site.coverStatus === 'Full' || site.coverStatus === 'Partial')
        );

        // If other filters are also active, combine with OR logic
        const hasOtherFilters = (filters.status && !filters.status.includes('Not Seen' as SeenStatus)) ||
          (filters.coverStatus && !filters.coverStatus.some(cs => cs === 'Full' || cs === 'Partial')) ||
          filters.usernames;

        if (hasOtherFilters) {
          // Backend already returned sites matching other filters
          // Combine with awaiting visit sites (OR logic)
          const siteIds = new Set(sitesData.map((s) => s.siteId));
          awaitingVisitSites.forEach((site) => {
            if (!siteIds.has(site.siteId)) {
              sitesData.push(site);
            }
          });
        } else {
          // Only awaiting visit filter is active (or it's the only status/coverStatus filter)
          sitesData = awaitingVisitSites;
        }
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

