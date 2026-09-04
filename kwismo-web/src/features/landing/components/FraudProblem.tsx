import { useTranslation } from 'react-i18next';

export default function FraudProblem() {
  const { t } = useTranslation('landing');

  const statistics = [
    {
      value: t('fraudProblem.stats.vishing.val', '1 / 3 min'),
      label: t('fraudProblem.stats.vishing.label', 'Vishing'),
    },
    {
      value: t('fraudProblem.stats.simswap.val', '87 %'),
      label: t('fraudProblem.stats.simswap.label', 'SIM Swap de tentatives réussies'),
    },
    {
      value: t('fraudProblem.stats.whatsapp.val', '+340 %'),
      label: t('fraudProblem.stats.whatsapp.label', 'Piratage WhatsApp en un an'),
    },
    {
      value: t('fraudProblem.stats.socialEng.val', '65 %'),
      label: t('fraudProblem.stats.socialEng.label', 'Ingénierie sociale de toutes les fraudes'),
    },
  ];

  return (
    <section id="fraud" className="w-full bg-white dark:bg-[#0F1626] px-6 py-16 transition-colors">
      <div className="mx-auto max-w-[1200px]">

        {/* Header */}
        <div className="text-center">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-slate-900 dark:text-white">
            {t('fraudProblem.title', 'La fraude Mobile Money explose')}
          </h2>
        </div>

        {/* Grid Stats */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statistics.map((stat, idx) => (
            <div
              key={idx}
              className="flex h-[110px] flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#161E33] px-4 text-center shadow-sm transition hover:shadow-md"
            >
              <span className="font-title text-2xl sm:text-3xl font-extrabold text-[#32B07F]">
                {stat.value}
              </span>

              <span className="mt-1.5 font-body text-xs font-medium text-slate-700 dark:text-slate-200">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}