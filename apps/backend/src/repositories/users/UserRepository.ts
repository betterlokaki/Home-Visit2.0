import { Repository } from 'typeorm';
import { AppDataSource } from '../../config/database';
import { User } from '../../entities/User';
import { IUserRepository } from './interfaces/IUserRepository';

export class UserRepository implements IUserRepository {
  private getRepository(): Repository<User> {
    if (!AppDataSource.isInitialized) {
      throw new Error('Database connection is not initialized');
    }
    return AppDataSource.getRepository(User);
  }

  async findByGroupName(groupName: string): Promise<User[]> {
    return await this.getRepository().find({
      where: {
        group: {
          groupName: groupName,
        },
      },
      relations: ['group'],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.getRepository().findOne({
      where: {
        username: username,
      },
      relations: ['group'],
    });
  }
}

