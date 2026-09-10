import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgHero from '@/assets/illustrations/Img_Hero.png';

export default function Hero() {
  const { t } = useTranslation('landing');

  return (
    <section
      id="accueil"
      className="relative min-h-[580px] lg:h-[calc(100vh-108px)] overflow-hidden bg-brand-navy text-white font-body flex items-center py-6 lg:py-0"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-darkBg to-brand-darkBg opacity-95 pointer-events-none" />

      <div className="relative mx-auto grid max-w-[90%] grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14 h-full py-4 lg:py-6">
        <div className="relative z-10 flex flex-col justify-center items-start">
          <h1 className="font-title max-w-[720px] text-3xl sm:text-4xl lg:text-[44px] xl:text-[54px] 2xl:text-[62px] font-extrabold leading-[1.12] tracking-tight text-white">
            {t('landing:hero.titleLine1')}
            <br />
            {t('landing:hero.titleLine2')}
            <br />
            {t('landing:hero.titleLine3')}{' '}
            <span className="text-brand-green inline-block drop-shadow-md">
              {t('landing:hero.titleHighlight')}
            </span>
          </h1>

          <p className="mt-4 lg:mt-6 max-w-[620px] text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed text-white/90 font-normal">
            {t('landing:hero.subtitle')}
          </p>
          <div className="mt-6 lg:mt-8 flex flex-wrap items-center gap-4 sm:gap-5">
            <a
              href="#download"
              className="flex h-12 lg:h-14 xl:h-[56px] items-center gap-3 rounded-2xl bg-brand-green px-6 lg:px-8 text-sm lg:text-base xl:text-lg font-bold text-white no-underline transition-all duration-300 hover:bg-brand-green/90 shadow-xl hover:shadow-brand-green/30 hover:-translate-y-0.5"
            >
              <Icon icon="basil:download-solid" className="text-xl lg:text-2xl shrink-0" />
              <span>{t('landing:hero.ctaApp')}</span>
            </a>

            <a
              href="#pricing"
              className="flex h-12 lg:h-14 xl:h-[56px] items-center gap-3 rounded-2xl bg-brand-orange pl-6 pr-3 lg:pl-8 lg:pr-4 text-sm lg:text-base xl:text-lg font-bold text-white no-underline transition-all duration-300 hover:bg-brand-orange/90 shadow-xl hover:shadow-brand-orange/30 hover:-translate-y-0.5"
            >
              <span>{t('landing:hero.ctaPartner')}</span>
              <div className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center text-white rounded-full bg-white/20">
                <Icon icon="solar:arrow-right-linear" className="text-xl lg:text-2xl stroke-[2.5]" />
              </div>
            </a>
          </div>

          {/* Carte de Statistiques adaptative */}
          <div className="mt-7 lg:mt-9 flex items-center rounded-2xl lg:rounded-3xl border border-white/20 bg-white/10 p-3.5 lg:p-5 xl:p-6 backdrop-blur-md shadow-2xl">
            <div className="flex flex-col px-3 sm:px-6 py-0.5">
              <span className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-none text-white">
                2.4M+
              </span>
              <span className="mt-1.5 text-xs lg:text-sm text-white/80 font-semibold">
                {t('landing:hero.stats.verifiedNumbers')}
              </span>
            </div>

            <div className="h-10 lg:h-12 w-px bg-white/20" />

            <div className="flex flex-col px-3 sm:px-6 py-0.5">
              <span className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-none text-white">
                98 %
              </span>
              <span className="mt-1.5 text-xs lg:text-sm text-white/80 font-semibold">
                {t('landing:hero.stats.accuracy')}
              </span>
            </div>

            <div className="h-10 lg:h-12 w-px bg-white/20" />

            <div className="flex flex-col px-3 sm:px-6 py-0.5">
              <span className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-none text-white">
                50+
              </span>
              <span className="mt-1.5 text-xs lg:text-sm text-white/80 font-semibold">
                {t('landing:hero.stats.operators')}
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex h-full items-center justify-center lg:justify-end overflow-hidden">
          <div className="relative z-10 w-full max-w-[520px] lg:max-w-[620px] xl:max-w-[700px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] lg:w-[460px] lg:h-[460px] rounded-full bg-brand-green/25 blur-3xl pointer-events-none animate-pulse" />
            <img
              src={ImgHero}
              alt="KWISMO Anti-Fraude Mobile Money"
              className="relative z-10 w-full max-h-[calc(100vh-200px)] object-contain drop-shadow-2xl hover:scale-[1.015] transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}