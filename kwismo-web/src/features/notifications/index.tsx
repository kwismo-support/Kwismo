import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { PageHeader } from '@/shared/components';
import { toast } from '@/shared/store/toastStore';

interface NotificationItem {
  id: number;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    type: 'danger',
    title: 'Alerte Fraude Critique sur +237 690 123 456',
    desc: 'Ce numéro a été signalé 5 fois en moins de 10 minutes sur le réseau MTN Cameroun. Une analyse d’urgence a été déclenchée.',
    time: 'Il y a 12 min',
    read: false,
  },
  {
    id: 2,
    type: 'warning',
    title: 'Chevauchement de préfixes détecté',
    desc: 'Un conflit potentiel a été identifié sur la plage 655-659 entre Orange Cameroun et MTN Cameroun.',
    time: 'Il y a 1 h',
    read: false,
  },
  {
    id: 3,
    type: 'info',
    title: 'Nouveau partenaire inscrit',
    desc: 'La société Wave Sénégal a finalisé son intégration API et demande la validation de ses accès.',
    time: 'Il y a 3 h',
    read: true,
  },
  {
    id: 4,
    type: 'success',
    title: 'Rapport mensuel généré avec succès',
    desc: 'Le rapport d’activité globale du mois écoulé est prêt au téléchargement au format PDF/CSV.',
    time: 'Hier, 18:30',
    read: true,
  },
  {
    id: 5,
    type: 'info',
    title: 'Mise à jour des codes USSD Orange CI',
    desc: '3 nouveaux codes USSD de consultation de solde et transfert ont été configurés.',
    time: '02/09/2026',
    read: true,
  },
];

export default function NotificationsPage() {
  const { t } = useTranslation('admin');
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<'Toutes' | 'Non lues'>('Toutes');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    filter === 'Non lues' ? notifications.filter((n) => !n.read) : notifications;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.info('Toutes les notifications ont été marquées comme lues.');
  };

  const handleToggleRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getTypeStyle = (type: NotificationItem['type']) => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 dark:bg-rose-500/20',
          iconColor: 'text-rose-600 dark:text-rose-400',
          icon: 'solar:danger-bold-duotone',
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/20',
          iconColor: 'text-amber-600 dark:text-amber-400',
          icon: 'solar:shield-warning-bold-duotone',
        };
      case 'success':
        return {
          bg: 'bg-brand-green/10 border-brand-green/30 dark:bg-brand-green/20',
          iconColor: 'text-brand-green dark:text-emerald-400',
          icon: 'solar:check-circle-bold-duotone',
        };
      case 'info':
      default:
        return {
          bg: 'bg-brand-blue/10 border-brand-blue/30 dark:bg-brand-blue/20',
          iconColor: 'text-brand-blue dark:text-blue-400',
          icon: 'solar:info-circle-bold-duotone',
        };
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-5xl">
      <PageHeader
        title={t('notifications.title', 'Center de Notifications')}
        subtitle={`${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${
          unreadCount > 1 ? 's' : ''
        } sur ${notifications.length}`}
        showBreadcrumb={true}
        actions={
          unreadCount > 0
            ? [
                {
                  label: 'Tout marquer lu',
                  icon: 'solar:check-read-linear',
                  variant: 'outline',
                  onClick: handleMarkAllRead,
                },
              ]
            : undefined
        }
      />

      {/* Filter Segmented Control */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl w-fit">
        <button
          onClick={() => setFilter('Toutes')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            filter === 'Toutes'
              ? 'bg-brand-navy text-white dark:bg-brand-orange dark:text-brand-navy shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Toutes ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('Non lues')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            filter === 'Non lues'
              ? 'bg-brand-navy text-white dark:bg-brand-orange dark:text-brand-navy shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Non lues ({unreadCount})
        </button>
      </div>

      {/* List of Notifications */}
      {filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#161E33] rounded-2xl border border-slate-200 dark:border-white/10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-3">
            <Icon icon="solar:bell-off-bold-duotone" className="text-2xl" />
          </div>
          <h3 className="font-title text-base font-bold text-slate-800 dark:text-slate-200">
            Aucune notification
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {filter === 'Non lues'
              ? 'Toutes vos notifications ont été lues.'
              : 'Vous n’avez aucune notification enregistrée pour le moment.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredNotifications.map((n) => {
            const style = getTypeStyle(n.type);
            return (
              <div
                key={n.id}
                onClick={() => handleToggleRead(n.id)}
                className={`group flex items-start gap-4 p-5 rounded-2xl border transition cursor-pointer ${
                  n.read
                    ? 'bg-white dark:bg-[#161E33] border-slate-200 dark:border-white/10 opacity-80 hover:opacity-100'
                    : `${style.bg} shadow-sm`
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                  <Icon icon={style.icon} className={`text-xl ${style.iconColor}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-orange shrink-0 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {n.desc}
                  </p>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 block font-mono">
                    {n.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
