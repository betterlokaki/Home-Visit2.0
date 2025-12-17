import React from 'react';

interface SitesHeaderProps {
  onLogout: () => void;
}

export const SitesHeader: React.FC<SitesHeaderProps> = ({ onLogout }) => {
  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold text-text-solid">ביקורי בית</h1>
        <img
          src="/house-icon.svg"
          alt="Logo"
          className="w-8 h-8 flex-shrink-0"
          style={{
            filter: 'brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(1352%) hue-rotate(201deg) brightness(97%) contrast(89%)',
          }}
        />
      </div>
      <button
        onClick={onLogout}
        className="px-4 py-2 bg-container border border-border rounded-lg text-text hover:bg-floating flex-shrink-0"
      >
        התנתק
      </button>
    </div>
  );
};

