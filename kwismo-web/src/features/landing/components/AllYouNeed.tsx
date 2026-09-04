import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';

export default function AllYouNeed() {
  const { t } = useTranslation('landing');

  const defaultItems = [
    {
      title: 'Vérification de numéro',
      desc: 'Analyse instantanée pour détecter fraude et risque avant un transfert.',
      icon: 'solar:phone-bold-duotone',
    },
    {
      title: 'Transfert protégé USSD',
      desc: 'Couche de sécurité sur chaque transfert Mobile Money via code USSD.',
      icon: 'solar:lock-keyhole-bold-duotone',
    },
    {
      title: 'Détection d\'appel suspect',
      desc: 'Identification des appels entrants à risque : faux service client, phishing.',
      icon: 'solar:shield-warning-bold-duotone',
    },
    {
      title: 'Contacts à insigne',
      desc: 'Vos proches obtiennent un badge de confiance vérifié par la communauté.',
      icon: 'solar:user-check-bold-duotone',
    },
    {
      title: 'Alerte WhatsApp',
      desc: 'Notification immédiate si votre compte WhatsApp subit une tentative de piratage.',
      icon: 'solar:chat-round-call-bold-duotone',
    },
    {
      title: 'Signalement communautaire',
      desc: 'Chaque signalement renforce la base de données collective contre la fraude.',
      icon: 'solar:users-group-two-rounded-bold-duotone',
    },
  ];

  const items: { title: string; desc: string }[] =
    (t('allYouNeed.items', { returnObjects: true }) as unknown as { title: string; desc: string }[]) || defaultItems;

  return (
    <section className="w-full bg-[#124E37] text-white px-6 py-16 transition-colors">
      <div className="mx-auto max-w-[1200px]">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-title text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            {t('allYouNeed.title', 'Tout ce dont vous avez besoin')}
          </h2>
        </div>

        {/* 6 White Feature Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, idx) => {
            const icon = defaultItems[idx]?.icon || 'solar:shield-check-bold';

            return (
              <div
                key={idx}
                className="flex flex-col p-6 rounded-2xl bg-white text-slate-900 shadow-xl border border-white/20 transition hover:-translate-y-1"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#32B07F]/10 text-[#32B07F] mb-3">
                  <Icon icon={icon} className="text-xl" />
                </div>

                <h3 className="font-title text-base font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-2 font-body text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
