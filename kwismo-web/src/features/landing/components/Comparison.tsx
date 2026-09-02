import { Check } from 'lucide-react';

export default function Comparison() {
  const benefits = [
    'Identification des appels et numéros à risque en temps réel',
    'Vérification du bénéficiaire avant chaque transfert USSD',
    'Alertes instantanées sur les tentatives de vishing et SIM swap',
    'Base communautaire alimentée par les signalements des utilisateurs',
    'Couverture multi-opérateurs sur les principaux marchés africains',
    'API sécurisée pour les institutions financières partenaires',
  ];

  return (
    <section
      id="comparison"
      className="w-full bg-white px-6 pb-[70px] pt-[20px]"
    >
      <div className="mx-auto max-w-[1200px]">

        {/* Titre */}
        <div className="text-center">
          <h2 className="font-title text-[40px] font-bold leading-[56px] text-[#151D34]">
            Ce que KWISMO vous apporte
          </h2>

          <p className="font-body mx-auto mt-1 max-w-[560px] text-[14px] font-medium leading-[20px] text-[#7A8496]">
            Une protection complète, pensée pour le quotidien des utilisateurs Mobile Money.
          </p>
        </div>

        {/* Avantages */}
        <div className="mt-8 grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <div
              key={benefit}
              className="flex min-h-[48px] items-center rounded-[9px] border border-[#AEB4BE] bg-white px-3"
            >
              {/* Icône */}
              <div className="mr-3 flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full bg-[#E7F7F1]">
                <Check
                  size={9}
                  strokeWidth={3}
                  className="text-[#31B58A]"
                />
              </div>

              {/* Texte */}
              <span className="font-body text-[12px] font-normal leading-[16px] text-[#394052]">
                {benefit}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}