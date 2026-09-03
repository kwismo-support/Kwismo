export default function Pricing() {
  const plans = [
    {
      type: 'Pay-as-you-go',
      price: '0,001 $',
      suffix: '/ appel API',
      description: 'Analysez vos numéros en temps réel.',
      features: [
        'Analyse numéro temps réel',
        'Score de risque détaillé',
        'Détection communautaire',
        'Documentation Swagger',
        'Support email',
      ],
      button: 'Obtenir une clé API',
      featured: false,
    },
    {
      type: 'Volume',
      price: 'Sur devis',
      suffix: '',
      description: 'Pour les gros volumes.',
      features: [
        'Tout Pay-as-you-go',
        'Quotas élevés garantis',
        'SLA contractuel',
        'Support prioritaire 24/7',
        'Webhooks fraudés temps réel',
      ],
      button: "Contacter l'équipe",
      featured: true,
    },
    {
      type: 'Entreprise',
      price: 'Sur mesure',
      suffix: '',
      description: 'Pour les besoins personnalisés.',
      features: [
        'Tout Volume',
        'Tableaux de bord dédiés',
        'Rapports stratégiques',
        'Intégration accompagnée',
        'Contrat SLA personnalisé',
      ],
      button: "Contacter l'équipe",
      featured: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="w-full bg-white px-6 py-[58px]"
    >
      <div className="mx-auto max-w-[1200px]">

        {/* Titre */}
        <div className="text-center">
          <h2 className="font-title text-[28px] font-bold leading-[40px] text-[#151D34]">
            Facturation transparente à l'usage
          </h2>
        </div>

        {/* Cards */}
        <div className="mx-auto mt-5 grid max-w-[1060px] grid-cols-1 gap-3 md:grid-cols-3">

          {plans.map((plan) => (
            <div
              key={plan.type}
              className={`flex min-h-[168px] flex-col rounded-[7px] border p-3 ${
                plan.featured
                  ? 'border-[#151D34] bg-[#151D34] text-white'
                  : 'border-[#AEB4BE] bg-white text-[#151D34]'
              }`}
            >

              {/* Type */}
              <span
                className={`font-body text-[9px] font-semibold ${
                  plan.featured
                    ? 'text-[#31B58A]'
                    : 'text-[#31B58A]'
                }`}
              >
                {plan.type}
              </span>

              {/* Prix */}
              <div className="mt-1">
                <span className="font-title text-[20px] font-bold leading-[24px]">
                  {plan.price}
                </span>

                {plan.suffix && (
                  <span
                    className={`font-body ml-1 text-[8px] ${
                      plan.featured
                        ? 'text-white/60'
                        : 'text-[#7A8496]'
                    }`}
                  >
                    {plan.suffix}
                  </span>
                )}
              </div>

              {/* Description */}
              <p
                className={`font-body mt-0.5 text-[8px] leading-[12px] ${
                  plan.featured
                    ? 'text-white/70'
                    : 'text-[#7A8496]'
                }`}
              >
                {plan.description}
              </p>

              {/* Features */}
              <div className="mt-2 flex flex-col gap-1">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-1.5"
                  >
                    <span
                      className={`mt-[3px] text-[8px] ${
                        plan.featured
                          ? 'text-white/70'
                          : 'text-[#667085]'
                      }`}
                    >
                      ✓
                    </span>

                    <span
                      className={`font-body text-[8px] leading-[11px] ${
                        plan.featured
                          ? 'text-white/75'
                          : 'text-[#667085]'
                      }`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bouton */}
              <button
                type="button"
                className="font-body mt-auto flex h-[28px] w-full items-center justify-center rounded-[6px] bg-[#31B58A] text-[8px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                {plan.button}
              </button>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}