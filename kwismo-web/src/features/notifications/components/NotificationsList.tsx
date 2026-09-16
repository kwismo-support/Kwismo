import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/shared/ui/button';
import type { NotificationItem } from '../services/notifications.api';

interface NotificationsListProps {
  notifications: NotificationItem[];
  unreadCount: number;
  filter: 'all' | 'unread';
  isLoading?: boolean;
  onFilterChange: (filter: 'all' | 'unread') => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationsList({
  notifications,
  unreadCount,
  filter,
  isLoading = false,
  onFilterChange,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsListProps) {
  const { t } = useTranslation(['admin', 'common']);

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm animate-pulse space-y-4 font-body">
        <div className="h-6 bg-slate-200 dark:bg-white/10 rounded w-48 mb-2" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161E33] shadow-sm space-y-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Icon icon="solar:bell-bold-duotone" className="text-brand-orange text-xl" />
          <h3 className="font-title text-base font-bold text-slate-900 dark:text-white">
            {t('admin:notifications.title')} ({notifications.length})
          </h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
              {unreadCount} {t('admin:notifications.unreadCountLabel')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-brand-navy text-white dark:bg-brand-orange dark:text-brand-navy shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('admin:notifications.filterAll')}
            </button>
            <button
              onClick={() => onFilterChange('unread')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filter === 'unread'
                  ? 'bg-brand-navy text-white dark:bg-brand-orange dark:text-brand-navy shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('admin:notifications.filterUnread')}
            </button>
          </div>

          {unreadCount > 0 && (
            <Button variant="outline" size="xs" onClick={onMarkAllAsRead}>
              {t('admin:notifications.markAllRead')}
            </Button>
          )}
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Icon icon="solar:bell-off-bold-duotone" className="text-4xl mx-auto mb-2 opacity-50" />
            <p>{t('admin:notifications.empty')}</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`py-4 flex items-start justify-between gap-4 transition ${
                !item.lu ? 'bg-brand-orange/5 dark:bg-brand-orange/10 p-3 rounded-2xl' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl text-lg shrink-0 ${
                    !item.lu
                      ? 'bg-brand-orange text-white'
                      : 'bg-slate-100 dark:bg-white/10 text-slate-400'
                  }`}
                >
                  <Icon icon="solar:bell-bing-bold-duotone" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                    {item.texte}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    {new Date(item.date).toLocaleString()}
                  </p>
                </div>
              </div>

              {!item.lu && (
                <Button
                  size="xs"
                  variant="ghost"
                  className="text-brand-orange hover:bg-brand-orange/10 shrink-0"
                  onClick={() => onMarkAsRead(item.id)}
                >
                  {t('admin:notifications.markRead')}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
