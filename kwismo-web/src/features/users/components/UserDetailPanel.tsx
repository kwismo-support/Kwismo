import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';
import type { UserDTO } from '@/shared/mock';

interface UserDetailPanelProps {
  user: UserDTO | null;
  onClose: () => void;
  onToggleStatus?: (user: UserDTO) => void;
}

export default function UserDetailPanel({ user, onClose, onToggleStatus }: UserDetailPanelProps) {
  const { t } = useTranslation(['admin', 'common']);

  if (!user) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-[#161E33] shadow-2xl border-l border-slate-200 dark:border-white/10 p-6 flex flex-col justify-between font-body animate-in slide-in-from-right duration-200">
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
            {t('admin:users.detail')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 transition"
          >
            <Icon icon="solar:close-circle-linear" className="text-2xl" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green font-title text-xl font-bold">
              {user.prenom.charAt(0)}
            </div>
            <div>
              <h4 className="font-title text-base font-bold text-slate-900 dark:text-white">
                {user.prenom} {user.nom}
              </h4>
              <p className="font-mono text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-500">{t('admin:users.role')} :</span>
              <span className="font-semibold text-slate-900 dark:text-white uppercase">
                {user.role.nomRole}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-500">{t('common:status')} :</span>
              <span className="font-semibold text-brand-green uppercase">
                {t(`admin:users.status.${user.statut}`)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-500">{t('admin:users.registeredAt')} :</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {new Date(user.dateInscription).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-white/10">
        <Button
          fullWidth
          variant={user.statut === 'active' ? 'danger' : 'success'}
          size="sm"
          onClick={() => onToggleStatus?.(user)}
        >
          {user.statut === 'active' ? t('admin:users.suspend') : t('admin:users.activate')}
        </Button>
        <Button
          fullWidth
          variant="outline"
          size="sm"
          onClick={onClose}
        >
          {t('common:close')}
        </Button>
      </div>
    </div>
  );
}
