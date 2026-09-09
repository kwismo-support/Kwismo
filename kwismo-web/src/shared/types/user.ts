import type { Role } from '@/config/constants';

export interface User {
  id:        string;
  nom:       string;
  prenom:    string;
  email:     string;
  role:      Role;
  langue:    'fr' | 'en';
  isBanned:  boolean;
  createdAt: string;
  updatedAt: string;
  partnerId?: string;
}

export interface UserSummary {
  id:     string;
  nom:    string;
  prenom: string;
  email:  string;
  role:   Role;
}
