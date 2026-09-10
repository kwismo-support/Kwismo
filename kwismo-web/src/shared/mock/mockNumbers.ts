export interface NumeroDTO {
  id: string;
  valeur: string;
  scoreRisque: number; // 0 à 100
  statut: 'securise' | 'a_signaler' | 'frauduleux';
  operatorName: string;
  countryCode: string;
  reportsCount: number;
  dateDerniereVerification: string;
}

export const MOCK_NUMBERS: NumeroDTO[] = [
  {
    id: 'num-001',
    valeur: '+237 690 12 34 56',
    scoreRisque: 92,
    statut: 'frauduleux',
    operatorName: 'Orange Cameroun',
    countryCode: '+237',
    reportsCount: 14,
    dateDerniereVerification: '2026-09-06T11:00:00Z',
  },
  {
    id: 'num-002',
    valeur: '+237 675 98 76 54',
    scoreRisque: 68,
    statut: 'a_signaler',
    operatorName: 'MTN Cameroun',
    countryCode: '+237',
    reportsCount: 5,
    dateDerniereVerification: '2026-09-06T10:30:00Z',
  },
  {
    id: 'num-003',
    valeur: '+237 699 00 11 22',
    scoreRisque: 4,
    statut: 'securise',
    operatorName: 'Orange Cameroun',
    countryCode: '+237',
    reportsCount: 0,
    dateDerniereVerification: '2026-09-05T18:00:00Z',
  },
  {
    id: 'num-004',
    valeur: '+225 07 08 09 10 11',
    scoreRisque: 88,
    statut: 'frauduleux',
    operatorName: 'Orange Côte d\'Ivoire',
    countryCode: '+225',
    reportsCount: 9,
    dateDerniereVerification: '2026-09-06T09:15:00Z',
  },
];
