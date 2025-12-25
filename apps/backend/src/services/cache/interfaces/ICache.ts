export interface ICache {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttlSeconds: number): void;
  delete(key: string): void;
  clear(): void;
  getTimeUntilExpiry(key: string): number | null;
  isExpiringSoon(key: string, thresholdPercentage: number): boolean;
}

