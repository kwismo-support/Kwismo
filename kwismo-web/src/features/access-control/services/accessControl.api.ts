import { apiClient } from '@/shared/lib/axios';

export interface RoleItem {
  id: string;
  nomRole: string;
  description?: string;
  usersCount?: number;
}

export interface PermissionItem {
  id: string;
  permission: string;
  description?: string;
}

export const accessControlApi = {
  getRoles: async (): Promise<RoleItem[]> => {
    try {
      const res = await apiClient.get('/access-control/roles');
      return res.data || [];
    } catch {
      return [];
    }
  },

  getPermissions: async (): Promise<PermissionItem[]> => {
    try {
      const res = await apiClient.get('/access-control/permissions');
      return res.data || [];
    } catch {
      return [];
    }
  },
};
