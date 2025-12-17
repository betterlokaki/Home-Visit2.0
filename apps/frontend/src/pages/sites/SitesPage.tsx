import React, { useState, useRef } from 'react';
import type { SeenStatus, CoverStatus } from '@home-visit/common';
import { useAuth } from '../../contexts/AuthContext';
import { useSitesData } from '../../hooks/useSitesData';
import { SitesHeader } from '../../components/sites/SitesHeader';
import { TimeframeNavigation } from '../../components/TimeframeNavigation';
import { SitesFilters } from '../../components/sites/SitesFilters';
import { SitesList } from '../../components/SitesList';
import { MapComponent, type MapComponentRef } from '../../components/map/MapComponent';

interface SitesFiltersState {
  usernames?: string[];
  status?: SeenStatus[];
  coverStatus?: CoverStatus[];
  awaitingVisit?: boolean;
}

export const SitesPage: React.FC = () => {
  const { group, logout } = useAuth();
  const [currentTimeframe, setCurrentTimeframe] = useState<Date>(new Date());
  const [filters, setFilters] = useState<SitesFiltersState>({});
  const { sites, loading, refreshSeconds, refreshSites } = useSitesData({
    group,
    currentTimeframe,
    filters,
  });
  const mapRef = useRef<MapComponentRef>(null);
  const sitesListRef = useRef<HTMLDivElement>(null);

  const navigateTimeframe = (direction: 'prev' | 'next') => {
    const change = direction === 'next' ? refreshSeconds : -refreshSeconds;
    setCurrentTimeframe((prev) => new Date(prev.getTime() + change * 1000));
  };

  const timeframeEndDate = new Date(currentTimeframe.getTime() + refreshSeconds * 1000);
  const canNavigateForward = timeframeEndDate <= new Date();

  const handlePolygonClick = (siteId: number): void => {
    const cardElement = document.getElementById(`site-card-${siteId}`);
    if (cardElement && sitesListRef.current) {
      cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        cardElement.click();
      }, 300);
    }
  };

  const handleSiteCardClick = (siteId: number): void => {
    if (mapRef.current) {
      mapRef.current.flyToSite(siteId);
    }
  };

  return (
    <div className="h-screen bg-background overflow-x-hidden flex flex-col" dir="rtl">
      <div className="px-4 pt-2 pb-1 flex-shrink-0">
        <SitesHeader onLogout={logout} />
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
        <div
          ref={sitesListRef}
          className="w-full md:w-1/2 flex flex-col overflow-hidden"
        >
          <div style={{ direction: 'rtl' }} className="flex-shrink-0">
            {group && (
              <SitesFilters
                groupName={group.groupName}
                onFiltersChange={setFilters}
              />
            )}
            <div className="flex items-center justify-center py-2">
              <TimeframeNavigation
                currentTimeframe={currentTimeframe}
                onNavigate={navigateTimeframe}
                canNavigateForward={canNavigateForward}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ direction: 'ltr' }}>
            <div style={{ direction: 'rtl' }} className="p-2">
              <SitesList
                key={currentTimeframe.getTime()}
                sites={sites}
                loading={loading}
                currentTimeframe={currentTimeframe}
                onSitesUpdate={refreshSites}
                onSiteCardClick={handleSiteCardClick}
              />
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 border-r border-border overflow-hidden">
          <MapComponent
            ref={mapRef}
            sites={sites}
            onPolygonClick={handlePolygonClick}
          />
        </div>
      </div>
    </div>
  );
};
