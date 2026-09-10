import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

const itemIcons = [
  'solar:phone-calling-bold-duotone',
  'solar:lock-keyhole-bold-duotone',
  'solar:chart-line-up-bold-duotone',
  'solar:shield-warning-bold-duotone',
  'logos:whatsapp-icon',
  'solar:users-group-two-rounded-bold-duotone',
];

export default function AllYouNeed() {
  const { t } = useTranslation('landing');

  const items = t('allYouNeed.items', { returnObjects: true }) as { title: string; desc: string }[];

  return (
    <section id="services" className="w-full bg-brand-darkGreen text-white px-6 py-20 lg:py-28 transition-colors font-body">
      <div className="mx-auto max-w-[90%] 2xl:max-w-[85%]">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-title text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white">
            {t('allYouNeed.title')}
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(items) && items.map((item, idx) => {
            const icon = itemIcons[idx] ?? 'solar:shield-check-bold-duotone';

            return (
              <div
                key={idx}
                className="relative overflow-hidden group flex flex-col p-7 sm:p-8 rounded-3xl bg-white text-slate-900 shadow-xl border border-white/20 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl justify-between min-h-[230px]"
              >
                {/* Icône en Filigrane géante fixe (~150px) en Vert Navbar (brand-green) ne décalant jamais la hauteur */}
                <div className="absolute -right-6 -bottom-6 text-[150px] leading-none text-brand-green/20 group-hover:text-brand-green/30 group-hover:scale-105 transition-all duration-500 pointer-events-none select-none z-0">
                  <Icon icon={icon} />
                </div>

                <div className="relative z-10">
                  {/* Titre en Bleu Marine Principal (brand-navy) agrandi */}
                  <h3 className="font-title text-xl sm:text-2xl font-black text-brand-navy dark:text-slate-900 mb-3">
                    {item.title}
                  </h3>

                  {/* Description concise */}
                  <p className="font-body text-sm sm:text-base text-slate-600 leading-relaxed max-w-[92%] font-normal">
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
