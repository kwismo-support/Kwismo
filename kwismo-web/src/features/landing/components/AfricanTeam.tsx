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
      <div className="mx-auto max-w-[90%] grid grid-cols-1 lg:grid-cols-2 items-center gap-12 lg:gap-16">
        <div className="flex flex-col justify-between items-start h-full">
          <div>
            <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight text-white">
              {t('africanTeam.title')}
            </h2>

            <p className="mt-5 font-body text-sm sm:text-base lg:text-lg leading-relaxed text-white/95">
              {t('africanTeam.desc')}
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border-2 border-white/20 shadow-2xl w-full flex-1 min-h-[280px] relative group">
            <div className="absolute inset-0 bg-brand-navy/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
            <img
              src={ImgEquipe}
              alt="KWISMO Équipe Africaine"
              className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700"
            />
          </div>
        </div>

        {/* Colonne des cartes compactes et fluides */}
        <div className="flex flex-col justify-center gap-4">
          {cards.map((card, idx) => {
            const isOpen = activeCard === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setActiveCard(idx)}
                onClick={() => setActiveCard(isOpen ? null : idx)}
                className={`cursor-pointer relative overflow-hidden p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white text-slate-900 border transition-all duration-500 ease-in-out flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg ${
                  isOpen
                    ? 'border-brand-green/50 shadow-2xl bg-gradient-to-br ' + card.accentBg
                    : 'border-white/40 shadow-sm hover:border-brand-green/30'
                }`}
              >
                {/* Icône expressive et Titre à gauche */}
                <div className="flex items-center gap-4 shrink-0 z-10">
                  <div className="p-2.5 rounded-2xl bg-slate-100/90 shadow-inner shrink-0">
                    <Icon icon={card.icon} className={`text-3xl sm:text-4xl ${card.iconColor}`} />
                  </div>
                  <h3 className="font-title text-base sm:text-lg font-extrabold text-slate-900">
                    {card.title}
                  </h3>
                </div>

                {/* Animation de Révélation latérale fluide de droite vers la gauche */}
                <div
                  className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isOpen
                      ? 'max-w-[400px] opacity-100 mt-3 sm:mt-0 sm:ml-5 sm:pl-5 sm:border-l border-slate-200'
                      : 'max-w-0 opacity-0 mt-0 sm:mt-0 sm:ml-0 sm:pl-0 sm:border-l-0'
                  }`}
                >
                  <p className="font-body text-xs sm:text-sm text-slate-600 leading-relaxed font-normal whitespace-normal w-full sm:w-[300px]">
                    {card.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
