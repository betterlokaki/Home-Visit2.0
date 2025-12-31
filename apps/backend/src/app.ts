import 'reflect-metadata';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { userContextMiddleware } from './middleware/userContext';
import groupsRoutes from './routes/groups';
import usersRoutes from './routes/users';
import sitesRoutes from './routes/sites';
import configRoutes from './routes/config';
import logsRoutes from './routes/logs';
import { appConfig } from './config/configLoader';

const app: express.Application = express();
export const config = appConfig;

app.use(cors());
app.use(express.json());
app.use(userContextMiddleware);
app.use((_req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});
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
app.use('/api/logs', logsRoutes);

app.use(errorHandler);

export default app;
