import { apiClient } from './apiClient';
import type { Site, SeenStatus, CoverStatus } from '@home-visit/common';

export interface SitesFilterRequest {
  group: string;
  usernames?: string[];
  status?: SeenStatus[];
  coverStatus?: CoverStatus[];
  dates?: {
    From: Date;
    To: Date;
  };
}

export interface UpdateStatusRequest {
  siteName: string;
  date: Date;
  seenStatus: SeenStatus;
}

export const sitesService = {
  async getSitesByFilters(filter: SitesFilterRequest): Promise<Site[]> {
    const response = await apiClient.post<Site[]>('/sites', filter);
    return response.data;
  },

  async updateStatus(request: UpdateStatusRequest): Promise<void> {
    await apiClient.put('/sites/status/update', request);
  },
};

