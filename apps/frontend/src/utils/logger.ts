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

interface LogContext {
  username?: string;
  userId?: number;
  groupName?: string;
  groupId?: number;
}

const emitLog = (
  severity: 'error' | 'warn' | 'info' | 'debug',
  message: string,
  metadata?: Record<string, unknown>,
  context?: LogContext
): void => {
  const attributes: Record<string, string> = {
    source: 'frontend',
    ...Object.fromEntries(
      Object.entries(metadata || {}).map(([key, value]) => [
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      ])
    ),
  };

  if (context?.username) attributes.username = context.username;
  if (context?.userId !== undefined) attributes.userId = String(context.userId);
  if (context?.groupName) attributes.groupName = context.groupName;
  if (context?.groupId !== undefined) attributes.groupId = String(context.groupId);

  otelLogger.emit({
    severityNumber: severityMap[severity],
    severityText: severity,
    body: message,
    attributes,
  });
};

export const logger = {
  error: (message: string, metadata?: Record<string, unknown>, context?: LogContext): void =>
    emitLog('error', message, metadata, context),
  warn: (message: string, metadata?: Record<string, unknown>, context?: LogContext): void =>
    emitLog('warn', message, metadata, context),
  info: (message: string, metadata?: Record<string, unknown>, context?: LogContext): void =>
    emitLog('info', message, metadata, context),
  debug: (message: string, metadata?: Record<string, unknown>, context?: LogContext): void =>
    emitLog('debug', message, metadata, context),
  log: (message: string, metadata?: Record<string, unknown>, context?: LogContext): void =>
    emitLog('info', message, metadata, context),
};

