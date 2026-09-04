import { Apple, Facebook, Instagram, Play, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#151D34] px-6 py-[38px] text-white">
      <div className="mx-auto max-w-[1200px]">

        {/* Contenu principal */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">

          {/* Présentation */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white">
                <span className="font-title text-[9px] font-bold text-[#31B58A]">
                  K
                </span>
              </div>

              <span className="font-title text-[16px] font-bold">
                KWISMO
              </span>
            </div>

            <p className="font-body mt-3 max-w-[190px] text-[10px] font-normal leading-[16px] text-white/70">
              Protection anti-fraude Mobile Money pour les marchés africains.
            </p>

            {/* Stores */}
            <div className="mt-3 flex gap-2">
              <a
                href="#"
                aria-label="App Store"
                className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-white/50"
              >
                <Apple size={13} />
              </a>

              <a
                href="#"
                aria-label="Google Play"
                className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border border-white/50"
              >
                <Play size={11} />
              </a>
            </div>
          </div>

          {/* Téléchargement */}
          <div>
            <h3 className="font-body text-[11px] font-semibold">
              Téléchargement
            </h3>

            <div className="mt-3 flex flex-col gap-2">
              <a href="#" className="font-body text-[10px] text-white/70">
                Fonctionnalités
              </a>

              <a href="#" className="font-body text-[10px] text-white/70">
                Tarifs
              </a>

              <a href="#" className="font-body text-[10px] text-white/70">
                API
              </a>
            </div>
          </div>

          {/* À propos */}
          <div>
            <h3 className="font-body text-[11px] font-semibold">
              À propos
            </h3>

            <div className="mt-3 flex flex-col gap-2">
              <a href="#" className="font-body text-[10px] text-white/70">
                À propos
              </a>

              <a href="#" className="font-body text-[10px] text-white/70">
                Partenaires
              </a>

              <a href="#" className="font-body text-[10px] text-white/70">
                Actualités
              </a>

              <a href="#" className="font-body text-[10px] text-white/70">
                Contact
              </a>
            </div>
          </div>

          {/* Légal */}
          <div>
            <h3 className="font-body text-[11px] font-semibold">
              Légal
            </h3>

            <div className="mt-3 flex flex-col gap-2">
              <a href="#" className="font-body text-[10px] text-white/70">
                Confidentialité
              </a>

              <a href="#" className="font-body text-[10px] text-white/70">
                CGU
              </a>

              <a href="#" className="font-body text-[10px] text-white/70">
                Cookies
              </a>

              <a href="#" className="font-body text-[10px] text-white/70">
                Sécurité
              </a>
            </div>
          </div>

        </div>

        {/* Bas du footer */}
        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center">

          <p className="font-body text-[9px] text-white/60">
            © 2026 KWISMO. Tous droits réservés.
          </p>

          <div className="flex items-center gap-2">

            <div className="flex h-[22px] items-center gap-1 rounded-full border border-white/30 px-2">
              <Facebook size={9} />
              <span className="font-body text-[8px]">
                FR
              </span>
            </div>

            <button
              type="button"
              className="font-body h-[22px] rounded-full bg-[#31B58A] px-3 text-[8px] font-semibold text-white"
            >
              Se connecter
            </button>

          </div>

        </div>

      </div>
    </footer>
  );
}