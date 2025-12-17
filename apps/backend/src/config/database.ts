import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Group } from '../entities/Group';
import { User } from '../entities/User';
import { Site } from '../entities/Site';
import { Status } from '../entities/Status';
import { logger } from './logger';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'homevisit',
  password: process.env.DB_PASSWORD || 'homevisit_password',
  database: process.env.DB_DATABASE || 'homevisit_db',
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

