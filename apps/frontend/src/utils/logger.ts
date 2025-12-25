import log from 'loglevel';
import axios from 'axios';
import { loggerConfig } from './loggerConfig';

interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private logQueue: LogEntry[] = [];
  private isFlushing = false;

  constructor() {
    this.setupFlushTimer();
    this.setupUnloadHandler();
  }

  private getContext(): Record<string, unknown> {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };
  }

  private createLogEntry(level: 'error' | 'warn' | 'info' | 'debug', message: string, metadata?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      metadata: {
        ...this.getContext(),
        ...metadata,
      },
    };
  }

  private async flushLogs(): Promise<void> {
    if (this.isFlushing || this.logQueue.length === 0) {
      return;
    }

    this.isFlushing = true;
    const logsToSend = [...this.logQueue];
    this.logQueue = [];

    try {
      await axios.post(loggerConfig.endpoint, logsToSend, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      this.logQueue.unshift(...logsToSend);
      if (this.logQueue.length > 100) {
        this.logQueue = this.logQueue.slice(-100);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  private setupFlushTimer(): void {
    setInterval(() => {
      if (this.logQueue.length > 0) {
        this.flushLogs().catch(() => {});
      }
    }, loggerConfig.flushIntervalMs);
  }

  private setupUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      if (this.logQueue.length > 0) {
        navigator.sendBeacon(`${loggerConfig.endpoint}`, JSON.stringify(this.logQueue));
      }
    });
  }

  private addToQueue(entry: LogEntry): void {
    this.logQueue.push(entry);

    if (this.logQueue.length >= loggerConfig.batchSize) {
      this.flushLogs().catch(() => {});
    }
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    log.error(message, metadata);
    this.addToQueue(this.createLogEntry('error', message, metadata));
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    log.warn(message, metadata);
    this.addToQueue(this.createLogEntry('warn', message, metadata));
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    log.info(message, metadata);
    this.addToQueue(this.createLogEntry('info', message, metadata));
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    log.debug(message, metadata);
    this.addToQueue(this.createLogEntry('debug', message, metadata));
  }

  log(message: string, metadata?: Record<string, unknown>): void {
    log.info(message, metadata);
    this.addToQueue(this.createLogEntry('info', message, metadata));
  }

  setLevel(level: log.LogLevelDesc): void {
    log.setLevel(level);
  }
}

export const logger = new Logger();

