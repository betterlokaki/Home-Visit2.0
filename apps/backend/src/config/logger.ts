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

export const logger = winston.createLogger({
  level: loggerLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports,
});

