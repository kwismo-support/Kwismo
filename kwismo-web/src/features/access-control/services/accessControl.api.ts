import { apiClient } from '@/shared/lib/axios';
import { ENDPOINTS } from '@/config/endpoints';

export interface RoleOut {
  id: string;
  nom_role: string;
  description?: string;
}

export interface AccessRightOut {
  id: string;
  role_id: string;
  permission: string;
  description?: string;
}

export const accessControlApi = {
  getRoles: async (): Promise<RoleOut[]> => {
    try {
      const response = await apiClient.get(ENDPOINTS.access.roles);
      return response.data || [];
    } catch {
      return [];
    }
  },

  createRole: async (nomRole: string): Promise<RoleOut> => {
    const response = await apiClient.post(ENDPOINTS.access.roles, {
      nom_role: nomRole,
    });
    return response.data;
  },

  deleteRole: async (roleId: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.access.role(roleId));
  },

  getAccessRights: async (): Promise<AccessRightOut[]> => {
    try {
      const response = await apiClient.get(ENDPOINTS.access.rights);
      return response.data || [];
    } catch {
      return [];
    }
  },

  createAccessRight: async (roleId: string, permission: string, description?: string): Promise<AccessRightOut> => {
    const response = await apiClient.post(ENDPOINTS.access.rights, {
      role_id: roleId,
      permission,
      description: description || '',
    });
    return response.data;
  },

  deleteAccessRight: async (rightId: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.access.right(rightId));
  },
};
