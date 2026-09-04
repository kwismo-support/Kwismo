import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgEquipe from '@/assets/illustrations/Img_Equipe.jpeg';

export default function AfricanTeam() {
  const { t } = useTranslation('landing');

  const cards = [
    {
      title: t('africanTeam.cards.mission.title', 'Notre mission'),
      desc: t('africanTeam.cards.mission.desc', 'Rendre chaque transaction Mobile Money sûre et sereine, partout en Afrique.'),
      icon: 'solar:target-bold-duotone',
      iconBg: 'bg-[#FF9900]/10 text-[#FF9900]',
    },
    {
      title: t('africanTeam.cards.community.title', 'Notre communauté'),
      desc: t('africanTeam.cards.community.desc', 'Des millions d\'utilisateurs qui signalent et protègent, ensemble, en temps réel.'),
      icon: 'solar:users-group-two-rounded-bold',
      iconBg: 'bg-[#32B07F]/10 text-[#32B07F]',
    },
    {
      title: t('africanTeam.cards.approach.title', 'Notre approche'),
      desc: t('africanTeam.cards.approach.desc', 'Une technologie locale, pensée pour les usages et les réseaux africains.'),
      icon: 'solar:bolt-bold',
      iconBg: 'bg-[#FF9900]/10 text-[#FF9900]',
    },
  ];

  return (
    <section id="about" className="w-full bg-[#104E37] text-white px-6 py-16 transition-colors">
      <div className="mx-auto max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12">

        {/* Left Column */}
        <div className="flex flex-col justify-between items-start">
          <div>
            <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white">
              {t('africanTeam.title', 'Une équipe africaine au service de la confiance numérique')}
            </h2>

            <p className="mt-4 font-body text-xs sm:text-sm leading-relaxed text-white/90">
              {t(
                'africanTeam.desc',
                "KWISMO est né d'un constat simple : le Mobile Money a transformé nos économies, mais la fraude avance aussi vite que l'innovation. Nous construisons le bouclier collectif qui manquait."
              )}
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border-2 border-white/20 shadow-2xl w-full flex-1 min-h-[260px]">
            <img
              src={ImgEquipe}
              alt="Équipe KWISMO"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>

        {/* Right Column: 3 White Cards filling 100% height matching left column */}
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
