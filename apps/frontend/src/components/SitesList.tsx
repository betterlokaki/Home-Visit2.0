import React, { useState } from 'react';
import type { Site, SeenStatus } from '@home-visit/common';
import { SiteCard } from './SiteCard';
import { sitesService } from '../services/sitesService';
import { logger } from '../utils/logger';

interface SitesListProps {
  sites: Site[];
  loading: boolean;
  currentTimeframe: Date;
  onSitesUpdate: () => void;
  onSiteCardClick?: (siteId: number) => void;
}

export const SitesList: React.FC<SitesListProps> = ({
  sites,
  loading,
  currentTimeframe,
  onSitesUpdate,
  onSiteCardClick,
}) => {
  const [openSiteId, setOpenSiteId] = useState<number | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Map<number, SeenStatus>
  >(new Map());

  const handleToggle = (siteId: number) => {
    if (openSiteId === siteId) {
      setOpenSiteId(null);
    } else {
      setOpenSiteId(siteId);
    }
  };

  const handleStatusUpdate = async (
    site: Site,
    seenStatus: SeenStatus
  ): Promise<void> => {
    // Optimistic update
    setOptimisticUpdates((prev) => {
      const newMap = new Map(prev);
      newMap.set(site.siteId, seenStatus);
      return newMap;
    });

    try {
      await sitesService.updateStatus({
        siteName: site.siteName,
        date: currentTimeframe,
        seenStatus,
      });
      // Refresh sites data after successful update
      onSitesUpdate();
      // Clear optimistic update after successful sync
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(site.siteId);
        return newMap;
      });
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticUpdates((prev) => {
        const newMap = new Map(prev);
        newMap.delete(site.siteId);
        return newMap;
      });
      // Log error but don't throw - let the component continue functioning
      logger.error('Failed to update site status', {
        siteName: site.siteName,
        seenStatus,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const getSiteWithOptimisticStatus = (site: Site): Site => {
    const optimisticStatus = optimisticUpdates.get(site.siteId);
    if (optimisticStatus) {
      return {
        ...site,
        status: site.status
          ? {
              ...site.status,
              seenStatus: optimisticStatus,
            }
          : {
              statusId: 0,
              siteId: site.siteId,
              seenStatus: optimisticStatus,
              time: new Date(),
              windowStartTime: currentTimeframe,
            },
      };
    }
    return site;
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-text">
        <p>טוען...</p>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="text-center py-12 text-text">
        <p>לא נמצאו אתרים</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sites.map((site: Site) => {
        const siteWithStatus = getSiteWithOptimisticStatus(site);
        return (
          <div key={site.siteId} id={`site-card-${site.siteId}`}>
            <SiteCard
              site={siteWithStatus}
              isOpen={openSiteId === site.siteId}
              onToggle={() => handleToggle(site.siteId)}
              onStatusUpdate={(seenStatus) =>
                handleStatusUpdate(site, seenStatus)
              }
              onMapFlyTo={onSiteCardClick}
            />
          </div>
        );
      })}
    </div>
  );
};

