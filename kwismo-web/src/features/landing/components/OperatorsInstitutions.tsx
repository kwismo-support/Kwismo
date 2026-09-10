import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgOperateur from '@/assets/illustrations/Img_Operateur.jpeg';

export default function OperatorsInstitutions() {
  const { t } = useTranslation('landing');

  const pointCards = [
    {
      title: 'Flux de Données Anti-Fraude en Temps Réel',
      desc: 'API REST et Webhooks haute performance pour synchroniser les alertes d’arnaque instantanément.',
      icon: 'solar:server-square-bold-duotone',
      color: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    },
    {
      title: 'Supervision & Intelligence Communautaire',
      desc: 'Tableau de bord dédié aux opérateurs pour visualiser la propagation des arnaques et scores de risque.',
      icon: 'solar:chart-2-bold-duotone',
      color: 'bg-brand-orange/10 text-brand-orange border-brand-orange/20',
    },
    {
      title: 'Conformité & Protection de la Clientèle',
      desc: 'Réduisez le taux de fraude sur vos réseaux Mobile Money tout en respectant les normes réglementaires.',
      icon: 'solar:shield-check-bold-duotone',
      color: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    },
  ];

  return (
    <section id="operators" className="w-full bg-slate-50 dark:bg-brand-navy px-6 py-20 lg:py-24 transition-colors font-body">
      <div className="mx-auto max-w-[90%] grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12 lg:gap-16">
        <div className="relative flex justify-center h-full">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl w-full h-full min-h-[380px] group">
            <img
              src={ImgOperateur}
              alt="KWISMO Partenariat Opérateurs"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute bottom-5 left-5 right-5 p-5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 text-white shadow-xl">
              <h4 className="font-title text-base sm:text-lg font-bold">
                {t('landing:operatorsInstitutions.badgeTitle')}
              </h4>
              <p className="mt-1 text-xs sm:text-sm text-white/85 leading-relaxed">
                {t('landing:operatorsInstitutions.badgeDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between items-start h-full py-2">
          <div>
            <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {t('landing:operatorsInstitutions.title')}
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('landing:operatorsInstitutions.subtitle')}
            </p>

            <div className="mt-8 flex flex-col gap-4">
              {pointCards.map((card, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-darkBg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${card.color}`}>
                    <Icon icon={card.icon} className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-title text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <a
            href="/partner"
            className="mt-8 flex h-[50px] items-center gap-3 rounded-xl bg-brand-green pl-7 pr-3 text-xs sm:text-sm lg:text-base font-semibold text-white shadow-lg hover:bg-brand-green/90 transition hover:shadow-brand-green/20"
          >
            <span>{t('landing:operatorsInstitutions.cta')}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full text-white">
              <Icon icon="solar:arrow-right-linear" className="text-2xl stroke-[2.5]" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
