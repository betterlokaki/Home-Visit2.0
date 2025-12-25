import PQueue from 'p-queue';
import { ICacheRefreshQueue } from './interfaces/ICacheRefreshQueue';
import { logger } from '../../config/logger';

export class CacheRefreshQueue implements ICacheRefreshQueue {
  private readonly queue: PQueue<any>;
  private readonly queuedKeys: Set<string> = new Set();

  constructor(maxConcurrency: number) {
    this.queue = new PQueue<any>({ concurrency: maxConcurrency });
  }

  enqueueRefresh(key: string, refreshFn: () => Promise<void>): void {
    if (this.queuedKeys.has(key)) {
      logger.debug('Cache refresh already queued', { cacheKey: key });
      return;
    }

    this.queuedKeys.add(key);
    logger.info('Cache refresh queued', { cacheKey: key, queueSize: this.queue.size });

    this.queue
      .add(async () => {
        logger.debug('Cache refresh started', { cacheKey: key });
        try {
          await refreshFn();
          logger.info('Cache refresh completed', { cacheKey: key });
        } catch (error) {
          logger.error('Cache refresh failed', { cacheKey: key, error });
          throw error;
        } finally {
          this.queuedKeys.delete(key);
        }
      })
      .catch((error) => {
        logger.error('Queue task error', { cacheKey: key, error });
        this.queuedKeys.delete(key);
      });
  }

  getQueueSize(): number {
    return this.queue.size;
  }
}

