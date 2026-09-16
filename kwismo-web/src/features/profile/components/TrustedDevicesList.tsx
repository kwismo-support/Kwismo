import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import type { DeviceSummary } from '../services/profile.api';

interface TrustedDevicesListProps {
  devices: DeviceSummary[];
}

export default function TrustedDevicesList({ devices }: TrustedDevicesListProps) {
  const { t } = useTranslation(['admin', 'common']);

  return (
    <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-4 font-body">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
        <h3 className="font-title text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon icon="solar:devices-bold-duotone" className="text-brand-blue text-xl" />
          {t('admin:profile.trustedDevicesTitle')} ({devices.length})
        </h3>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {devices.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {t('admin:profile.noDevices')}
          </div>
        ) : (
          devices.map((device) => (
            <div key={device.id} className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-lg">
                  <Icon icon="solar:cellphone-bold" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {device.nom}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {t('admin:profile.lastConnection')}: {new Date(device.derniere_connexion).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                {t('admin:profile.deviceActive')}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
