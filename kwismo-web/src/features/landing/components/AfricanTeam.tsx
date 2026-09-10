import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgEquipe from '@/assets/illustrations/Img_Equipe.jpeg';

export default function AfricanTeam() {
  const { t } = useTranslation('landing');

  const cards = [
    {
      title: t('africanTeam.cards.mission.title'),
      desc: t('africanTeam.cards.mission.desc') + ' Nous analysons des milliers d’appels et numéros signalés quotidiennement en Afrique subsaharienne pour bloquer la fraude Mobile Money à la source.',
      tag: 'Engagement Anti-Fraude',
      icon: 'solar:target-bold-duotone',
      iconBg: 'bg-brand-orange/15 text-brand-orange border border-brand-orange/20',
    },
    {
      title: t('africanTeam.cards.community.title'),
      desc: t('africanTeam.cards.community.desc') + ' Grâce aux données partagées par notre communauté et les opérateurs partenaires, chaque arnaque signalée protège instantanément des milliers d’utilisateurs.',
      tag: 'Intelligence Collective',
      icon: 'solar:users-group-two-rounded-bold-duotone',
      iconBg: 'bg-brand-green/15 text-brand-green border border-brand-green/20',
    },
    {
      title: t('africanTeam.cards.approach.title'),
      desc: t('africanTeam.cards.approach.desc') + ' Notre moteur IA combiné au protocole USSD natif calcule un score de risque instantané en moins d’une seconde, même sans connexion internet haut débit.',
      tag: 'Réponse Instantanée',
      icon: 'solar:bolt-bold-duotone',
      iconBg: 'bg-brand-orange/15 text-brand-orange border border-brand-orange/20',
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
              className="p-7 sm:p-8 rounded-3xl bg-white text-slate-900 shadow-2xl border border-white/30 flex flex-col justify-center items-start flex-1 transition-all duration-300 hover:scale-[1.015] hover:shadow-2xl"
            >
              <div className="flex items-center justify-between w-full mb-3">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.iconBg}`}>
                    <Icon icon={card.icon} className="text-2xl" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                      {card.tag}
                    </span>
                    <h3 className="font-title text-lg sm:text-xl font-extrabold text-slate-900">
                      {card.title}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="mt-2 font-body text-sm sm:text-base text-slate-600 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
