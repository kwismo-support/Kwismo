import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components';
import { useNotifications } from './hooks/useNotifications';
import NotificationsList from './components/NotificationsList';

export default function NotificationsPage() {
  const { t } = useTranslation(['admin', 'common']);

  const {
    notifications,
    unreadCount,
    loading,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  return (
    <div className="flex flex-col gap-6 p-6 font-body max-w-5xl mx-auto">
      <PageHeader
        title={t('admin:notifications.title')}
        subtitle={t('admin:notifications.subtitle')}
        showBreadcrumb={true}
      />

      <NotificationsList
        notifications={notifications}
        unreadCount={unreadCount}
        filter={filter}
        isLoading={loading}
        onFilterChange={setFilter}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </div>
  );
}
