import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

export default function Pricing() {
  const { t } = useTranslation('landing');

  const plans = [
    {
      type: t('landing:pricing.plans.payg.badge'),
      price: t('landing:pricing.plans.payg.price'),
      suffix: t('landing:pricing.plans.payg.perCall'),
      features: t('landing:pricing.plans.payg.features', { returnObjects: true }) as string[],
      button: t('landing:pricing.plans.payg.cta'),
      featured: false,
    },
    {
      type: t('landing:pricing.plans.volume.badge'),
      price: t('landing:pricing.plans.volume.title'),
      suffix: t('landing:pricing.plans.volume.sub'),
      features: t('landing:pricing.plans.volume.features', { returnObjects: true }) as string[],
      button: t('landing:pricing.plans.volume.cta'),
      featured: true,
    },
    {
      type: t('landing:pricing.plans.enterprise.badge'),
      price: t('landing:pricing.plans.enterprise.title'),
      suffix: t('landing:pricing.plans.enterprise.sub'),
      features: t('landing:pricing.plans.enterprise.features', { returnObjects: true }) as string[],
      button: t('landing:pricing.plans.enterprise.cta'),
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="w-full bg-slate-50 dark:bg-brand-darkBg px-6 py-16 transition-colors font-body">
      <div className="mx-auto max-w-[90%]">
        <div className="text-center">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
            {t('landing:pricing.title')}
          </h2>
        </div>

        <div className="mx-auto mt-10 grid max-w-[1060px] grid-cols-1 gap-6 md:grid-cols-3 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`flex flex-col justify-between rounded-3xl border p-6 transition ${plan.featured
                  ? 'border-brand-green bg-brand-navy text-white'
                  : 'border-brand-navy dark:border-brand-green border-slate-200 bg-transparent dark:bg-transparent text-slate-900 dark:text-white'
                }`}
            >
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-green">
                  {plan.type}
                </span>

                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-title text-2xl sm:text-3xl font-extrabold">
                    {plan.price}
                  </span>
                  {plan.suffix && (
                    <span className="text-xs opacity-75">{plan.suffix}</span>
                  )}
                </div>

                <div className="mt-6 flex flex-col gap-2.5">
                  {Array.isArray(plan.features) && plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <Icon icon="solar:check-circle-bold" className="text-brand-green text-sm shrink-0" />
                      <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="#contact"
                className="mt-8 flex h-11 w-full items-center justify-center rounded-xl bg-brand-green text-xs sm:text-sm font-semibold text-white hover:bg-brand-green/90 transition"
              >
                {plan.button}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}