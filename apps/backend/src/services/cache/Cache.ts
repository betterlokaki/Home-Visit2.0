import { ICache } from './interfaces/ICache';

/**
 * Internal cache entry structure.
 * @template T - Type of the cached value
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

/**
 * In-memory cache implementation with TTL support.
 * 
 * Provides thread-safe caching with expiration, time-until-expiry tracking,
 * and expiring-soon detection for proactive refresh.
 */
export class Cache implements ICache {
  private readonly store: Map<string, CacheEntry<unknown>> = new Map();

  /**
   * Retrieves a value from the cache.
   * 
   * @param key - Cache key to retrieve
   * @returns Cached value or null if not found or expired
   * @template T - Expected type of the cached value
   */
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

  /**
   * Stores a value in the cache with a time-to-live (TTL).
   * 
   * @param key - Cache key to store the value under
   * @param value - Value to cache
   * @param ttlSeconds - Time-to-live in seconds
   * @template T - Type of the value being cached
   */
  set<T>(key: string, value: T, ttlSeconds: number): void {
    const now = Date.now();
    const expiresAt = now + ttlSeconds * 1000;
    this.store.set(key, {
      value,
      expiresAt,
      createdAt: now,
    });
  }

  /**
   * Deletes a cache entry by key.
   * 
   * @param key - Cache key to delete
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Clears all cache entries.
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Gets the time remaining until a cache entry expires.
   * 
   * @param key - Cache key to check
   * @returns Milliseconds until expiry, or null if entry doesn't exist or is expired
   */
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

  /**
   * Checks if a cache entry is expiring soon based on a threshold percentage.
   * 
   * @param key - Cache key to check
   * @param thresholdPercentage - Threshold as a decimal (e.g., 0.8 for 80%)
   * @returns True if remaining lifetime is <= threshold, false otherwise
   */
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

