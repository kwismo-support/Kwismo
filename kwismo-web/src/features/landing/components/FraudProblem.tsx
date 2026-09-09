import { useTranslation } from 'react-i18next';

export default function FraudProblem() {
  const { t } = useTranslation('landing');

  const statistics = [
    {
      value: t('landing:fraudProblem.stats.vishing.val'),
      label: t('landing:fraudProblem.stats.vishing.label'),
    },
    {
      value: t('landing:fraudProblem.stats.simswap.val'),
      label: t('landing:fraudProblem.stats.simswap.label'),
    },
    {
      value: t('landing:fraudProblem.stats.whatsapp.val'),
      label: t('landing:fraudProblem.stats.whatsapp.label'),
    },
    {
      value: t('landing:fraudProblem.stats.socialEng.val'),
      label: t('landing:fraudProblem.stats.socialEng.label'),
    },
  ];

  return (
    <section id="fraud" className="w-full bg-white dark:bg-brand-navy py-16 px-6 font-body">
      <div className="mx-auto max-w-[90%]">
        <div className="text-center">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-slate-900 dark:text-white">
            {t('landing:fraudProblem.title')}
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statistics.map((stat, idx) => (
            <div
              key={idx}
              className="flex h-[110px] flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-navy px-4 text-center shadow-sm transition hover:shadow-md"
            >
              <span className="font-title text-2xl sm:text-3xl font-extrabold text-brand-green">
                {stat.value}
              </span>

              <span className="mt-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}