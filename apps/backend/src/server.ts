import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import { logger } from './config/logger';
import app from './app';

dotenv.config();

const PORT = process.env.PORT || 3001;

const startServer = async (): Promise<void> => {
  try {
    await initializeDatabase();
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    logger.warn('Server will start without database connection. Some routes may not work.');
  }
  
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

startServer();

