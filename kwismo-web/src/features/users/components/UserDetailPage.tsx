import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { PageHeader, StatusBadge } from '@/shared/components';
import { UserAvatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { PhoneInput } from '@/shared/ui/phone-input';
import { FormSkeleton } from '@/shared/ui/skeleton';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { toast } from '@/shared/store/toastStore';
import { usersApi, type UserItem } from '../services/users.api';
import { usePermissions } from '@/shared/hooks/usePermissions';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(['admin', 'common']);
  const { hasPermission } = usePermissions();
  const [user, setUser] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const [initialData, setInitialData] = useState({
    prenom: '',
    nom: '',
    email: '',
    roleName: 'user',
    statut: 'active',
    telephone: '',
  });

  const [formData, setFormData] = useState({ ...initialData });

  useEffect(() => {
    let mounted = true;
    if (id === 'new') {
      const emptyState = {
        prenom: '',
        nom: '',
        email: '',
        roleName: 'user',
        statut: 'active',
        telephone: '',
      };
      setUser({
        id: 'new',
        prenom: '',
        nom: '',
        email: '',
        statut: 'active',
        role: 'user',
      });
      setIsEditing(true);
      setInitialData(emptyState);
      setFormData(emptyState);
      setLoading(false);
      return;
    }

    if (id) {
      usersApi
        .getUserById(id)
        .then((found) => {
          if (!mounted) return;
          if (found) {
            setUser(found);
            const state = {
              prenom: found.prenom || '',
              nom: found.nom || '',
              email: found.email || '',
              roleName: typeof found.role === 'string' ? found.role : 'user',
              statut: found.statut || 'active',
              telephone: found.numeros?.[0]?.valeur || '',
            };
            setInitialData(state);
            setFormData(state);
          }
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
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
        <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
          {t('admin:users.notFoundTitle')}
        </h3>
        <Button className="mt-4" variant="outline" onClick={() => navigate('/app/users')}>
          {t('admin:users.backToList')}
        </Button>
      </div>
    );
  }

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleSave = async () => {
    try {
      if (id !== 'new') {
        await usersApi.updateUserStatus(id!, formData.statut);
      }
      setUser((prev) => (prev ? { ...prev, prenom: formData.prenom, nom: formData.nom, email: formData.email, statut: formData.statut } : null));
      setInitialData({ ...formData });
      setIsEditing(false);
      toast.success(t('users.toasts.saveSuccess'));
    } catch {
      toast.error(t('users.toasts.saveError'));
    }
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

  const handleConfirmSaveAndLeave = async () => {
    await handleSave();
    setShowUnsavedModal(false);
    navigate('/app/users');
  };

  const roleNameStr = typeof user.role === 'string' ? user.role : 'user';

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-6xl mx-auto">
      <PageHeader
        title={`${t('admin:users.detailTitle')} — ${user.prenom} ${user.nom}`}
        subtitle={t('admin:users.detailSubtitle')}
        showBreadcrumb={false}
        showBack={true}
        onBack={handleBack}
        actions={
          hasPermission('users:update')
            ? [
                !isEditing
                  ? {
                      label: t('common:actions.edit'),
                      icon: 'solar:pen-bold',
                      variant: 'primary',
                      onClick: () => setIsEditing(true),
                    }
                  : {
                      label: t('common:actions.save'),
                      icon: 'solar:diskette-bold',
                      variant: 'primary',
                      disabled: !isDirty,
                      onClick: handleSave,
                    },
              ]
            : []
        }
      />

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <UserAvatar
            name={`${user.prenom} ${user.nom}`}
            roleRing={roleNameStr.toLowerCase().includes('admin') ? 'admin' : roleNameStr.toLowerCase().includes('partner') ? 'partner' : 'user'}
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
            <p className="text-xs text-slate-400 mt-0.5">
              {t('admin:users.registeredAt')}:{' '}
              {user.date_inscription
                ? new Date(user.date_inscription).toLocaleDateString()
                : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon icon="solar:user-id-bold-duotone" className="text-brand-green text-xl" />
            {t('admin:users.formSectionTitle')}
          </h3>
          {isEditing && (
            <span className="text-xs font-semibold text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/20 animate-pulse">
              {t('common:editMode')}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Input
            label={t('admin:users.name')}
            disabled={!isEditing}
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            required
          />
          <Input
            label={t('admin:users.surname')}
            disabled={!isEditing}
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            required
          />
          <Input
            label={t('admin:users.email')}
            type="email"
            disabled={!isEditing}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <PhoneInput
            label={t('admin:numbers.phoneNumber')}
            disabled={!isEditing}
            value={formData.telephone}
            onChange={(val) => setFormData({ ...formData, telephone: val })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('admin:users.role')}
            </label>
            <select
              disabled={!isEditing}
              value={formData.roleName}
              onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
              className="h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-green disabled:opacity-60 disabled:cursor-not-allowed font-body"
            >
              <option value="admin">{t('admin:users.filters.admin')}</option>
              <option value="partner">{t('admin:users.filters.partner')}</option>
              <option value="user">{t('admin:users.filters.user')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('common:status')}
            </label>
            <select
              disabled={!isEditing}
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
              className="h-11 px-4 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-brand-green disabled:opacity-60 disabled:cursor-not-allowed font-body"
            >
              <option value="active">{t('admin:users.status.active')}</option>
              <option value="suspended">{t('admin:users.status.suspended')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-4">
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon icon="solar:smartphone-line-duotone" className="text-brand-blue text-xl" />
          {t('admin:users.attachedNumbers')} ({user.numeros?.length || 0})
        </h3>

        {user.numeros && user.numeros.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {user.numeros.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0F1626] flex items-center justify-between"
              >
                <div>
                  <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">{n.valeur}</p>
                </div>
                <StatusBadge status={n.est_verifie ? 'securise' : 'a_signaler'} size="sm" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">
            {t('admin:users.noAttachedNumbers')}
          </p>
        )}
      </div>

      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icon icon="solar:shield-keyhole-bold-duotone" className="text-brand-orange text-xl" />
              Permissions & Droits Spécifiques de l'Utilisateur
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Rôle principal : <strong className="uppercase font-mono text-brand-navy dark:text-brand-orange">{roleNameStr}</strong>
            </p>
          </div>

          {roleNameStr.toLowerCase().includes('super') && (
            <span className="px-3 py-1 rounded-full bg-brand-orange/20 text-brand-orange border border-brand-orange/30 text-xs font-bold font-mono">
              Super-Admin (Toutes autorisations actives)
            </span>
          )}
        </div>

        {roleNameStr.toLowerCase().includes('super') && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
            <Icon icon="solar:info-circle-bold" className="text-lg shrink-0 text-amber-500" />
            <span>
              Le rôle Super-Admin possède de plein droit la totalité des autorisations système. Ses permissions ne peuvent pas être restreintes ou modifiées.
            </span>
          </div>
        )}

        <div className="space-y-6">
          {[
            {
              id: 'users',
              title: 'Gestion des Utilisateurs',
              permissions: [
                { code: 'users:read', label: 'Consulter les utilisateurs' },
                { code: 'users:create', label: 'Créer des utilisateurs' },
                { code: 'users:update', label: 'Modifier les utilisateurs' },
                { code: 'users:delete', label: 'Supprimer des utilisateurs' },
                { code: 'users:export', label: 'Exporter les utilisateurs' },
              ],
            },
            {
              id: 'numbers',
              title: 'Registre des Numéros',
              permissions: [
                { code: 'numbers:read', label: 'Consulter les numéros' },
                { code: 'numbers:create', label: 'Ajouter des numéros' },
                { code: 'numbers:update', label: 'Modifier des numéros' },
                { code: 'numbers:delete', label: 'Supprimer des numéros' },
                { code: 'numbers:verify', label: 'Vérifier la réputation' },
                { code: 'numbers:export', label: 'Exporter le registre' },
              ],
            },
            {
              id: 'reports',
              title: 'Signalements de Fraude',
              permissions: [
                { code: 'reports:read', label: 'Consulter les signalements' },
                { code: 'reports:create', label: 'Signaler un numéro' },
                { code: 'reports:verify', label: 'Valider/Rejeter les signalements' },
                { code: 'reports:delete', label: 'Supprimer des signalements' },
                { code: 'reports:export', label: 'Exporter les rapports PDF/CSV' },
              ],
            },
            {
              id: 'partners',
              title: 'Partenaires & Affiliation',
              permissions: [
                { code: 'partners:read', label: 'Consulter les partenaires' },
                { code: 'partners:create', label: 'Créer un partenaire' },
                { code: 'partners:update', label: 'Modifier un partenaire' },
                { code: 'partners:delete', label: 'Supprimer un partenaire' },
                { code: 'affiliation:update', label: 'Gérer l’affiliation' },
                { code: 'partners:export', label: 'Exporter les partenaires' },
              ],
            },
            {
              id: 'ussd',
              title: 'Pays, Opérateurs & Actions USSD',
              permissions: [
                { code: 'ussd:read', label: 'Consulter les pays & USSD' },
                { code: 'ussd:create', label: 'Créer pays / opérateur / USSD' },
                { code: 'ussd:update', label: 'Modifier pays / opérateur / USSD' },
                { code: 'ussd:delete', label: 'Supprimer pays / opérateur / USSD' },
                { code: 'ussd:export', label: 'Exporter la configuration USSD' },
              ],
            },
            {
              id: 'roles',
              title: 'Rôles & Matrice d’Accès',
              permissions: [
                { code: 'roles:read', label: 'Consulter les rôles' },
                { code: 'roles:create', label: 'Créer un rôle' },
                { code: 'roles:update', label: 'Modifier la matrice de rôle' },
                { code: 'roles:delete', label: 'Supprimer un rôle' },
              ],
            },
            {
              id: 'settings',
              title: 'Paramètres Système & Supervision',
              permissions: [
                { code: 'analytics:read', label: 'Supervision des KPI & API' },
                { code: 'settings:read', label: 'Consulter les paramètres' },
                { code: 'settings:update', label: 'Modifier les paramètres' },
                { code: 'system:configure', label: 'Configurer les seuils de risque IA' },
              ],
            },
          ].map((mod) => {
            const isSuperAdminUser = roleNameStr.toLowerCase().includes('super');
            const defaultRolePerms: Record<string, string[]> = {
              admin: [
                'users:read', 'users:create', 'users:update', 'users:delete', 'users:export',
                'numbers:read', 'numbers:create', 'numbers:update', 'numbers:delete', 'numbers:verify', 'numbers:export',
                'reports:read', 'reports:create', 'reports:verify', 'reports:delete', 'reports:export',
                'partners:read', 'partners:create', 'partners:update', 'partners:delete', 'partners:export',
                'affiliation:update', 'ussd:read', 'ussd:create', 'ussd:update', 'ussd:delete', 'ussd:export',
                'roles:read', 'roles:create', 'roles:update', 'roles:delete', 'analytics:read', 'settings:read'
              ],
              partner: [
                'users:read', 'users:create', 'users:update', 'users:delete',
                'roles:read', 'roles:create', 'roles:update', 'roles:delete',
                'reports:read', 'reports:create', 'reports:export',
                'numbers:read', 'numbers:verify', 'numbers:export', 'analytics:read'
              ],
              user: ['reports:read', 'reports:create', 'numbers:read', 'numbers:verify']
            };

            const roleDefaults = defaultRolePerms[roleNameStr.toLowerCase()] || defaultRolePerms.user;
            const activeCustomPerms = user.custom_permissions || [];

            return (
              <div
                key={mod.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] space-y-3"
              >
                <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  {mod.title}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {mod.permissions.map((p) => {
                    const isGranted = isSuperAdminUser || roleDefaults.includes(p.code) || activeCustomPerms.includes(p.code);
                    const canCheck = !isSuperAdminUser && isEditing;

                    return (
                      <label
                        key={p.code}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border transition ${
                          canCheck ? 'cursor-pointer' : 'cursor-default opacity-85'
                        } ${
                          isGranted
                            ? 'border-brand-green/40 bg-brand-green/10 text-slate-900 dark:text-white'
                            : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F1626] text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isGranted}
                          disabled={!canCheck}
                          onChange={() => {}}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-green focus:ring-brand-green cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div>
                          <p className="text-xs font-bold leading-snug">{p.label}</p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{p.code}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showUnsavedModal}
        onClose={handleConfirmDiscard}
        onConfirm={handleConfirmSaveAndLeave}
        title={t('common:unsavedChanges.title')}
        description={t('common:unsavedChanges.desc')}
        confirmLabel={t('common:unsavedChanges.saveAndLeave')}
        cancelLabel={t('common:unsavedChanges.discard')}
        variant="warning"
      />
    </div>
  );
}
