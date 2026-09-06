import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgHero from '@/assets/illustrations/Img_Hero.png';

export default function Hero() {
  const { t } = useTranslation('landing');

  return (
    <section
      id="accueil"
      className="relative min-h-[540px] overflow-hidden bg-brand-navy py-12 lg:py-16 text-white font-body"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-darkBg to-brand-darkBg opacity-95 pointer-events-none" />

      <div className="relative mx-auto grid max-w-[90%] grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-12">
        <div className="relative z-10 flex flex-col items-start pt-4 lg:pt-0">
          <h1 className="font-title max-w-[540px] text-3xl sm:text-4xl lg:text-[44px] font-bold leading-[1.18] tracking-tight text-white">
            {t('landing:hero.titleLine1')}
            <br />
            {t('landing:hero.titleLine2')}
            <br />
            {t('landing:hero.titleLine3')}{' '}
            <span className="text-brand-green inline-block">
              {t('landing:hero.titleHighlight')}
            </span>
          </h1>

          <p className="mt-4 max-w-[460px] text-xs sm:text-sm font-normal leading-relaxed text-white/80">
            {t('landing:hero.subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#download"
              className="flex h-[44px] items-center gap-2.5 rounded-xl bg-brand-green px-5 text-xs sm:text-sm font-semibold text-white no-underline transition hover:bg-brand-green/90 shadow-md"
            >
              <Icon icon="basil:download-solid" className="text-xl shrink-0" />
              <span>{t('landing:hero.ctaApp')}</span>
            </a>

            <a
              href="#pricing"
              className="flex h-[44px] items-center gap-3 rounded-xl bg-brand-orange pl-5 pr-2.5 text-xs sm:text-sm font-semibold text-white no-underline transition hover:bg-brand-orange/90 shadow-md"
            >
              <span>{t('landing:hero.ctaPartner')}</span>
              <div className="flex h-7 w-7 items-center justify-center text-white">
                <Icon icon="solar:arrow-right-linear" className="text-2xl stroke-[2.5]" />
              </div>
            </a>
          </div>

          <div className="mt-8 flex items-center rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md shadow-xl">
            <div className="flex flex-col px-4 py-1">
              <span className="font-title text-xl sm:text-2xl font-bold leading-none text-white">
                2.4M+
              </span>
              <span className="mt-1 text-[10px] sm:text-xs text-white/70">
                {t('landing:hero.stats.verifiedNumbers')}
              </span>
            </div>

            <div className="h-9 w-px bg-white/20" />

            <div className="flex flex-col px-4 py-1">
              <span className="font-title text-xl sm:text-2xl font-bold leading-none text-white">
                98 %
              </span>
              <span className="mt-1 text-[10px] sm:text-xs text-white/70">
                {t('landing:hero.stats.accuracy')}
              </span>
            </div>

            <div className="h-9 w-px bg-white/20" />

            <div className="flex flex-col px-4 py-1">
              <span className="font-title text-xl sm:text-2xl font-bold leading-none text-white">
                50+
              </span>
              <span className="mt-1 text-[10px] sm:text-xs text-white/70">
                {t('landing:hero.stats.operators')}
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex h-full items-center justify-center lg:justify-end">
          <div className="relative z-10 w-full max-w-[540px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-brand-green/25 blur-2xl pointer-events-none" />
            <img
              src={ImgHero}
              alt="KWISMO"
              className="relative z-10 w-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}