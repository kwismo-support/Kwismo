import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgHero from '@/assets/illustrations/Img_Hero.png';

export default function Hero() {
  const { t } = useTranslation('landing');

  return (
    <section
      id="accueil"
      className="relative h-[calc(100vh-108px)] min-h-[560px] overflow-hidden bg-brand-navy text-white font-body flex items-center"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-darkBg to-brand-darkBg opacity-95 pointer-events-none" />

      <div className="relative mx-auto grid max-w-[90%] grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12 w-full h-full py-4 lg:py-6">
        <div className="relative z-10 flex flex-col justify-center items-start">
          <h1 className="font-title max-w-[640px] text-2xl sm:text-3xl lg:text-[40px] xl:text-[46px] 2xl:text-[52px] font-extrabold leading-[1.12] tracking-tight text-white">
            {t('landing:hero.titleLine1')}
            <br />
            {t('landing:hero.titleLine2')}
            <br />
            {t('landing:hero.titleLine3')}{' '}
            <span className="text-brand-green inline-block">
              {t('landing:hero.titleHighlight')}
            </span>
          </h1>

          <p className="mt-3 lg:mt-4 max-w-[560px] text-xs sm:text-sm lg:text-base leading-relaxed text-white/90">
            {t('landing:hero.subtitle')}
          </p>

          <div className="mt-5 lg:mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
            <a
              href="#download"
              className="flex h-[44px] lg:h-[48px] items-center gap-2.5 rounded-xl bg-brand-green px-5 lg:px-6 text-xs sm:text-sm font-semibold text-white no-underline transition hover:bg-brand-green/90 shadow-lg hover:shadow-brand-green/20"
            >
              <Icon icon="basil:download-solid" className="text-lg lg:text-xl shrink-0" />
              <span>{t('landing:hero.ctaApp')}</span>
            </a>

            <a
              href="#pricing"
              className="flex h-[44px] lg:h-[48px] items-center gap-2.5 rounded-xl bg-brand-orange pl-5 pr-2.5 lg:pl-6 lg:pr-3 text-xs sm:text-sm font-semibold text-white no-underline transition hover:bg-brand-orange/90 shadow-lg hover:shadow-brand-orange/20"
            >
              <span>{t('landing:hero.ctaPartner')}</span>
              <div className="flex h-6 w-6 lg:h-7 lg:w-7 items-center justify-center text-white">
                <Icon icon="solar:arrow-right-linear" className="text-xl stroke-[2.5]" />
              </div>
            </a>
          </div>

          <div className="mt-6 lg:mt-7 flex items-center rounded-2xl border border-white/15 bg-white/10 p-3 lg:p-4 backdrop-blur-md shadow-2xl">
            <div className="flex flex-col px-3 sm:px-5 py-0.5">
              <span className="font-title text-xl sm:text-2xl lg:text-3xl font-extrabold leading-none text-white">
                2.4M+
              </span>
              <span className="mt-1 text-[11px] lg:text-xs text-white/75 font-medium">
                {t('landing:hero.stats.verifiedNumbers')}
              </span>
            </div>

            <div className="h-8 w-px bg-white/20" />

            <div className="flex flex-col px-3 sm:px-5 py-0.5">
              <span className="font-title text-xl sm:text-2xl lg:text-3xl font-extrabold leading-none text-white">
                98 %
              </span>
              <span className="mt-1 text-[11px] lg:text-xs text-white/75 font-medium">
                {t('landing:hero.stats.accuracy')}
              </span>
            </div>

            <div className="h-8 w-px bg-white/20" />

            <div className="flex flex-col px-3 sm:px-5 py-0.5">
              <span className="font-title text-xl sm:text-2xl lg:text-3xl font-extrabold leading-none text-white">
                50+
              </span>
              <span className="mt-1 text-[11px] lg:text-xs text-white/75 font-medium">
                {t('landing:hero.stats.operators')}
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex h-full items-center justify-center lg:justify-end overflow-hidden">
          <div className="relative z-10 w-full max-w-[500px] lg:max-w-[580px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] lg:w-[400px] lg:h-[400px] rounded-full bg-brand-green/20 blur-3xl pointer-events-none" />
            <img
              src={ImgHero}
              alt="KWISMO Anti-Fraude Mobile Money"
              className="relative z-10 w-full max-h-[calc(100vh-160px)] object-contain drop-shadow-2xl transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
}