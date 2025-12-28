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

  let isDevelopment = false;
  try {
    isDevelopment = appConfig?.backend?.environment === 'development';
  } catch (configError) {
    // Config not available, default to production
    isDevelopment = false;
  }

  const responseBody: { error: string; message?: string } = {
    error: 'Internal server error',
  };

  if (isDevelopment) {
    responseBody.message = err.message;
  }

  res.status(500).json(responseBody);
};

