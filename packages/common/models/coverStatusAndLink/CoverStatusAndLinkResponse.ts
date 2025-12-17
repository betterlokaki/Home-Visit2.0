import { CoverStatus } from '../coverStatus/CoverStatus';

export interface CoverStatusAndLinkResponseItem {
  siteName: string;
  status: CoverStatus;
  projectLink: string;
}

export interface CoverStatusAndLinkResponse {
  [responseKey: string]: CoverStatusAndLinkResponseItem[];
}

