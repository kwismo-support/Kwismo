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
  verifiedNumbers: 2458910,
  verifiedChange: '+14.2%',
  blockedFrauds: 184320,
  blockedChange: '+8.5%',
  apiCalls24h: 1245000,
  apiCallsChange: '+22.1%',
  aiAccuracy: 98.7,
  aiAccuracyChange: '+0.4%',
};
