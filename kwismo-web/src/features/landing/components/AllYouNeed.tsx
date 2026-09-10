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

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(items) && items.map((item, idx) => {
            const icon = itemIcons[idx] ?? 'solar:shield-check-bold-duotone';

            return (
              <div
                key={idx}
                className="group flex flex-col p-7 sm:p-8 rounded-3xl bg-white text-slate-900 shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl justify-between"
              >
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-green/15 text-brand-green mb-5 group-hover:scale-110 transition-transform duration-300 border border-brand-green/20">
                    <Icon icon={icon} className="text-3xl" />
                  </div>

                  <h3 className="font-title text-lg sm:text-xl font-extrabold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 font-body text-sm sm:text-base text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-brand-green text-xs font-bold uppercase tracking-wider">
                  <span>Fonctionnalité KWISMO</span>
                  <Icon icon="solar:alt-arrow-right-linear" className="text-base group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
