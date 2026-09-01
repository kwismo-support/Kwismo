import { ArrowRight, Download } from 'lucide-react';
import ImgHero from '@/assets/illustrations/Img_Hero.png';

export default function Hero() {
  return (
    <section
      id="accueil"
      className="relative min-h-[438px] overflow-hidden bg-[#151D34]"
    >
      <div className="mx-auto grid min-h-[438px] max-w-[1200px] grid-cols-1 items-center px-6 lg:grid-cols-2">

        {/* =====================================================
            COLONNE GAUCHE
        ====================================================== */}
        <div className="relative z-10 flex flex-col items-start pt-10 lg:pt-0">

          {/* Titre */}
          <h1 className="font-title max-w-[480px] text-[42px] font-bold leading-[1.18] tracking-tight text-white">
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
          <p className="mt-3 max-w-[390px] font-body text-[11px] font-medium leading-[1.45] text-white">
            KWISMO protège vos transferts Orange Money et MTN
            <br />
            MoMo contre les arnaques et les erreurs de saisie.
            <br />
            Envoyez et recevez votre argent l'esprit tranquille.
          </p>

          {/* Boutons */}
          <div className="mt-7 flex items-center gap-4">

            <a
              href="#download"
              className="flex h-[36px] items-center gap-2 rounded-lg bg-[#31B58A] px-4 font-body text-[10px] font-semibold text-white no-underline transition hover:opacity-90"
            >
              <Download size={13} />
              Télécharger l'application
            </a>

            <a
              href="#partner"
              className="flex h-[36px] items-center gap-2 rounded-lg bg-[#FF9900] px-4 font-body text-[10px] font-semibold text-white no-underline transition hover:bg-[#e88a00]"
            >
              Devenir partenaire
              <ArrowRight size={14} />
            </a>

          </div>

          {/* ===================================================
              STATISTIQUES
          ==================================================== */}
          <div className="mt-7 flex h-[64px] items-center rounded-xl border border-white/10 bg-white/10 px-3 backdrop-blur-sm">

            {/* Stat 1 */}
            <div className="flex flex-col px-3">
              <span className="font-title text-[20px] font-bold leading-none text-white">
                2.4M+
              </span>

              <span className="mt-1 font-body text-[8px] text-white/60">
                numéros vérifiés
              </span>
            </div>

            <div className="h-9 w-px bg-white/20" />

            {/* Stat 2 */}
            <div className="flex flex-col px-3">
              <span className="font-title text-[20px] font-bold leading-none text-white">
                98 %
              </span>

              <span className="mt-1 font-body text-[8px] text-white/60">
                Précision
              </span>
            </div>

            <div className="h-9 w-px bg-white/20" />

            {/* Stat 3 */}
            <div className="flex flex-col px-3">
              <span className="font-title text-[20px] font-bold leading-none text-white">
                50+
              </span>

              <span className="mt-1 font-body text-[8px] text-white/60">
                Opérateurs
              </span>
            </div>

          </div>

        </div>

        {/* =====================================================
            COLONNE DROITE — IMAGE HERO
        ====================================================== */}
        <div className="relative flex h-full items-end justify-center lg:justify-end">

          <img
            src={ImgHero}
            alt="Solution KWISMO"
            className="relative z-10 w-full max-w-[560px] object-contain object-bottom"
          />

        </div>

      </div>
    </section>
  );
}