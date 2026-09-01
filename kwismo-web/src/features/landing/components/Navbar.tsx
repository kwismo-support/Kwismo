import { ArrowRight } from 'lucide-react';
import Logo from '@/assets/logo/Logo_NavBar.png';

export default function Navbar() {
  return (
    <nav className="w-full bg-[#31B58A]">
      <div className="mx-auto flex h-[45px] max-w-[1200px] items-center justify-between px-6">

        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-1.5 text-white no-underline"
        >
          <img
            src={Logo}
            alt="KWISMO Logo"
            className="h-8"
          />
        </a>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">

          <a
            href="#accueil"
            className="text-[9px] font-medium text-white no-underline transition hover:opacity-80"
          >
            Accueil
          </a>

          <a
            href="#about"
            className="text-[9px] font-medium text-white no-underline transition hover:opacity-80"
          >
            A propos de nous
          </a>

          <a
            href="#security"
            className="text-[9px] font-medium text-white no-underline transition hover:opacity-80"
          >
            Sécurité & Protection
          </a>

          <a
            href="#features"
            className="text-[9px] font-medium text-white no-underline transition hover:opacity-80"
          >
            Fonctionnalités
          </a>

          <a
            href="#contact"
            className="text-[9px] font-medium text-white no-underline transition hover:opacity-80"
          >
            Contact
          </a>

        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">

          <a
            href="/auth"
            className="rounded-full bg-[#151D34] px-5 py-2 text-[9px] font-semibold text-white no-underline transition hover:opacity-90"
          >
            Partenaire
          </a>

          <a
            href="/auth"
            className="flex items-center gap-2 rounded-full bg-[#FF9900] px-5 py-2 text-[9px] font-semibold text-white no-underline transition hover:bg-[#e88a00]"
          >
            Se connecter
            <ArrowRight size={11} />
          </a>

        </div>

      </div>
    </nav>
  );
}