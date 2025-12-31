import React from 'react';
import { Download } from 'lucide-react';
import { useLogger } from '../../hooks/useLogger';

interface ExcelDownloadButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const ExcelDownloadButton: React.FC<ExcelDownloadButtonProps> = ({
  onClick,
  disabled,
}) => {
  const logger = useLogger();

  const handleClick = () => {
    logger.info('Button clicked', { buttonName: 'download_excel' });
    onClick();
  };

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`p-1.5 rounded text-sm transition-colors flex items-center justify-center ${
          disabled
            ? 'bg-gray-500 cursor-not-allowed text-gray-300'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-100'
        }`}
      >
        <Download size={14} />
      </button>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        הורד דו״ח סיכומי
      </div>
    </div>
  );
};

