import { User } from '../../../entities/User';

export interface IUserRepository {
  findByGroupName(groupName: string): Promise<User[]>;
  findByUsername(username: string): Promise<User | null>;
}

