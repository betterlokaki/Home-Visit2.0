import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Group } from '../entities/Group';
import { User } from '../entities/User';
import { Site } from '../entities/Site';
import { Status } from '../entities/Status';
import { logger } from './logger';
import { appConfig } from './configLoader';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: appConfig.database.url,
  entities: [Group, User, Site, Status],
  synchronize: false,
  logging: appConfig.backend.environment === 'development',
});

export const initializeDatabase = async (): Promise<void> => {
  await AppDataSource.initialize();
  logger.info('Database connection established');
};

