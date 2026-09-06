// Step-by-step workflow section showing how Kwismo protects transactions in 3 steps.
import { useTranslation } from 'react-i18next';
import ImgEtape from '@/assets/illustrations/Img_Etape.png';

export default function HowItWorks() {
  const { t } = useTranslation('landing');

  const steps = t('howItWorks.steps', { returnObjects: true }) as { num: string; title: string; desc: string }[];

  return (
    <section id="howItWorks" className="w-full bg-white dark:bg-brand-darkBg px-6 py-16 transition-colors font-body">
      <div className="mx-auto max-w-[90%]">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
            {t('landing:howItWorks.title')}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12">
          <div className="flex flex-col justify-between gap-5 h-full">
            {Array.isArray(steps) && steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-navy shadow-sm hover:border-brand-green/50 transition flex-1 justify-center flex-col"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-brand-darkBg font-title text-lg font-bold text-brand-green">
                    {step.num || (idx + 1).toString()}
                  </div>

                  <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                </div>

                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-13">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center h-full">
            <img
              src={ImgEtape}
              alt="KWISMO"
              className="w-full max-w-[480px] h-full max-h-[400px] object-contain drop-shadow-xl rounded-3xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
