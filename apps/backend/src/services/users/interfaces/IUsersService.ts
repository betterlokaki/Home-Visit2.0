import { User } from '@home-visit/common';

export interface IUsersService {
  getUsersByGroupName(groupName: string): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | null>;
}

