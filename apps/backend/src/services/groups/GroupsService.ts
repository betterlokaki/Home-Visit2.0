import { Group as CommonGroup } from '@home-visit/common';
import { Group } from '../../entities/Group';
import { IGroupRepository } from '../../repositories/groups/interfaces/IGroupRepository';
import { IGroupsService } from './interfaces/IGroupsService';

export class GroupsService implements IGroupsService {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async getAllGroups(): Promise<CommonGroup[]> {
    const groups = await this.groupRepository.findAll();
    return groups.map(this.mapToCommonGroup);
  }

  private mapToCommonGroup(group: Group): CommonGroup {
    return {
      groupId: group.groupId,
      groupName: group.groupName,
      groupDisplayName: group.groupDisplayName,
      groupDefaultRefreshSeconds: group.groupDefaultRefreshSeconds,
    };
  }
}

