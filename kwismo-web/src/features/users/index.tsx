import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usersApi } from './services/users.api';
import { toast } from '@/shared/store/toastStore';
import { PageHeader, ConfirmDialog } from '@/shared/components';
import UsersTable from './components/UsersTable';

export default function UsersPage() {
  const { t } = useTranslation(['admin', 'common']);
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [userToToggle, setUserToToggle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    setLoading(true);
    usersApi.getUsers(1, 100)
      .then((data) => {
        setUsers(data.items || []);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleConfirmToggleStatus = async () => {
    if (!userToToggle) return;
    const currentActive = userToToggle.statut === 'active' || userToToggle.statut === 'Actif';
    const nextStatus = currentActive ? 'suspended' : 'active';
    try {
      await usersApi.updateUserStatus(userToToggle.id, nextStatus);
      toast.success(`Le statut du compte de ${userToToggle.prenom || ''} ${userToToggle.nom || ''} est désormais ${nextStatus}.`);
      loadUsers();
    } catch {
      toast.error('Erreur lors du changement de statut.');
    } finally {
      setUserToToggle(null);
    }
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    toast.success(`Utilisateur ${userToDelete.prenom} ${userToDelete.nom} supprimé.`);
    setUserToDelete(null);
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body">
      <PageHeader
        title={t('admin:users.title')}
        subtitle="Supervision des accès utilisateurs, attribution des rôles administratifs et gestion des comptes."
        rolePerspective="ADMIN"
        showBreadcrumb={true}
        actions={[
          {
            label: 'Nouveau compte',
            icon: 'solar:user-plus-bold',
            variant: 'primary',
            onClick: () => navigate('/app/users/new'),
          },
        ]}
      />

      <UsersTable
        users={users}
        isLoading={loading}
        onSelectUser={(u) => navigate(`/app/users/${u.id}`)}
        onToggleStatus={(u) => setUserToToggle(u)}
        onDeleteUser={(u) => setUserToDelete(u)}
      />

      <ConfirmDialog
        isOpen={!!userToToggle}
        onClose={() => setUserToToggle(null)}
        onConfirm={handleConfirmToggleStatus}
        title={(userToToggle?.statut === 'Actif' || userToToggle?.statut === 'active') ? 'Suspendre cet utilisateur ?' : 'Réactiver cet utilisateur ?'}
        description={`Voulez-vous modifier l'accès au compte de ${userToToggle?.prenom || ''} ${userToToggle?.nom || ''} (${userToToggle?.email}) ?`}
        confirmLabel="Confirmer la modification"
        variant={(userToToggle?.statut === 'Actif' || userToToggle?.statut === 'active') ? 'warning' : 'success'}
      />

      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDeleteUser}
        title="Supprimer l'utilisateur ?"
        description={`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${userToDelete?.prenom || ''} ${userToDelete?.nom || ''} ? Cette action supprimera tous ses accès.`}
        confirmLabel="Supprimer le compte"
        variant="danger"
      />
    </div>
  );
}
