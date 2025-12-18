import React from 'react';
import { Zap } from 'lucide-react';
import type { CoverStatus } from '@home-visit/common';

interface GitHubProjectButtonProps {
  siteLink: string | 'no data available' | undefined;
  coverStatus: CoverStatus | 'no data available' | undefined;
}

export const GitHubProjectButton: React.FC<GitHubProjectButtonProps> = ({
  siteLink,
  coverStatus,
}) => {
  const isDisabled =
    coverStatus === 'no data available' ||
    coverStatus === 'Empty' ||
    siteLink === 'no data available' ||
    !siteLink ||
    siteLink.trim() === '';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!isDisabled && siteLink && siteLink !== 'no data available') {
      window.open(siteLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`p-1.5 rounded-lg font-medium transition-colors ${
        isDisabled
          ? 'opacity-50 cursor-not-allowed bg-container border border-border text-text'
          : 'bg-container border border-border text-text hover:bg-floating cursor-pointer'
      }`}
      title="פתח ביקור"
      aria-label="פתח ביקור"
    >
      <Zap className="w-4 h-4" />
    </button>
  );
};

