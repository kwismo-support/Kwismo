export interface ReportDTO {
  id: string;
  titre: string;
  type: 'monthly' | 'security' | 'api_usage';
  dateCreation: string;
  taille: string;
  downloadUrl: string;
}

export const MOCK_REPORTS: ReportDTO[] = [
  { id: 'rep-01', titre: 'Rapport Mensuel Anti-Fraude - Août 2026', type: 'monthly', dateCreation: '2026-09-01T00:00:00Z', taille: '2.4 MB', downloadUrl: '#' },
  { id: 'rep-02', titre: 'Audit de Sécurité Lignes Compromises Q2', type: 'security', dateCreation: '2026-08-15T00:00:00Z', taille: '1.8 MB', downloadUrl: '#' },
  { id: 'rep-03', titre: 'Analyse d\'Impact Partenaires Telco', type: 'api_usage', dateCreation: '2026-08-01T00:00:00Z', taille: '3.1 MB', downloadUrl: '#' },
];
