import React from 'react';
import type { SeenStatus, CoverStatus, Group } from '@home-visit/common';
import { UserDropdown } from './UserDropdown';
import { ExcelDownloadButton } from './ExcelDownloadButton';
import { useSitesFilters } from './useSitesFilters';
import { useSitesHistoryData } from '../../hooks/useSitesHistoryData';
import { generateExcelReport } from '../../services/excelService';
import { useLogger } from '../../hooks/useLogger';

interface SitesFiltersProps {
  groupName: string;
  onFiltersChange: (filters: {
    usernames?: string[];
    status?: SeenStatus[];
    coverStatus?: CoverStatus[];
    awaitingVisit?: boolean;
  }) => void;
  currentTimeframe: Date;
  refreshSeconds: number;
  group: Group;
}

export const SitesFilters: React.FC<SitesFiltersProps> = ({
  groupName,
  onFiltersChange,
  currentTimeframe,
  refreshSeconds,
  group,
}) => {
  const logger = useLogger();
  const {
    users,
    selectedUsernames,
    setSelectedUsernames,
    emptyCover,
    setEmptyCover,
    awaitingVisit,
    setAwaitingVisit,
    completed,
    setCompleted,
    coverNotSatisfied,
    setCoverNotSatisfied,
  } = useSitesFilters({ groupName, onFiltersChange });

  const { fetchSitesHistory, loading: isDownloading } = useSitesHistoryData();

  const handleDownload = async () => {
    const { sitesByTimeframe, allSites } = await fetchSitesHistory(
      group,
      currentTimeframe,
      refreshSeconds,
      7
    );
    generateExcelReport(sitesByTimeframe, allSites);
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b border-gray-700">
      <div className="flex flex-wrap gap-2 items-center flex-1">
        <UserDropdown
          users={users}
          selectedUsernames={selectedUsernames}
          onSelectionChange={setSelectedUsernames}
        />

        <button
          type="button"
          onClick={() => {
            logger.info('Button clicked', { buttonName: 'filter_empty_cover', filterState: !emptyCover });
            setEmptyCover(!emptyCover);
          }}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            emptyCover
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
          }`}
        >
          אין איסוף
        </button>

        <button
          type="button"
          onClick={() => {
            logger.info('Button clicked', { buttonName: 'filter_awaiting_visit', filterState: !awaitingVisit });
            setAwaitingVisit(!awaitingVisit);
          }}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            awaitingVisit
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
          }`}
        >
          מחכה לביקור
        </button>

        <button
          type="button"
          onClick={() => {
            logger.info('Button clicked', { buttonName: 'filter_cover_not_satisfied', filterState: !coverNotSatisfied });
            setCoverNotSatisfied(!coverNotSatisfied);
          }}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            coverNotSatisfied
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
          }`}
        >
          איסוף לא מספק
        </button>

        <button
          type="button"
          onClick={() => {
            logger.info('Button clicked', { buttonName: 'filter_completed', filterState: !completed });
            setCompleted(!completed);
          }}
          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
            completed
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
          }`}
        >
          בוצע
        </button>
      </div>

      <ExcelDownloadButton onClick={handleDownload} disabled={isDownloading} />
    </div>
  );
};

