import { z } from 'zod';

const nonEmptyString = z.string().min(1, 'Value is required');

const headersSchema = z.record(nonEmptyString).optional();

const service1Schema = z.object({
  url: nonEmptyString,
  endpoint: nonEmptyString,
  geometryOuterKey: nonEmptyString,
  geometryInnerKey: nonEmptyString,
  siteNameKey: nonEmptyString,
  timeRangeOuterKey: nonEmptyString,
  timeRangeInnerKey: nonEmptyString,
  responseKey: nonEmptyString,
  headers: headersSchema,
});

const service2Schema = z.object({
  url: nonEmptyString,
  geometryOuterKey: nonEmptyString,
  geometryInnerKey: nonEmptyString,
  secondsOuterKey: nonEmptyString,
  secondsInnerKey: nonEmptyString,
  responseKey: nonEmptyString,
  headers: headersSchema,
});

const cacheSchema = z.object({
  ttlSeconds: z.number().positive(),
  refreshThresholdPercentage: z.number().min(0).max(1).optional().default(0.8),
  maxConcurrentRefreshes: z.number().int().positive(),
});

const mapStyleSchema = z.union([nonEmptyString, z.record(z.unknown())]);

const mapSchema = z.object({
  styleJson: mapStyleSchema,
  flyToZoom: z.number().positive().optional(),
});

const databaseSchema = z.object({
  url: nonEmptyString,
});

const backendSchema = z.object({
  port: z.number().int().positive().max(65535),
  environment: z.enum(['development', 'production', 'test']),
});

const frontendSchema = z.object({
  host: nonEmptyString,
  port: z.number().int().positive().max(65535),
  allowedHosts: z.array(nonEmptyString).min(1),
  apiBaseUrl: nonEmptyString,
});

const elasticsearchSchema = z.object({
  url: nonEmptyString,
  index: nonEmptyString,
  auth: z.object({
    username: nonEmptyString,
    password: nonEmptyString,
  }).optional(),
});

const fileLogSchema = z.object({
  path: nonEmptyString,
  maxSize: z.string().optional(),
  maxFiles: z.number().int().positive().optional(),
});

const loggingSchema = z.object({
  level: z.enum(['error', 'warn', 'info', 'debug']).optional(),
  elasticsearch: elasticsearchSchema.optional(),
  file: fileLogSchema.optional(),
});

export const appConfigSchema = z
  .object({
    service1: service1Schema,
    service2: service2Schema,
    cache: cacheSchema,
    map: mapSchema,
    database: databaseSchema,
    backend: backendSchema,
    frontend: frontendSchema,
    logging: loggingSchema.optional(),
  })
  .strict();

export type MapStyle = z.infer<typeof mapStyleSchema>;
export type AppConfig = z.infer<typeof appConfigSchema>;

