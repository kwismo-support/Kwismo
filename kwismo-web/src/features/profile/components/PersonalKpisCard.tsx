import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import type { UserProfileMe } from '../services/profile.api';

interface PersonalKpisCardProps {
  kpi?: UserProfileMe['kpi'];
}

export default function PersonalKpisCard({ kpi }: PersonalKpisCardProps) {
  const { t } = useTranslation(['admin', 'common']);

  const stats = [
    {
      title: t('admin:profile.verifiedNumbers'),
      value: kpi?.numeros_verifies ?? 0,
      icon: 'solar:shield-check-bold-duotone',
      color: '#32B07F',
    },
    {
      title: t('admin:profile.reportsSubmitted'),
      value: kpi?.signalements_effectues ?? 0,
      icon: 'solar:danger-triangle-bold-duotone',
      color: '#FF9900',
    },
    {
      title: t('admin:profile.protectedTransfers'),
      value: kpi?.transferts_proteges ?? 0,
      icon: 'solar:square-transfer-horizontal-bold-duotone',
      color: '#6B98FF',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-body">
      {stats.map((s, i) => (
        <div
          key={i}
          className="p-5 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm flex items-center gap-4"
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shrink-0"
            style={{ backgroundColor: `${s.color}15`, color: s.color }}
          >
            <Icon icon={s.icon} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {s.title}
            </p>
            <p className="text-2xl font-bold font-title text-slate-900 dark:text-white mt-0.5">
              {s.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
