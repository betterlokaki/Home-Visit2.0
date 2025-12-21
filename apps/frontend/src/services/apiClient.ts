import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';

declare const __API_BASE_URL__: string;

function getApiBaseUrl(): string {
  if (!__API_BASE_URL__) {
    throw new Error('Configuration missing API base URL');
  }
  return __API_BASE_URL__;
}

class ApiClient {
  private client: AxiosInstance;
  private apiBaseUrl: string | null = null;
  private configPromise: Promise<void>;

  constructor() {
    this.client = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.configPromise = this.loadConfig();
  }

  private async loadConfig(): Promise<void> {
    this.apiBaseUrl = getApiBaseUrl();
    this.client.defaults.baseURL = this.apiBaseUrl;
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      async (config) => {
        await this.configPromise;
        if (this.apiBaseUrl) {
          config.baseURL = this.apiBaseUrl;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          console.error('API Error:', error.response.data);
        } else if (error.request) {
          console.error('Network Error:', error.request);
        } else {
          console.error('Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().getClient();

