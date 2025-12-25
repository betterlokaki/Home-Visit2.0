import { Request, Response } from 'express';
import { logger } from '../../config/logger';

interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export class LogsController {
  async receiveLogs(req: Request, res: Response): Promise<void> {
    const logEntries = req.body as LogEntry[];

    if (!Array.isArray(logEntries)) {
      res.status(400).json({ error: 'Request body must be an array of log entries' });
      return;
    }

    for (const entry of logEntries) {
      if (!entry.level || !entry.message) {
        continue;
      }

      const logData: Record<string, unknown> = {
        message: entry.message,
        ...entry.metadata,
      };

      if (entry.timestamp) {
        logData.timestamp = entry.timestamp;
      }

      switch (entry.level) {
        case 'error':
          logger.error(logData);
          break;
        case 'warn':
          logger.warn(logData);
          break;
        case 'info':
          logger.info(logData);
          break;
        case 'debug':
          logger.debug(logData);
          break;
        default:
          logger.info(logData);
      }
    }

    res.status(200).json({ success: true, received: logEntries.length });
  }
}

