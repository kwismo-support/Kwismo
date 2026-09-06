export interface UserDTO {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  emailVerifie: boolean;
  statut: 'active' | 'suspended';
  roleId: string;
  role: { id: string; nomRole: 'user' | 'partner' | 'admin' };
  partnerId?: string | null;
  partner?: { id: string; nomEntreprise: string } | null;
  dateInscription: string;
}

export const MOCK_USERS: UserDTO[] = [
  {
    id: 'usr-001',
    nom: 'Mbarga',
    prenom: 'Jean-Baptiste',
    email: 'admin@kwismo.com',
    emailVerifie: true,
    statut: 'active',
    roleId: 'role-admin',
    role: { id: 'role-admin', nomRole: 'admin' },
    partnerId: null,
    dateInscription: '2026-01-15T08:30:00Z',
  },
  {
    id: 'usr-002',
    nom: 'Kamga',
    prenom: 'Claire',
    email: 'claire.kamga@orange.cm',
    emailVerifie: true,
    statut: 'active',
    roleId: 'role-partner',
    role: { id: 'role-partner', nomRole: 'partner' },
    partnerId: 'part-orange-cm',
    partner: { id: 'part-orange-cm', nomEntreprise: 'Orange Cameroun' },
    dateInscription: '2026-02-10T14:20:00Z',
  },
  {
    id: 'usr-003',
    nom: 'Fosso',
    prenom: 'Alain',
    email: 'alain.fosso@mtn.cm',
    emailVerifie: true,
    statut: 'active',
    roleId: 'role-partner',
    role: { id: 'role-partner', nomRole: 'partner' },
    partnerId: 'part-mtn-cm',
    partner: { id: 'part-mtn-cm', nomEntreprise: 'MTN Cameroun' },
    dateInscription: '2026-03-01T10:15:00Z',
  },
  {
    id: 'usr-004',
    nom: 'Njoya',
    prenom: 'Ibrahim',
    email: 'ibrahim.njoya@gmail.com',
    emailVerifie: false,
    statut: 'suspended',
    roleId: 'role-user',
    role: { id: 'role-user', nomRole: 'user' },
    partnerId: null,
    dateInscription: '2026-04-12T16:45:00Z',
  },
];
