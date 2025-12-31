import { Request, Response } from 'express';
import { logger } from '../../config/logger';

interface OTLPLogRecord {
  timeUnixNano?: string;
  severityNumber?: number;
  severityText?: string;
  body?: {
    stringValue?: string;
  };
  attributes?: Array<{
    key: string;
    value: {
      stringValue?: string;
      intValue?: string;
      doubleValue?: number;
      boolValue?: boolean;
    };
  }>;
}

interface OTLPRequest {
  resourceLogs?: Array<{
    scopeLogs?: Array<{
      logRecords?: OTLPLogRecord[];
    }>;
  }>;
}

const severityNumberToLevel = (severityNumber?: number): 'error' | 'warn' | 'info' | 'debug' => {
  if (!severityNumber) return 'info';
  if (severityNumber >= 17) return 'error';
  if (severityNumber >= 13) return 'warn';
  if (severityNumber >= 9) return 'info';
  return 'debug';
};

const parseOTLPAttributes = (attributes?: OTLPLogRecord['attributes']): Record<string, unknown> => {
  if (!attributes) return {};
  const result: Record<string, unknown> = {};
  for (const attr of attributes) {
    const value = attr.value.stringValue ?? attr.value.intValue ?? attr.value.doubleValue ?? attr.value.boolValue;
    if (value !== undefined) {
      result[attr.key] = value;
    }
  }
  return result;
};

export class LogsController {
  async receiveLogs(req: Request, res: Response): Promise<void> {
    const body = req.body;

    if (this.isOTLPFormat(body)) {
      await this.handleOTLPFormat(body as OTLPRequest, res);
    } else {
      res.status(400).json({ error: 'Request body must be OTLP format' });
    }
  }

  private isOTLPFormat(body: unknown): boolean {
    return typeof body === 'object' && body !== null && 'resourceLogs' in body;
  }

  private async handleOTLPFormat(otlpRequest: OTLPRequest, res: Response): Promise<void> {
    let processedCount = 0;

    for (const resourceLog of otlpRequest.resourceLogs || []) {
      for (const scopeLog of resourceLog.scopeLogs || []) {
        for (const logRecord of scopeLog.logRecords || []) {
          const message = logRecord.body?.stringValue || 'Unknown log message';
          const severityLevel = severityNumberToLevel(logRecord.severityNumber);
          const attributes = parseOTLPAttributes(logRecord.attributes);

          const logData: Record<string, unknown> = {
            message,
            source: 'frontend',
            ...attributes,
          };

          if (logRecord.timeUnixNano) {
            const timestamp = new Date(Number(logRecord.timeUnixNano) / 1_000_000).toISOString();
            logData.timestamp = timestamp;
          }

          switch (severityLevel) {
            case 'error':
              logger.error(logData);
              break;
            case 'warn':
              logger.warn(logData);
              break;
            case 'info':
              logger.info(logData);
              break;
            case 'debug':
              logger.debug(logData);
              break;
          }

          processedCount++;
        }
      }
    }

    res.status(200).json({ success: true, received: processedCount });
  }
}

