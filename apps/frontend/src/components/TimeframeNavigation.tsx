import React from 'react';
import dayjs from 'dayjs';
import { useLogger } from '../hooks/useLogger';

interface TimeframeNavigationProps {
  currentTimeframe: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
  onNavigateToToday: () => void;
  canNavigateForward: boolean;
}

export const TimeframeNavigation: React.FC<TimeframeNavigationProps> = ({
  currentTimeframe,
  onNavigate,
  onNavigateToToday,
  canNavigateForward,
}) => {
  const logger = useLogger();
  const windowStartTime = currentTimeframe;
  
  return (
    <div className="mb-2 flex items-center justify-center gap-2 px-2">
      <button
        onClick={() => {
          logger.info('Button clicked', { buttonName: 'timeframe_prev' });
          onNavigate('prev');
        }}
        className="px-2 py-1 text-sm bg-primary text-white rounded-lg hover:opacity-90"
      >
        קודם →
      </button>
      <div className="px-2 py-1 text-sm bg-container border border-border rounded-lg text-text-solid">
        {dayjs(windowStartTime).format('DD/MM/YYYY HH:mm')}
      </div>
      <button
        onClick={() => {
          logger.info('Button clicked', { buttonName: 'timeframe_today' });
          onNavigateToToday();
        }}
        className="px-2 py-1 text-sm bg-secondary text-white rounded-lg hover:opacity-90"
      >
        היום
      </button>
      <button
        onClick={() => {
          logger.info('Button clicked', { buttonName: 'timeframe_next' });
          onNavigate('next');
        }}
        disabled={!canNavigateForward}
        className={`px-2 py-1 text-sm bg-primary text-white rounded-lg ${
          canNavigateForward ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'
        }`}
      >
        ← הבא
      </button>
    </div>
  );
};

