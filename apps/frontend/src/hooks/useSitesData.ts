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

      // Handle "awaiting visit" filter - requires AND logic:
      // (Not Seen AND Full/Partial) OR (Partial Seen AND Full)
      // So we need to fetch sites with both conditions and filter on frontend
      if (filters?.awaitingVisit) {
        // Add status filter for "Not Seen" and "Partial Seen" if not already present
        if (!requestFilters.status) {
          requestFilters.status = ['Not Seen' as SeenStatus, 'Partial Seen' as SeenStatus];
        } else {
          const statusSet = new Set(requestFilters.status);
          if (!statusSet.has('Not Seen' as SeenStatus)) {
            requestFilters.status.push('Not Seen' as SeenStatus);
          }
          if (!statusSet.has('Partial Seen' as SeenStatus)) {
            requestFilters.status.push('Partial Seen' as SeenStatus);
          }
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

      // Apply "awaiting visit" filter on frontend:
      // Include: (Not Seen AND Full/Partial) OR (Partial Seen AND Full)
      // Exclude: Empty or no data available
      if (filters?.awaitingVisit) {
        const awaitingVisitSites = sitesData.filter(
          (site) => {
            const coverStatus = site.coverStatus;
            const seenStatus = site.status?.seenStatus;
            
            // Exclude Empty or no data available - must have valid cover status
            // CoverStatus enum values: 'Full', 'Partial', 'Empty'
            if (!coverStatus || coverStatus === 'Empty' || coverStatus === 'no data available') {
              return false;
            }
            
            // Only include Full or Partial cover status (explicit check to be safe)
            if (coverStatus !== 'Full' && coverStatus !== 'Partial') {
              return false;
            }
            
            // Include: Not Seen + (Full OR Partial) OR Partial Seen + Full
            return (
              (seenStatus === 'Not Seen' && (coverStatus === 'Full' || coverStatus === 'Partial')) ||
              (seenStatus === 'Partial Seen' && coverStatus === 'Full')
            );
          }
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

