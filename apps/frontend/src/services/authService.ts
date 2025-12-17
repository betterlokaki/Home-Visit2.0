import { apiClient } from './apiClient';
import type { User } from '@home-visit/common';

export const authService = {
  async login(username: string): Promise<User> {
    const response = await apiClient.get<User>('/users', {
      params: { username },
    });

    if (!response.data) {
      throw new Error('User not found');
    }

    const user = response.data;
    if (!user.group) {
      throw new Error('User has no associated group');
    }

    return user;
  },
};

