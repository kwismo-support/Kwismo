import { ArrowRight } from 'lucide-react';
import Logo from '@/assets/logo/Logo_NavBar.png';

export default function Navbar() {
  return (
    <nav className="w-full bg-[#31B58A]">
      <div className="flex h-[45px] w-full items-center px-[7%]">

        {/* Logo */}
        <a
          href="/"
          className="flex shrink-0 items-center no-underline"
        >
          <img
            src={Logo}
            alt="KWISMO"
            className="h-[22px] w-auto object-contain"
          />
        </a>

        {/* Navigation */}
        <div className="mx-auto hidden items-center gap-[32px] lg:flex">

          <a
            href="#accueil"
            className="font-body text-[9px] font-semibold text-white no-underline"
          >
            Accueil
          </a>

          <a
            href="#about"
            className="font-body text-[9px] font-semibold text-white no-underline"
          >
            A propos de nous
          </a>

          <a
            href="#security"
            className="font-body text-[9px] font-semibold text-white no-underline"
          >
            Sécurité & Protection
          </a>

          <a
            href="#features"
            className="font-body text-[9px] font-semibold text-white no-underline"
          >
            Fonctionnalités
          </a>

          <a
            href="#contact"
            className="font-body text-[9px] font-semibold text-white no-underline"
          >
            Contact
          </a>

        </div>

        {/* Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-3">

          <a
            href="/auth"
            className="flex h-[32px] items-center rounded-full bg-[#151D34] px-5 font-body text-[9px] font-semibold text-white no-underline transition-opacity hover:opacity-90"
          >
            Partenaire
          </a>

          <a
            href="/auth"
            className="flex h-[32px] items-center gap-2 rounded-full bg-[#FF9900] px-5 font-body text-[9px] font-semibold text-white no-underline transition-opacity hover:opacity-90"
          >
            <span>Se connecter</span>
            <ArrowRight size={11} strokeWidth={2} />
          </a>

        </div>

      </div>
    </nav>
  );
}