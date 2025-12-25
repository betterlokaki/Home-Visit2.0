import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

declare const __API_BASE_URL__: string;

if (!__API_BASE_URL__) {
  throw new Error('Configuration missing API base URL');
}

const client: AxiosInstance = axios.create({
  baseURL: __API_BASE_URL__,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      logger.error('API Error', { 
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
    } else if (error.request) {
      logger.error('Network Error', { 
        request: error.request,
        url: error.config?.url,
      });
    } else {
      logger.error('Error', { 
        message: error.message,
        url: error.config?.url,
      });
    }
    return Promise.reject(error);
  }
);

export const apiClient = client;

