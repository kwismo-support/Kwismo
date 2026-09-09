// Écran de Vérification de Numéro conforme à la maquette (Image 1 et Image 2)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../src/shared/ui/Icon';
import { HeaderBar } from '../../src/shared/components/HeaderBar';
import { useAppTheme } from '../../src/shared/hooks/useAppTheme';
import { colors, fonts } from '../../src/styles/tokens';
import { scaleFont } from '../../src/shared/lib/responsive';
import { verifyApi, VerifyResult } from '../../src/features/verify/services/verify.api';
import { lookupNumberOffline } from '../../src/shared/services/database';

export default function VerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const [inputPhone, setInputPhone] = useState(params.phone || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(
    params.phone
      ? {
          id: 'num-init',
          valeur: params.phone,
          phone: params.phone,
          score_risque: 90,
          riskScore: 90,
          statut: 'active',
          riskLevel: 'HIGH',
          est_compromis: true,
          nombre_signalements: 90,
          reportCount: 90,
          operator: 'MTN Cameroon',
          recommendation: 'Dernier signalement il y’a 8 mois',
        }
      : null
  );

  const handleVerify = async () => {
    if (!inputPhone.trim()) return;
    setLoading(true);
    try {
      const res = await verifyApi.checkNumber(inputPhone);
      if (res.success && res.data) {
        setResult(res.data);
      }
    } catch (err) {
      try {
        const offlineResult = await lookupNumberOffline(inputPhone.trim());
        if (offlineResult) {
          const score = Math.round(offlineResult.score_risque * 100);
          setResult({
            id: `num-offline-${Date.now()}`,
            valeur: offlineResult.valeur,
            phone: offlineResult.valeur,
            score_risque: score,
            riskScore: score,
            statut: offlineResult.statut,
            riskLevel: offlineResult.statut === 'frauduleux' ? 'HIGH' : offlineResult.statut === 'suspect' ? 'MEDIUM' : 'LOW',
            est_compromis: offlineResult.statut === 'frauduleux',
            nombre_signalements: 1,
            reportCount: 1,
            operator: 'Réseau Mobile',
            recommendation: 'Résultat issu de la base locale SQLite (Mode hors-ligne)',
          });
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };


  const isFraudulent = result?.riskLevel === 'HIGH' || result?.riskLevel === 'CRITICAL' || (result?.riskScore || 0) >= 70;
  const isSuspect = result?.riskLevel === 'MEDIUM' || ((result?.riskScore || 0) >= 40 && (result?.riskScore || 0) < 70);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      {/* Header Bar conforme avec titre et retour */}
      <HeaderBar title="Verification du numero" showBack={true} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Champ de recherche de numéro si pas encore soumis */}
        <View style={styles.searchBoxContainer}>
          <View style={[styles.searchInputWrapper, { backgroundColor: themeColors.inputBg, borderColor: themeColors.inputBorder }]}>
            <Icon name="solar:magnifer-linear" color="#94A3B8" size={20} style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.searchInput, { color: themeColors.textPrimary }]}
              placeholder="Entrez un numéro (+237...)"
              placeholderTextColor={themeColors.inputPlaceholder}
              keyboardType="phone-pad"
              value={inputPhone}
              onChangeText={setInputPhone}
            />
          </View>

          <TouchableOpacity
            style={[styles.verifyButton, { backgroundColor: colors.green }]}
            onPress={handleVerify}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.verifyButtonText}>Vérifier</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* RÉSULTAT CONFORME AUX MAQUETTES (Image 1 & Image 2) */}
        {result && (
          <View style={styles.resultContentCard}>
            {/* 1. Pill de Statut Haut (Frauduleux / A signaler / Sécurisé) */}
            <View
              style={[
                styles.statusOutlinePill,
                {
                  borderColor: isFraudulent ? '#EF4444' : isSuspect ? '#F59E0B' : '#10B981',
                },
              ]}
            >
              <Text
                style={[
                  styles.statusOutlinePillText,
                  { color: isFraudulent ? '#EF4444' : isSuspect ? '#F59E0B' : '#10B981' },
                ]}
              >
                {isFraudulent ? 'Frauduleux' : isSuspect ? 'A signaler' : 'Sécurisé'}
              </Text>
            </View>

            {/* 2. Illustration centrale (Bouclier avec crâne ou attention) */}
            <View style={styles.illustrationWrapper}>
              <View
                style={[
                  styles.outerCircleGraphic,
                  { backgroundColor: isFraudulent ? '#FEE2E2' : isSuspect ? '#FEF3C7' : '#DCFCE7' },
                ]}
              >
                <View
                  style={[
                    styles.shieldIconBox,
                    { backgroundColor: isFraudulent ? '#EF4444' : isSuspect ? '#F59E0B' : '#10B981' },
                  ]}
                >
                  <Icon
                    name={
                      isFraudulent
                        ? 'solar:danger-triangle-bold'
                        : isSuspect
                        ? 'solar:danger-bold'
                        : 'solar:shield-check-bold'
                    }
                    color="#FFFFFF"
                    size={48}
                  />
                </View>
              </View>
            </View>

            {/* 3. Carte Verte : Score de Risque (0 à 100) */}
            <View style={styles.greenScoreCard}>
              <View style={styles.scoreHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.scoreTitleText}>Score de risque</Text>
                  <Icon name="solar:info-circle-linear" color="#FFFFFF" size={16} style={{ marginLeft: 4 }} />
                </View>
                <View style={styles.riskBadgePill}>
                  <Text style={styles.riskBadgeText}>
                    {isFraudulent ? 'Attention' : isSuspect ? 'Suspect' : 'Faible'}
                  </Text>
                </View>
              </View>

              <View style={styles.gaugeContainer}>
                <View style={styles.gaugeLabelsRow}>
                  <Text style={styles.gaugeMinMaxText}>0</Text>
                  <Text style={styles.gaugeMinMaxText}>100</Text>
                </View>
                <View style={styles.gaugeTrack}>
                  <View
                    style={[
                      styles.gaugeFill,
                      { width: `${Math.min(result.riskScore, 100)}%` },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* 4. Historique Communautaire */}
            <View style={styles.communitySection}>
              <Text style={[styles.communityTitle, { color: themeColors.textPrimary }]}>
                Historique communautaire
              </Text>

              <View style={styles.communityRow}>
                <View style={styles.communityLeft}>
                  <Icon name="solar:bell-bing-bold" color="#0F172A" size={20} style={{ marginRight: 10 }} />
                  <Text style={[styles.communityLabel, { color: themeColors.textPrimary }]}>
                    Signalements
                  </Text>
                </View>
                <Text style={[styles.communityValue, { color: themeColors.textPrimary }]}>
                  {result.reportCount < 10 ? `0${result.reportCount}` : result.reportCount}
                </Text>
              </View>

              <View style={styles.communityRow}>
                <View style={styles.communityLeft}>
                  <Icon name="solar:chat-round-line-bold" color="#0F172A" size={20} style={{ marginRight: 10 }} />
                  <Text style={[styles.communityLabel, { color: themeColors.textPrimary }]}>
                    Commentaires positifs
                  </Text>
                </View>
                <Text style={[styles.communityValue, { color: themeColors.textPrimary }]}>
                  {isFraudulent ? '00' : isSuspect ? '10' : '45'}
                </Text>
              </View>

              <Text style={styles.lastReportSubtext}>
                {result.recommendation || 'Dernier signalement il y’a 8 mois'}
              </Text>
            </View>

            {/* 5. Boutons d'actions bas (Signaler / Transferer) */}
            <View style={styles.bottomButtonsRow}>
              {isFraudulent ? (
                <>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push({ pathname: '/(app)/report', params: { phone: result.phone } })}
                    style={[styles.actionBtnHalf, { backgroundColor: '#F59E0B' }]}
                  >
                    <Text style={styles.actionBtnText}>Signaler</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push({ pathname: '/(app)/transfer', params: { recipient: result.phone } })}
                    style={[styles.actionBtnHalf, { backgroundColor: '#0F172A' }]}
                  >
                    <Text style={styles.actionBtnText}>Transferer</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push({ pathname: '/(app)/transfer', params: { recipient: result.phone } })}
                  style={[styles.actionBtnFull, { backgroundColor: '#F59E0B' }]}
                >
                  <Text style={styles.actionBtnText}>Transferer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
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
  searchBoxContainer: {
    marginBottom: 20,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: scaleFont(15),
    fontFamily: fonts.regular,
  },
  verifyButton: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFont(15),
    fontFamily: fonts.headlineBold,
    fontWeight: '700',
  },
  resultContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  statusOutlinePill: {
    alignSelf: 'center',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  statusOutlinePillText: {
    fontSize: scaleFont(18),
    fontFamily: fonts.headlineBold,
    fontWeight: '800',
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginVertical: 16,
  },
  outerCircleGraphic: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldIconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenScoreCard: {
    backgroundColor: colors.green,
    borderRadius: 18,
    padding: 16,
    marginVertical: 16,
  },
  scoreHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreTitleText: {
    color: '#FFFFFF',
    fontSize: scaleFont(14),
    fontFamily: fonts.headlineBold,
    fontWeight: '700',
  },
  riskBadgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskBadgeText: {
    color: '#FFFFFF',
    fontSize: scaleFont(12),
    fontFamily: fonts.headlineBold,
    fontWeight: '700',
  },
  gaugeContainer: {
    marginTop: 4,
  },
  gaugeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  gaugeMinMaxText: {
    color: '#FFFFFF',
    fontSize: scaleFont(11),
    fontFamily: fonts.regular,
  },
  gaugeTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  communitySection: {
    marginVertical: 12,
  },
  communityTitle: {
    fontSize: scaleFont(15),
    fontFamily: fonts.headlineBold,
    fontWeight: '800',
    marginBottom: 12,
  },
  communityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  communityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  communityLabel: {
    fontSize: scaleFont(14),
    fontFamily: fonts.regular,
  },
  communityValue: {
    fontSize: scaleFont(15),
    fontFamily: fonts.headlineBold,
    fontWeight: '800',
  },
  lastReportSubtext: {
    fontSize: scaleFont(12),
    color: '#94A3B8',
    fontFamily: fonts.regular,
    marginTop: 12,
  },
  bottomButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  actionBtnHalf: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnFull: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: scaleFont(15),
    fontFamily: fonts.headlineBold,
    fontWeight: '700',
  },
});
