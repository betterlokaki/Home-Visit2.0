import winston from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { appConfig } from './configLoader';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';

const winstonInstrumentation = new WinstonInstrumentation();
winstonInstrumentation.enable();

const loggerLevel = appConfig.logging?.level || (appConfig.backend.environment === 'production' ? 'info' : 'debug');

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
];

if (appConfig.logging?.elasticsearch) {
  const esConfig = appConfig.logging.elasticsearch;
  const clientOpts: { node: string; auth?: { username: string; password: string } } = {
    node: esConfig.url,
  };

  if (esConfig.auth) {
    clientOpts.auth = {
      username: esConfig.auth.username,
      password: esConfig.auth.password,
    };
  }

  transports.push(
    new ElasticsearchTransport({
      level: loggerLevel,
      clientOpts,
      index: esConfig.index,
      format: winston.format.json(),
    })
  );
}

const baseLogger = winston.createLogger({
  level: loggerLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format((info) => {
      info.source = 'backend';
      return info;
    })(),
    winston.format.json()
  ),
  transports,
});

interface UserContext {
  username?: string;
  userId?: number;
}

interface GroupContext {
  groupName?: string;
  groupId?: number;
}

interface LogContext {
  user?: UserContext;
  group?: GroupContext;
}

interface LoggerMethods {
  error(message: string, metadata?: Record<string, unknown>, context?: LogContext): void;
  error(data: Record<string, unknown>, context?: LogContext): void;
  warn(message: string, metadata?: Record<string, unknown>, context?: LogContext): void;
  warn(data: Record<string, unknown>, context?: LogContext): void;
  info(message: string, metadata?: Record<string, unknown>, context?: LogContext): void;
  info(data: Record<string, unknown>, context?: LogContext): void;
  debug(message: string, metadata?: Record<string, unknown>, context?: LogContext): void;
  debug(data: Record<string, unknown>, context?: LogContext): void;
}

const createLoggerMethod = (
  level: 'error' | 'warn' | 'info' | 'debug'
): LoggerMethods[typeof level] => {
  return (messageOrData: string | Record<string, unknown>, metadataOrContext?: Record<string, unknown> | LogContext, context?: LogContext): void => {
    let logData: Record<string, unknown>;
    let logContext: LogContext | undefined;

    if (typeof messageOrData === 'string') {
      logData = { message: messageOrData, ...(metadataOrContext as Record<string, unknown> | undefined) };
      logContext = context;
    } else {
      logData = messageOrData;
      logContext = metadataOrContext as LogContext | undefined;
    }

    baseLogger[level]({
      ...logData,
      ...(logContext?.user && { username: logContext.user.username, userId: logContext.user.userId }),
      ...(logContext?.group && { groupName: logContext.group.groupName, groupId: logContext.group.groupId }),
    });
  };
};

export const logger: LoggerMethods = {
  error: createLoggerMethod('error'),
  warn: createLoggerMethod('warn'),
  info: createLoggerMethod('info'),
  debug: createLoggerMethod('debug'),
};

export const logWithContext = (
  req: { user?: UserContext; group?: GroupContext },
  level: 'error' | 'warn' | 'info' | 'debug',
  messageOrData: string | Record<string, unknown>
): void => {
  const context: LogContext = {};
  if (req.user) {
    context.user = req.user;
  }
  if (req.group) {
    context.group = req.group;
  }
  if (typeof messageOrData === 'string') {
    logger[level](messageOrData, undefined, context);
  } else {
    logger[level](messageOrData, context);
  }
};

