import { apiClient } from './apiClient';
import type { User } from '@home-visit/common';

export const usersService = {
  async getUsersByGroup(groupName: string): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users', {
      params: { group: groupName },
    });
    return response.data;
  },
};

