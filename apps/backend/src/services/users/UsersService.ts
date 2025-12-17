import { User as CommonUser, Group as CommonGroup } from '@home-visit/common';
import { User } from '../../entities/User';
import { IUserRepository } from '../../repositories/users/interfaces/IUserRepository';
import { IUsersService } from './interfaces/IUsersService';

export class UsersService implements IUsersService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getUsersByGroupName(groupName: string): Promise<CommonUser[]> {
    const users = await this.userRepository.findByGroupName(groupName);
    return users.map(this.mapToCommonUser);
  }

  async getUserByUsername(username: string): Promise<CommonUser | null> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      return null;
    }
    return this.mapToCommonUser(user);
  }

  private mapToCommonUser(user: User): CommonUser {
    const commonGroup: CommonGroup = {
      groupId: user.group.groupId,
      groupName: user.group.groupName,
      groupDisplayName: user.group.groupDisplayName,
      groupDefaultRefreshSeconds: user.group.groupDefaultRefreshSeconds,
    };

    return {
      userId: user.userId,
      username: user.username,
      userDisplayName: user.userDisplayName,
      group: commonGroup,
    };
  }
}

