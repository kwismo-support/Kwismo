import { Icon } from '@iconify/react';

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: string;
  color?: string;
}

export default function KpiCard({
  title,
  value,
  change,
  isPositive = true,
  icon,
  color = 'text-brand-green bg-brand-green/10',
}: KpiCardProps) {
  return (
    <div className="flex flex-col p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <span className="font-body text-xs font-semibold text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
          <Icon icon={icon} className="text-xl" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="font-title text-2xl font-bold text-slate-900 dark:text-white">
          {value}
        </span>

        {change && (
          <div
            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'text-brand-green bg-brand-green/10'
                : 'text-danger bg-danger/10'
            }`}
          >
            <Icon
              icon={isPositive ? 'solar:arrow-up-linear' : 'solar:arrow-down-linear'}
              className="text-xs"
            />
            <span>{change}</span>
          </div>
        )}
      </div>
    </div>
  );
}
