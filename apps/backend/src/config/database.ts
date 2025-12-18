import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Group } from '../entities/Group';
import { User } from '../entities/User';
import { Site } from '../entities/Site';
import { Status } from '../entities/Status';
import { logger } from './logger';
import { ConfigLoader } from '../services/configLoader/ConfigLoader';

const configLoader = new ConfigLoader();
const config = configLoader.loadConfig();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: config.database.url,
  entities: [Group, User, Site, Status],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    logger.info('Database connection established');
  } catch (error) {
    logger.error('Error connecting to database:', error);
    throw error;
  }
};

