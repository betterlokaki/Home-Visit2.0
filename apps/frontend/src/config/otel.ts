import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

declare const __LOGS_ENDPOINT__: string;

if (!__LOGS_ENDPOINT__) {
  throw new Error('Configuration missing logs endpoint');
}

const logsEndpoint = __LOGS_ENDPOINT__;

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'home-visit-frontend',
});

const logExporter = new OTLPLogExporter({
  url: logsEndpoint,
});

const loggerProvider = new LoggerProvider({
  resource,
  processors: [new BatchLogRecordProcessor(logExporter)],
});

const tracerProvider = new WebTracerProvider({
  resource,
});

tracerProvider.register();

registerInstrumentations({
  instrumentations: [
    new DocumentLoadInstrumentation(),
    new UserInteractionInstrumentation(),
  ],
});

export const otelSDK = {
  start: () => {
    // SDK is already initialized above
  },
};

export const loggerProviderInstance = loggerProvider;

