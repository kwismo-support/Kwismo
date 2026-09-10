import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  ActivityIndicator,
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

export default function TwoFactorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isDark, colors: themeColors } = useAppTheme();

  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [pinConfigured, setPinConfigured] = useState(true);
  const [twoFactorSmsEnabled, setTwoFactorSmsEnabled] = useState(false);

  // PIN Verification Modal for sensitive changes
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [enteredPin, setEnteredPin] = useState(['', '', '', '', '', '']);
  const [pinError, setPinError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pendingAction, setPendingAction] = useState<'toggle_bio' | null>(null);

  const handleToggleBiometrics = (value: boolean) => {
    if (!value) {
      setPendingAction('toggle_bio');
      setEnteredPin(['', '', '', '', '', '']);
      setPinError('');
      setPinModalVisible(true);
    } else {
      setBiometricsEnabled(true);
      toast.success(t('twoFactor.bioEnabled'));
    }
  };

  const handlePinInput = (digit: string, index: number) => {
    const newPin = [...enteredPin];
    newPin[index] = digit;
    setEnteredPin(newPin);
    if (pinError) setPinError('');

    if (digit && index === 5 && newPin.every((d) => d !== '')) {
      verifyPinAndExecute(newPin.join(''));
    }
  };

  const verifyPinAndExecute = (pinCode: string) => {
    setIsVerifyingPin(true);
    setTimeout(() => {
      setIsVerifyingPin(false);
      if (pinCode.length === 6) {
        if (pendingAction === 'toggle_bio') {
          setBiometricsEnabled(false);
          toast.info(t('twoFactor.bioDisabled'));
        }
        setPinModalVisible(false);
        setPendingAction(null);
      } else {
        setPinError(t('twoFactor.invalidPin'));
      }
    }, 600);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style="light" />

      <HeaderBar
        title={t('twoFactor.title')}
        showBack={true}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          {t('twoFactor.securityHeader')}
        </Text>
        <Text style={[styles.sectionSub, { color: themeColors.textSecondary }]}>
          {t('twoFactor.securitySubtitle')}
        </Text>

        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder, marginTop: 16 }]}>
          <View style={styles.row}>
            <Icon name="solar:fingerprint-bold" color={colors.green} size={24} style={{ marginRight: 12 }} />
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>
                {t('twoFactor.biometricsTitle')}
              </Text>
              <Text style={[styles.rowSub, { color: themeColors.textSecondary }]}>
                {t('twoFactor.biometricsSub')}
              </Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: '#CBD5E1', true: colors.green }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder, marginTop: 16 }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/pin-setup')}
            style={styles.row}
          >
            <Icon name="solar:shield-keyhole-bold" color={colors.green} size={24} style={{ marginRight: 12 }} />
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>
                {t('twoFactor.pinTitle')}
              </Text>
              <Text style={[styles.rowSub, { color: themeColors.textSecondary }]}>
                {pinConfigured
                  ? t('twoFactor.pinActive')
                  : t('twoFactor.pinNotConfigured')}
              </Text>
            </View>
            <Icon name="solar:alt-arrow-right-linear" color={themeColors.inputPlaceholder} size={20} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary, marginTop: 24 }]}>
          {t('twoFactor.otpSectionTitle')}
        </Text>
        <View style={[styles.card, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder, marginTop: 12 }]}>
          <View style={styles.row}>
            <Icon name="solar:smartphone-rotate-2-bold" color={colors.green} size={24} style={{ marginRight: 12 }} />
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.rowTitle, { color: themeColors.textPrimary }]}>
                {t('twoFactor.smsTitle')}
              </Text>
              <Text style={[styles.rowSub, { color: themeColors.textSecondary }]}>
                {t('twoFactor.smsSub')}
              </Text>
            </View>
            <Switch
              value={twoFactorSmsEnabled}
              onValueChange={(val) => {
                setTwoFactorSmsEnabled(val);
                toast.info(val ? '2FA SMS activée' : '2FA SMS désactivée');
              }}
              trackColor={{ false: '#CBD5E1', true: colors.green }}
              thumbColor={colors.white}
            />
          </View>
        </View>
      </ScrollView>

      <Modal visible={pinModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.cardBg, borderColor: themeColors.inputBorder }]}>
            <Icon name="solar:shield-warning-bold" color={colors.orange} size={36} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
              {t('twoFactor.confirmPinTitle')}
            </Text>
            <Text style={[styles.modalSub, { color: themeColors.textSecondary }]}>
              {t('twoFactor.confirmPinSub')}
            </Text>

            {/* Inputs 6 chiffres */}
            <View style={styles.pinInputsRow}>
              {enteredPin.map((digit, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.pinBox,
                    {
                      borderColor: digit
                        ? colors.green
                        : pinError
                        ? '#EF4444'
                        : themeColors.inputBorder,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                    },
                  ]}
                >
                  <Text style={[styles.pinDigitText, { color: themeColors.textPrimary }]}>
                    {digit ? '•' : ''}
                  </Text>
                </View>
              ))}
            </View>

            {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                onPress={() => setPinModalVisible(false)}
                style={[styles.modalCancelBtn, { borderColor: themeColors.inputBorder }]}
              >
                <Text style={[styles.modalCancelText, { color: themeColors.textPrimary }]}>
                  {t('common.cancel', 'Annuler')}
                </Text>
              </TouchableOpacity>
            </View>
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
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(16),
    fontWeight: '800',
  },
  sectionSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(14),
    fontWeight: '700',
  },
  rowSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: fonts.headlineBold,
    fontSize: scaleFont(17),
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSub: {
    fontFamily: fonts.regular,
    fontSize: scaleFont(13),
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  pinInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pinBox: {
    width: 44,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigitText: {
    fontSize: scaleFont(22),
    fontWeight: '800',
  },
  errorText: {
    color: '#EF4444',
    fontFamily: fonts.medium,
    fontSize: scaleFont(12),
    textAlign: 'center',
    marginBottom: 12,
  },
  modalButtonsRow: {
    marginTop: 8,
  },
  modalCancelBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontFamily: fonts.semiBold,
    fontSize: scaleFont(14),
  },
});
