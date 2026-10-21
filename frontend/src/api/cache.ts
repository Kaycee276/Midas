import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

interface CacheItem<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Memory cache store for ultra-fast instant lookups (0ms)
const memoryCache = new Map<string, CacheItem>();

// Session storage cache prefix for cross-page navigation persistence
const STORAGE_PREFIX = 'midas_cache:';

// Default TTL configurations (in milliseconds)
export const CACHE_TTL = {
  MERCHANTS_LIST: 5 * 60 * 1000, // 5 minutes
  MERCHANT_DETAIL: 5 * 60 * 1000, // 5 minutes
  MERCHANT_INVESTMENTS: 3 * 60 * 1000, // 3 minutes
  BUSINESS_TYPES: 15 * 60 * 1000, // 15 minutes
  PORTFOLIO: 60 * 1000, // 1 minute
  WALLET: 30 * 1000, // 30 seconds
  USER_PROFILE: 5 * 60 * 1000, // 5 minutes
  DEFAULT_GET: 2 * 60 * 1000, // 2 minutes
};

/**
 * Generate a deterministic cache key from an Axios request config or URL + params
 */
export function getCacheKey(url?: string, params?: unknown): string {
  if (!url) return '';
  let paramStr = '';
  if (params && typeof params === 'object') {
    try {
      const sorted = Object.keys(params as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          const val = (params as Record<string, unknown>)[key];
          if (val !== undefined && val !== null) {
            acc[key] = val;
          }
          return acc;
        }, {});
      paramStr = JSON.stringify(sorted);
    } catch {
      paramStr = '';
    }
  }
  return `${url}?${paramStr}`;
}

/**
 * Determine the appropriate TTL for an endpoint URL
 */
export function getEndpointTTL(url?: string): number {
  if (!url) return CACHE_TTL.DEFAULT_GET;

  if (url.includes('/public/business-types')) return CACHE_TTL.BUSINESS_TYPES;
  if (url.includes('/investments/merchants/')) return CACHE_TTL.MERCHANT_INVESTMENTS;
  if (url.includes('/public/merchants')) return CACHE_TTL.MERCHANTS_LIST;
  if (url.includes('/investments/portfolio') || url.includes('/investments/history'))
    return CACHE_TTL.PORTFOLIO;
  if (url.includes('/wallet')) return CACHE_TTL.WALLET;
  if (url.includes('/me') || url.includes('/profile')) return CACHE_TTL.USER_PROFILE;

  return CACHE_TTL.DEFAULT_GET;
}

/**
 * Read data from memory or session storage
 */
export function getFromCache<T = unknown>(key: string): T | null {
  if (!key) return null;

  const now = Date.now();

  // 1. Check memory cache first (instant 0ms)
  const memItem = memoryCache.get(key) as CacheItem<T> | undefined;
  if (memItem) {
    if (now - memItem.timestamp < memItem.ttl) {
      return memItem.data;
    }
    memoryCache.delete(key);
  }

  // 2. Check sessionStorage fallback
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      const parsed: CacheItem<T> = JSON.parse(raw);
      if (now - parsed.timestamp < parsed.ttl) {
        // Hydrate back into memory cache
        memoryCache.set(key, parsed);
        return parsed.data;
      }
      sessionStorage.removeItem(`${STORAGE_PREFIX}${key}`);
    }
  } catch {
    // Session storage unavailable or corrupt
  }

  return null;
}

/**
 * Save data into memory and session storage
 */
export function saveToCache<T = unknown>(key: string, data: T, ttl?: number): void {
  if (!key || data === undefined) return;

  const effectiveTtl = ttl || getEndpointTTL(key);
  const item: CacheItem<T> = {
    data,
    timestamp: Date.now(),
    ttl: effectiveTtl,
  };

  // Save to memory
  memoryCache.set(key, item);

  // Save to sessionStorage (safely ignoring quota errors)
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(item));
  } catch {
    // Ignore storage quota limits
  }
}

/**
 * Invalidate cache entries matching a string prefix or RegExp
 */
export function invalidateCache(pattern?: string | RegExp): void {
  if (!pattern) {
    clearCache();
    return;
  }

  const isMatch = (key: string): boolean => {
    if (typeof pattern === 'string') {
      return key.includes(pattern);
    }
    return pattern.test(key);
  };

  // Invalidate memory
  for (const key of memoryCache.keys()) {
    if (isMatch(key)) {
      memoryCache.delete(key);
    }
  }

  // Invalidate sessionStorage
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        const actualKey = k.slice(STORAGE_PREFIX.length);
        if (isMatch(actualKey)) {
          keysToRemove.push(k);
        }
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // Ignore
  }
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  memoryCache.clear();
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // Ignore
  }
}

/**
 * Creates an Axios adapter or interceptor cache handler
 */
export function handleRequestCache(config: InternalAxiosRequestConfig): {
  cachedResponse?: AxiosResponse;
  config: InternalAxiosRequestConfig;
} {
  const method = (config.method || 'get').toLowerCase();

  // Only cache GET requests
  if (method !== 'get') {
    return { config };
  }

  // Check if caller explicitly bypassed cache
  if ((config as { bypassCache?: boolean }).bypassCache) {
    return { config };
  }

  const key = getCacheKey(config.url, config.params);
  const cachedData = getFromCache(key);

  if (cachedData !== null) {
    const fakeResponse: AxiosResponse = {
      data: cachedData,
      status: 200,
      statusText: 'OK (from cache)',
      headers: {},
      config,
    };
    return { cachedResponse: fakeResponse, config };
  }

  return { config };
}

/**
 * Handles mutation cache invalidation
 */
export function handleMutationInvalidation(url?: string, method?: string): void {
  const m = (method || 'get').toLowerCase();
  if (m === 'get') return;
  if (!url) return;

  // Investment mutations invalidate investments, wallet, and merchant summaries
  if (url.includes('/investments')) {
    invalidateCache('/investments');
    invalidateCache('/wallet');
    invalidateCache('/public/merchants');
  }

  // Wallet mutations invalidate wallet and investments
  if (url.includes('/wallet')) {
    invalidateCache('/wallet');
    invalidateCache('/investments');
  }

  // Revenue mutations invalidate revenue, distributions, and merchant listings
  if (url.includes('/revenue')) {
    invalidateCache('/revenue');
    invalidateCache('/investments');
    invalidateCache('/public/merchants');
  }

  // KYC or Merchant mutations invalidate merchant details
  if (url.includes('/kyc') || url.includes('/merchants') || url.includes('/profile')) {
    invalidateCache('/public/merchants');
    invalidateCache('/kyc');
    invalidateCache('/me');
  }
}
