import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import ImgHero from '@/assets/illustrations/Img_Hero.png';

export default function Hero() {
  const { t } = useTranslation('landing');

  return (
    <section
      id="accueil"
      className="relative min-h-[540px] overflow-hidden bg-[#161E33] py-12 lg:py-16 text-white"
    >
      {/* Background glow gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#161E33] via-[#0E1726] to-[#0F1626] opacity-95 pointer-events-none" />

      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-12">

        {/* COLONNE GAUCHE */}
        <div className="relative z-10 flex flex-col items-start pt-4 lg:pt-0">

          {/* Titre principal */}
          <h1 className="font-title max-w-[540px] text-3xl sm:text-4xl lg:text-[44px] font-bold leading-[1.18] tracking-tight text-white">
            {t('hero.titleLine1', 'Sécurisez vos')}
            <br />
            {t('hero.titleLine2', 'transactions en')}
            <br />
            {t('hero.titleLine3', 'toute')}{' '}
            <span className="text-[#32B07F] inline-block">
              {t('hero.titleHighlight', 'simplicité')}
            </span>
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-[460px] font-body text-xs sm:text-sm font-normal leading-relaxed text-white/80">
            {t(
              'hero.subtitle',
              "KWISMO protège vos transferts Orange Money et MTN MoMo contre les arnaques et les erreurs de saisie. Envoyez et recevez votre argent l'esprit tranquille."
            )}
          </p>

          {/* Boutons CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {/* CTA 1: Télécharger l'application avec icône basil:download-solid */}
            <a
              href="#download"
              className="flex h-[44px] items-center gap-2.5 rounded-xl bg-[#32B07F] px-5 font-body text-xs sm:text-sm font-semibold text-white no-underline transition hover:bg-[#2aa072] shadow-md"
            >
              <Icon icon="basil:download-solid" className="text-xl shrink-0" />
              <span>{t('hero.ctaApp', "Télécharger l'application")}</span>
            </a>

            {/* CTA 2: Devenir partenaire avec icône flèche droite dans un cercle blanc */}
            <a
              href="#pricing"
              className="flex h-[44px] items-center gap-3 rounded-xl bg-[#FF9900] pl-5 pr-2.5 font-body text-xs sm:text-sm font-semibold text-white no-underline transition hover:bg-[#e08700] shadow-md"
            >
              <span>{t('hero.ctaPartner', 'Devenir partenaire')}</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#FF9900] shadow-sm">
                <Icon icon="solar:arrow-right-linear" className="text-sm stroke-[2.5]" />
              </div>
            </a>
          </div>

          {/* Statistiques floutées */}
          <div className="mt-8 flex items-center rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md shadow-xl">

            <div className="flex flex-col px-4 py-1">
              <span className="font-title text-xl sm:text-2xl font-bold leading-none text-white">
                2.4M+
              </span>
              <span className="mt-1 font-body text-[10px] sm:text-xs text-white/70">
                {t('hero.stats.verifiedNumbers', 'numéros vérifiés')}
              </span>
            </div>

            <div className="h-9 w-px bg-white/20" />

            <div className="flex flex-col px-4 py-1">
              <span className="font-title text-xl sm:text-2xl font-bold leading-none text-white">
                98 %
              </span>
              <span className="mt-1 font-body text-[10px] sm:text-xs text-white/70">
                {t('hero.stats.accuracy', 'Précision')}
              </span>
            </div>

            <div className="h-9 w-px bg-white/20" />

            <div className="flex flex-col px-4 py-1">
              <span className="font-title text-xl sm:text-2xl font-bold leading-none text-white">
                50+
              </span>
              <span className="mt-1 font-body text-[10px] sm:text-xs text-white/70">
                {t('hero.stats.operators', 'Opérateurs')}
              </span>
            </div>

          </div>

        </div>

        {/* COLONNE DROITE */}
        <div className="relative flex h-full items-center justify-center lg:justify-end">
          <div className="relative z-10 w-full max-w-[540px]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-[#32B07F]/25 blur-2xl pointer-events-none" />
            
            <img
              src={ImgHero}
              alt="KWISMO Protection App"
              className="relative z-10 w-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>

      </div>
    </section>
  );
}