import { useState, useEffect, useCallback } from 'react';
import type { Site, Group } from '@home-visit/common';
import { sitesService } from '../services/sitesService';
import { calculateStartTime } from '../utils/timeframeCalculator';

interface UseAllSitesInTimeframeProps {
  group: Group | null;
  currentTimeframe: Date;
  refreshSeconds: number;
}

export const useAllSitesInTimeframe = ({
  group,
  currentTimeframe,
  refreshSeconds,
}: UseAllSitesInTimeframeProps) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAllSites = useCallback(async () => {
    if (!group) {
      setSites([]);
      return;
    }

    setLoading(true);
    try {
      const timeframeEnd = new Date(currentTimeframe);
      const timeframeStart = calculateStartTime(timeframeEnd, refreshSeconds);

      const sitesData = await sitesService.getSitesByFilters({
        group: group.groupName,
        dates: {
          From: timeframeStart,
          To: timeframeEnd,
        },
      });

      setSites(sitesData);
    } catch (error) {
      console.error('Failed to fetch all sites:', error);
      setSites([]);
    } finally {
      setLoading(false);
    }
  }, [group, currentTimeframe, refreshSeconds]);

  useEffect(() => {
    fetchAllSites();
  }, [fetchAllSites]);

  return { sites, loading };
};

