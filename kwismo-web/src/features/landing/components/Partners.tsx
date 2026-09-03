import { ArrowRight, Check } from 'lucide-react';
import ImgOperateur from '@/assets/illustrations/Img_Operateur.jpeg';

export default function Partners() {
  const benefits = [
    'Intelligence collective multi-opérateurs',
    'API REST documentée, intégration rapide',
    'Tableaux de bord et rapports dédiés',
  ];

  return (
    <section
      id="partner"
      className="w-full bg-white px-6 pb-[65px] pt-[25px]"
    >
      <div className="mx-auto grid max-w-[1060px] grid-cols-1 items-center gap-8 md:grid-cols-2">

        {/* Image */}
        <div className="relative overflow-hidden rounded-[8px]">
          <img
            src={ImgOperateur}
            alt="Rejoignez l'écosystème KWISMO"
            className="h-auto w-full object-cover"
          />

          {/* Texte sur l'image */}
          <div className="absolute bottom-3 left-3">
            <p className="font-body text-[11px] font-semibold text-white">
              Rejoignez l'écosystème
            </p>

            <p className="font-body text-[8px] text-white/80">
              Contactez-nous
            </p>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex flex-col items-start">

          <h2 className="font-title max-w-[390px] text-[28px] font-bold leading-[32px] text-[#151D34]">
            Pour les opérateurs et
            <br />
            institutions
          </h2>

          <p className="font-body mt-3 max-w-[390px] text-[12px] font-normal leading-[16px] text-[#7A8496]">
            Intégrez l'intelligence collective KWISMO et détectez la fraude à
            l'échelle de votre réseau.
          </p>

          {/* Liste */}
          <div className="mt-4 flex flex-col gap-2">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2"
              >
                <span className="flex h-[13px] w-[13px] shrink-0 items-center justify-center rounded-full bg-[#E7F7F1]">
                  <Check
                    size={8}
                    strokeWidth={3}
                    className="text-[#31B58A]"
                  />
                </span>

                <span className="font-body text-[10px] font-medium leading-[14px] text-[#394052]">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          {/* Bouton */}
          <a
            href="#contact"
            className="font-body mt-4 flex h-[30px] items-center gap-2 rounded-[7px] bg-[#31B58A] px-4 text-[9px] font-semibold text-white no-underline transition-opacity hover:opacity-90"
          >
            Devenir partenaire
            <ArrowRight size={11} />
          </a>

        </div>

      </div>
    </section>
  );
}