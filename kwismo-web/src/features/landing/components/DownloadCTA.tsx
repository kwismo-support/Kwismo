// Mobile application download call-to-action section with store buttons and illustration.
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgEquipe from '@/assets/illustrations/Img_Equipe.jpeg';

export default function DownloadCTA() {
  const { t } = useTranslation('landing');

  return (
    <section id="download" className="w-full bg-brand-navy text-white px-6 py-16 transition-colors relative overflow-hidden font-body">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy to-brand-darkBg opacity-95 pointer-events-none" />

      <div className="relative mx-auto max-w-[90%] grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
        <div className="flex flex-col items-start">
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-green">
            {t('landing:download.badge')}
          </span>

          <h2 className="mt-2 font-title text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
            {t('landing:download.title')}
          </h2>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/80 max-w-md">
            {t('landing:download.subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#"
              className="flex h-[50px] items-center gap-3 rounded-xl bg-white text-slate-900 px-5 transition hover:bg-slate-100 shadow-lg"
            >
              <Icon icon="bxl:apple" className="text-2xl text-slate-900" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] text-slate-500 uppercase font-medium">{t('landing:download.downloadOn')}</span>
                <span className="text-xs sm:text-sm font-bold font-title">{t('landing:download.ios')}</span>
              </div>
            </a>

            <a
              href="#"
              className="flex h-[50px] items-center gap-3 rounded-xl bg-white text-slate-900 px-5 transition hover:bg-slate-100 shadow-lg"
            >
              <Icon icon="bxl:play-store" className="text-2xl text-brand-green" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] text-slate-500 uppercase font-medium">{t('landing:download.downloadOn')}</span>
                <span className="text-xs sm:text-sm font-bold font-title">{t('landing:download.android')}</span>
              </div>
            </a>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div className="overflow-hidden rounded-3xl border-2 border-white/10 shadow-2xl max-w-[480px]">
            <img
              src={ImgEquipe}
              alt="KWISMO"
              className="w-full h-72 sm:h-80 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}