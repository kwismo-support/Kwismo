import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

const itemIcons = [
  'solar:phone-bold-duotone',
  'solar:lock-keyhole-bold-duotone',
  'solar:shield-warning-bold-duotone',
  'solar:user-check-bold-duotone',
  'solar:chat-round-call-bold-duotone',
  'solar:users-group-two-rounded-bold-duotone',
];

export default function AllYouNeed() {
  const { t } = useTranslation('landing');

  const items = t('allYouNeed.items', { returnObjects: true }) as { title: string; desc: string }[];

  return (
    <section id="services" className="w-full bg-brand-darkGreen text-white px-6 py-20 lg:py-24 transition-colors font-body">
      <div className="mx-auto max-w-[90%]">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white">
            {t('allYouNeed.title')}
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(items) && items.map((item, idx) => {
            const icon = itemIcons[idx] ?? 'solar:shield-check-bold-duotone';

            return (
              <div
                key={idx}
                className="relative overflow-hidden group flex flex-col p-7 sm:p-8 rounded-3xl bg-white text-slate-900 shadow-xl border border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl justify-between min-h-[220px]"
              >
                {/* Icône en Filigrane géante en arrière-plan à droite (~80% hauteur) */}
                <div className="absolute -right-4 -bottom-4 text-[130px] leading-none text-brand-green/10 group-hover:text-brand-green/15 group-hover:scale-105 transition-all duration-300 pointer-events-none select-none z-0">
                  <Icon icon={icon} />
                </div>

                <div className="relative z-10">
                  {/* Titre propre et direct */}
                  <h3 className="font-title text-lg sm:text-xl font-extrabold text-slate-900 mb-3">
                    {item.title}
                  </h3>

                  {/* Description concise */}
                  <p className="font-body text-sm sm:text-base text-slate-600 leading-relaxed max-w-[90%]">
                    {item.desc}
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
