import { CoverStatus } from '@home-visit/common';

export interface CoverStatusAndLinkResult {
  siteName: string;
  coverStatus: CoverStatus | 'no data available';
  siteLink: string | 'no data available';
}

export interface ICoverStatusAndLinkService {
  getCoverStatusAndLink(
    sites: Array<{ siteName: string; geometry: string; refreshSeconds: number }>,
    timeRange: { from: Date; to: Date }
  ): Promise<CoverStatusAndLinkResult[]>;
}

