// Section grid highlighting all essential Kwismo security features.
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
    <section id="services" className="w-full bg-brand-darkGreen text-white px-6 py-16 transition-colors">
      <div className="mx-auto max-w-[90%]">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            {t('allYouNeed.title')}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(items) && items.map((item, idx) => {
            const icon = itemIcons[idx] ?? 'solar:shield-check-bold';

            return (
              <div
                key={idx}
                className="flex flex-col p-6 rounded-2xl bg-white text-slate-900 shadow-xl border border-white/20 transition hover:-translate-y-1"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green mb-3">
                  <Icon icon={icon} className="text-xl" />
                </div>

                <h3 className="font-title text-base font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-2 font-body text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
