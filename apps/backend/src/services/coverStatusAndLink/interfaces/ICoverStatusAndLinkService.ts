import { CoverStatus } from '@home-visit/common';
import { TimeRange } from '../timeWindowUtils';

export interface CoverStatusAndLinkResult {
  siteName: string;
  coverStatus: CoverStatus | 'no data available';
  siteLink: string | 'no data available';
}

export interface ICoverStatusAndLinkService {
  getCoverStatusAndLink(
    groupName: string,
    sites: Array<{ siteName: string; geometry: string; refreshSeconds: number }>,
    timeRange: TimeRange
  ): Promise<CoverStatusAndLinkResult[]>;
}

