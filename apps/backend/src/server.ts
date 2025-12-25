import { initializeDatabase } from './config/database';
import { logger } from './config/logger';
import app, { config } from './app';

const PORT = config.backend.port;

const startServer = async (): Promise<void> => {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

startServer();

