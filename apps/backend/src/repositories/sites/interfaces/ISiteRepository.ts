import { Site } from '../../../entities/Site';
import { Status } from '../../../entities/Status';
import { SeenStatus } from '@home-visit/common';

export interface SiteFilterOptions {
  groupName: string;
  statuses?: SeenStatus[];
  usernames?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface ISiteRepository {
  findByFilters(options: SiteFilterOptions): Promise<Site[]>;
  findBySiteName(siteName: string): Promise<Site | null>;
  findStatusBySiteIdAndWindowStartTime(siteId: number, windowStartTime: Date): Promise<Status | null>;
  saveStatus(status: Status): Promise<Status>;
}

