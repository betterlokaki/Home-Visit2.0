import React from 'react';
import type { CoverStatus, SeenStatus } from '@home-visit/common';
import { useLogger } from '../../hooks/useLogger';

interface StatusButtonsProps {
  coverStatus: CoverStatus | 'no data available' | undefined;
  currentSeenStatus: SeenStatus | undefined;
  onStatusClick: (seenStatus: SeenStatus) => void;
  siteId: number;
}

export const StatusButtons: React.FC<StatusButtonsProps> = ({
  coverStatus,
  currentSeenStatus,
  onStatusClick,
  siteId,
}) => {
  const logger = useLogger();
  const isFullCover = coverStatus === 'Full';
  const isPartialOrFullCover =
    coverStatus === 'Full' || coverStatus === 'Partial';
  const isEmptyCover = !coverStatus || coverStatus === 'Empty' || coverStatus === 'no data available';
  
  const isDoneDisabled = !isFullCover;
  const isPartialDoneDisabled = !isPartialOrFullCover;
  const isCoverNotSatisfiedDisabled = isEmptyCover;

  const isDoneActive = currentSeenStatus === 'Seen';
  const isPartialDoneActive = currentSeenStatus === 'Partial Seen';
  const isCoverNotSatisfiedActive = currentSeenStatus === 'Cover Not Satisfied';
  const isNotDoneActive = currentSeenStatus === 'Not Seen' || !currentSeenStatus;

  return (
    <div className="flex gap-1.5 flex-wrap">
      <button
        onClick={() => {
          if (!isDoneDisabled) {
            logger.info('Button clicked', { buttonName: 'status_seen', siteId });
            onStatusClick('Seen' as SeenStatus);
          }
        }}
        disabled={isDoneDisabled}
        className={`pl-1 pr-1 py-1 rounded-lg font-medium text-sm transition-colors ${
          isDoneActive
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-container border border-border text-text hover:bg-floating'
        } ${isDoneDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        בוצע
      </button>
      <button
        onClick={() => {
          if (!isPartialDoneDisabled) {
            logger.info('Button clicked', { buttonName: 'status_partial_seen', siteId });
            onStatusClick('Partial Seen' as SeenStatus);
          }
        }}
        disabled={isPartialDoneDisabled}
        className={`pl-1 pr-1 py-1 rounded-lg font-medium text-sm transition-colors ${
          isPartialDoneActive
            ? 'bg-orange-600 hover:bg-orange-700 text-white'
            : 'bg-container border border-border text-text hover:bg-floating'
        } ${isPartialDoneDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        בוצע חלקית
      </button>
      <button
        onClick={() => {
          if (!isCoverNotSatisfiedDisabled) {
            logger.info('Button clicked', { buttonName: 'status_cover_not_satisfied', siteId });
            onStatusClick('Cover Not Satisfied' as SeenStatus);
          }
        }}
        disabled={isCoverNotSatisfiedDisabled}
        className={`pl-1 pr-1 py-1 rounded-lg font-medium text-sm transition-colors ${
          isCoverNotSatisfiedActive
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-container border border-border text-text hover:bg-floating'
        } ${isCoverNotSatisfiedDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        איסוף לא מספק
      </button>
      <button
        onClick={() => {
          logger.info('Button clicked', { buttonName: 'status_not_seen', siteId });
          onStatusClick('Not Seen' as SeenStatus);
        }}
        className={`pl-1 pr-1 py-1 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
          isNotDoneActive
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-container border border-border text-text hover:bg-floating'
        }`}
      >
        לא בוצע
      </button>
    </div>
  );
};

