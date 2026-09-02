import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { TabBar } from '../../src/shared/components/TabBar';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

const CONTACTS_DATA = [
  { id: '1', name: 'Alain Dupont', phone: '+237 6 98 44 43 88', status: 'Protégé', trusted: true },
  { id: '2', name: 'Carine Mbida', phone: '+237 6 77 12 34 56', status: 'Protégé', trusted: true },
  { id: '3', name: 'Boris Talla', phone: '+237 6 55 98 76 54', status: 'Non vérifié', trusted: false },
  { id: '4', name: 'Diane Ewane', phone: '+237 6 99 23 45 67', status: 'Protégé', trusted: true },
  { id: '5', name: 'Eric Kamga', phone: '+237 6 70 88 99 00', status: 'Protégé', trusted: true },
];

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
  const [search, setSearch] = useState('');

  const filteredContacts = CONTACTS_DATA.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerCard, { paddingTop: Math.max(insets.top + 10, 20) }]}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{t('common.management')}</Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.addBtn}>
              <Icon name="solar:user-plus-linear" color={colors.white} size={22} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Icon name="solar:magnifer-linear" color={colors.white} size={20} style={{ opacity: 0.9, marginRight: 10 }} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('common.search')}
              placeholderTextColor="rgba(255, 255, 255, 0.75)"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <View style={styles.listContainer}>
          {filteredContacts.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              style={[
                styles.contactRow,
                {
                  backgroundColor: themeColors.cardBg,
                  borderColor: themeColors.inputBorder,
                  borderWidth: isDark ? 1 : 0,
                },
              ]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0]}</Text>
              </View>

              <View style={styles.details}>
                <Text style={[styles.nameText, { color: themeColors.textPrimary }]}>
                  {item.name}
                </Text>
                <View style={styles.phoneRow}>
                  <Icon name="solar:phone-linear" color={themeColors.textSecondary} size={12} style={{ marginRight: 4 }} />
                  <Text style={[styles.phoneText, { color: themeColors.textSecondary }]}>
                    {item.phone}
                  </Text>
                </View>
              </View>

              {item.trusted && (
                <View style={styles.badge}>
                  <Icon name="solar:shield-check-bold" color={colors.green} size={14} style={{ marginRight: 4 }} />
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              )}

              <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={18} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TabBar activeTab="contacts" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: colors.green,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: fonts.h6,
    fontSize: scaleFont(22),
    fontWeight: '700',
    color: colors.white,
  },
  addBtn: {
    padding: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.white,
    height: '100%',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.white,
  },
  details: {
    flex: 1,
  },
  nameText: {
    fontFamily: fonts.bold,
    fontSize: scaleFont(15),
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  phoneText: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.green,
  },
});

