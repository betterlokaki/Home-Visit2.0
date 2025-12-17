import type { Site } from '@home-visit/common';
import { getStatusDisplay } from '../../utils/statusDisplay';
import { formatDate } from './excelDateFormatter';

interface SitesByTimeframe {
  timeframe: Date;
  sites: Site[];
}

export function buildWorksheetData(
  sitesByTimeframe: SitesByTimeframe[],
  allSites: Site[]
): (string | undefined)[][] {
  const worksheetData: (string | undefined)[][] = [];

  const headerRow: (string | undefined)[] = [];
  sitesByTimeframe.forEach(({ timeframe }) => {
    headerRow.push(formatDate(timeframe));
  });
  headerRow.push('');
  worksheetData.push(headerRow);

  allSites.forEach((site) => {
    const row: (string | undefined)[] = [];
    sitesByTimeframe.forEach(({ sites }) => {
      const siteData = sites.find((s) => s.siteId === site.siteId);
      if (siteData) {
        const statusDisplay = getStatusDisplay(
          siteData.coverStatus,
          siteData.status?.seenStatus,
          false
        );
        row.push(statusDisplay.text);
      } else {
        row.push('');
      }
    });
    row.push(site.siteDisplayName);
    worksheetData.push(row);
  });

  return worksheetData;
}

