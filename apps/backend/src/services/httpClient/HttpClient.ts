import axios from 'axios';
import { IHttpClient, HttpResponse } from './interfaces/IHttpClient';

export class HttpClient implements IHttpClient {
  async post<T = unknown>(url: string, data: unknown, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    const response = await axios.post<T>(url, data, {
      headers: headers,
    });
    return {
      status: response.status,
      data: response.data,
    };
  }
}

