import { Icon } from '@iconify/react';

export type NumberRiskStatus = 'safe' | 'suspicious' | 'fraudulent';

interface NumberStatusBadgeProps {
  status: NumberRiskStatus;
}

export default function NumberStatusBadge({ status }: NumberStatusBadgeProps) {
  const configs: Record<NumberRiskStatus, { label: string; icon: string; style: string }> = {
    safe: {
      label: 'Numéro Sûr',
      icon: 'solar:shield-check-bold',
      style: 'bg-brand-green/10 text-brand-green border-brand-green/30',
    },
    suspicious: {
      label: 'Suspect',
      icon: 'solar:danger-triangle-bold',
      style: 'bg-brand-orange/10 text-brand-orange border-brand-orange/30',
    },
    fraudulent: {
      label: 'Frauduleux (Bloqué)',
      icon: 'solar:user-block-bold',
      style: 'bg-danger/10 text-danger border-danger/30',
    },
  };

  const config = configs[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold font-body ${config.style}`}>
      <Icon icon={config.icon} className="text-xs" />
      <span>{config.label}</span>
    </span>
  );
}
