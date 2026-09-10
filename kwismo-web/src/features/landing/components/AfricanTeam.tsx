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
      icon: 'solar:target-bold-duotone',
      iconColor: 'text-brand-orange',
      accentBg: 'from-brand-orange/10 via-transparent to-transparent',
    },
    {
      title: t('africanTeam.cards.community.title'),
      desc: t('africanTeam.cards.community.desc'),
      icon: 'solar:users-group-two-rounded-bold-duotone',
      iconColor: 'text-brand-green',
      accentBg: 'from-brand-green/10 via-transparent to-transparent',
    },
    {
      title: t('africanTeam.cards.approach.title'),
      desc: t('africanTeam.cards.approach.desc'),
      icon: 'solar:bolt-bold-duotone',
      iconColor: 'text-brand-orange',
      accentBg: 'from-brand-orange/10 via-transparent to-transparent',
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-28 bg-brand-green font-body transition-colors duration-200">
      <div className="mx-auto max-w-[90%] 2xl:max-w-[85%] grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12 lg:gap-16">
        <div className="flex flex-col justify-between items-start">
          <div>
            <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight text-white">
              {t('africanTeam.title')}
            </h2>

            <p className="mt-6 font-body text-base sm:text-lg lg:text-xl leading-relaxed text-white/95 max-w-[620px]">
              {t('africanTeam.desc')}
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border-2 border-white/30 shadow-2xl w-full flex-1 min-h-[320px] relative group">
            <div className="absolute inset-0 bg-brand-navy/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
            <img
              src={ImgEquipe}
              alt="KWISMO Équipe Africaine"
              className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 h-full">
          {cards.map((card, idx) => {
            const isOpen = activeCard === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setActiveCard(idx)}
                onClick={() => setActiveCard(isOpen ? null : idx)}
                className={`cursor-pointer relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-white text-slate-900 shadow-xl border transition-all duration-500 ease-out flex flex-col justify-center items-start flex-1 ${
                  isOpen
                    ? 'border-brand-green/50 shadow-2xl bg-gradient-to-br ' + card.accentBg
                    : 'border-white/40 shadow-md hover:border-brand-green/30'
                }`}
              >
                {/* En-tête : Titre et Icône seuls au départ */}
                <div className="flex items-center gap-4 w-full">
                  <div className="p-2.5 rounded-2xl bg-slate-100/80 shadow-inner shrink-0">
                    <Icon icon={card.icon} className={`text-3xl sm:text-4xl ${card.iconColor}`} />
                  </div>
                  <h3 className="font-title text-lg sm:text-xl font-extrabold text-slate-900 flex-1">
                    {card.title}
                  </h3>
                  <Icon
                    icon="solar:alt-arrow-down-bold"
                    className={`text-xl text-slate-400 transition-transform duration-500 ${
                      isOpen ? 'rotate-180 text-brand-green' : 'rotate-0'
                    }`}
                  />
                </div>

                {/* Animation de Révélation du texte (Grid-rows 0fr -> 1fr) */}
                <div
                  className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out w-full ${
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100 mt-3 pt-3 border-t border-slate-100'
                      : 'grid-rows-[0fr] opacity-0 mt-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="font-body text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
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
