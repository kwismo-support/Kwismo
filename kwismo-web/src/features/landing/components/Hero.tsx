import { ArrowRight, Download } from 'lucide-react';
import ImgHero from '@/assets/illustrations/Img_Hero.png';

export default function Hero() {
  return (
    <section
      id="accueil"
      className="w-full overflow-hidden bg-[#151D34]"
    >
      <div className="grid min-h-[438px] w-full grid-cols-1 lg:grid-cols-2">

        {/* =====================================================
            COLONNE GAUCHE 
        ====================================================== */}
        <div className="flex items-center justify-center px-[8%] py-12 lg:justify-end lg:py-0 lg:pr-[7%]">

          <div className="w-full max-w-[500px]">

            {/* Titre */}
            <h1 className="font-title m-0 text-[56px] font-bold leading-[72px] tracking-[-1px] text-white">
              Sécurisez vos
              <br />
              transactions en
              <br />
              toute{' '}
              <span className="text-[#31B58A]">
                simplicité
              </span>
            </h1>

            {/* Description */}
            <p className="font-body mt-4 max-w-[430px] text-[16px] font-medium leading-[27px] text-white">
              KWISMO protège vos transferts Orange Money et MTN
              MoMo contre les arnaques et les erreurs de saisie.
              Envoyez et recevez votre argent l'esprit tranquille.
            </p>

            {/* Boutons */}
            <div className="mt-7 flex flex-wrap items-center gap-4">

              <a
                href="#download"
                className="font-body flex h-[42px] items-center gap-2 rounded-lg bg-[#31B58A] px-5 text-[14px] font-semibold text-white no-underline transition-opacity hover:opacity-90"
              >
                <Download size={15} strokeWidth={2.2} />
                <span>Télécharger l'application</span>
              </a>

              <a
                href="#partner"
                className="font-body flex h-[42px] items-center gap-2 rounded-lg bg-[#FF9900] px-5 text-[14px] font-semibold text-white no-underline transition-opacity hover:opacity-90"
              >
                <span>Devenir partenaire</span>
                <ArrowRight size={15} strokeWidth={2.2} />
              </a>

            </div>

            {/* =================================================
                STATISTIQUES
            ================================================== */}
            <div className="mt-8 inline-flex h-[64px] items-center rounded-xl border border-white/10 bg-white/10 px-2 backdrop-blur-sm">

              {/* 2.4M+ */}
              <div className="flex min-w-[110px] flex-col items-center px-3">
                <span className="font-title text-[20px] font-bold leading-[24px] text-white">
                  2.4M+
                </span>

                <span className="font-body mt-1 text-[12px] font-normal leading-[16px] text-white/60">
                  numéros vérifiés
                </span>
              </div>

              <div className="h-[38px] w-px bg-white/20" />

              {/* 98% */}
              <div className="flex min-w-[90px] flex-col items-center px-3">
                <span className="font-title text-[20px] font-bold leading-[24px] text-white">
                  98 %
                </span>

                <span className="font-body mt-1 text-[12px] font-normal leading-[16px] text-white/60">
                  Précision
                </span>
              </div>

              <div className="h-[38px] w-px bg-white/20" />

              {/* 50+ */}
              <div className="flex min-w-[80px] flex-col items-center px-3">
                <span className="font-title text-[20px] font-bold leading-[24px] text-white">
                  50+
                </span>

                <span className="font-body mt-1 text-[12px] font-normal leading-[16px] text-white/60">
                  Opérateurs
                </span>
              </div>

            </div>

          </div>
        </div>

        {/* =====================================================
            COLONNE DROITE 
        ====================================================== */}
        <div className="relative flex min-h-[438px] items-end justify-center lg:justify-start">

          <img
            src={ImgHero}
            alt="KWISMO - Sécurisation des transactions"
            className="h-auto w-full max-w-[620px] object-contain object-bottom"
          />

        </div>

      </div>
    </section>
  );
}