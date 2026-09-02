import { Facebook, Instagram, Mail, Phone, Twitter } from 'lucide-react';

export default function ContactBar() {
  return (
    <div className="w-full bg-[#151D34] text-white">
      <div className="mx-auto flex h-[30px] w-full items-center justify-between px-[7%]">

        {/* Contact */}
        <div className="flex items-center gap-8">
          <a
            href="mailto:kwismosupport@gmail.com"
            className="flex items-center gap-2 font-body text-[9px] font-medium text-white no-underline"
          >
            <Mail size={10} strokeWidth={2} />
            <span>kwismosupport@gmail.com</span>
          </a>

          <a
            href="tel:+237698444388"
            className="flex items-center gap-2 font-body text-[9px] font-medium text-white no-underline"
          >
            <Phone size={10} strokeWidth={2} />
            <span>+237 698 44 43 88</span>
          </a>
        </div>

        {/* Réseaux sociaux */}
        <div className="flex items-center gap-5">
          <a href="#" aria-label="Facebook" className="text-white">
            <Facebook size={10} strokeWidth={2} />
          </a>

          <a href="#" aria-label="Twitter" className="text-white">
            <Twitter size={10} strokeWidth={2} />
          </a>

          <a href="#" aria-label="Instagram" className="text-white">
            <Instagram size={10} strokeWidth={2} />
          </a>
        </div>

      </div>
    </div>
  );
}