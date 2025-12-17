import { SeenStatus } from './SeenStatus';

export interface Status {
  statusId: number;
  siteId: number;
  seenStatus: SeenStatus;
  time: Date;
  windowStartTime: Date;
}

