import PQueue from 'p-queue';
import { ICacheRefreshQueue } from './interfaces/ICacheRefreshQueue';
import { logger } from '../../config/logger';

/**
 * Queue for managing proactive cache refresh operations.
 * 
 * Provides non-blocking background refresh with:
 * - Deduplication (same key can only be queued once)
 * - Concurrency limits
 * - Error handling and logging
 */
export class CacheRefreshQueue implements ICacheRefreshQueue {
  private readonly queue: PQueue<any>;
  private readonly queuedKeys: Set<string> = new Set();

  /**
   * Creates a new cache refresh queue.
   * 
   * @param maxConcurrency - Maximum number of concurrent refresh operations
   */
  constructor(maxConcurrency: number) {
    this.queue = new PQueue<any>({ concurrency: maxConcurrency });
  }

  /**
   * Enqueues a cache refresh operation.
   * 
   * If the key is already queued, the operation is skipped (deduplication).
   * The refresh function is executed asynchronously in the background.
   * 
   * @param key - Cache key to refresh
   * @param refreshFn - Async function to execute for refresh
   */
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
          logger.error('Cache refresh failed', { 
            cacheKey: key, 
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          throw error;
        } finally {
          this.queuedKeys.delete(key);
        }
      })
      .catch((error) => {
        logger.error('Queue task error', { 
          cacheKey: key, 
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
        this.queuedKeys.delete(key);
      });
  }

  /**
   * Gets the current queue size (number of pending refresh operations).
   * 
   * @returns Number of items in the queue
   */
  getQueueSize(): number {
    return this.queue.size;
  }
}

