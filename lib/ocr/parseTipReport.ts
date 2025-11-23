import { TipReport, TipRow } from '@/types/tips';
import { extractTextFromImage } from './mockVisionClient';

export async function parseTipReportImage(file: File | Blob): Promise<TipReport> {
  const rawText = await extractTextFromImage(file);
  return parseRawTextToReport(rawText);
}

function parseRawTextToReport(text: string): TipReport {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let storeNumber = '';
  let timePeriodStart = '';
  let timePeriodEnd = '';
  let executedBy = '';
  let executedOn = '';
  let totalTippableHoursReported = 0;
  const rows: TipRow[] = [];

  let tableStartIndex = -1;
  let tableEndIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Extract header fields
    if (line.startsWith('Store Number:')) {
      storeNumber = line.replace('Store Number:', '').trim();
    } else if (line.startsWith('Time Period:')) {
      const periodText = line.replace('Time Period:', '').trim();
      const parts = periodText.split('-').map(p => p.trim());
      if (parts.length === 2) {
        timePeriodStart = parts[0];
        timePeriodEnd = parts[1];
      }
    } else if (line.startsWith('Executed By:')) {
      executedBy = line.replace('Executed By:', '').trim();
    } else if (line.startsWith('Executed On:')) {
      executedOn = line.replace('Executed On:', '').trim();
    }

    // Find table header
    if (line.includes('Home Store') && line.includes('Partner Name') && line.includes('Partner Number') && line.includes('Total Tippable Hours')) {
      tableStartIndex = i + 1;
    }

    // Find footer total
    if (line.startsWith('Total Tippable Hours:')) {
      totalTippableHoursReported = parseFloat(line.replace('Total Tippable Hours:', '').trim());
      tableEndIndex = i;
      break;
    }
  }

  // Parse table rows
  if (tableStartIndex > 0 && tableEndIndex > tableStartIndex) {
    for (let i = tableStartIndex; i < tableEndIndex; i++) {
      const line = lines[i];
      const row = parseTableRow(line);
      if (row) {
        rows.push(row);
      }
    }
  }

  return {
    storeNumber,
    timePeriodStart,
    timePeriodEnd,
    executedBy,
    executedOn,
    rows,
    totalTippableHoursReported,
  };
}

function parseTableRow(line: string): TipRow | null {
  // Expected format: "69600         Ailuogwemhe, Jodie O      US37008498       18.48"
  // Split by multiple spaces
  const parts = line.split(/\s{2,}/).map(p => p.trim()).filter(p => p.length > 0);

  if (parts.length < 4) {
    return null;
  }

  const homeStore = parts[0];
  const partnerName = parts[1];
  const partnerNumber = parts[2];
  const hoursStr = parts[3];

  const tippableHours = parseFloat(hoursStr);

  if (isNaN(tippableHours)) {
    return null;
  }

  // Simulate uncertainty detection
  const uncertainFields: string[] = [];
  if (hoursStr.includes('.') && hoursStr.split('.')[1].length === 2) {
    // If last digit is 3 or 8, mark as uncertain (simulate OCR ambiguity)
    const lastDigit = hoursStr[hoursStr.length - 1];
    if (lastDigit === '3' || lastDigit === '8') {
      uncertainFields.push('tippableHours');
    }
  }

  return {
    homeStore,
    partnerName,
    partnerNumber,
    tippableHours,
    uncertainFields: uncertainFields.length > 0 ? uncertainFields : undefined,
  };
}
