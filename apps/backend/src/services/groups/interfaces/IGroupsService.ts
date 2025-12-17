import { Group } from '@home-visit/common';

export interface IGroupsService {
  getAllGroups(): Promise<Group[]>;
}

