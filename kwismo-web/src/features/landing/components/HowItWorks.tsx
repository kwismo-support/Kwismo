import { useTranslation } from 'react-i18next';
import ImgEtape from '@/assets/illustrations/Img_Etape.png';

export default function HowItWorks() {
  const { t } = useTranslation('landing');

  const defaultSteps = [
    {
      num: '1',
      title: 'Initialisez votre transfert',
      desc: 'Saisissez les informations de transaction sur une interface épurée et vérifiée.',
    },
    {
      num: '2',
      title: 'Validez en toute sécurité',
      desc: 'KWISMO analyse les risques de fraude et vous confirme l\'authenticité du destinataire.',
    },
    {
      num: '3',
      title: 'Transaction réussie',
      desc: 'Recevez un reçu numérique sécurisé et traçable en un instant.',
    },
  ];

  const steps: { num: string; title: string; desc: string }[] =
    (t('howItWorks.steps', { returnObjects: true }) as unknown as { num: string; title: string; desc: string }[]) || defaultSteps;

  return (
    <section id="howItWorks" className="w-full bg-white dark:bg-[#0F1626] px-6 py-16 transition-colors">
      <div className="mx-auto max-w-[1200px]">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
            {t('howItWorks.title', 'Opérationnel en 3 étapes')}
          </h2>
        </div>

        {/* Content Layout */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 items-stretch gap-12">
          
          {/* 3 Step Cards - Left column matching full height */}
          <div className="flex flex-col justify-between gap-5 h-full">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#161E33] shadow-sm hover:border-[#32B07F]/50 transition flex-1 justify-center flex-col"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 dark:border-white/20 bg-white dark:bg-[#0F1626] font-title text-lg font-bold text-[#32B07F]">
                    {step.num || (idx + 1).toString()}
                  </div>

                  <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                </div>

                <p className="mt-2 font-body text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pl-13">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Right Image */}
          <div className="flex justify-center items-center h-full">
            <img
              src={ImgEtape}
              alt="Opérationnel en 3 étapes"
              className="w-full max-w-[480px] h-full max-h-[400px] object-contain drop-shadow-xl rounded-3xl"
            />
          </div>

        </div>

      </div>
    </section>
  );
}
