// Page d'accueil conforme exactement au design de la maquette (Image 3)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { TabBar } from '../../src/shared/components/TabBar';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { useAuthStore } from '../../src/shared/store/authStore';
import { useDashboard } from '../../src/features/dashboard/hooks/useDashboard';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();
  const { user } = useAuthStore();
  const { summary } = useDashboard();

  const userName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.email
    ? user.email.split('@')[0]
    : 'LOREM Ipsum';

  const activities = [
    { id: '1', phone: '+237 6 98 44 43 88', type: 'Verification de numero', status: 'Faible', badgeType: 'blue', date: 'hier, 21:47' },
    { id: '2', phone: '+237 6 98 44 43 88', type: 'Verification de numero', status: 'Détectée', badgeType: 'red', date: 'hier, 21:47' },
    { id: '3', phone: '+237 6 98 44 43 88', type: 'Verification de numero', status: 'Protégé', badgeType: 'green', date: 'hier, 21:47' },
    { id: '4', phone: '+237 6 98 44 43 88', type: 'Verification de numero', status: 'En cour', badgeType: 'yellow', date: 'hier, 21:47' },
    { id: '5', phone: '+237 6 98 44 43 88', type: 'Verification de numero', status: 'Protégé', badgeType: 'green', date: 'hier, 21:47' },
    { id: '6', phone: '+237 6 98 44 43 88', type: 'Verification de numero', status: 'Protégé', badgeType: 'green', date: 'hier, 21:47' },
  ];

  const getBadgeStyle = (badgeType: string) => {
    switch (badgeType) {
      case 'green':
        return { bg: '#E6F4EA', text: '#1E8E3E' };
      case 'red':
        return { bg: '#FCE8E6', text: '#D93025' };
      case 'yellow':
        return { bg: '#FEF7E0', text: '#B06000' };
      case 'blue':
      default:
        return { bg: '#E8F0FE', text: '#1A73E8' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header Bar avec Logo KWISMO, Cloche et Loupe */}
      <HeaderBar isHome={true} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* CARTE HERO UNIFIÉE PROFIL + KPIS (Maquette Image 3) */}
        <View style={styles.heroCard}>
          {/* Ligne utilisateur : Avatar + "Bienvenu" avec check vert + Nom */}
          <View style={styles.userRow}>
            <View style={styles.avatarContainer}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.userInfo}>
              <View style={styles.welcomeRow}>
                <Text style={styles.welcomeText}>Bienvenu</Text>
                <Icon name="solar:verified-check-bold" color={colors.green} size={16} style={{ marginLeft: 4 }} />
              </View>
              <Text style={styles.userNameText}>{userName}</Text>
            </View>
          </View>

          {/* Ligne des 4 KPIs Horizontaux */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{summary?.activeNumbersCount ?? 127}</Text>
              <Text style={styles.kpiLabel}>Numéro{'\n'}vérifié</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{summary?.compromisedNumbersCount ?? 25}</Text>
              <Text style={styles.kpiLabel}>Menace{'\n'}évitée</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>10</Text>
              <Text style={styles.kpiLabel}>Signalement{'\n'}effectué</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>50</Text>
              <Text style={styles.kpiLabel}>Transfert{'\n'}d'argent</Text>
            </View>
          </View>
        </View>

        {/* 4 BOUTONS D'ACTIONS RAPIDES CIRCULAIRES (Maquette Image 3) */}
        <View style={styles.quickActionsRow}>
          {/* Vérifier un numéro */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/verify')}
            style={styles.actionBtnWrapper}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#E8F0FE' }]}>
              <Icon name="solar:qr-code-scan-bold" color="#1A73E8" size={26} />
            </View>
            <Text style={[styles.actionText, { color: '#1A73E8' }]}>Vérifier{'\n'}numéro</Text>
          </TouchableOpacity>

          {/* Transfert d'argent */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/transfer')}
            style={styles.actionBtnWrapper}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#FEF7E0' }]}>
              <Icon name="solar:card-transfer-bold" color="#B06000" size={26} />
            </View>
            <Text style={[styles.actionText, { color: '#B06000' }]}>Transfert{'\n'}d'argent</Text>
          </TouchableOpacity>

          {/* Alerte Whatsapp */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/alert-whatsapp')}
            style={styles.actionBtnWrapper}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#E6F4EA' }]}>
              <Icon name="ic:baseline-whatsapp" color="#1E8E3E" size={26} />
            </View>
            <Text style={[styles.actionText, { color: '#1E8E3E' }]}>Alerte{'\n'}Whatsapp</Text>
          </TouchableOpacity>

          {/* Signaler */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/report')}
            style={styles.actionBtnWrapper}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#FCE8E6' }]}>
              <Icon name="heroicons:signal-16-solid" color="#D93025" size={26} />
            </View>
            <Text style={[styles.actionText, { color: '#D93025' }]}>Signaler</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION ACTIVITÉ RÉCENTE (Maquette Image 3) */}
        <View style={styles.activityHeaderRow}>
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
            Activité récente
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(app)/verify')}>
            <Text style={styles.seeAllText}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityList}>
          {activities.map((item) => {
            const badgeStyle = getBadgeStyle(item.badgeType);
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.75}
                onPress={() => router.push({ pathname: '/(app)/verify', params: { phone: item.phone } })}
                style={[styles.activityCard, { backgroundColor: themeColors.cardBg }]}
              >
                <View style={styles.activityAvatar}>
                  <Icon name="solar:user-bold" color="#94A3B8" size={20} />
                </View>

                <View style={styles.activityInfo}>
                  <Text style={[styles.activityPhone, { color: themeColors.textPrimary }]}>
                    {item.phone}
                  </Text>
                  <Text style={[styles.activityType, { color: themeColors.textSecondary }]}>
                    {item.type}
                  </Text>
                </View>

                <View style={styles.activityRight}>
                  <View style={[styles.statusPill, { backgroundColor: badgeStyle.bg }]}>
                    <Text style={[styles.statusPillText, { color: badgeStyle.text }]}>
                      {item.status}
                    </Text>
                  </View>
                  <Text style={styles.activityDate}>{item.date}</Text>
                  <Icon name="solar:alt-arrow-right-linear" color="#CBD5E1" size={16} style={{ marginLeft: 6 }} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Navigation TabBar officielle */}
      <TabBar activeTab="home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 14,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: scaleFont(13),
    color: '#64748B',
    fontFamily: fonts.regular,
  },
  userNameText: {
    fontSize: scaleFont(18),
    fontFamily: fonts.headlineBold,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  kpiItem: {
    alignItems: 'center',
    flex: 1,
  },
  kpiValue: {
    fontSize: scaleFont(20),
    fontFamily: fonts.headlineBold,
    fontWeight: '800',
    color: '#0F172A',
  },
  kpiLabel: {
    fontSize: scaleFont(10),
    fontFamily: fonts.regular,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 13,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionBtnWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  actionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: scaleFont(11),
    fontFamily: fonts.headlineBold,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  activityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: scaleFont(16),
    fontFamily: fonts.headlineBold,
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: scaleFont(13),
    fontFamily: fonts.headlineBold,
    fontWeight: '700',
    color: colors.green,
  },
  activityList: {
    gap: 10,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  activityAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityPhone: {
    fontSize: scaleFont(14),
    fontFamily: fonts.headlineBold,
    fontWeight: '700',
  },
  activityType: {
    fontSize: scaleFont(11),
    fontFamily: fonts.regular,
    color: '#94A3B8',
    marginTop: 2,
  },
  activityRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  statusPillText: {
    fontSize: scaleFont(11),
    fontFamily: fonts.headlineBold,
    fontWeight: '700',
  },
  activityDate: {
    fontSize: scaleFont(11),
    color: '#94A3B8',
    fontFamily: fonts.regular,
  },
});
