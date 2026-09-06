import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

export default function WhatKwismoBrings() {
  const { t } = useTranslation('landing');

  const points = t('whatKwismoBrings.points', { returnObjects: true }) as string[];

  return (
    <section className="w-full bg-slate-50 dark:bg-brand-navy px-6 py-16 transition-colors font-body">
      <div className="mx-auto max-w-[1200px]">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
            {t('landing:whatKwismoBrings.title')}
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('landing:whatKwismoBrings.subtitle')}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(points) && points.map((text: string, idx: number) => (
            <div
              key={idx}
              className="flex items-start gap-3.5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-darkBg shadow-sm transition"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-green/10 text-brand-green mt-0.5">
                <Icon icon="solar:check-circle-bold" className="text-base text-brand-green" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
