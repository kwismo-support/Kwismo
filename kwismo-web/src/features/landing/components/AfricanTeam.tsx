// African team presentation section displaying team mission, community, and approach.
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
      iconBg: 'bg-brand-orange/10 text-brand-orange',
    },
    {
      title: t('africanTeam.cards.community.title'),
      desc: t('africanTeam.cards.community.desc'),
      icon: 'solar:users-group-two-rounded-bold',
      iconBg: 'bg-brand-green/10 text-brand-green',
    },
    {
      title: t('africanTeam.cards.approach.title'),
      desc: t('africanTeam.cards.approach.desc'),
      icon: 'solar:bolt-bold',
      iconBg: 'bg-brand-orange/10 text-brand-orange',
    },
  ];

  return (
    <section id="about" className="w-full bg-brand-darkGreen text-white px-6 py-16 transition-colors">
      <div className="mx-auto max-w-[90%] grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12">
        <div className="flex flex-col justify-between items-start">
          <div>
            <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white">
              {t('africanTeam.title')}
            </h2>

            <p className="mt-4 font-body text-xs sm:text-sm leading-relaxed text-white/90">
              {t('africanTeam.desc')}
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border-2 border-white/20 shadow-2xl w-full flex-1 min-h-[260px]">
            <img
              src={ImgEquipe}
              alt="KWISMO"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-5 h-full">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white text-slate-900 shadow-xl border border-white/20 flex flex-col justify-center items-start flex-1 transition hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold ${card.iconBg}`}>
                  <Icon icon={card.icon} className="text-xl" />
                </div>
                <h3 className="font-title text-base font-bold text-slate-900">
                  {card.title}
                </h3>
              </div>

              <p className="mt-2.5 font-body text-xs sm:text-sm text-slate-600 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
