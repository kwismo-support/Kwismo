import { Icon } from '@iconify/react';
import type { UserItem } from './UsersTable';

interface UserDetailPanelProps {
  user: UserItem | null;
  onClose: () => void;
}

export default function UserDetailPanel({ user, onClose }: UserDetailPanelProps) {
  if (!user) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-brand-navy shadow-2xl border-l border-slate-200 dark:border-white/10 p-6 flex flex-col justify-between font-body animate-in slide-in-from-right duration-200">
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
            Détails de l'utilisateur
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500"
          >
            <Icon icon="solar:close-circle-linear" className="text-2xl" />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/10 text-brand-green font-title text-xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h4 className="font-title text-base font-bold text-slate-900 dark:text-white">{user.name}</h4>
              <p className="font-mono text-xs text-slate-500">{user.phone}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-500">Rôle :</span>
              <span className="font-semibold text-slate-900 dark:text-white uppercase">{user.role}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-500">Statut :</span>
              <span className="font-semibold text-brand-green uppercase">{user.status}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-500">Dernière activité :</span>
              <span className="font-semibold text-slate-900 dark:text-white">{user.lastActive}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-white/10">
        <button className="flex-1 h-10 rounded-xl bg-brand-orange text-white text-xs font-semibold hover:bg-[#e08700] transition">
          Modifier Rôle
        </button>
        <button className="flex-1 h-10 rounded-xl bg-danger/10 text-danger text-xs font-semibold hover:bg-danger/20 transition">
          Suspendre
        </button>
      </div>
    </div>
  );
}
