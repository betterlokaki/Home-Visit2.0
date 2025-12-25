export interface ICacheRefreshQueue {
  enqueueRefresh(key: string, refreshFn: () => Promise<void>): void;
  getQueueSize(): number;
}

