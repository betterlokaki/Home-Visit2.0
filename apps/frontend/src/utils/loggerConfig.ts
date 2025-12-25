declare const __API_BASE_URL__: string;

export interface LoggerConfig {
  batchSize: number;
  flushIntervalMs: number;
  endpoint: string;
}

export const loggerConfig: LoggerConfig = {
  batchSize: 10,
  flushIntervalMs: 5000,
  endpoint: __API_BASE_URL__ ? `${__API_BASE_URL__}/logs` : '/api/logs',
};

