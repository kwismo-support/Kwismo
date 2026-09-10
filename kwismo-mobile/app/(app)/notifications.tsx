import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { toast } from '../../src/shared/store/toastStore';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

import { MOCK_NOTIFICATIONS, NotificationItem } from '../../src/shared/mock/notificationsMock';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'security'>('all');
  const [preferencesModalVisible, setPreferencesModalVisible] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const [pushEnabled, setPushEnabled] = useState(true);
  const [whatsappAlertsEnabled, setWhatsappAlertsEnabled] = useState(true);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(true);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'unread') return notifications.filter((n) => !n.read);
    if (activeTab === 'security') return notifications.filter((n) => n.type === 'security');
    return notifications;
  }, [notifications, activeTab]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success(t('notifications.markedAllRead'));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'security':
        return { name: 'solar:danger-triangle-bold', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)' };
      case 'transfer':
        return { name: 'solar:card-send-bold', color: colors.green, bg: 'rgba(43, 182, 115, 0.12)' };
      case 'sim':
        return { name: 'solar:sim-cards-bold', color: colors.orange, bg: 'rgba(245, 158, 11, 0.12)' };
      default:
        return { name: 'solar:bell-bold', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      <HeaderBar
        title={t('common.notifications')}
        showBack={true}
      />

      <View style={[styles.topActionBar, { borderBottomColor: themeColors.divider }]}>
        <View style={styles.tabsRow}>
          {[
            { id: 'all', label: t('notifications.tabAll') },
            { id: 'unread', label: `${t('notifications.tabUnread')} (${unreadCount})` },
            { id: 'security', label: t('notifications.tabSecurity') },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isSelected
                      ? colors.green
                      : isDark
                      ? 'rgba(255,255,255,0.06)'
                      : '#F1F5F9',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    { color: isSelected ? colors.white : themeColors.textSecondary },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Boutons Tout marquer lu + Réglages */}
        <View style={styles.actionButtonsRow}>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.markReadBtn}>
              <Icon name="solar:check-read-linear" size={18} color={colors.green} />
              <Text style={styles.markReadBtnText}>
                {t('notifications.markAll', 'Tout lire')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setPreferencesModalVisible(true)}
            style={[styles.settingsBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' }]}
          >
            <Icon name="solar:settings-bold" size={18} color={themeColors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTE DES NOTIFICATIONS */}
      <ScrollView
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="solar:bell-off-linear" size={48} color="#CBD5E1" />
            <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
              {t('notifications.emptyTitle', 'Aucune notification')}
            </Text>
            <Text style={[styles.emptySub, { color: themeColors.textSecondary }]}>
              {t('notifications.emptySub', 'Vous êtes à jour ! Aucune alerte en attente.')}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((item) => {
            const iconMeta = getIconForType(item.type);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                onPress={() => {
                  handleToggleRead(item.id);
                  if (item.actionUrl) router.push(item.actionUrl as any);
                }}
                style={[
                  styles.notificationCard,
                  {
                    backgroundColor: item.read
                      ? themeColors.cardBg
                      : isDark
                      ? '#1E293B'
                      : '#F8FAFC',
                    borderColor: item.read ? themeColors.inputBorder : colors.green,
                  },
                ]}
              >
                {!item.read && <View style={styles.unreadDot} />}

                <View style={[styles.iconCircle, { backgroundColor: iconMeta.bg }]}>
                  <Icon name={iconMeta.name} size={22} color={iconMeta.color} />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.timestampText, { color: themeColors.textSecondary }]}>
                      {item.timestamp}
                    </Text>
                  </View>
                  <Text style={[styles.cardMessage, { color: themeColors.textSecondary }]}>
                    {item.message}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* MODAL CANAUX DE NOTIFICATION */}
      <Modal visible={preferencesModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderTitle, { color: themeColors.textPrimary }]}>
                {t('notifications.preferencesTitle', 'Canaux de notification')}
              </Text>
              <TouchableOpacity onPress={() => setPreferencesModalVisible(false)}>
                <Icon name="solar:close-circle-bold" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.prefRow}>
              <Text style={[styles.prefLabel, { color: themeColors.textPrimary }]}>
                Notifications Push
              </Text>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: '#CBD5E1', true: colors.green }}
              />
            </View>

            <View style={styles.prefRow}>
              <Text style={[styles.prefLabel, { color: themeColors.textPrimary }]}>
                Alertes de sécurité SMS
              </Text>
              <Switch
                value={smsAlertsEnabled}
                onValueChange={setSmsAlertsEnabled}
                trackColor={{ false: '#CBD5E1', true: colors.green }}
              />
            </View>

            <View style={styles.prefRow}>
              <Text style={[styles.prefLabel, { color: themeColors.textPrimary }]}>
                Alertes WhatsApp
              </Text>
              <Switch
                value={whatsappAlertsEnabled}
                onValueChange={setWhatsappAlertsEnabled}
                trackColor={{ false: '#CBD5E1', true: colors.green }}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                setPreferencesModalVisible(false);
                toast.success('Préférences de notification mises à jour !');
              }}
              style={[styles.saveBtn, { backgroundColor: colors.green, marginTop: 16 }]}
            >
              <Text style={styles.saveBtnText}>{t('common.save', 'Enregistrer')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topActionBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabChipText: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(12),
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  markReadBtnText: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(12),
    color: colors.green,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.green,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  cardTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
    flex: 1,
  },
  timestampText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(11),
  },
  cardMessage: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 4,
    lineHeight: 18,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    fontWeight: '800',
    marginTop: 12,
  },
  emptySub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    marginTop: 4,
    textAlign: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalHeaderTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    fontWeight: '800',
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  prefLabel: {
    fontFamily: fonts.medium,
    fontSize: scaleFont(14),
  },
  saveBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    color: colors.white,
  },
});
