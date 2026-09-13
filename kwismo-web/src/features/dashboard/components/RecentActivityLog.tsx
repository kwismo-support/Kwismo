import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

interface RecentActivityLogProps {
  isLoading?: boolean;
}

const recentActions = [
  {
    id: 1,
    action: 'Désactivation temporaire du numéro +237 690 123 456 suite à 3 signalements',
    user: 'Alice Nguesso',
    time: 'Il y a 12 min',
    color: '#E4483B',
  },
  {
    id: 2,
    action: 'Création du partenaire Wave Sénégal avec 12 100 numéros surveillés',
    user: 'Ibrahima Sow',
    time: 'Il y a 45 min',
    color: '#4D6AB1',
  },
  {
    id: 3,
    action: 'Mise à jour de la règle d’affiliation pour le préfixe MTN +237 67',
    user: 'Alice Nguesso',
    time: 'Il y a 2 h',
    color: '#56B039',
  },
  {
    id: 4,
    action: 'Signalement massif de fraude détecté sur l’opérateur Orange CI',
    user: 'Système IA',
    time: 'Il y a 3 h',
    color: '#F6A020',
  },
  {
    id: 5,
    action: 'Modification des droits du rôle Analyste par l’administrateur',
    user: 'Bernard Talla',
    time: 'Il y a 5 h',
    color: '#7C3AED',
  },
];

export default function RecentActivityLog({ isLoading = false }: RecentActivityLogProps) {
  const { t } = useTranslation('admin');

  if (isLoading) {
    return (
      <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm animate-pulse font-body">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-64 mb-6" />
        <div className="space-y-3">
          <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl w-full" />
          <div className="h-10 bg-slate-100 dark:bg-white/5 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm font-body h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon icon="solar:history-bold-duotone" className="text-brand-orange text-lg" />
            {t('dashboard.activityTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('dashboard.activitySubtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
        {recentActions.map((a) => (
          <div
            key={a.id}
            className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/50 dark:hover:bg-white/5 transition"
          >
            <span
              className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
              style={{ backgroundColor: a.color }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                {a.action}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Par <span className="font-medium text-slate-600 dark:text-slate-300">{a.user}</span>
              </p>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 whitespace-nowrap">
              {a.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
