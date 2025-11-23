export interface TipRow {
  homeStore: string;
  partnerName: string;
  partnerNumber: string;
  tippableHours: number;
  uncertainFields?: string[];
}

export interface TipReport {
  storeNumber: string;
  timePeriodStart: string;
  timePeriodEnd: string;
  executedBy: string;
  executedOn: string;
  rows: TipRow[];
  totalTippableHoursReported: number;
}

export interface TipCalculation {
  reportId?: string;
  report: TipReport;
  totalTips: number;
  adjustments: number;
  hourlyTipRate: number;
  payouts: TipPayout[];
  createdAt: string;
}

export interface TipPayout {
  partnerName: string;
  partnerNumber: string;
  tippableHours: number;
  tipAmount: number;
}
