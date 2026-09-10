import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgOperateur from '@/assets/illustrations/Img_Operateur.jpeg';

export default function OperatorsInstitutions() {
  const { t } = useTranslation('landing');
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const pointCards = [
    {
      title: 'Flux de Données Anti-Fraude en Temps Réel',
      desc: 'API REST et Webhooks haute performance pour synchroniser les alertes d’arnaque instantanément.',
      icon: 'solar:server-square-bold-duotone',
      color: 'text-brand-green bg-brand-green/10 border-brand-green/30',
    },
    {
      title: 'Supervision & Intelligence Communautaire',
      desc: 'Tableau de bord dédié aux opérateurs pour visualiser la propagation des arnaques et scores de risque.',
      icon: 'solar:chart-2-bold-duotone',
      color: 'text-brand-orange bg-brand-orange/10 border-brand-orange/30',
    },
    {
      title: 'Conformité & Protection de la Clientèle',
      desc: 'Réduisez le taux de fraude sur vos réseaux Mobile Money tout en respectant les normes réglementaires.',
      icon: 'solar:shield-check-bold-duotone',
      color: 'text-brand-green bg-brand-green/10 border-brand-green/30',
    },
  ];

  const activeCard = pointCards[activeIndex];

  const getPosition = (index: number) => {
    const angles = [270, 30, 150];
    const angleRad = (angles[index] * Math.PI) / 180;
    const radius = 100;
    const x = radius * Math.cos(angleRad);
    const y = radius * Math.sin(angleRad);
    return { x, y };
  };

  return (
    <section id="operators" className="w-full bg-slate-50 dark:bg-brand-navy px-6 py-20 lg:py-24 transition-colors font-body">
      <div className="mx-auto max-w-[90%] grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12 lg:gap-16">
        <div className="relative flex justify-center h-full">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl w-full h-full min-h-[380px] group flex flex-col">
            <img
              src={ImgOperateur}
              alt="KWISMO Partenariat Opérateurs"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02] flex-1"
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
          <div className="w-full">
            <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {t('landing:operatorsInstitutions.title')}
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('landing:operatorsInstitutions.subtitle')}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-8 bg-white dark:bg-brand-darkBg p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg min-h-[260px]">
              <div className="relative w-[220px] h-[220px] shrink-0 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full text-brand-green/30 dark:text-brand-green/20 pointer-events-none" viewBox="0 0 220 220">
                  <circle cx="110" cy="110" r="100" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
                </svg>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-navy dark:bg-white text-white dark:text-brand-navy shadow-xl z-10">
                  <Icon icon="solar:shield-star-bold" className="text-3xl" />
                </div>

                {pointCards.map((card, idx) => {
                  const pos = getPosition(idx);
                  const isActive = activeIndex === idx;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => setActiveIndex(idx)}
                      style={{
                        transform: `translate(${pos.x}px, ${pos.y}px)`,
                      }}
                      className={`absolute flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300 z-20 cursor-pointer ${
                        isActive
                          ? 'bg-white dark:bg-brand-navy scale-125 shadow-2xl ring-4 ring-brand-green ' + card.color
                          : 'bg-white dark:bg-brand-navy text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:scale-110'
                      }`}
                    >
                      <Icon icon={card.icon} className="text-2xl" />
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col justify-center flex-1 text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-green">
                  Option {activeIndex + 1} / 3
                </span>
                <h3 className="font-title text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                  {activeCard.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeCard.desc}
                </p>
              </div>
            </div>
          </div>

          <a
            href="/partner"
            className="mt-8 flex h-[50px] items-center gap-3 rounded-xl bg-brand-green pl-7 pr-3 text-xs sm:text-sm lg:text-base font-semibold text-white shadow-lg hover:bg-brand-green/90 transition hover:shadow-brand-green/20 shrink-0"
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
