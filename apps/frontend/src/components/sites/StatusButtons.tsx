import React from 'react';
import type { CoverStatus, SeenStatus } from '@home-visit/common';

interface StatusButtonsProps {
  coverStatus: CoverStatus | 'no data available' | undefined;
  currentSeenStatus: SeenStatus | undefined;
  onStatusClick: (seenStatus: SeenStatus) => void;
}

export const StatusButtons: React.FC<StatusButtonsProps> = ({
  coverStatus,
  currentSeenStatus,
  onStatusClick,
}) => {
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
        onClick={() => onStatusClick('Not Seen' as SeenStatus)}
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

