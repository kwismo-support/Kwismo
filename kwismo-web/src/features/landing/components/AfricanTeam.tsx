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
      icon: 'solar:bolt-circle-bold-duotone',
      iconColor: 'text-brand-orange',
      accentBg: 'from-brand-orange/10 via-transparent to-transparent',
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-24 bg-brand-green font-body transition-colors duration-200">
      <div className="mx-auto max-w-[90%] grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12 lg:gap-16">
        <div className="flex flex-col justify-between items-start">
          <div>
            {/* Typographie d'origine remise à la taille exacte initiale */}
            <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight text-white">
              {t('africanTeam.title')}
            </h2>

            <p className="mt-5 font-body text-sm sm:text-base lg:text-lg leading-relaxed text-white/95">
              {t('africanTeam.desc')}
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border-2 border-white/20 shadow-2xl w-full flex-1 min-h-[300px] relative group">
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
                className={`cursor-pointer relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-white text-slate-900 shadow-xl border transition-all duration-500 ease-out flex flex-col sm:flex-row items-start sm:items-center justify-between flex-1 ${
                  isOpen
                    ? 'border-brand-green/50 shadow-2xl bg-gradient-to-br ' + card.accentBg
                    : 'border-white/40 shadow-md hover:border-brand-green/30'
                }`}
              >
                {/* Icône expressive et Titre à gauche */}
                <div className="flex items-center gap-4 shrink-0 z-10">
                  <div className="p-3 rounded-2xl bg-slate-100/90 shadow-inner shrink-0">
                    <Icon icon={card.icon} className={`text-4xl sm:text-5xl ${card.iconColor}`} />
                  </div>
                  <h3 className="font-title text-lg sm:text-xl font-extrabold text-slate-900">
                    {card.title}
                  </h3>
                </div>

                {/* Animation de Révélation latérale (droite vers la gauche) */}
                <div
                  className={`grid transition-[grid-template-columns,opacity,margin,padding] duration-500 ease-out ${
                    isOpen
                      ? 'grid-cols-[1fr] opacity-100 mt-4 sm:mt-0 sm:ml-6 sm:pl-6 sm:border-l border-slate-200'
                      : 'grid-cols-[0fr] opacity-0 mt-0 sm:mt-0 sm:ml-0 sm:pl-0 sm:border-l-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="font-body text-sm text-slate-600 leading-relaxed font-normal max-w-[340px]">
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
