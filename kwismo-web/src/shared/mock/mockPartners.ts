export type PartnerType = 'Opérateur' | 'Fintech' | 'Banque' | 'Régulateur' | 'telco' | 'bank' | 'fintech';
export type PartnerStatus = 'Actif' | 'Suspendu' | 'active' | 'pending' | 'suspended';

export interface PartnerDTO {
  id: string;
  nomEntreprise: string;
  typePartenariat: PartnerType;
  pays: string;
  statut: PartnerStatus;
  dateAdhesion: string;
  apiKeyCount: number;
  webhookUrl?: string;
  prefixes: string[];
  contact?: string;
  email?: string;
  phone?: string;
  numerosSurveilles?: number;
}

export interface AffiliationRule {
  id: number | string;
  partenaire: string;
  pays: string;
  prefixes: string[];
  numerosConcernes: number;
  actif: boolean;
}

export const MOCK_PARTNERS: PartnerDTO[] = [
  {
    id: 'part-001',
    nomEntreprise: 'MTN Cameroun',
    typePartenariat: 'Opérateur',
    pays: 'Cameroun',
    numerosSurveilles: 28430,
    statut: 'Actif',
    dateAdhesion: '2023-01-15T00:00:00Z',
    apiKeyCount: 3,
    contact: 'Diallo Kouyaté',
    email: 'dkouyate@mtn.com',
    phone: '+237 699 123 456',
    webhookUrl: 'https://security.mtn.cm/alerts',
    prefixes: ['67', '68', '650-654'],
  },
  {
    id: 'part-002',
    nomEntreprise: 'Orange CI',
    typePartenariat: 'Opérateur',
    pays: "Côte d'Ivoire",
    numerosSurveilles: 19820,
    statut: 'Actif',
    dateAdhesion: '2023-03-03T00:00:00Z',
    apiKeyCount: 2,
    contact: 'Aminata Bah',
    email: 'abah@orange.ci',
    phone: '+225 07 12 34 56 78',
    webhookUrl: 'https://api.orange.ci/kwismo/webhook',
    prefixes: ['07', '08', '09'],
  },
  {
    id: 'part-003',
    nomEntreprise: 'Wave Sénégal',
    typePartenariat: 'Fintech',
    pays: 'Sénégal',
    numerosSurveilles: 12100,
    statut: 'Actif',
    dateAdhesion: '2023-06-20T00:00:00Z',
    apiKeyCount: 4,
    contact: 'Omar Sy',
    email: 'osy@wave.com',
    phone: '+221 77 456 12 34',
    webhookUrl: 'https://api.wave.com/security/kwismo',
    prefixes: ['70', '75-76'],
  },
  {
    id: 'part-004',
    nomEntreprise: 'Société Générale CI',
    typePartenariat: 'Banque',
    pays: "Côte d'Ivoire",
    numerosSurveilles: 8750,
    statut: 'Actif',
    dateAdhesion: '2023-09-11T00:00:00Z',
    apiKeyCount: 5,
    contact: 'Paul Yao',
    email: 'pyao@sgci.com',
    phone: '+225 05 98 76 54 32',
    webhookUrl: 'https://mobilemoney.afrilandfirstbank.com/kwismo',
    prefixes: ['05'],
  },
  {
    id: 'part-005',
    nomEntreprise: 'Airtel Kenya',
    typePartenariat: 'Opérateur',
    pays: 'Kenya',
    numerosSurveilles: 5200,
    statut: 'Suspendu',
    dateAdhesion: '2023-11-28T00:00:00Z',
    apiKeyCount: 1,
    contact: 'James Otieno',
    email: 'jotieno@airtel.ke',
    phone: '+254 73 111 2233',
    webhookUrl: 'https://api.airtel.ke/webhook',
    prefixes: ['73', '78'],
  },
  {
    id: 'part-006',
    nomEntreprise: 'Moov Burkina',
    typePartenariat: 'Opérateur',
    pays: 'Burkina Faso',
    numerosSurveilles: 3410,
    statut: 'Actif',
    dateAdhesion: '2024-02-07T00:00:00Z',
    apiKeyCount: 2,
    contact: 'Salif Compaoré',
    email: 'scompaore@moov.bf',
    phone: '+226 70 998 877',
    webhookUrl: 'https://api.moov.bf/kwismo',
    prefixes: ['70-71'],
  },
];

export const MOCK_AFFILIATION_RULES: AffiliationRule[] = [
  { id: 1, partenaire: 'MTN Cameroun', pays: 'Cameroun', prefixes: ['67', '68', '650-654'], numerosConcernes: 28430, actif: true },
  { id: 2, partenaire: 'Orange CI', pays: "Côte d'Ivoire", prefixes: ['07', '08', '09'], numerosConcernes: 19820, actif: true },
  { id: 3, partenaire: 'Wave Sénégal', pays: 'Sénégal', prefixes: ['70', '75-76'], numerosConcernes: 12100, actif: true },
  { id: 4, partenaire: 'Société Générale CI', pays: "Côte d'Ivoire", prefixes: ['05'], numerosConcernes: 8750, actif: true },
  { id: 5, partenaire: 'Airtel Kenya', pays: 'Kenya', prefixes: ['73', '78'], numerosConcernes: 5200, actif: false },
  { id: 6, partenaire: 'Moov Burkina', pays: 'Burkina Faso', prefixes: ['70-71'], numerosConcernes: 3410, actif: true },
];
