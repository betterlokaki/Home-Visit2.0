import { AppConfig } from '@home-visit/common';
import { TimeRange } from './timeWindowUtils';

export type SiteWithGeometry = { siteName: string; geometry: string };

export const buildRequestPayload = (
  sites: SiteWithGeometry[],
  timeRange: TimeRange,
  config: AppConfig
): Record<string, unknown> => ({
  [config.service1.geometryOuterKey]: {
    [config.service1.geometryInnerKey]: sites.map((site) => site.geometry),
    [config.service1.siteNameKey]: sites.map((site) => site.siteName),
  },
  [config.service1.timeRangeOuterKey]: {
    [config.service1.timeRangeInnerKey]: {
      From: timeRange.from.toISOString(),
      To: timeRange.to.toISOString(),
    },
  },
});

