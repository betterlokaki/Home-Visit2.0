export interface HttpResponse<T = unknown> {
  status: number;
  data: T;
}

export interface IHttpClient {
  post<T = unknown>(url: string, data: unknown, headers?: Record<string, string>): Promise<HttpResponse<T>>;
}

