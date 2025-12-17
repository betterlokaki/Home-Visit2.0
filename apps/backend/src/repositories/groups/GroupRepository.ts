import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/database';
import { Group } from '../../entities/Group';
import { IGroupRepository } from './interfaces/IGroupRepository';

export class GroupRepository implements IGroupRepository {
  private getRepository(): Repository<Group> {
    if (!AppDataSource.isInitialized) {
      throw new Error('Database connection is not initialized');
    }
    return AppDataSource.getRepository(Group);
  }

  async findAll(): Promise<Group[]> {
    return await this.getRepository().find();
  }
}

