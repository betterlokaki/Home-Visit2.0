import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { detectResources, resourceFromAttributes } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { appConfig } from './configLoader';

const otelEnabled = appConfig.otel?.enabled !== false;

let otelSDK: NodeSDK | null = null;

if (otelEnabled) {
  const detectedResource = detectResources();
  const customResource = resourceFromAttributes({
    [SEMRESATTRS_SERVICE_NAME]: appConfig.otel?.serviceName || 'home-visit-backend',
    [SEMRESATTRS_SERVICE_VERSION]: '1.0.0',
  });
  const resource = detectedResource.merge(customResource);

  otelSDK = new NodeSDK({
    resource,
    instrumentations: [getNodeAutoInstrumentations()],
  });
}

export { otelSDK };

