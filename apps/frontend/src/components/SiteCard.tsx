import React from 'react';
import type { Site, SeenStatus } from '@home-visit/common';
import { getStatusDisplay } from '../utils/statusDisplay';
import { StatusButtons } from './sites/StatusButtons';
import { GitHubProjectButton } from './sites/GitHubProjectButton';
import { useLogger } from '../hooks/useLogger';

interface SiteCardProps {
  site: Site;
  isOpen: boolean;
  onToggle: () => void;
  onStatusUpdate: (seenStatus: SeenStatus) => void;
  onMapFlyTo?: (siteId: number) => void;
}

export const SiteCard: React.FC<SiteCardProps> = ({
  site,
  isOpen,
  onToggle,
  onStatusUpdate,
  onMapFlyTo,
}) => {
  const logger = useLogger();
  const statusDisplay = getStatusDisplay(
    site.coverStatus,
    site.status?.seenStatus,
    isOpen
  );

  const getStatusColorClass = (color: string): string => {
    switch (color) {
      case 'red':
        return 'bg-error-bg border-error-border text-error-text';
      case 'yellow':
        return 'bg-warning-bg border-warning-border text-warning-text';
      case 'orange':
        return 'bg-orange-900 border-orange-700 text-orange-300';
      case 'green':
        return 'bg-green-900 border-green-700 text-green-300';
      case 'blue':
        return 'bg-info-bg border-info-border text-info-text';
      default:
        return 'bg-info-bg border-info-border text-info-text';
    }
  };

  const handleCardClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    logger.info('Site clicked', { siteId: site.siteId });
    onToggle();
    if (onMapFlyTo) {
      // Use setTimeout to ensure the toggle happens first, then flyTo
      setTimeout(() => {
        onMapFlyTo(site.siteId);
      }, 0);
    }
  };

  return (
    <div
      className="p-3 bg-container border border-border rounded-lg hover:border-primary transition-colors cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-1.5">
        <span
          className={`pl-0.5 pr-0.5 py-0.5 border rounded text-xs ${getStatusColorClass(
            statusDisplay.color
          )}`}
        >
          {statusDisplay.text}
        </span>
        <div
          className="flex items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {isOpen && (
            <>
              <StatusButtons
                coverStatus={site.coverStatus}
                currentSeenStatus={site.status?.seenStatus}
                onStatusClick={onStatusUpdate}
                siteId={site.siteId}
              />
              <span className="text-text text-base">|</span>
            </>
          )}
          <GitHubProjectButton
            siteLink={site.siteLink}
            coverStatus={site.coverStatus}
            siteId={site.siteId}
          />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-text-solid mb-1.5">
        {site.siteDisplayName}
      </h3>
      <p className="text-text text-sm mb-1.5">אחראי: {site.user.userDisplayName}</p>
    </div>
  );
};

