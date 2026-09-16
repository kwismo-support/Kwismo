import { useTranslation } from 'react-i18next';
import { DetailDrawer } from '@/shared/components/DetailDrawer';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { UserAvatar } from '@/shared/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs';
import type { UserItem } from '../services/users.api';

interface UserDetailPanelProps {
  user: UserItem | null;
  onClose: () => void;
  onToggleStatus?: (user: UserItem) => void;
}

export default function UserDetailPanel({ user, onClose, onToggleStatus }: UserDetailPanelProps) {
  const { t } = useTranslation(['admin', 'common']);
  if (!user) return null;

  const roleStr = typeof user.role === 'string' ? user.role : 'user';
  const roleRing = roleStr.toLowerCase().includes('admin') ? 'admin' : roleStr.toLowerCase().includes('partner') ? 'partner' : 'user';

  return (
    <DetailDrawer
      isOpen={!!user}
      onClose={onClose}
      title={`${user.prenom} ${user.nom}`}
      subtitle={`${t('admin:users.detailTitle')} #${user.id}`}
      icon="solar:user-bold-duotone"
      width="md"
      footerActions={
        <div className="flex items-center justify-between w-full font-body gap-2">
          {onToggleStatus && (
            <button
              onClick={() => onToggleStatus(user)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition cursor-pointer ${
                user.statut === 'active' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-brand-green hover:bg-emerald-600'
              }`}
            >
              {user.statut === 'active' ? t('admin:users.suspend') : t('admin:users.activate')}
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
          >
            {t('common:actions.close')}
          </button>
        </div>
      }
    >
      <div className="space-y-6 font-body">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-brand-darkBg/80 border border-slate-200 dark:border-white/10 flex items-center gap-4">
          <UserAvatar
            name={`${user.prenom} ${user.nom}`}
            roleRing={roleRing}
            size="xl"
            statusDot={user.statut === 'active' ? 'active' : 'inactive'}
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
                {user.prenom} {user.nom}
              </h3>
              <StatusBadge status={user.statut} size="xs" />
            </div>
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={roleStr} size="xs" showDot={false} />
            </div>
          </div>
        </div>

        <Tabs defaultValue="info" variant="segmented">
          <TabsList>
            <TabsTrigger value="info" icon="solar:info-circle-bold">
              {t('admin:users.tabInfo')}
            </TabsTrigger>
            <TabsTrigger value="numbers" icon="solar:smartphone-line-duotone">
              {t('admin:users.attachedNumbers')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-3">
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-brand-darkBg/60 border border-slate-100 dark:border-white/5">
                <span className="text-slate-500">{t('admin:users.systemId')}</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">#{user.id}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-brand-darkBg/60 border border-slate-100 dark:border-white/5">
                <span className="text-slate-500">{t('admin:users.role')}</span>
                <span className="font-bold text-slate-900 dark:text-white uppercase">{roleStr}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-brand-darkBg/60 border border-slate-100 dark:border-white/5">
                <span className="text-slate-500">{t('admin:users.registeredAt')}</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  {user.date_inscription ? new Date(user.date_inscription).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="numbers" className="space-y-2">
            {user.numeros && user.numeros.length > 0 ? (
              <div className="space-y-2">
                {user.numeros.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{n.valeur}</span>
                    <StatusBadge status={n.est_verifie ? 'securise' : 'a_signaler'} size="xs" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">{t('admin:users.noAttachedNumbers')}</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DetailDrawer>
  );
}
