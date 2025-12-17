import { Group } from '../group/Group';
import { User } from '../user/User';
import { Status } from '../status/Status';
import { CoverStatus } from '../coverStatus/CoverStatus';

export interface Site {
  siteId: number;
  siteName: string;
  siteDisplayName: string;
  group: Group;
  user: User;
  refreshSeconds: number | null;
  geometry: string | null;
  status?: Status;
  coverStatus?: CoverStatus | 'no data available';
  siteLink?: string | 'no data available';
}

