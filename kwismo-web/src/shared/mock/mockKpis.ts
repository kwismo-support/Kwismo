export interface KpiSummaryDTO {
  verifiedNumbers: number;
  verifiedChange: string;
  blockedFrauds: number;
  blockedChange: string;
  apiCalls24h: number;
  apiCallsChange: string;
  aiAccuracy: number;
  aiAccuracyChange: string;
}

export const MOCK_KPIS: KpiSummaryDTO = {
  verifiedNumbers: 2418901,
  verifiedChange: '+8,7 %',
  blockedFrauds: 14873,
  blockedChange: '+23,1 %',
  apiCalls24h: 4100000,
  apiCallsChange: '+31,5 %',
  aiAccuracy: 99.4,
  aiAccuracyChange: '+1,2 %',
};

export const WEEKLY_TREND_DATA = [
  { w: 'S1', sig: 1240, fra: 310 },
  { w: 'S2', sig: 1380, fra: 345 },
  { w: 'S3', sig: 1520, fra: 380 },
  { w: 'S4', sig: 1650, fra: 412 },
  { w: 'S5', sig: 1480, fra: 370 },
  { w: 'S6', sig: 1720, fra: 430 },
  { w: 'S7', sig: 1890, fra: 472 },
  { w: 'S8', sig: 2010, fra: 502 },
  { w: 'S9', sig: 1950, fra: 487 },
  { w: 'S10', sig: 2140, fra: 535 },
  { w: 'S11', sig: 2380, fra: 594 },
  { w: 'S12', sig: 2510, fra: 627 },
];

export const OPERATOR_FRAUD_DATA = [
  { op: 'MTN', n: 892, fraudes: 214 },
  { op: 'Orange', n: 654, fraudes: 168 },
  { op: 'Airtel', n: 423, fraudes: 97 },
  { op: 'M-Pesa', n: 312, fraudes: 61 },
  { op: 'Moov', n: 187, fraudes: 43 },
  { op: 'Wave', n: 156, fraudes: 38 },
];
