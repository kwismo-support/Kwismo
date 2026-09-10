import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

export type NumberRiskStatus = 'securise' | 'a_signaler' | 'frauduleux' | 'unknown';

interface NumberStatusBadgeProps {
  status: NumberRiskStatus;
}

export default function NumberStatusBadge({ status }: NumberStatusBadgeProps) {
  const { t } = useTranslation('admin');

  const configs: Record<NumberRiskStatus, { icon: string; style: string }> = {
    securise: {
      icon: 'solar:shield-check-bold',
      style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    },
    a_signaler: {
      icon: 'solar:danger-triangle-bold',
      style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    },
    frauduleux: {
      icon: 'solar:user-block-bold',
      style: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    },
    unknown: {
      icon: 'solar:help-bold',
      style: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
    },
  };

  const config = configs[status] || configs.unknown;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold font-body ${config.style}`}>
      <Icon icon={config.icon} className="text-xs" />
      <span>{t(`numbers.status.${status}`)}</span>
    </span>
  );
}
