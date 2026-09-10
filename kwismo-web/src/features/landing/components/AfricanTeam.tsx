import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgEquipe from '@/assets/illustrations/Img_Equipe.jpeg';

export default function AfricanTeam() {
  const { t } = useTranslation('landing');

  const cards = [
    {
      title: t('africanTeam.cards.mission.title'),
      desc: `${t('africanTeam.cards.mission.desc')} Nous analysons des milliers d'appels et de numéros signalés quotidiennement en Afrique subsaharienne pour bloquer la fraude Mobile Money à sa source.`,
      icon: 'solar:target-bold-duotone',
      iconColor: 'text-brand-orange',
      accentBg: 'from-brand-orange/10 via-transparent to-transparent',
    },
    {
      title: t('africanTeam.cards.community.title'),
      desc: `${t('africanTeam.cards.community.desc')} Grâce aux données partagées par notre communauté et les opérateurs télécoms partenaires, chaque arnaque signalée protège instantanément des milliers d'utilisateurs.`,
      icon: 'solar:users-group-two-rounded-bold-duotone',
      iconColor: 'text-brand-green',
      accentBg: 'from-brand-green/10 via-transparent to-transparent',
    },
    {
      title: t('africanTeam.cards.approach.title'),
      desc: `${t('africanTeam.cards.approach.desc')} Notre moteur IA combiné au protocole USSD natif calcule un score de risque instantané en moins d'une seconde, même sans connexion internet haut débit.`,
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

        <div className="flex flex-col justify-between gap-6 h-full">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden p-7 sm:p-8 rounded-3xl bg-white text-slate-900 shadow-2xl border border-white/40 flex flex-col justify-center items-start flex-1 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl bg-gradient-to-br ${card.accentBg}`}
            >
              <div className="flex items-center gap-4 mb-3 z-10">
                <div className="p-3 rounded-2xl bg-slate-100/80 shadow-inner">
                  <Icon icon={card.icon} className={`text-3xl sm:text-4xl lg:text-5xl ${card.iconColor} shrink-0`} />
                </div>
                <h3 className="font-title text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">
                  {card.title}
                </h3>
              </div>

              <p className="font-body text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed z-10">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
