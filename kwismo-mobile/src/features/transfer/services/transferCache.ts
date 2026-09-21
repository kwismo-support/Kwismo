import { UserPhoneItem } from '@/features/numbers/services/numbers.api';

interface TransferMemoryCache {
  myNumbers: UserPhoneItem[] | null;
  myNumbersTimestamp: number;
  actionsByOperator: Record<string, { actions: any[]; timestamp: number }>;
  verifiedNumbers: Record<string, { data: any; timestamp: number }>;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

const memoryCache: TransferMemoryCache = {
  myNumbers: null,
  myNumbersTimestamp: 0,
  actionsByOperator: {},
  verifiedNumbers: {},
};

export const transferCache = {
  getCachedMyNumbers(): UserPhoneItem[] | null {
    if (memoryCache.myNumbers && Date.now() - memoryCache.myNumbersTimestamp < CACHE_TTL_MS) {
      return memoryCache.myNumbers;
    }
    return memoryCache.myNumbers;
  },

  setCachedMyNumbers(numbers: UserPhoneItem[]) {
    memoryCache.myNumbers = numbers;
    memoryCache.myNumbersTimestamp = Date.now();
  },

  getCachedActions(opId: string): any[] | null {
    const cached = memoryCache.actionsByOperator[opId];
    if (cached) {
      return cached.actions;
    }
    return null;
  },

  setCachedActions(opId: string, actions: any[]) {
    memoryCache.actionsByOperator[opId] = {
      actions,
      timestamp: Date.now(),
    };
  },

  getCachedVerifiedNumber(phone: string): any | null {
    const cached = memoryCache.verifiedNumbers[phone];
    if (cached) {
      return cached.data;
    }
    return null;
  },

  setCachedVerifiedNumber(phone: string, data: any) {
    memoryCache.verifiedNumbers[phone] = {
      data,
      timestamp: Date.now(),
    };
  },

  clearCache() {
    memoryCache.myNumbers = null;
    memoryCache.myNumbersTimestamp = 0;
    memoryCache.actionsByOperator = {};
    memoryCache.verifiedNumbers = {};
  },
};
