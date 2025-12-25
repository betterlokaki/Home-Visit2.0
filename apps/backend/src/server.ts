import { initializeDatabase } from './config/database';
import { logger } from './config/logger';
import app, { config } from './app';
import { otelSDK } from './config/otel';

const PORT = config.backend.port;

const startServer = async (): Promise<void> => {
  if (otelSDK) {
    otelSDK.start();
  }
  
  await initializeDatabase();
  
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

startServer();

