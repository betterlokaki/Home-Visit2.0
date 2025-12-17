import { Site, SeenStatus, Status, CoverStatus } from '@home-visit/common';

export interface SitesFilterRequest {
  group: string;
  status?: SeenStatus[];
  usernames?: string[];
  coverStatus?: CoverStatus[];
  dates?: {
    From: Date;
    To: Date;
  };
}

export interface ISitesService {
  getSitesByFilters(filter: SitesFilterRequest): Promise<Site[]>;
  updateStatus(siteName: string, date: Date, seenStatus: SeenStatus): Promise<Status>;
}

