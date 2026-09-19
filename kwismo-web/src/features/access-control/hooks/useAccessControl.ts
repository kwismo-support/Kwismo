import { useState, useEffect, useCallback } from 'react';
import { accessControlApi, type RoleOut, type AccessRightOut } from '../services/accessControl.api';
import { toast } from '@/shared/store/toastStore';

export function useAccessControl() {
  const [roles, setRoles] = useState<RoleOut[]>([]);
  const [accessRights, setAccessRights] = useState<AccessRightOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedRoles, fetchedRights] = await Promise.all([
        accessControlApi.getRoles(),
        accessControlApi.getAccessRights(),
      ]);
      setRoles(fetchedRoles);
      setAccessRights(fetchedRights);
    } catch {
      toast.error('errors:http.serverError');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createRole = async (nomRole: string) => {
    setSaving(true);
    try {
      const newRole = await accessControlApi.createRole(nomRole);
      setRoles((prev) => [...prev, newRole]);
      toast.success('admin:access.roleCreated');
      return newRole;
    } catch (err: any) {
      toast.error(err.message || 'errors:error');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    setSaving(true);
    try {
      await accessControlApi.deleteRole(roleId);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      setAccessRights((prev) => prev.filter((ar) => ar.role_id !== roleId));
      toast.success('admin:access.roleDeleted');
    } catch (err: any) {
      toast.error(err.message || 'errors:error');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const toggleAccessRight = async (roleId: string, permission: string, grant: boolean) => {
    setSaving(true);
    try {
      if (grant) {
        const newRight = await accessControlApi.createAccessRight(roleId, permission);
        setAccessRights((prev) => [...prev, newRight]);
      } else {
        const existingRight = accessRights.find((ar) => ar.role_id === roleId && ar.permission === permission);
        if (existingRight) {
          await accessControlApi.deleteAccessRight(existingRight.id);
          setAccessRights((prev) => prev.filter((ar) => ar.id !== existingRight.id));
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'errors:error');
    } finally {
      setSaving(false);
    }
  };

  const filteredRoles = roles;

  return {
    roles: filteredRoles,
    rawRoles: roles,
    accessRights,
    loading,
    saving,
    refreshData,
    createRole,
    deleteRole,
    toggleAccessRight,
  };
}
