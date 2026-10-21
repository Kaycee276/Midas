import axios, {
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    bypassCache?: boolean;
  }
}
import {
  getCacheKey,
  getFromCache,
  saveToCache,
  handleMutationInvalidation,
  clearCache,
} from './cache';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Retrieve standard Axios adapter
const defaultAdapter = axios.getAdapter(axios.defaults.adapter || ['xhr', 'http']);

// High-performance caching adapter for instantaneous 0ms responses
const cacheAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  const method = (config.method || 'get').toLowerCase();
  const bypassCache = (config as { bypassCache?: boolean }).bypassCache;

  // Cache GET requests
  if (method === 'get' && !bypassCache) {
    const key = getCacheKey(config.url, config.params);
    const cachedData = getFromCache(key);

    if (cachedData !== null) {
      return {
        data: cachedData,
        status: 200,
        statusText: 'OK (from cache)',
        headers: { 'x-cache': 'HIT' },
        config,
        request: {},
      } as AxiosResponse;
    }

    const response = await defaultAdapter(config);
    if (response.status >= 200 && response.status < 300) {
      saveToCache(key, response.data);
    }
    return response;
  }

  // Perform mutations and invalidate related cached data
  const response = await defaultAdapter(config);
  if (response.status >= 200 && response.status < 400) {
    handleMutationInvalidation(config.url, method);
  }
  return response;
};

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  adapter: cacheAdapter,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      clearCache();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default client;
