import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import groupsRoutes from './routes/groups';
import usersRoutes from './routes/users';
import sitesRoutes from './routes/sites';
import configRoutes from './routes/config';
import { ConfigLoader } from './services/configLoader/ConfigLoader';

const app: express.Application = express();

const configLoader = new ConfigLoader();
export const config = configLoader.loadConfig();

app.use(cors());
app.use(express.json());
app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  })
);

app.use('/api/groups', groupsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api/config', configRoutes);

app.use(errorHandler);

export default app;

