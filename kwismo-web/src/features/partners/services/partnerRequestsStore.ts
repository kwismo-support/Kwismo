export interface PartnerRequestItem {
  id: string;
  nomEntreprise: string;
  typePartenariat: string;
  nomContact: string;
  prenomContact: string;
  email: string;
  telephone: string;
  pays?: string;
  message?: string;
  dateDemande: string;
  statut: 'pending' | 'validated' | 'rejected';
  validatedAt?: string;
  loginCredentials?: {
    emailConnexion: string;
    role: string;
  };
}

const INITIAL_REQUESTS: PartnerRequestItem[] = [
  {
    id: 'req-001',
    nomEntreprise: 'PaySecur International',
    typePartenariat: 'fintech',
    nomContact: 'Kamdem',
    prenomContact: 'Eric',
    email: 'contact@paysecur.cm',
    telephone: '+237699112233',
    message: "Nous souhaitons intégrer l'API KWISMO pour vérifier les numéros bénéficiaires avant transfert.",
    dateDemande: '2026-09-06T14:30:00Z',
    statut: 'pending',
  },
  {
    id: 'req-002',
    nomEntreprise: 'Express Exchange Microfinance',
    typePartenariat: 'microfinance',
    nomContact: 'Ngo Ndoumbe',
    prenomContact: 'Claire',
    email: 'c.ngo@expressexchange.cm',
    telephone: '+237677889900',
    message: "Demande de partenariat institutionnel pour nos 45 agences de transfert d'argent.",
    dateDemande: '2026-09-05T09:15:00Z',
    statut: 'pending',
  },
  {
    id: 'req-003',
    nomEntreprise: 'Afriland Mobile Pay',
    typePartenariat: 'bank',
    nomContact: 'Fosso',
    prenomContact: 'Alain',
    email: 'a.fosso@afrilandfirstbank.com',
    telephone: '+237655001122',
    message: 'Interconnexion direct USSD et détection de SIM Swap.',
    dateDemande: '2026-09-04T16:00:00Z',
    statut: 'validated',
    validatedAt: '2026-09-04T18:30:00Z',
    loginCredentials: {
      emailConnexion: 'a.fosso@afrilandfirstbank.com',
      role: 'Partenaire Premium',
    },
  },
];

let requestsMemory: PartnerRequestItem[] = [...INITIAL_REQUESTS];
const listeners: Array<() => void> = [];

export const partnerRequestsStore = {
  getRequests: (): PartnerRequestItem[] => [...requestsMemory],
  
  getPendingCount: (): number => requestsMemory.filter((r) => r.statut === 'pending').length,

  addRequest: (request: Omit<PartnerRequestItem, 'id' | 'dateDemande' | 'statut'>): PartnerRequestItem => {
    const newItem: PartnerRequestItem = {
      ...request,
      id: `req-${Date.now()}`,
      dateDemande: new Date().toISOString(),
      statut: 'pending',
    };
    requestsMemory = [newItem, ...requestsMemory];
    listeners.forEach((l) => l());
    return newItem;
  },

  validateRequest: (id: string, emailConnexion: string, role: string): PartnerRequestItem | null => {
    let updated: PartnerRequestItem | null = null;
    requestsMemory = requestsMemory.map((r) => {
      if (r.id === id) {
        updated = {
          ...r,
          statut: 'validated',
          validatedAt: new Date().toISOString(),
          loginCredentials: {
            emailConnexion,
            role,
          },
        };
        return updated;
      }
      return r;
    });
    listeners.forEach((l) => l());
    return updated;
  },

  rejectRequest: (id: string): PartnerRequestItem | null => {
    let updated: PartnerRequestItem | null = null;
    requestsMemory = requestsMemory.map((r) => {
      if (r.id === id) {
        updated = {
          ...r,
          statut: 'rejected',
        };
        return updated;
      }
      return r;
    });
    listeners.forEach((l) => l());
    return updated;
  },

  subscribe: (listener: () => void) => {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  },
};
