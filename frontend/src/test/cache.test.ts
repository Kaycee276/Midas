import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCacheKey,
  getFromCache,
  saveToCache,
  invalidateCache,
  clearCache,
  handleMutationInvalidation,
} from '../api/cache';

describe('Frontend API Caching Engine', () => {
  beforeEach(() => {
    clearCache();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('generates consistent deterministic cache keys', () => {
    const key1 = getCacheKey('/public/merchants', { page: 1, limit: 10 });
    const key2 = getCacheKey('/public/merchants', { limit: 10, page: 1 });
    expect(key1).toBe(key2);
    expect(key1).toContain('/public/merchants?');
  });

  it('saves and retrieves data from cache immediately (0ms)', () => {
    const key = '/public/merchants/test-123';
    const payload = { id: 'test-123', name: 'Campus Beanery' };

    saveToCache(key, payload, 5000);
    const cached = getFromCache<typeof payload>(key);

    expect(cached).toEqual(payload);
  });

  it('returns null when cached item TTL expires', () => {
    const key = '/public/merchants/expire-test';
    const payload = { temp: true };

    saveToCache(key, payload, 100);

    // Advance time past TTL
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 500);

    const cached = getFromCache(key);
    expect(cached).toBeNull();
  });

  it('invalidates specific cache entries by string prefix or pattern', () => {
    saveToCache('/public/merchants/1', { id: 1 }, 10000);
    saveToCache('/public/merchants/2', { id: 2 }, 10000);
    saveToCache('/wallet/balance', { balance: 500 }, 10000);

    invalidateCache('/public/merchants');

    expect(getFromCache('/public/merchants/1')).toBeNull();
    expect(getFromCache('/public/merchants/2')).toBeNull();
    expect(getFromCache('/wallet/balance')).toEqual({ balance: 500 });
  });

  it('handles mutation invalidation for investments and wallet', () => {
    saveToCache('/investments/portfolio', { total: 100 }, 10000);
    saveToCache('/wallet/balance', { balance: 5000 }, 10000);
    saveToCache('/public/merchants?page=1', { count: 3 }, 10000);

    // Simulating POST /investments
    handleMutationInvalidation('/investments', 'post');

    expect(getFromCache('/investments/portfolio')).toBeNull();
    expect(getFromCache('/wallet/balance')).toBeNull();
    expect(getFromCache('/public/merchants?page=1')).toBeNull();
  });
});
