export type NumberOwnerStatus = 'Vérifié' | 'En attente' | 'Compromis';
export type AccountStatus = 'Actif' | 'Suspendu' | 'Inactif' | 'active' | 'suspended';

export interface UserNumber {
  id: number | string;
  num: string;
  op: string;
  pays: string;
  indicatif: string;
  statut: NumberOwnerStatus;
  verif: string;
}

export interface UserDTO {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  emailVerifie: boolean;
  statut: AccountStatus;
  roleId?: string;
  role: { id: string; nomRole: string };
  partnerId?: string | null;
  partner?: { id: string; nomEntreprise: string } | null;
  dateInscription: string;
  numeros: UserNumber[];
}

export interface Contact {
  id: number;
  nom: string;
  num: string;
  statut: 'Sécurisé' | 'À signaler' | 'Frauduleux' | 'Inconnu';
}

export const MOCK_USERS: UserDTO[] = [
  {
    id: 'usr-001',
    nom: 'Nguesso',
    prenom: 'Alice',
    email: 'alice.nguesso@kwismo.com',
    emailVerifie: true,
    statut: 'Actif',
    roleId: 'role-admin',
    role: { id: 'role-admin', nomRole: 'Admin' },
    dateInscription: '2025-01-02T08:30:00Z',
    numeros: [
      { id: 101, num: '+237 691 234 567', op: 'MTN', pays: 'Cameroun', indicatif: '+237', statut: 'Vérifié', verif: '02/01/2025' },
      { id: 102, num: '+237 655 987 654', op: 'Orange', pays: 'Cameroun', indicatif: '+237', statut: 'Vérifié', verif: '18/03/2025' },
    ],
  },
  {
    id: 'usr-002',
    nom: 'Sow',
    prenom: 'Ibrahima',
    email: 'i.sow@orange.sn',
    emailVerifie: true,
    statut: 'Actif',
    roleId: 'role-partner',
    role: { id: 'role-partner', nomRole: 'Partenaire' },
    partnerId: 'part-orange-sn',
    partner: { id: 'part-orange-sn', nomEntreprise: 'Orange Sénégal' },
    dateInscription: '2025-02-14T14:20:00Z',
    numeros: [
      { id: 103, num: '+221 77 891 23 45', op: 'Orange', pays: 'Sénégal', indicatif: '+221', statut: 'Vérifié', verif: '14/02/2025' },
      { id: 104, num: '+221 70 445 88 12', op: 'Wave', pays: 'Sénégal', indicatif: '+221', statut: 'En attente', verif: '—' },
      { id: 105, num: '+221 76 112 34 56', op: 'Free', pays: 'Sénégal', indicatif: '+221', statut: 'Vérifié', verif: '22/05/2025' },
    ],
  },
  {
    id: 'usr-003',
    nom: 'Mbeki',
    prenom: 'Jean',
    email: 'jean.mbeki@kwismo.com',
    emailVerifie: true,
    statut: 'Suspendu',
    roleId: 'role-admin',
    role: { id: 'role-admin', nomRole: 'Admin' },
    dateInscription: '2025-01-15T10:15:00Z',
    numeros: [
      { id: 106, num: '+237 690 123 456', op: 'MTN', pays: 'Cameroun', indicatif: '+237', statut: 'Compromis', verif: '10/07/2026' },
    ],
  },
  {
    id: 'usr-004',
    nom: 'Asante',
    prenom: 'Kwame',
    email: 'k.asante@mtn.gh',
    emailVerifie: true,
    statut: 'Actif',
    roleId: 'role-partner',
    role: { id: 'role-partner', nomRole: 'Partenaire' },
    partnerId: 'part-mtn-gh',
    partner: { id: 'part-mtn-gh', nomEntreprise: 'MTN Ghana' },
    dateInscription: '2025-06-08T16:45:00Z',
    numeros: [
      { id: 107, num: '+233 20 987 65 43', op: 'MTN', pays: 'Ghana', indicatif: '+233', statut: 'Vérifié', verif: '08/06/2025' },
      { id: 108, num: '+233 24 456 78 90', op: 'Airtel', pays: 'Ghana', indicatif: '+233', statut: 'Vérifié', verif: '12/06/2025' },
    ],
  },
  {
    id: 'usr-005',
    nom: 'Adeyemi',
    prenom: 'Ngozi',
    email: 'ngozi.adeyemi@gmail.com',
    emailVerifie: false,
    statut: 'Inactif',
    roleId: 'role-analyst',
    role: { id: 'role-analyst', nomRole: 'Analyste' },
    dateInscription: '2025-04-30T11:00:00Z',
    numeros: [
      { id: 109, num: '+234 80 1234 5678', op: 'MTN', pays: 'Nigéria', indicatif: '+234', statut: 'En attente', verif: '—' },
    ],
  },
  {
    id: 'usr-006',
    nom: 'Ben Salah',
    prenom: 'Aïcha',
    email: 'aicha.bensalah@ooredoo.tn',
    emailVerifie: true,
    statut: 'Actif',
    roleId: 'role-partner',
    role: { id: 'role-partner', nomRole: 'Partenaire' },
    partnerId: 'part-ooredoo-tn',
    partner: { id: 'part-ooredoo-tn', nomEntreprise: 'Ooredoo Tunisie' },
    dateInscription: '2025-07-03T09:30:00Z',
    numeros: [
      { id: 110, num: '+216 20 456 789', op: 'Ooredoo', pays: 'Tunisie', indicatif: '+216', statut: 'Vérifié', verif: '03/07/2025' },
    ],
  },
  {
    id: 'usr-007',
    nom: 'Diarra',
    prenom: 'Moussa',
    email: 'm.diarra@kwismo.com',
    emailVerifie: true,
    statut: 'Actif',
    roleId: 'role-support',
    role: { id: 'role-support', nomRole: 'Support' },
    dateInscription: '2025-07-10T15:20:00Z',
    numeros: [
      { id: 111, num: '+223 76 543 210', op: 'Orange', pays: 'Mali', indicatif: '+223', statut: 'Vérifié', verif: '10/07/2025' },
      { id: 112, num: '+223 65 221 908', op: 'Moov', pays: 'Mali', indicatif: '+223', statut: 'Vérifié', verif: '15/07/2025' },
    ],
  },
  {
    id: 'usr-008',
    nom: 'Ouédraogo',
    prenom: 'Fatimata',
    email: 'f.ouedraogo@kwismo.com',
    emailVerifie: true,
    statut: 'Actif',
    roleId: 'role-analyst',
    role: { id: 'role-analyst', nomRole: 'Analyste' },
    dateInscription: '2025-07-19T12:00:00Z',
    numeros: [
      { id: 113, num: '+226 70 123 456', op: 'Moov', pays: 'Burkina Faso', indicatif: '+226', statut: 'Vérifié', verif: '19/07/2025' },
    ],
  },
  {
    id: 'usr-009',
    nom: 'Kouyaté',
    prenom: 'Diallo',
    email: 'dkouyate@mtn.com',
    emailVerifie: true,
    statut: 'Actif',
    roleId: 'role-partner',
    role: { id: 'role-partner', nomRole: 'Partenaire' },
    partnerId: 'part-mtn-cm',
    partner: { id: 'part-mtn-cm', nomEntreprise: 'MTN Cameroun' },
    dateInscription: '2023-01-15T10:00:00Z',
    numeros: [
      { id: 114, num: '+237 699 123 456', op: 'MTN', pays: 'Cameroun', indicatif: '+237', statut: 'Vérifié', verif: '15/01/2023' },
    ],
  },
  {
    id: 'usr-010',
    nom: 'Yao',
    prenom: 'Paul',
    email: 'pyao@sgci.com',
    emailVerifie: false,
    statut: 'Actif',
    roleId: 'role-partner',
    role: { id: 'role-partner', nomRole: 'Partenaire' },
    partnerId: 'part-sgci',
    partner: { id: 'part-sgci', nomEntreprise: 'Société Générale CI' },
    dateInscription: '2023-09-11T11:30:00Z',
    numeros: [
      { id: 115, num: '+225 07 45 678 901', op: 'Orange', pays: "Côte d'Ivoire", indicatif: '+225', statut: 'Compromis', verif: '20/07/2026' },
    ],
  },
];

export const currentUser: UserDTO = {
  id: 'usr-1000',
  nom: 'Talla',
  prenom: 'Bernard',
  email: 'bernard.talla@gmail.com',
  emailVerifie: true,
  statut: 'Actif',
  roleId: 'role-user',
  role: { id: 'role-user', nomRole: 'Utilisateur' },
  dateInscription: '2025-03-12T10:00:00Z',
  numeros: [
    { id: 2001, num: '+237 691 456 789', op: 'MTN', pays: 'Cameroun', indicatif: '+237', statut: 'Vérifié', verif: '12/03/2025' },
    { id: 2002, num: '+237 655 112 233', op: 'Orange', pays: 'Cameroun', indicatif: '+237', statut: 'Vérifié', verif: '20/04/2025' },
    { id: 2003, num: '+237 680 998 877', op: 'Camtel', pays: 'Cameroun', indicatif: '+237', statut: 'En attente', verif: '—' },
  ],
};

export const userContacts: Contact[] = [
  { id: 1, nom: 'Marie Talla', num: '+237 690 111 222', statut: 'Sécurisé' },
  { id: 2, nom: 'Paul Nkeng', num: '+237 677 333 444', statut: 'Sécurisé' },
  { id: 3, nom: 'Grace Fon', num: '+237 655 555 666', statut: 'À signaler' },
  { id: 4, nom: 'Samuel Eto', num: '+237 699 777 888', statut: 'Sécurisé' },
  { id: 5, nom: 'Aïssatou Bah', num: '+237 681 999 000', statut: 'Inconnu' },
  { id: 6, nom: 'Jean-Pierre M.', num: '+237 672 121 212', statut: 'Sécurisé' },
  { id: 7, nom: 'Fatou Diop', num: '+237 690 343 434', statut: 'Sécurisé' },
  { id: 8, nom: 'Boubacar S.', num: '+237 655 565 656', statut: 'À signaler' },
];

export const pendingInvites = [
  { id: 1, email: 'nouveau@kwismo.com', role: 'Analyste', by: 'Alice Nguesso', date: '15/07/2026' },
  { id: 2, email: 'support@mtn.cm', role: 'Support', by: 'Jean Mbeki', date: '18/07/2026' },
];
