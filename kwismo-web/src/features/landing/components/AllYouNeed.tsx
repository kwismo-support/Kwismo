import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

const itemIcons = [
  'solar:phone-calling-bold-duotone',
  'solar:lock-keyhole-bold-duotone',
  'solar:chart-line-up-bold-duotone',
  'solar:shield-warning-bold-duotone',
  'solar:chat-round-dots-bold-duotone',
  'solar:users-group-two-rounded-bold-duotone',
];

export default function AllYouNeed() {
  const { t } = useTranslation('landing');

  const items = t('landing:allYouNeed.items', { returnObjects: true }) as { title: string; desc: string }[];

  return (
    <section id="services" className="w-full bg-brand-darkGreen text-white px-6 py-20 lg:py-24 transition-colors font-body overflow-hidden">
      <div className="mx-auto max-w-[90%]">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white">
            {t('landing:allYouNeed.title')}
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(items) &&
            items.map((item, idx) => {
              const icon = itemIcons[idx] ?? 'solar:shield-check-bold-duotone';

              return (
                <div
                  key={idx}
                  className="relative overflow-hidden flex flex-col justify-between p-7 sm:p-8 rounded-3xl bg-white dark:bg-brand-darkBg text-slate-900 dark:text-white shadow-lg border border-slate-200 dark:border-white/10 hover:border-brand-green/50 transition-all duration-300 min-h-[180px]"
                >
                  <div className="absolute right-3 bottom-2 text-brand-green/20 pointer-events-none z-0">
                    <Icon icon={icon} className="text-8xl sm:text-8xl text-brand-green opacity-25" />
                  </div>

                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold uppercase tracking-wider text-brand-green bg-brand-green/10 px-3 py-1 rounded-full">
                        0{idx + 1}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-title text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="font-body text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                        {item.desc}
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
