import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgEquipe from '@/assets/illustrations/Img_Equipe.jpeg';

export default function AfricanTeam() {
  const { t } = useTranslation('landing');

  const cards = [
    {
      title: t('africanTeam.cards.mission.title'),
      desc: t('africanTeam.cards.mission.desc'),
      icon: 'solar:target-bold-duotone',
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
      icon: 'solar:bolt-bold-duotone',
      iconColor: 'text-brand-orange',
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-24 bg-brand-green font-body transition-colors duration-200">
      <div className="mx-auto max-w-[90%] grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12 lg:gap-16">
        <div className="flex flex-col justify-between items-start">
          <div>
            <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight text-white">
              {t('africanTeam.title')}
            </h2>

            <p className="mt-5 font-body text-sm sm:text-base lg:text-lg leading-relaxed text-white/95">
              {t('africanTeam.desc')}
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border-2 border-white/20 shadow-2xl w-full flex-1 min-h-[300px]">
            <img
              src={ImgEquipe}
              alt="KWISMO Équipe Africaine"
              className="w-full h-full object-cover object-center hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 h-full">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-3xl bg-white text-slate-900 shadow-xl border border-white/20 flex flex-col justify-center items-start flex-1 transition-all duration-300 hover:shadow-2xl"
            >
              <div className="flex items-center gap-3.5 mb-2">
                <Icon icon={card.icon} className={`text-3xl ${card.iconColor} shrink-0`} />
                <h3 className="font-title text-lg sm:text-xl font-extrabold text-slate-900">
                  {card.title}
                </h3>
              </div>

              <p className="font-body text-sm sm:text-base text-slate-600 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
