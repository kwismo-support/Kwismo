import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

export default function Features() {
  const { t } = useTranslation('landing');

  const featureList = [
    {
      icon: 'solar:magnifer-bold-duotone',
      title: t('features.items.verify.title'),
      desc: t('features.items.verify.desc'),
      color: 'text-brand-green bg-brand-green/10',
    },
    {
      icon: 'solar:shield-warning-bold-duotone',
      title: t('features.items.detect.title'),
      desc: t('features.items.detect.desc'),
      color: 'text-brand-orange bg-brand-orange/10',
    },
    {
      icon: 'solar:card-transfer-bold-duotone',
      title: t('features.items.transfer.title'),
      desc: t('features.items.transfer.desc'),
      color: 'text-brand-blue bg-brand-blue/10',
    },
    {
      icon: 'solar:users-group-two-rounded-bold-duotone',
      title: t('features.items.report.title'),
      desc: t('features.items.report.desc'),
      color: 'text-brand-green bg-brand-green/10',
    },
    {
      icon: 'solar:chat-round-call-bold-duotone',
      title: t('features.items.whatsapp.title'),
      desc: t('features.items.whatsapp.desc'),
      color: 'text-brand-orange bg-brand-orange/10',
    },
    {
      icon: 'solar:user-check-bold-duotone',
      title: t('features.items.contacts.title'),
      desc: t('features.items.contacts.desc'),
      color: 'text-brand-blue bg-brand-blue/10',
    },
  ];

  return (
    <section id="services" className="w-full bg-slate-50 dark:bg-brand-darkBg px-6 py-16 transition-colors font-body">
      <div className="mx-auto max-w-[90%]">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-orange">
            {t('features.subtitle')}
          </span>
          <h2 className="mt-2 font-title text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            {t('features.title')}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featureList.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-navy shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-200 group"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color} mb-4`}>
                <Icon icon={item.icon} className="text-2xl group-hover:scale-110 transition duration-200" />
              </div>

              <h3 className="font-title text-lg font-bold text-slate-900 dark:text-white">
                {item.title}
              </h3>

              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
