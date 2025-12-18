import React, { useMemo } from 'react';
import type { Site } from '@home-visit/common';

interface SitesProgressBarProps {
  sites: Site[];
  loading: boolean;
}

export const SitesProgressBar: React.FC<SitesProgressBarProps> = ({
  sites,
  loading,
}) => {
  const { seenCount, totalCount, percentage } = useMemo(() => {
    if (!sites || sites.length === 0) {
      return { seenCount: 0, totalCount: 0, percentage: 0 };
    }

    const seen = sites.filter(
      (site) => site.status?.seenStatus === 'Seen'
    ).length;

    return {
      seenCount: seen,
      totalCount: sites.length,
      percentage: sites.length > 0 ? (seen / sites.length) * 100 : 0,
    };
  }, [sites]);

  return (
    <div className="px-4 py-3 border-b border-border bg-container" dir="rtl">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <div className="h-3 w-full bg-floating rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-600 via-green-500 to-green-400 rounded-full transition-all duration-500 ease-out shadow-lg shadow-green-500/30"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        <div className="text-sm text-text whitespace-nowrap font-medium min-w-[60px] text-right">
          {loading ? (
            <span className="text-text/60">טוען...</span>
          ) : (
            <span>
              {seenCount} / {totalCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

