import { CoverStatus } from '../coverStatus/CoverStatus';

export interface CoverStatusHistoryResponseItem {
  date: string;
  status: CoverStatus;
}

export interface CoverStatusHistoryResponse {
  [responseKey: string]: CoverStatusHistoryResponseItem[];
}

