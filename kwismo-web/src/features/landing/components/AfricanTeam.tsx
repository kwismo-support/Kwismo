import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgEquipe from '@/assets/illustrations/Img_Equipe.jpeg';

export default function AfricanTeam() {
  const { t } = useTranslation('landing');
  const [activeCard, setActiveCard] = useState<number | null>(0);

  const cards = [
    {
      title: t('africanTeam.cards.mission.title'),
      desc: t('africanTeam.cards.mission.desc'),
      icon: 'solar:shield-star-bold-duotone',
      iconColor: 'text-brand-orange',
    },
    {
      title: t('africanTeam.cards.community.title'),
      desc: t('africanTeam.cards.community.desc'),
      icon: 'solar:users-group-two-rounded-bold-duotone',
      iconColor: 'text-brand-green',
    },
    {
      title: t('africanTeam.cards.approach.title'),
      desc: t('africanTeam.cards.approach.desc'),
      icon: 'solar:bolt-circle-bold-duotone',
      iconColor: 'text-brand-orange',
    },
  ];

  return (
    <section id="about" className="py-16 sm:py-20 lg:py-24 bg-brand-green font-body transition-colors duration-200 overflow-hidden">
      <div className="mx-auto max-w-[92%] sm:max-w-[90%] max-w-7xl grid grid-cols-1 lg:grid-cols-2 items-stretch gap-8 lg:gap-16">
        <div className="flex flex-col justify-between items-start gap-6 lg:gap-8">
          <div>
            <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight text-white">
              {t('africanTeam.title')}
            </h2>

            <p className="mt-4 sm:mt-5 font-body text-sm sm:text-base lg:text-lg leading-relaxed text-white/95">
              {t('africanTeam.desc')}
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border-2 border-white/20 shadow-2xl w-full h-64 sm:h-80 lg:h-full min-h-[260px] sm:min-h-[300px] relative group">
            <div className="absolute inset-0 bg-brand-navy/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
            <img
              src={ImgEquipe}
              alt="KWISMO Équipe Africaine"
              className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 sm:gap-6 w-full">
          {cards.map((card, idx) => {
            const isOpen = activeCard === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setActiveCard(idx)}
                onClick={() => setActiveCard(isOpen ? null : idx)}
                className={`cursor-pointer relative overflow-hidden p-5 sm:p-7 rounded-3xl border transition-all duration-300 ease-out flex flex-col justify-start lg:justify-center lg:flex-1 ${
                  isOpen
                    ? 'bg-gradient-to-r from-brand-navy via-brand-navy to-brand-darkBg text-white border-brand-green/60 shadow-2xl lg:scale-[1.02] z-10'
                    : 'bg-white text-slate-900 border-white/40 shadow-lg hover:border-brand-green/40 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between w-full gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div
                      className={`p-2.5 sm:p-3 rounded-2xl shrink-0 transition-all duration-300 ${
                        isOpen
                          ? 'bg-brand-green/20 border border-brand-green/40 text-brand-green shadow-lg shadow-brand-green/20 scale-105 sm:scale-110'
                          : 'bg-slate-100/90 shadow-inner'
                      }`}
                    >
                      <Icon
                        icon={card.icon}
                        className={`text-2xl sm:text-3xl lg:text-4xl ${isOpen ? 'text-brand-green' : card.iconColor}`}
                      />
                    </div>
                    <h3
                      className={`font-title font-extrabold transition-colors duration-300 truncate text-base sm:text-xl lg:text-2xl ${
                        isOpen ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {card.title}
                    </h3>
                  </div>

                  <div
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                      isOpen
                        ? 'bg-brand-green text-white rotate-180 shadow-md shadow-brand-green/40'
                        : 'bg-brand-green/10 text-brand-green'
                    }`}
                  >
                    <Icon icon="solar:alt-arrow-down-bold" className="text-lg sm:text-xl" />
                  </div>
                </div>

                <div
                  className={`grid transition-[grid-template-rows,opacity,margin,padding] duration-300 ease-out w-full ${
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100 mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-white/20'
                      : 'grid-rows-[0fr] opacity-0 mt-0 pt-0 border-t-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p
                      className={`font-body text-xs sm:text-sm lg:text-base leading-relaxed font-normal transition-colors duration-300 ${
                        isOpen ? 'text-white/90' : 'text-slate-600'
                      }`}
                    >
                      {card.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
