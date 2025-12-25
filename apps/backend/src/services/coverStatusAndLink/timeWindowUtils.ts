import * as crypto from 'crypto';

export type TimeRange = { from: Date; to: Date };

export const normalizeTimeRange = (timeRange: TimeRange, ttlSeconds: number): TimeRange => {
  const ttlMs = ttlSeconds * 1000;
  return {
    from: new Date(Math.floor(timeRange.from.getTime() / ttlMs) * ttlMs),
    to: new Date(Math.floor(timeRange.to.getTime() / ttlMs) * ttlMs),
  };
};

export const generateCacheKey = (groupName: string, timeRange: TimeRange): string => {
  const keyString = `coverStatusAndLink:${groupName}:${timeRange.from.toISOString()}:${timeRange.to.toISOString()}`;
  return crypto.createHash('sha256').update(keyString).digest('hex');
};

