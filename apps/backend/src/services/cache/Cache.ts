import { ICache } from './interfaces/ICache';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export class Cache implements ICache {
  private readonly store: Map<string, CacheEntry<unknown>> = new Map();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    const now = Date.now();
    const expiresAt = now + ttlSeconds * 1000;
    this.store.set(key, {
      value,
      expiresAt,
      createdAt: now,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  getTimeUntilExpiry(key: string): number | null {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.expiresAt - now;
  }

  isExpiringSoon(key: string, thresholdPercentage: number): boolean {
    const entry = this.store.get(key);
    if (!entry) {
      return false;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }

    const totalLifetime = entry.expiresAt - entry.createdAt;
    const remainingTime = entry.expiresAt - now;
    const remainingPercentage = remainingTime / totalLifetime;

    return remainingPercentage <= thresholdPercentage;
  }
}

