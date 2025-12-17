import axios, { AxiosError } from 'axios';
import { IHttpClient, HttpResponse } from './interfaces/IHttpClient';

export class HttpClient implements IHttpClient {
  async post<T = unknown>(url: string, data: unknown, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    try {
      const response = await axios.post<T>(url, data, {
        timeout: 0,
        headers: headers,
      });
      return {
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<T>;
        if (axiosError.response) {
          return {
            status: axiosError.response.status,
            data: axiosError.response.data,
          };
        }
        throw new Error(`HTTP request failed: ${axiosError.message}`);
      }
      throw new Error(`HTTP request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

