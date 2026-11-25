import { create } from 'zustand';
import { storage } from '@/shared/services/storage';
import { subscriptionsApi } from '../services/subscriptions.api';
import type {
  SubscriptionPlanItem,
  UserSubscriptionState,
  SubscriptionStatus,
  FamilyMemberItem,
} from '../types/subscription.types';

interface SubscriptionStoreState extends UserSubscriptionState {
  availablePlans: SubscriptionPlanItem[];
  loading: boolean;
  fetchPlans: () => Promise<void>;
  fetchUserSubscription: () => Promise<void>;
  activatePlanLocally: (plan: SubscriptionPlanItem) => Promise<void>;
  addFamilyMemberLocally: (name: string, phoneNumber: string) => Promise<boolean>;
  removeFamilyMemberLocally: (id: string) => Promise<void>;
  computeStatus: (expirationDateStr?: string | null) => { status: SubscriptionStatus; daysLeft: number };
}

const STORAGE_KEY = 'kwismo_subscription_state_v1';

const calculateStatusAndDays = (expirationDateStr?: string | null): { status: SubscriptionStatus; daysLeft: number } => {
  if (!expirationDateStr) {
    return { status: 'free', daysLeft: 0 };
  }
  const expDate = new Date(expirationDateStr).getTime();
  const now = new Date().getTime();
  const diffMs = expDate - now;
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft > 5) {
    return { status: 'active', daysLeft };
  } else if (daysLeft > 0) {
    return { status: 'expiring_soon', daysLeft };
  } else if (daysLeft >= -3) {
    // 72h de période de grâce
    return { status: 'grace_period', daysLeft };
  } else {
    return { status: 'expired', daysLeft };
  }
};

export const useSubscriptionStore = create<SubscriptionStoreState>((set, get) => ({
  currentPlan: null,
  status: 'free',
  startDate: null,
  expirationDate: null,
  daysLeft: 0,
  numbersCount: 1,
  maxNumbers: 1,
  membersCount: 1,
  maxMembers: 1,
  isFamilyAdmin: false,
  familyAdminName: null,
  familyMembers: [],
  availablePlans: [],
  loading: false,

  computeStatus: (expirationDateStr) => calculateStatusAndDays(expirationDateStr),

  fetchPlans: async () => {
    try {
      set({ loading: true });
      const plans = await subscriptionsApi.getActivePlans();
      if (plans && plans.length > 0) {
        set({ availablePlans: plans });
      }
    } catch {
      // Garder les plans en cache si hors-ligne
    } finally {
      set({ loading: false });
    }
  },

  fetchUserSubscription: async () => {
    try {
      // 1. Lire d'abord le cache local
      const cached = await storage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const { status, daysLeft } = calculateStatusAndDays(parsed.expirationDate);
          set({ ...parsed, status, daysLeft });
        } catch {}
      }

      // 2. Tenter de rafraîchir depuis le serveur
      const serverSub = await subscriptionsApi.getUserSubscription();
      if (serverSub) {
        const { status, daysLeft } = calculateStatusAndDays(serverSub.expirationDate);
        const updated = { ...serverSub, status, daysLeft };
        set(updated);
        await storage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {
      // Conserver les données locales
    }
  },

  activatePlanLocally: async (plan: SubscriptionPlanItem) => {
    const now = new Date();
    const expDate = new Date(now.getTime() + plan.duree_jours * 24 * 60 * 60 * 1000);
    const { status, daysLeft } = calculateStatusAndDays(expDate.toISOString());

    const isFamily = plan.max_membres > 1;

    const newState: Partial<UserSubscriptionState> = {
      currentPlan: plan,
      status,
      startDate: now.toISOString(),
      expirationDate: expDate.toISOString(),
      daysLeft,
      maxNumbers: plan.max_numeros,
      maxMembers: plan.max_membres,
      isFamilyAdmin: isFamily,
      membersCount: 1,
      familyMembers: isFamily
        ? [
            {
              id: 'admin_self',
              name: 'Moi (Chef de famille)',
              phoneNumber: 'Numéro Principal',
              role: 'admin',
              joinedAt: now.toISOString(),
              isProtected: true,
            },
          ]
        : [],
    };

    set(newState as any);
    await storage.setItem(STORAGE_KEY, JSON.stringify({ ...get(), ...newState }));
  },

  addFamilyMemberLocally: async (name: string, phoneNumber: string) => {
    const { familyMembers, maxMembers } = get();
    if (familyMembers.length >= maxMembers) {
      return false;
    }

    const newMember: FamilyMemberItem = {
      id: `fam_${Date.now()}`,
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      role: 'member',
      joinedAt: new Date().toISOString(),
      isProtected: true,
    };

    const updatedList = [...familyMembers, newMember];
    set({ familyMembers: updatedList, membersCount: updatedList.length });
    await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
    return true;
  },

  removeFamilyMemberLocally: async (id: string) => {
    const { familyMembers } = get();
    const updatedList = familyMembers.filter((m) => m.id !== id);
    set({ familyMembers: updatedList, membersCount: updatedList.length });
    await storage.setItem(STORAGE_KEY, JSON.stringify(get()));
  },
}));
