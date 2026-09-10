import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

export default function Comparison() {
  const { t } = useTranslation('landing');

  const rows = [
    { key: 'africaFocus', label: t('landing:comparison.features.africaFocus') },
    { key: 'ussd', label: t('landing:comparison.features.ussd') },
    { key: 'community', label: t('landing:comparison.features.community') },
    { key: 'realtime', label: t('landing:comparison.features.realtime') },
    { key: 'whatsapp', label: t('landing:comparison.features.whatsapp') },
    { key: 'offline', label: t('landing:comparison.features.offline') },
  ];

  return (
    <section id="comparison" className="w-full bg-white dark:bg-[#161E33] px-6 py-16 transition-colors">
      <div className="mx-auto max-w-[1000px]">
        <div className="text-center max-w-2xl mx-auto">
          <span className="font-body text-xs font-semibold uppercase tracking-wider text-brand-green">
            {t('landing:comparison.subtitle')}
          </span>
          <h2 className="mt-2 font-title text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t('landing:comparison.title')}
          </h2>
        </div>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#0F1626] border-b border-slate-200 dark:border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                <th className="p-4 sm:p-5 font-title">{t('landing:comparison.featureHeader')}</th>
                <th className="p-4 sm:p-5 text-center text-slate-400">Truecaller</th>
                <th className="p-4 sm:p-5 text-center text-slate-400">Whoscall</th>
                <th className="p-4 sm:p-5 text-center font-bold text-brand-green bg-brand-green/10">
                  <div className="flex items-center justify-center gap-1.5">
                    <Icon icon="solar:shield-check-bold" className="text-lg" />
                    <span>KWISMO</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10 font-body text-xs sm:text-sm">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition">
                  <td className="p-4 sm:p-5 font-medium text-slate-900 dark:text-white">{row.label}</td>
                  <td className="p-4 sm:p-5 text-center">
                    <Icon icon="solar:close-circle-bold" className="mx-auto text-xl text-slate-400" />
                  </td>
                  <td className="p-4 sm:p-5 text-center">
                    <Icon icon="solar:close-circle-bold" className="mx-auto text-xl text-slate-400" />
                  </td>
                  <td className="p-4 sm:p-5 text-center bg-brand-green/5">
                    <Icon icon="solar:check-circle-bold" className="mx-auto text-xl text-brand-green" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}