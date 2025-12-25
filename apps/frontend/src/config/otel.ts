import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { LoggerProvider, BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

declare const __API_BASE_URL__: string;

const apiBaseUrl = __API_BASE_URL__ || '';
const logsEndpoint = `${apiBaseUrl}/api/logs`;

const resource = resourceFromAttributes({
  [SEMRESATTRS_SERVICE_NAME]: 'home-visit-frontend',
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

