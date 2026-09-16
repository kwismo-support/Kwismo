import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { useNotifications } from './hooks/useNotifications';
import NotificationsList from './components/NotificationsList';

export default function NotificationsPage() {
  const { t } = useTranslation(['admin', 'common']);
  const { hasPermission } = usePermissions();
  const canRead = hasPermission('analytics:read') || hasPermission('users:read');

  const {
    notifications,
    unreadCount,
    loading,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  if (!canRead) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center font-body min-h-[400px]">
        <h2 className="font-title text-xl font-bold text-slate-900 dark:text-white">
          {t('common:accessDeniedTitle')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          {t('common:accessDeniedDesc')}
        </p>
      </div>
    );
  }

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
