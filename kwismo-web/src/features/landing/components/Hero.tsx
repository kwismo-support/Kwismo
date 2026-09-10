import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgHero from '@/assets/illustrations/Img_Hero.png';

export default function Hero() {
  const { t } = useTranslation('landing');

  return (
    <section
      id="accueil"
      className="relative min-h-[580px] lg:min-h-[calc(100vh-108px)] overflow-hidden bg-brand-navy py-12 lg:py-0 text-white font-body flex items-center"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-darkBg to-brand-darkBg opacity-95 pointer-events-none" />

      <div className="relative mx-auto grid max-w-[90%] grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14 w-full py-8 lg:py-12">
        <div className="relative z-10 flex flex-col items-start pt-2 lg:pt-0">
          <h1 className="font-title max-w-[620px] text-3xl sm:text-4xl lg:text-[48px] xl:text-[54px] 2xl:text-[60px] font-extrabold leading-[1.16] tracking-tight text-white">
            {t('landing:hero.titleLine1')}
            <br />
            {t('landing:hero.titleLine2')}
            <br />
            {t('landing:hero.titleLine3')}{' '}
            <span className="text-brand-green inline-block">
              {t('landing:hero.titleHighlight')}
            </span>
          </h1>

          <p className="mt-5 max-w-[540px] text-sm sm:text-base lg:text-lg font-normal leading-relaxed text-white/85">
            {t('landing:hero.subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-5">
            <a
              href="#download"
              className="flex h-[48px] lg:h-[52px] items-center gap-3 rounded-xl bg-brand-green px-6 lg:px-7 text-xs sm:text-sm lg:text-base font-semibold text-white no-underline transition hover:bg-brand-green/90 shadow-lg hover:shadow-brand-green/20"
            >
              <Icon icon="basil:download-solid" className="text-xl lg:text-2xl shrink-0" />
              <span>{t('landing:hero.ctaApp')}</span>
            </a>

            <a
              href="#pricing"
              className="flex h-[48px] lg:h-[52px] items-center gap-3 rounded-xl bg-brand-orange pl-6 pr-3 lg:pl-7 lg:pr-3.5 text-xs sm:text-sm lg:text-base font-semibold text-white no-underline transition hover:bg-brand-orange/90 shadow-lg hover:shadow-brand-orange/20"
            >
              <span>{t('landing:hero.ctaPartner')}</span>
              <div className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center text-white">
                <Icon icon="solar:arrow-right-linear" className="text-2xl stroke-[2.5]" />
              </div>
            </a>
          </div>

          <div className="mt-10 flex items-center rounded-2xl border border-white/15 bg-white/10 p-4 lg:p-5 backdrop-blur-md shadow-2xl">
            <div className="flex flex-col px-4 sm:px-6 py-1">
              <span className="font-title text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-none text-white">
                2.4M+
              </span>
              <span className="mt-1.5 text-xs lg:text-sm text-white/75 font-medium">
                {t('landing:hero.stats.verifiedNumbers')}
              </span>
            </div>

            <div className="h-10 w-px bg-white/20" />

            <div className="flex flex-col px-4 sm:px-6 py-1">
              <span className="font-title text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-none text-white">
                98 %
              </span>
              <span className="mt-1.5 text-xs lg:text-sm text-white/75 font-medium">
                {t('landing:hero.stats.accuracy')}
              </span>
            </div>

            <div className="h-10 w-px bg-white/20" />

            <div className="flex flex-col px-4 sm:px-6 py-1">
              <span className="font-title text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-none text-white">
                50+
              </span>
              <span className="mt-1.5 text-xs lg:text-sm text-white/75 font-medium">
                {t('landing:hero.stats.operators')}
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex h-full items-center justify-center lg:justify-end">
          <div className="relative z-10 w-full max-w-[540px] lg:max-w-[620px] xl:max-w-[680px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] lg:w-[460px] lg:h-[460px] rounded-full bg-brand-green/25 blur-3xl pointer-events-none" />
            <img
              src={ImgHero}
              alt="KWISMO Anti-Fraude Mobile Money"
              className="relative z-10 w-full object-contain drop-shadow-2xl hover:scale-[1.01] transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </section>
  );
}