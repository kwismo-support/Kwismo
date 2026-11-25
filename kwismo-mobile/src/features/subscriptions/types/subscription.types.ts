export interface SubscriptionPlanItem {
  id: string;
  code: string;
  nom_fr: string;
  nom_en: string;
  prix_fcfa: number;
  duree_jours: number;
  max_numeros: number;
  max_membres: number;
  description_fr?: string | null;
  description_en?: string | null;
  options_fr?: string[] | null;
  options_en?: string[] | null;
  badge_fr?: string | null;
  badge_en?: string | null;
  est_actif: boolean;
  ordre: number;
  created_at?: string;
  updated_at?: string;
}

export type SubscriptionStatus = 'free' | 'active' | 'expiring_soon' | 'grace_period' | 'expired';

export interface FamilyMemberItem {
  id: string;
  name: string;
  phoneNumber: string;
  role: 'admin' | 'member';
  joinedAt: string;
  isProtected: boolean;
}

export interface UserSubscriptionState {
  currentPlan: SubscriptionPlanItem | null;
  status: SubscriptionStatus;
  startDate?: string | null;
  expirationDate?: string | null;
  daysLeft: number;
  numbersCount: number;
  maxNumbers: number;
  membersCount: number;
  maxMembers: number;
  isFamilyAdmin: boolean;
  familyAdminName?: string | null;
  familyMembers: FamilyMemberItem[];
}
