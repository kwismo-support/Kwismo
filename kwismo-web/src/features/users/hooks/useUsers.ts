import { useState, useEffect, useCallback } from 'react';
import { usersApi, type UserItem } from '../services/users.api';
import { toast } from '@/shared/store/toastStore';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '@/shared/hooks/usePermissions';

export function useUsers() {
  const { t } = useTranslation('admin');
  const { isPartner, partnerId } = usePermissions();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.getUsers(page, pageSize);
      setUsers(res.items);
      setTotal(res.total);
    } catch {
      toast.error(t('users.toasts.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateStatus = async (id: string, status: string): Promise<boolean> => {
    try {
      await usersApi.updateUserStatus(id, status);
      toast.success(t('users.toasts.statusSuccess'));
      fetchUsers();
      return true;
    } catch {
      toast.error(t('users.toasts.statusError'));
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success(t('users.toasts.deleteSuccess'));
      return true;
    } catch {
      toast.error(t('users.toasts.deleteError'));
      return false;
    }
  };

  const filteredUsers = users.filter((u) => {
    if (isPartner && partnerId && (u as any).partner_id && (u as any).partner_id !== partnerId) {
      return false;
    }

    const matchesSearch =
      !searchQuery ||
      u.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || u.statut.toLowerCase() === statusFilter.toLowerCase();

    const matchesRole =
      roleFilter === 'ALL' || (u.role && u.role.toLowerCase() === roleFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesRole;
  });

  return {
    users: filteredUsers,
    rawUsers: users,
    total: isPartner ? filteredUsers.length : total,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    statusFilter,
    setStatusFilter,
    roleFilter,
    setRoleFilter,
    searchQuery,
    setSearchQuery,
    refetch: fetchUsers,
    updateStatus,
    deleteUser,
  };
}
