import { Facebook, Instagram, Mail, Phone, Twitter } from 'lucide-react';

export default function ContactBar() {
  return (
    <div className="w-full bg-[#151D34] text-white">
      <div className="mx-auto flex h-[30px] max-w-[1200px] items-center justify-between px-6 text-[9px] font-medium">
        
        {/* Informations de contact */}
        <div className="flex items-center gap-8">
          
          <a
            href="mailto:kwismosupport@gmail.com"
            className="flex items-center gap-2 text-white/80 transition hover:text-white"
          >
            <Mail size={10} strokeWidth={2.5} />
            <span>kwismosupport@gmail.com</span>
          </a>

          <a
            href="tel:+237698444388"
            className="flex items-center gap-2 text-white/80 transition hover:text-white"
          >
            <Phone size={10} strokeWidth={2.5} />
            <span>+237 698 44 43 88</span>
          </a>

        </div>

        {/* Réseaux sociaux */}
        <div className="flex items-center gap-4 text-white/80">
          <a
            href="#"
            aria-label="Facebook"
            className="transition hover:text-white"
          >
            <Facebook size={10} />
          </a>

          <a
            href="#"
            aria-label="Twitter"
            className="transition hover:text-white"
          >
            <Twitter size={10} />
          </a>

          <a
            href="#"
            aria-label="Instagram"
            className="transition hover:text-white"
          >
            <Instagram size={10} />
          </a>
        </div>

      </div>
    </div>
  );
}