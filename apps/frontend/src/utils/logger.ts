import type { Logger as OTELLogger } from '@opentelemetry/api-logs';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { loggerProviderInstance } from '../config/otel';

const otelLogger: OTELLogger = loggerProviderInstance.getLogger('home-visit-frontend');

const severityMap: Record<'error' | 'warn' | 'info' | 'debug', SeverityNumber> = {
  error: SeverityNumber.ERROR,
  warn: SeverityNumber.WARN,
  info: SeverityNumber.INFO,
  debug: SeverityNumber.DEBUG,
};

class Logger {
  private emitLog(severity: 'error' | 'warn' | 'info' | 'debug', message: string, metadata?: Record<string, unknown>): void {
    const attributes: Record<string, string> = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...Object.fromEntries(
        Object.entries(metadata || {}).map(([key, value]) => [
          key,
          typeof value === 'string' ? value : JSON.stringify(value),
        ])
      ),
    };

    otelLogger.emit({
      severityNumber: severityMap[severity],
      severityText: severity,
      body: message,
      attributes,
    });
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.emitLog('error', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.emitLog('warn', message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.emitLog('info', message, metadata);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.emitLog('debug', message, metadata);
  }

  log(message: string, metadata?: Record<string, unknown>): void {
    this.emitLog('info', message, metadata);
  }

  setLevel(_level: string): void {
    // OTel handles log levels via configuration, not runtime
  }
}

export const logger = new Logger();

