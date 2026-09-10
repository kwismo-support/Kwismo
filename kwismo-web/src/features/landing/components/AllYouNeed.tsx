import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

const itemIcons = [
  'solar:phone-bold-duotone',
  'solar:lock-keyhole-bold-duotone',
  'solar:shield-warning-bold-duotone',
  'solar:user-check-bold-duotone',
  'solar:chat-round-call-bold-duotone',
  'solar:users-group-two-rounded-bold-duotone',
];

export default function AllYouNeed() {
  const { t } = useTranslation('landing');

  const items = t('allYouNeed.items', { returnObjects: true }) as { title: string; desc: string }[];

  const detailedDescs = [
    "Vérifiez l'identité et le score de fiabilité de n'importe quel numéro de téléphone d'Afrique subsaharienne avant d'effectuer le moindre transfert d'argent.",
    "Bénéficiez d'une protection native sur vos transactions par code USSD (*126#, *150#) avec blocage automatique des numéros reconnus frauduleux.",
    "Accédez à une base centrale alimentée en continu par des milliers de signalements croisés d'utilisateurs et d'opérateurs télécoms.",
    "Consultez l'indicateur de risque instantané (Faible, Suspect, Frauduleux) calculé grâce à nos modèles d'analyse comportementale.",
    "Protégez vos comptes WhatsApp contre la prise de contrôle à distance et recevez des alertes préventives sur vos lignes SIM associées.",
    "Identifiez les contacts fiables et certifiés de votre répertoire grâce aux insignes de confiance de la communauté anti-fraude Kwismo."
  ];

  return (
    <section id="services" className="w-full bg-brand-darkGreen text-white px-6 py-20 lg:py-24 transition-colors font-body">
      <div className="mx-auto max-w-[90%]">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-white">
            {t('allYouNeed.title')}
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(items) && items.map((item, idx) => {
            const icon = itemIcons[idx] ?? 'solar:shield-check-bold-duotone';
            const description = detailedDescs[idx] || item.desc;

            return (
              <div
                key={idx}
                className="relative overflow-hidden group flex flex-col p-7 sm:p-8 rounded-3xl bg-white text-slate-900 shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl justify-between"
              >
                {/* Icône en Filigrane au coin supérieur droit */}
                <div className="absolute top-5 right-5 text-6xl text-brand-green/15 group-hover:scale-110 group-hover:text-brand-green/25 transition-all duration-300 pointer-events-none">
                  <Icon icon={icon} />
                </div>

                <div className="relative z-10">
                  {/* Titre sous forme de Bouton / Badge en haut à gauche */}
                  <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-brand-green/10 border border-brand-green/25 text-brand-green font-title text-sm sm:text-base font-extrabold mb-4 shadow-sm">
                    <Icon icon={icon} className="text-lg shrink-0" />
                    <span>{item.title}</span>
                  </div>

                  {/* Description enrichie de la fonctionnalité */}
                  <p className="mt-2 font-body text-sm sm:text-base text-slate-600 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
