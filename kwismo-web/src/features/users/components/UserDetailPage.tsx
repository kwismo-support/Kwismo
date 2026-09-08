import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { PageHeader, StatusBadge } from '@/shared/components';
import { UserAvatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { PhoneInput } from '@/shared/ui/phone-input';
import { FormSkeleton } from '@/shared/ui/skeleton';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { toast } from '@/shared/store/toastStore';
import { api } from '@/shared/lib/api';
import type { UserDTO, AccountStatus } from '@/shared/mock';

const MODULE_LIST = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'numbers', label: 'Gestion des Numéros' },
  { id: 'users', label: 'Gestion des Utilisateurs' },
  { id: 'partners', label: 'Gestion des Partenaires' },
  { id: 'ussd', label: 'USSD & Opérateurs' },
  { id: 'access', label: 'Droits d\'accès & Sécurité' },
  { id: 'reports', label: 'Rapports & Audit' },
];

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  // Initial & Current Form State for Dirty Checking
  const [initialData, setInitialData] = useState({
    prenom: '',
    nom: '',
    email: '',
    roleName: 'Utilisateur',
    statut: 'Actif' as AccountStatus,
    telephone: '',
    permissions: ['dashboard', 'numbers'] as string[],
  });

  const [formData, setFormData] = useState({ ...initialData });

  useEffect(() => {
    let mounted = true;
    if (id === 'new') {
      const newUser: UserDTO = {
        id: 'new',
        prenom: 'Nouveau',
        nom: 'Utilisateur',
        email: '',
        role: { id: 'user', nomRole: 'Utilisateur' },
        statut: 'Actif',
        emailVerifie: false,
        dateInscription: new Date().toISOString(),
        numeros: [],
      };
      setUser(newUser);
      setIsEditing(true);
      const emptyState = {
        prenom: '',
        nom: '',
        email: '',
        roleName: 'Utilisateur',
        statut: 'Actif' as AccountStatus,
        telephone: '',
        permissions: ['dashboard', 'numbers'],
      };
      setInitialData(emptyState);
      setFormData(emptyState);
      setLoading(false);
      return;
    }

    if (id) {
      api.getUsers()
        .then((data) => {
          if (!mounted) return;
          const found = data.find((u: UserDTO) => String(u.id) === id);
          if (found) {
            setUser(found);
            const roleName = typeof found.role === 'object' ? found.role.nomRole : String(found.role || 'Utilisateur');
            const dataState = {
              prenom: found.prenom || '',
              nom: found.nom || '',
              email: found.email || '',
              roleName,
              statut: found.statut || 'Actif',
              telephone: (found as any).telephone || '',
              permissions: roleName.toLowerCase().includes('admin')
                ? MODULE_LIST.map((m) => m.id)
                : ['dashboard', 'numbers'],
            };
            setInitialData(dataState);
            setFormData(dataState);
          }
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 font-body">
        <FormSkeleton />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 font-body text-center py-12">
        <Icon icon="solar:user-block-bold-duotone" className="text-5xl text-slate-400 mx-auto mb-3" />
        <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">Utilisateur introuvable</h3>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/app/users')}>
          Retour à la liste
        </Button>
      </div>
    );
  }

  // Check if form is dirty (modified)
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);
  const roleNameStr = typeof user.role === 'object' ? user.role.nomRole : String(user.role || 'USER');

  const handleTogglePermission = (modId: string) => {
    if (!isEditing) return;
    setFormData((prev) => {
      const exists = prev.permissions.includes(modId);
      const updated = exists ? prev.permissions.filter((p) => p !== modId) : [...prev.permissions, modId];
      return { ...prev, permissions: updated };
    });
  };

  const handleSave = () => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        statut: formData.statut,
        role: { ...prev.role, nomRole: formData.roleName },
      };
    });
    setInitialData({ ...formData });
    setIsEditing(false);
    toast.success('Informations et permissions utilisateur enregistrées !');
  };

  const handleBack = () => {
    if (isDirty) {
      setShowUnsavedModal(true);
    } else {
      navigate('/app/users');
    }
  };

  const handleConfirmDiscard = () => {
    setShowUnsavedModal(false);
    navigate('/app/users');
  };

  const handleConfirmSaveAndLeave = () => {
    handleSave();
    setShowUnsavedModal(false);
    navigate('/app/users');
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-6xl mx-auto">
      {/* Top Page Header */}
      <PageHeader
        title={`Fiche Utilisateur — ${user.prenom} ${user.nom}`}
        subtitle="Consultation et édition des informations, rôles et privilèges spécifiques."
        showBreadcrumb={false}
        showBack={true}
        onBack={handleBack}
        actions={[
          !isEditing ? {
            label: 'Éditer',
            icon: 'solar:pen-bold',
            variant: 'primary',
            onClick: () => setIsEditing(true),
          } : {
            label: 'Enregistrer les modifications',
            icon: 'solar:diskette-bold',
            variant: 'primary',
            disabled: !isDirty,
            onClick: handleSave,
          },
        ]}
      />

      {/* Profile Header Banner */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <UserAvatar
            name={`${user.prenom} ${user.nom}`}
            roleRing={roleNameStr.toLowerCase().includes('admin') ? 'admin' : roleNameStr.toLowerCase().includes('partenaire') ? 'partner' : 'user'}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-title text-xl font-bold text-slate-900 dark:text-white">
                {user.prenom} {user.nom}
              </h2>
              <StatusBadge status={user.statut} size="sm" />
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">{user.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">Membre depuis le {user.dateInscription ? new Date(user.dateInscription).toLocaleDateString('fr-FR') : '01/01/2026'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.emailVerifie ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Icon icon="solar:check-circle-bold" className="text-base" /> Email Vérifié
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Icon icon="solar:clock-circle-bold" className="text-base" /> Email non vérifié
            </span>
          )}
        </div>
      </div>

      {/* Main Details Form */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon icon="solar:user-id-bold-duotone" className="text-brand-green text-xl" />
            Informations Générales & Rôle
          </h3>
          {isEditing && (
            <span className="text-xs font-semibold text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/20 animate-pulse">
              Mode Édition Actif
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Input
            label="Prénom"
            disabled={!isEditing}
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            required
          />
          <Input
            label="Nom"
            disabled={!isEditing}
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <Input
            label="Adresse Email"
            type="email"
            disabled={!isEditing}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <PhoneInput
            label="Téléphone"
            disabled={!isEditing}
            value={formData.telephone}
            onChange={(val) => setFormData({ ...formData, telephone: val })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rôle Principal</label>
            <select
              disabled={!isEditing}
              value={formData.roleName}
              onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
              className="h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-green disabled:opacity-60 disabled:cursor-not-allowed font-body"
            >
              <option value="Admin">Admin</option>
              <option value="Partenaire">Partenaire</option>
              <option value="Utilisateur">Utilisateur (Simple)</option>
              <option value="Analyste">Analyste</option>
              <option value="Support">Support</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Statut du Compte</label>
            <select
              disabled={!isEditing}
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value as AccountStatus })}
              className="h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-green disabled:opacity-60 disabled:cursor-not-allowed font-body"
            >
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="Suspendu">Suspendu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Individual Custom Permissions Management Section */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icon icon="solar:shield-keyhole-bold-duotone" className="text-purple-500 text-xl" />
              Permissions Spécifiques sur la Plateforme
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Vous pouvez accorder des droits de gestion spécifiques à cet utilisateur indépendamment de son rôle principal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {MODULE_LIST.map((mod) => {
            const hasPerm = formData.permissions.includes(mod.id);
            return (
              <div
                key={mod.id}
                onClick={() => handleTogglePermission(mod.id)}
                className={`p-4 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                  hasPerm
                    ? 'border-brand-green bg-brand-green/5 dark:bg-brand-green/10'
                    : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626]'
                } ${!isEditing ? 'cursor-not-allowed opacity-75' : 'hover:border-brand-green'}`}
              >
                <span className="text-xs font-bold text-slate-900 dark:text-white">{mod.label}</span>
                <Icon
                  icon={hasPerm ? 'solar:check-circle-bold' : 'solar:circle-linear'}
                  className={`text-lg ${hasPerm ? 'text-brand-green' : 'text-slate-400'}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Associated Multi-SIM Numbers List */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-4">
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon icon="solar:smartphone-line-duotone" className="text-brand-blue text-xl" />
          Numéros Associés ({user.numeros?.length || 0})
        </h3>

        {user.numeros && user.numeros.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {user.numeros.map((n, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] flex items-center justify-between"
              >
                <div>
                  <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">{n.num}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{n.op} ({n.pays})</p>
                </div>
                <StatusBadge status={n.statut} size="sm" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">Aucun numéro enregistré pour cet utilisateur.</p>
        )}
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      <ConfirmDialog
        isOpen={showUnsavedModal}
        onClose={handleConfirmDiscard}
        onConfirm={handleConfirmSaveAndLeave}
        title="Modifications non enregistrées"
        description="Vous avez modifié des informations sur cette fiche. Voulez-vous enregistrer vos modifications avant de quitter ?"
        confirmLabel="Enregistrer et quitter"
        cancelLabel="Annuler les modifications"
        variant="warning"
      />
    </div>
  );
}
