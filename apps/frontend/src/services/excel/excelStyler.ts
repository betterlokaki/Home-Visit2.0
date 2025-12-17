import * as XLSX from 'xlsx-js-style';
import type { Site } from '@home-visit/common';
import { getStatusColor } from './excelColorMapper';
import { getStatusDisplay } from '../../utils/statusDisplay';

interface SitesByTimeframe {
  timeframe: Date;
  sites: Site[];
}

export function applyStyles(
  worksheet: XLSX.WorkSheet,
  sitesByTimeframe: SitesByTimeframe[],
  allSites: Site[]
): void {
  const headerStyle = {
    fill: { fgColor: { rgb: '434343' } },
    font: { color: { rgb: 'ffffff' }, bold: true },
    alignment: { horizontal: 'center', vertical: 'center' },
  };

  for (let col = 0; col <= sitesByTimeframe.length; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = headerStyle;
  }

  for (let row = 1; row <= allSites.length; row++) {
    const site = allSites[row - 1];
    for (let col = 0; col < sitesByTimeframe.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) continue;

      const timeframeIndex = col;
      const sitesForTimeframe = sitesByTimeframe[timeframeIndex].sites;
      const siteData = sitesForTimeframe.find((s) => s.siteId === site.siteId);

      if (siteData) {
        const statusDisplay = getStatusDisplay(
          siteData.coverStatus,
          siteData.status?.seenStatus,
          false
        );
        const colorHex = getStatusColor(statusDisplay.color);

        worksheet[cellAddress].s = {
          fill: { fgColor: { rgb: colorHex }, patternType: 'solid' },
          font: { color: { rgb: '000000' }, bold: true },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      }
    }

    const siteNameCell = XLSX.utils.encode_cell({ r: row, c: sitesByTimeframe.length });
    if (worksheet[siteNameCell]) {
      worksheet[siteNameCell].s = {
        font: { bold: true },
        alignment: { horizontal: 'right', vertical: 'center' },
      };
    }
  }
}

