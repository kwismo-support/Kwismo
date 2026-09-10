export interface PartnerDTO {
  id: string;
  nomEntreprise: string;
  typePartenariat: 'telco' | 'bank' | 'fintech';
  statut: 'active' | 'pending' | 'suspended';
  dateAdhesion: string;
  apiKeyCount: number;
  webhookUrl?: string;
  prefixes: string[];
}

export const MOCK_PARTNERS: PartnerDTO[] = [
  {
    id: 'part-orange-cm',
    nomEntreprise: 'Orange Cameroun',
    typePartenariat: 'telco',
    statut: 'active',
    dateAdhesion: '2025-11-01T00:00:00Z',
    apiKeyCount: 3,
    webhookUrl: 'https://api.orange.cm/kwismo/webhook',
    prefixes: ['69', '655', '656', '657', '658', '659'],
  },
  {
    id: 'part-mtn-cm',
    nomEntreprise: 'MTN Cameroun',
    typePartenariat: 'telco',
    statut: 'active',
    dateAdhesion: '2025-12-15T00:00:00Z',
    apiKeyCount: 2,
    webhookUrl: 'https://security.mtn.cm/alerts',
    prefixes: ['67', '650', '651', '652', '653', '654'],
  },
  {
    id: 'part-afriland',
    nomEntreprise: 'Afriland First Bank',
    typePartenariat: 'bank',
    statut: 'active',
    dateAdhesion: '2026-01-20T00:00:00Z',
    apiKeyCount: 5,
    webhookUrl: 'https://mobilemoney.afrilandfirstbank.com/kwismo',
    prefixes: [],
  },
  {
    id: 'part-maviance',
    nomEntreprise: 'Maviance PayUnit',
    typePartenariat: 'fintech',
    statut: 'pending',
    dateAdhesion: '2026-02-28T00:00:00Z',
    apiKeyCount: 1,
    webhookUrl: '',
    prefixes: [],
  },
];
