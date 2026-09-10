import { useTranslation } from 'react-i18next';
import ImgEtape from '@/assets/illustrations/Img_Etape.png';

export default function HowItWorks() {
  const { t } = useTranslation('landing');

  const steps = t('howItWorks.steps', { returnObjects: true }) as { num: string; title: string; desc: string }[];

  return (
    <section id="howItWorks" className="w-full bg-white dark:bg-brand-darkBg px-6 py-20 lg:py-24 transition-colors font-body">
      <div className="mx-auto max-w-[90%]">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-slate-900 dark:text-white">
            {t('landing:howItWorks.title')}
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12 lg:gap-16">
          <div className="flex flex-col justify-between gap-6 h-full">
            {Array.isArray(steps) && steps.map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col p-6 sm:p-7.5 rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-navy shadow-md hover:shadow-xl hover:border-brand-green/50 transition-all duration-300 flex-1 justify-center"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-green text-white font-title text-xl font-extrabold shadow-lg shadow-brand-green/20">
                    {step.num || (idx + 1).toString()}
                  </div>

                  <h3 className="font-title text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                </div>

                <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pl-16">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center h-full">
            <div className="relative w-full max-w-[540px] p-4 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl flex items-center justify-center">
              <img
                src={ImgEtape}
                alt="KWISMO Process 3 étapes"
                className="w-full max-w-[500px] h-auto object-contain drop-shadow-2xl rounded-2xl hover:scale-[1.01] transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
