import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { appConfig } from '../config/configLoader';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: 'Internal server error',
    message: appConfig.backend.environment === 'development' ? err.message : undefined,
  });
};

