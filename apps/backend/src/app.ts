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

const app: express.Application = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
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

