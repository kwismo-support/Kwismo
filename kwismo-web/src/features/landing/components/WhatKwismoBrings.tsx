import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

export default function WhatKwismoBrings() {
  const { t } = useTranslation('landing');

  const defaultPoints = [
    'Identification des appels et numéros à risque en temps réel',
    'Vérification du bénéficiaire avant chaque transfert USSD',
    'Alertes instantanées sur les tentatives de vishing et SIM swap',
    'Base communautaire alimentée par les signalements des utilisateurs',
    'Couverture multi-opérateurs sur les principaux marchés africains',
    'API sécurisée pour les institutions financières partenaires',
  ];

  const points: string[] =
    (t('whatKwismoBrings.points', { returnObjects: true }) as unknown as string[]) || defaultPoints;

  return (
    <section className="w-full bg-slate-50 dark:bg-[#161E33] px-6 py-16 transition-colors">
      <div className="mx-auto max-w-[1200px]">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
            {t('whatKwismoBrings.title', 'Ce que KWISMO vous apporte')}
          </h2>
          <p className="mt-3 font-body text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('whatKwismoBrings.subtitle', 'Une protection complète, pensée pour le quotidien des utilisateurs Mobile Money.')}
          </p>
        </div>

        {/* Grid of 6 Checkmark Cards */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {points.map((text: string, idx: number) => (
            <div
              key={idx}
              className="flex items-start gap-3.5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F1626] shadow-sm hover:shadow-md transition"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#32B07F]/10 text-[#32B07F] mt-0.5">
                {/* Exact Checkmark Icon: lucide:check */}
                <Icon icon="lucide:check" className="text-sm stroke-[3]" />
              </div>
              <p className="font-body text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                {text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
