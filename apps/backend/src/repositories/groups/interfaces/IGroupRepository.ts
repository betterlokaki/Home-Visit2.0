import { Group } from '../../../entities/Group';

export interface IGroupRepository {
  findAll(): Promise<Group[]>;
}

