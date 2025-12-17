import * as XLSX from 'xlsx-js-style';
import type { Site } from '@home-visit/common';
import { buildWorksheetData } from './excel/excelDataBuilder';
import { applyStyles } from './excel/excelStyler';
import { formatDate } from './excel/excelDateFormatter';

interface SitesByTimeframe {
  timeframe: Date;
  sites: Site[];
}

export function generateExcelReport(
  sitesByTimeframe: SitesByTimeframe[],
  allSites: Site[]
): void {
  if (sitesByTimeframe.length === 0 || allSites.length === 0) {
    return;
  }

  const workbook = XLSX.utils.book_new();
  const worksheetData = buildWorksheetData(sitesByTimeframe, allSites);
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  applyStyles(worksheet, sitesByTimeframe, allSites);

  const columnWidths = [];
  for (let i = 0; i < sitesByTimeframe.length; i++) {
    columnWidths.push({ wch: 18 });
  }
  columnWidths.push({ wch: 25 });
  worksheet['!cols'] = columnWidths;

  worksheet['!rtl'] = true;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'דוח סיכומי');

  const fileName = `דוח_סיכומי_${formatDate(new Date()).replace(/[\/\s:]/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

